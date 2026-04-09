using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class RecommendationService : IRecommendationService
{
    private readonly ApplicationDbContext _db;
    private readonly IOpenAIService _openAI;
    private readonly IMlInterestPredictService _mlSurvey;
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(
        ApplicationDbContext db,
        IOpenAIService openAI,
        IMlInterestPredictService mlSurvey,
        ILogger<RecommendationService> logger)
    {
        _db = db;
        _openAI = openAI;
        _mlSurvey = mlSurvey;
        _logger = logger;
    }

    public async Task<IReadOnlyList<RecommendationResponse>> GetAllByUserIdAsync(int userId, CancellationToken ct = default)
    {
        var list = await _db.CareerRecommendations.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        return list.Select(ToResponse).ToList();
    }

    public async Task<RecommendationGenerateResponse> GenerateAsync(int userId, CancellationToken ct = default)
    {
        try
        {
            return await GenerateCoreAsync(userId, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI recommendation generation failed for user {UserId}; using survey-guided template careers.", userId);
            try
            {
                var list = await PersistTemplateRecommendationsAsync(userId, ct);
                return new RecommendationGenerateResponse(list, "template_no_key");
            }
            catch (Exception ex2)
            {
                _logger.LogError(ex2, "Could not save template recommendations for user {UserId}; returning in-memory list.", userId);
                try
                {
                    UserProfile? prof = null;
                    try
                    {
                        prof = await _db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, ct);
                    }
                    catch { /* ignore */ }

                    MlSurveySignal? ms = null;
                    try
                    {
                        ms = await GetMlSurveySignalAsync(prof, ct);
                    }
                    catch { /* ignore */ }

                    var effective = MergeSurveySignalForTemplates(ms, prof);
                    var rows = BuildMlGuidedTemplateRows(effective, prof);
                    return new RecommendationGenerateResponse(BuildInMemoryFromGuidedRows(userId, rows), "template_preview_only");
                }
                catch (Exception ex3)
                {
                    _logger.LogError(ex3, "In-memory guided template fallback failed for user {UserId}; using static catalog.", userId);
                    return new RecommendationGenerateResponse(BuildInMemoryFromGuidedRows(userId, BuildMlGuidedTemplateRows(null, null)), "template_preview_only");
                }
            }
        }
    }

    private async Task<RecommendationGenerateResponse> GenerateCoreAsync(int userId, CancellationToken ct)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        var profile = await _db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, ct);
        var assessment = await _db.Assessments.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var profileSummary = BuildProfileSummary(user, profile);
        var assessmentSummary = assessment?.ResultSummary ?? assessment?.AnswersJson ?? "No assessment data yet.";

        var mlSignal = await GetMlSurveySignalAsync(profile, ct);
        var aiRaw = await _openAI.GenerateRecommendationsAsync(
            profileSummary,
            assessmentSummary,
            ct,
            mlSignal?.PromptHint);

        var validAi = aiRaw?
            .Where(s => s != null && !string.IsNullOrWhiteSpace(s.Title))
            .ToList();

        if (aiRaw is { Count: > 0 } && (validAi == null || validAi.Count == 0))
            _logger.LogWarning("Career generate for user {UserId}: LLM returned entries with no usable titles; using templates.", userId);

        var useAi = validAi is { Count: > 0 };
        var generationSource = useAi
            ? "ai"
            : !_openAI.IsLlmAvailable
                ? "template_no_key"
                : "template_llm_failed";

        if (generationSource == "template_no_key")
            _logger.LogWarning("Career generate for user {UserId}: no LLM API key (or Local not used). Using template list. Set AI:Gemini:ApiKey or GEMINI_API_KEY — see docs/OPENAI-SETUP.md.", userId);
        else if (generationSource == "template_llm_failed")
            _logger.LogWarning("Career generate for user {UserId}: LLM call failed or returned no parseable JSON. Using template list. Check API key, model name, quota, and network.", userId);

        var existing = await _db.CareerRecommendations.Where(x => x.UserId == userId).ToListAsync(ct);
        _db.CareerRecommendations.RemoveRange(existing);

        if (useAi)
        {
            for (var i = 0; i < validAi!.Count; i++)
            {
                var s = validAi[i];
                string? metaJson;
                try
                {
                    var meta = new
                    {
                        matchPercentage = s.MatchPercentage,
                        salaryRange = s.SalaryRange,
                        growth = s.Growth,
                        skills = s.Skills,
                        learningPath = s.LearningPath?.Select(lp => new { lp.Step, lp.Title, lp.Duration }).ToList(),
                    };
                    metaJson = JsonSerializer.Serialize(meta);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not serialize metadata for AI career row; saving without metadata.");
                    metaJson = null;
                }

                _db.CareerRecommendations.Add(new CareerRecommendation
                {
                    UserId = userId,
                    Title = s.Title.Trim(),
                    Description = string.IsNullOrWhiteSpace(s.Description) ? null : s.Description.Trim(),
                    Category = string.IsNullOrWhiteSpace(s.Category) ? null : s.Category.Trim(),
                    Saved = false,
                    SortOrder = i,
                    CreatedAt = DateTime.UtcNow,
                    MetadataJson = metaJson,
                });
            }
        }
        else
        {
            List<(string Title, string Desc, string Category, int Match, string Salary, string Growth)> templateRows;
            try
            {
                var effectiveMl = MergeSurveySignalForTemplates(mlSignal, profile);
                templateRows = BuildMlGuidedTemplateRows(effectiveMl, profile);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "BuildMlGuidedTemplateRows failed for user {UserId}; using catalog fallback.", userId);
                templateRows = BuildMlGuidedTemplateRows(null, profile);
            }

            for (var i = 0; i < templateRows.Count; i++)
            {
                var row = templateRows[i];
                string? metaJson;
                try
                {
                    metaJson = JsonSerializer.Serialize(new
                    {
                        matchPercentage = row.Match,
                        salaryRange = row.Salary,
                        growth = row.Growth,
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not serialize template metadata; saving without metadata.");
                    metaJson = null;
                }

                _db.CareerRecommendations.Add(new CareerRecommendation
                {
                    UserId = userId,
                    Title = row.Title,
                    Description = row.Desc,
                    Category = row.Category,
                    Saved = false,
                    SortOrder = i,
                    CreatedAt = DateTime.UtcNow,
                    MetadataJson = metaJson,
                });
            }
        }

        await _db.SaveChangesAsync(ct);

        var newList = await _db.CareerRecommendations.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        var responses = newList.Select(ToResponse).ToList();
        return new RecommendationGenerateResponse(responses, generationSource);
    }

    private async Task<IReadOnlyList<RecommendationResponse>> PersistTemplateRecommendationsAsync(int userId, CancellationToken ct)
    {
        var profile = await _db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, ct);
        MlSurveySignal? mlSignal = null;
        try
        {
            mlSignal = await GetMlSurveySignalAsync(profile, ct);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "ML signal unavailable while persisting template recommendations for user {UserId}", userId);
        }

        var effective = MergeSurveySignalForTemplates(mlSignal, profile);
        List<(string Title, string Desc, string Category, int Match, string Salary, string Growth)> templateRows;
        try
        {
            templateRows = BuildMlGuidedTemplateRows(effective, profile);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "BuildMlGuidedTemplateRows failed in PersistTemplate for user {UserId}", userId);
            templateRows = BuildMlGuidedTemplateRows(null, profile);
        }

        var existing = await _db.CareerRecommendations.Where(x => x.UserId == userId).ToListAsync(ct);
        _db.CareerRecommendations.RemoveRange(existing);

        for (var i = 0; i < templateRows.Count; i++)
        {
            var row = templateRows[i];
            string? metaJson;
            try
            {
                metaJson = JsonSerializer.Serialize(new
                {
                    matchPercentage = row.Match,
                    salaryRange = row.Salary,
                    growth = row.Growth,
                });
            }
            catch
            {
                metaJson = null;
            }

            _db.CareerRecommendations.Add(new CareerRecommendation
            {
                UserId = userId,
                Title = row.Title,
                Description = row.Desc,
                Category = row.Category,
                Saved = false,
                SortOrder = i,
                CreatedAt = DateTime.UtcNow,
                MetadataJson = metaJson,
            });
        }

        await _db.SaveChangesAsync(ct);
        var newList = await _db.CareerRecommendations.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        return newList.Select(ToResponse).ToList();
    }

    private static IReadOnlyList<RecommendationResponse> BuildInMemoryFromGuidedRows(
        int userId,
        List<(string Title, string Desc, string Category, int Match, string Salary, string Growth)> rows)
    {
        var now = DateTime.UtcNow;
        var list = new List<RecommendationResponse>();
        for (var i = 0; i < rows.Count; i++)
        {
            var row = rows[i];
            list.Add(new RecommendationResponse(
                Id: -(i + 1),
                UserId: userId,
                Title: row.Title,
                Description: row.Desc,
                Category: row.Category,
                Saved: false,
                SortOrder: i,
                CreatedAt: now,
                MatchPercentage: row.Match,
                SalaryRange: row.Salary,
                Growth: row.Growth,
                Skills: new[] { "Communication", "Problem solving", "Domain knowledge" },
                LearningPath: null));
        }
        return list;
    }

    private static string BuildProfileSummary(User? user, UserProfile? p)
    {
        var parts = new List<string>();
        if (user != null && !string.IsNullOrWhiteSpace(user.Name)) parts.Add($"Name: {user.Name}");
        if (p == null) return parts.Count > 0 ? string.Join("\n", parts) : "No profile data yet.";
        if (!string.IsNullOrWhiteSpace(p.Gender)) parts.Add($"Gender: {p.Gender}");
        if (!string.IsNullOrWhiteSpace(p.UgCourse)) parts.Add($"UG course: {p.UgCourse}");
        if (!string.IsNullOrWhiteSpace(p.UgSpecialization)) parts.Add($"UG specialization / major: {p.UgSpecialization}");
        if (!string.IsNullOrWhiteSpace(p.UgCgpaOrPercentage)) parts.Add($"UG CGPA or percentage: {p.UgCgpaOrPercentage}");
        if (!string.IsNullOrWhiteSpace(p.Interests)) parts.Add($"Interests: {p.Interests}");
        if (!string.IsNullOrWhiteSpace(p.Skills)) parts.Add($"Skills: {p.Skills}");
        if (p.HasAdditionalCertifications == true) parts.Add("Additional certification courses: Yes");
        else if (p.HasAdditionalCertifications == false) parts.Add("Additional certification courses: No");
        if (!string.IsNullOrWhiteSpace(p.CertificateCourseTitles)) parts.Add($"Certificate course titles: {p.CertificateCourseTitles}");
        if (p.IsWorking == true) parts.Add("Currently working: Yes");
        else if (p.IsWorking == false) parts.Add("Currently working: No");
        if (!string.IsNullOrWhiteSpace(p.FirstJobTitle)) parts.Add($"First job title in current field (or NA): {p.FirstJobTitle}");
        if (!string.IsNullOrWhiteSpace(p.MastersField)) parts.Add($"Masters (after UG): {p.MastersField}");
        if (!string.IsNullOrWhiteSpace(p.Education)) parts.Add($"Other education notes: {p.Education}");
        if (!string.IsNullOrWhiteSpace(p.ExperienceLevel)) parts.Add($"Experience / current role: {p.ExperienceLevel}");
        if (!string.IsNullOrWhiteSpace(p.PreferredIndustries)) parts.Add($"Industries: {p.PreferredIndustries}");
        if (!string.IsNullOrWhiteSpace(p.Location)) parts.Add($"Location: {p.Location}");
        if (!string.IsNullOrWhiteSpace(p.Bio)) parts.Add($"Bio: {p.Bio}");
        return parts.Count > 0 ? string.Join("\n", parts) : "No profile data yet.";
    }

    private sealed record MlSurveySignal(
        string PromptHint,
        string PrimaryCategory,
        IReadOnlyList<MlTopPredictionItem>? TopPredictions);

    private static bool IsGenericOrUnknownMlCategory(string? cat)
    {
        if (string.IsNullOrWhiteSpace(cat)) return true;
        var c = cat.Trim().ToLowerInvariant().Replace(' ', '_').Replace('-', '_');
        return c is "other" or "unknown" or "general" or "misc" or "miscellaneous" or "none" or "na" or "n_a" or "exploring";
    }

    /// <summary>Prefer keyword clusters over vague ML labels so template careers align with survey text.</summary>
    private static MlSurveySignal? MergeSurveySignalForTemplates(MlSurveySignal? ml, UserProfile? profile)
    {
        var inferred = InferClusterFromSurveyText(profile);
        if (ml == null)
        {
            if (inferred == null) return null;
            return new MlSurveySignal(
                $"Survey keywords suggest {inferred} for career template ordering.",
                inferred,
                null);
        }

        if (IsGenericOrUnknownMlCategory(ml.PrimaryCategory) && inferred != null)
        {
            return new MlSurveySignal(
                ml.PromptHint + $" Keyword routing ({inferred}) applied for clearer career matches.",
                inferred,
                null);
        }

        return ml;
    }

    private static string BuildSurveyBlob(UserProfile? profile)
    {
        if (profile == null) return "";
        return string.Join(
            " ",
            new[]
            {
                profile.Interests,
                profile.Skills,
                profile.UgSpecialization,
                profile.UgCourse,
                profile.CertificateCourseTitles,
                profile.PreferredIndustries,
                profile.MastersField,
                profile.Bio,
                profile.FirstJobTitle,
                profile.ExperienceLevel,
                profile.Education,
                profile.Location,
            }.Select(s => s ?? ""));
    }

    private static readonly HashSet<string> ProfileStopWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "the", "and", "for", "you", "are", "with", "not", "but", "can", "our", "your", "has", "have", "was", "were", "been",
        "from", "they", "will", "would", "could", "this", "that", "into", "about", "also", "any", "more", "some", "than", "then",
        "when", "what", "which", "who", "how", "all", "each", "both", "such", "only", "over", "after", "before", "between",
        "under", "while", "during", "very", "just", "like", "well", "years", "year", "work", "want", "help", "make", "good", "new",
        "use", "using", "etc", "per", "may", "one", "two", "his", "her", "its", "had", "did",
    };

    private static List<string> TokenizeProfileWords(string blob)
    {
        if (string.IsNullOrWhiteSpace(blob)) return new List<string>();
        var lower = blob.ToLowerInvariant().ToCharArray();
        for (var i = 0; i < lower.Length; i++)
        {
            if (!char.IsLetterOrDigit(lower[i]))
                lower[i] = ' ';
        }

        return new string(lower).Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(t => t.Length >= 3 && !ProfileStopWords.Contains(t))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static List<(string Title, string Desc, string Category)> OrderTemplatesByProfileOverlap(UserProfile? profile)
    {
        var list = RecommendationTemplateCatalog.Careers.ToList();
        var tokens = TokenizeProfileWords(BuildSurveyBlob(profile));
        if (tokens.Count == 0) return list;

        int Score((string Title, string Desc, string Category) item)
        {
            var text = $"{item.Title} {item.Desc} {item.Category}".ToLowerInvariant();
            var score = 0;
            foreach (var tok in tokens)
            {
                if (text.Contains(tok, StringComparison.Ordinal)) score++;
            }
            return score;
        }

        var maxScore = list.Max(Score);
        if (maxScore == 0) return list;

        return list.OrderByDescending(Score).ThenBy(x => x.Title, StringComparer.OrdinalIgnoreCase).ToList();
    }

    /// <summary>Keyword fallback when ML is offline or vague — routes templates toward legal, healthcare, marketing, data, tech, etc.</summary>
    private static string? InferClusterFromSurveyText(UserProfile? profile)
    {
        var blob = BuildSurveyBlob(profile).ToLowerInvariant();
        if (blob.Trim().Length < 3) return null;

        if (blob.Contains("legal", StringComparison.Ordinal) || blob.Contains("litigation", StringComparison.Ordinal)
            || blob.Contains("attorney", StringComparison.Ordinal) || blob.Contains("lawyer", StringComparison.Ordinal)
            || blob.Contains("paralegal", StringComparison.Ordinal) || blob.Contains("counsel", StringComparison.Ordinal)
            || blob.Contains("compliance", StringComparison.Ordinal) || blob.Contains("regulatory", StringComparison.Ordinal)
            || blob.Contains("court", StringComparison.Ordinal) || blob.Contains("law firm", StringComparison.Ordinal)
            || blob.Contains("bar exam", StringComparison.Ordinal) || blob.Contains("juris", StringComparison.Ordinal))
            return "law";
        if (blob.Contains(" law", StringComparison.Ordinal) || blob.Contains("law ", StringComparison.Ordinal))
            return "law";

        if (blob.Contains("nurse", StringComparison.Ordinal) || blob.Contains("nursing", StringComparison.Ordinal)
            || blob.Contains("clinical", StringComparison.Ordinal) || blob.Contains("healthcare", StringComparison.Ordinal)
            || blob.Contains("hospital", StringComparison.Ordinal) || blob.Contains("patient care", StringComparison.Ordinal)
            || blob.Contains("medical", StringComparison.Ordinal) || blob.Contains("pharma", StringComparison.Ordinal))
            return "healthcare";

        if (blob.Contains("teach", StringComparison.Ordinal) || blob.Contains("education", StringComparison.Ordinal)
            || blob.Contains("curriculum", StringComparison.Ordinal) || blob.Contains("classroom", StringComparison.Ordinal)
            || blob.Contains("k-12", StringComparison.Ordinal) || blob.Contains("academic", StringComparison.Ordinal))
            return "education";

        if (blob.Contains("human resource", StringComparison.Ordinal) || blob.Contains("recruit", StringComparison.Ordinal)
            || blob.Contains("talent acquisition", StringComparison.Ordinal)
            || blob.Contains(" hr ", StringComparison.Ordinal) || blob.StartsWith("hr ", StringComparison.Ordinal)
            || blob.EndsWith(" hr", StringComparison.Ordinal))
            return "human_resources";

        if (blob.Contains("product manager", StringComparison.Ordinal) || blob.Contains("product owner", StringComparison.Ordinal)
            || blob.Contains("product roadmap", StringComparison.Ordinal))
            return "product";

        if (blob.Contains("ux ", StringComparison.Ordinal) || blob.Contains(" ui", StringComparison.Ordinal)
            || blob.Contains("user experience", StringComparison.Ordinal) || blob.Contains("figma", StringComparison.Ordinal)
            || (blob.Contains("design", StringComparison.Ordinal) && !blob.Contains("instructional", StringComparison.Ordinal)))
            return "design";

        if (blob.Contains("market", StringComparison.Ordinal) || blob.Contains("brand", StringComparison.Ordinal)
            || blob.Contains("social media", StringComparison.Ordinal) || blob.Contains("seo", StringComparison.Ordinal)
            || blob.Contains("campaign", StringComparison.Ordinal)
            || (blob.Contains("content", StringComparison.Ordinal) && !blob.Contains("legal", StringComparison.Ordinal)))
            return "marketing";

        if (blob.Contains("data science", StringComparison.Ordinal) || blob.Contains("machine learning", StringComparison.Ordinal)
            || blob.Contains("statistics", StringComparison.Ordinal)
            || (blob.Contains("python", StringComparison.Ordinal) && blob.Contains("data", StringComparison.Ordinal)))
            return "data_science";

        if (blob.Contains("software", StringComparison.Ordinal) || blob.Contains("developer", StringComparison.Ordinal)
            || blob.Contains("programming", StringComparison.Ordinal) || blob.Contains("devops", StringComparison.Ordinal)
            || blob.Contains("full stack", StringComparison.Ordinal) || blob.Contains("backend", StringComparison.Ordinal)
            || blob.Contains("frontend", StringComparison.Ordinal))
            return "technology";

        if (blob.Contains("business analyst", StringComparison.Ordinal) || blob.Contains("business analysis", StringComparison.Ordinal))
            return "business";

        if (blob.Contains("finance", StringComparison.Ordinal) || blob.Contains("accounting", StringComparison.Ordinal)
            || blob.Contains("investment", StringComparison.Ordinal) || blob.Contains("financial", StringComparison.Ordinal))
            return "finance";

        return null;
    }

    /// <summary>Calls the Colab-trained Python model with the same fields as the career survey UI (combined into one text for TF-IDF).</summary>
    private async Task<MlSurveySignal?> GetMlSurveySignalAsync(UserProfile? profile, CancellationToken ct)
    {
        if (profile == null) return null;
        if (BuildSurveyBlob(profile).Trim().Length < 3)
            return null;

        var interests = profile.Interests?.Trim() ?? "";
        var skills = profile.Skills?.Trim() ?? "";
        var certs = profile.CertificateCourseTitles?.Trim() ?? "";
        var ugCourse = profile.UgCourse?.Trim() ?? "";
        var ugSpec = profile.UgSpecialization?.Trim() ?? "";

        try
        {
            var r = await _mlSurvey.PredictInterestAsync(
                interests,
                skills,
                profile.CertificateCourseTitles ?? "",
                profile.UgCourse ?? "",
                profile.UgSpecialization ?? "",
                3,
                ct);

            if (r.Available && !string.IsNullOrWhiteSpace(r.PredictedCategory))
            {
                var sb = new StringBuilder();
                sb.Append("Primary predicted interest cluster: ").Append(r.PredictedCategory).Append('.');
                if (r.TopPredictions is { Count: > 0 })
                {
                    sb.Append(" Top alternatives: ");
                    sb.Append(string.Join("; ", r.TopPredictions.Select(t => $"{t.Label} ({t.Probability:P0})")));
                }

                _logger.LogInformation("Survey ML signal for recommendations: {Category}", r.PredictedCategory);
                return new MlSurveySignal(sb.ToString(), r.PredictedCategory.Trim(), r.TopPredictions);
            }

            var inferred = InferClusterFromSurveyText(profile);
            if (inferred != null)
            {
                _logger.LogInformation(
                    "ML API unavailable for recommendations; using survey keyword cluster {Cluster}",
                    inferred);
                return new MlSurveySignal(
                    $"User survey text aligns with {inferred} (ML classifier unreachable — keyword routing for template order).",
                    inferred,
                    null);
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Survey ML call skipped for recommendations.");
            var inferred = InferClusterFromSurveyText(profile);
            return inferred == null
                ? null
                : new MlSurveySignal(
                    $"User survey text aligns with {inferred} (ML call failed — keyword routing).",
                    inferred,
                    null);
        }
    }

    private static int MatchPercentFromProbability(double p)
    {
        if (double.IsNaN(p) || double.IsInfinity(p)) p = 0.65;
        p = Math.Clamp(p, 0, 1);
        return (int)Math.Clamp(Math.Round(58 + p * 37), 55, 92);
    }

    private static (string Salary, string Growth) TemplateMarketHints(string category) =>
        category switch
        {
            "Marketing" => ("$55,000 - $95,000", "+12%"),
            "Data" => ("$70,000 - $120,000", "+18%"),
            "Product" => ("$85,000 - $130,000", "+14%"),
            "Design" => ("$65,000 - $110,000", "+13%"),
            "Technology" => ("$80,000 - $125,000", "+16%"),
            "Legal" => ("$70,000 - $160,000", "+8%"),
            "Healthcare" => ("$65,000 - $120,000", "+14%"),
            "Education" => ("$45,000 - $85,000", "+6%"),
            "Human Resources" => ("$55,000 - $100,000", "+10%"),
            "Business" => ("$65,000 - $105,000", "+12%"),
            _ => ("See market data", "+12%"),
        };

    /// <summary>
    /// Up to 10 careers: ML top labels pick templates first; remaining slots follow cluster order or profile word overlap.
    /// </summary>
    private static List<(string Title, string Desc, string Category, int Match, string Salary, string Growth)> BuildMlGuidedTemplateRows(
        MlSurveySignal? signal,
        UserProfile? profile)
    {
        const int max = 10;
        var used = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var rows = new List<(string Title, string Desc, string Category, int Match, string Salary, string Growth)>();

        if (signal?.TopPredictions is { Count: > 0 })
        {
            foreach (var t in signal.TopPredictions.OrderByDescending(x => x?.Probability ?? 0))
            {
                if (rows.Count >= max) break;
                if (t == null || string.IsNullOrWhiteSpace(t.Label)) continue;
                var listForLabel = OrderTemplatesForMlCategory(t.Label.Trim());
                foreach (var item in listForLabel)
                {
                    if (!used.Add(item.Title)) continue;
                    var (sal, gr) = TemplateMarketHints(item.Category);
                    rows.Add((item.Title, item.Desc, item.Category, MatchPercentFromProbability(t.Probability), sal, gr));
                    break;
                }
            }
        }

        var fillOrder = signal == null
            ? OrderTemplatesByProfileOverlap(profile)
            : OrderTemplatesForMlCategory(signal.PrimaryCategory);

        var fallbackMatches = new[] { 87, 83, 80, 77, 74, 71, 69, 67, 65, 63 };
        var fi = 0;
        foreach (var item in fillOrder)
        {
            if (rows.Count >= max) break;
            if (!used.Add(item.Title)) continue;
            var m = fi < fallbackMatches.Length ? fallbackMatches[fi] : 62;
            fi++;
            var (sal, gr) = TemplateMarketHints(item.Category);
            rows.Add((item.Title, item.Desc, item.Category, m, sal, gr));
        }

        if (rows.Count == 0)
        {
            var fb = new[] { 87, 83, 80, 77, 74, 71, 69, 67, 65, 63 };
            var j = 0;
            foreach (var item in RecommendationTemplateCatalog.Careers.Take(max))
            {
                var (sal, gr) = TemplateMarketHints(item.Category);
                var m = j < fb.Length ? fb[j] : 62;
                j++;
                rows.Add((item.Title, item.Desc, item.Category, m, sal, gr));
            }
        }

        return rows;
    }

    /// <summary>Put careers most aligned with the ML / keyword cluster first when the LLM is unavailable.</summary>
    private static List<(string Title, string Desc, string Category)> OrderTemplatesForMlCategory(string? mlCategory)
    {
        var list = RecommendationTemplateCatalog.Careers.ToList();
        if (string.IsNullOrWhiteSpace(mlCategory)) return list;

        var c = mlCategory.Trim().ToLowerInvariant().Replace(' ', '_').Replace('-', '_');

        bool Cluster(string needle) => c.Contains(needle, StringComparison.Ordinal);

        int ItemScore((string Title, string Desc, string Category) x)
        {
            var t = x.Title.ToLowerInvariant();
            var cat = x.Category.ToLowerInvariant();
            var d = x.Desc.ToLowerInvariant();
            var blob = t + " " + d + " " + cat;

            if (Cluster("legal") || Cluster("law") || Cluster("litigation") || Cluster("compliance") || Cluster("paralegal") || c == "law")
                return cat.Contains("legal", StringComparison.Ordinal) ? 0 : blob.Contains("legal", StringComparison.Ordinal) ? 1 : 6;

            if (Cluster("health") || Cluster("medical") || Cluster("nurs") || Cluster("clinical") || Cluster("pharma"))
                return cat.Contains("health", StringComparison.Ordinal) ? 0 : 6;

            if (Cluster("education") || Cluster("teach") || Cluster("academic") || Cluster("curriculum") || Cluster("k12") || c.Contains("k_12", StringComparison.Ordinal))
                return cat.Contains("education", StringComparison.Ordinal) ? 0 : 6;

            if (c.Contains("human_resource", StringComparison.Ordinal) || c.Contains("talent", StringComparison.Ordinal)
                || c.Contains("recruit", StringComparison.Ordinal) || c == "hr")
                return cat.Contains("human", StringComparison.Ordinal) ? 0 : 6;

            if (Cluster("data_science") || Cluster("datascience") || (Cluster("data") && Cluster("science")))
                return t.Contains("data scientist", StringComparison.Ordinal) ? 0
                    : t.Contains("data analyst", StringComparison.Ordinal) ? 1
                    : 5;

            if (Cluster("data_analyst") || Cluster("dataanalysis"))
                return t.Contains("data analyst", StringComparison.Ordinal) ? 0
                    : t.Contains("data scientist", StringComparison.Ordinal) ? 1
                    : 5;

            if (Cluster("technology") || Cluster("software") || Cluster("engineering") || Cluster("developer") || Cluster("programming"))
                return t.Contains("software", StringComparison.Ordinal) || t.Contains("devops", StringComparison.Ordinal) ? 0
                    : t.Contains("data", StringComparison.Ordinal) ? 2
                    : 5;

            if (Cluster("marketing") || Cluster("brand") || Cluster("digital"))
                return t.Contains("digital marketing", StringComparison.Ordinal) ? 0
                    : t.Contains("marketing analyst", StringComparison.Ordinal) ? 1
                    : t.Contains("content strategist", StringComparison.Ordinal) ? 2
                    : 5;

            if (Cluster("product"))
                return t.Contains("product manager", StringComparison.Ordinal) ? 0 : 5;

            if (Cluster("design") || Cluster("ux") || Cluster("ui"))
                return t.Contains("ux", StringComparison.Ordinal) ? 0 : 5;

            if (Cluster("finance") || Cluster("accounting") || Cluster("investment"))
                return cat.Contains("finance", StringComparison.Ordinal) ? 0
                    : t.Contains("financial analyst", StringComparison.Ordinal) ? 0
                    : t.Contains("analyst", StringComparison.Ordinal) ? 1
                    : 5;

            if (Cluster("business"))
                return t.Contains("business analyst", StringComparison.Ordinal) ? 0 : 5;

            return c switch
            {
                "data_science" or "datascience" => t.Contains("data scientist", StringComparison.Ordinal) ? 0
                    : t.Contains("data analyst", StringComparison.Ordinal) ? 1
                    : t.Contains("software", StringComparison.Ordinal) ? 4
                    : 8,
                "data_analyst" or "dataanalysis" => t.Contains("data analyst", StringComparison.Ordinal) ? 0
                    : t.Contains("data scientist", StringComparison.Ordinal) ? 1
                    : 8,
                "technology" or "software_engineering" or "softwareengineering" or "engineering" =>
                    t.Contains("software", StringComparison.Ordinal) || t.Contains("devops", StringComparison.Ordinal) ? 0
                    : t.Contains("data", StringComparison.Ordinal) ? 2
                    : 8,
                "marketing" or "digital_marketing" or "digitalmarketing" or "brand" =>
                    t.Contains("digital marketing", StringComparison.Ordinal) ? 0
                    : t.Contains("marketing analyst", StringComparison.Ordinal) ? 1
                    : t.Contains("content strategist", StringComparison.Ordinal) ? 2
                    : t.Contains("product", StringComparison.Ordinal) ? 3
                    : t.Contains("ux", StringComparison.Ordinal) ? 4
                    : t.Contains("data analyst", StringComparison.Ordinal) ? 5
                    : 8,
                "finance" or "business_analysis" or "businessanalysis" => t.Contains("financial analyst", StringComparison.Ordinal) ? 0
                    : t.Contains("analyst", StringComparison.Ordinal) ? 1
                    : t.Contains("product", StringComparison.Ordinal) ? 2
                    : t.Contains("data", StringComparison.Ordinal) ? 3
                    : 8,
                "teaching" => cat.Contains("education", StringComparison.Ordinal) ? 0 : 8,
                "other" => 5,
                _ => 5
            };
        }

        return list.OrderBy(ItemScore).ThenBy(x => x.Title, StringComparer.OrdinalIgnoreCase).ToList();
    }

    public async Task<string> ChatAboutRecommendationsAsync(int userId, string message, IReadOnlyList<ChatMessageDto> conversationHistory, CancellationToken ct = default)
    {
        try
        {
            return await ChatAboutRecommendationsCoreAsync(userId, message, conversationHistory, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat: unhandled failure for user {UserId}; using template fallback.", userId);
            try
            {
                return CareerChatFallback.BuildReplyUsingTemplateCatalog(
                    AugmentMessageWithHistory(message ?? "", conversationHistory ?? Array.Empty<ChatMessageDto>()));
            }
            catch (Exception ex2)
            {
                _logger.LogError(ex2, "Chat: ultimate fallback failed for user {UserId}", userId);
                return "I could not answer that right now. Try again in a moment, or regenerate recommendations on this page.";
            }
        }
    }

    private async Task<string> ChatAboutRecommendationsCoreAsync(int userId, string message, IReadOnlyList<ChatMessageDto> conversationHistory, CancellationToken ct)
    {
        IReadOnlyList<RecommendationResponse> recommendations;
        try
        {
            recommendations = await GetAllByUserIdAsync(userId, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat: failed to load recommendations for user {UserId}", userId);
            try
            {
                var historyObjects = BuildChatHistoryObjects(conversationHistory);
                var degradedContext =
                    "Database unavailable. The app may show built-in sample careers (Software Developer, Data Analyst, Data Scientist, Product Manager, UX Designer, DevOps Engineer). Answer using the user's message; focus on any job title they mention.";
                var aiReply = await _openAI.ChatAsync(message ?? "", historyObjects, degradedContext, ct);
                if (!string.IsNullOrWhiteSpace(aiReply))
                {
                    _logger.LogWarning(
                        "Chat: database unreachable for user {UserId}; returned AI reply using built-in career context only. Fix ConnectionStrings:Default (SQL Server / LocalDB).",
                        userId);
                    return aiReply;
                }
            }
            catch { /* ignore */ }

            _logger.LogWarning(
                "Chat: database unreachable for user {UserId}; using rule-based template catalog. Fix ConnectionStrings:Default.",
                userId);
            return CareerChatFallback.BuildReplyUsingTemplateCatalog(AugmentMessageWithHistory(message ?? "", conversationHistory));
        }

        try
        {
            var context = string.Join("\n", recommendations.Select(r =>
                $"- {r.Title}: {r.Description} (Category: {r.Category}, Match: {r.MatchPercentage}%, Salary: {r.SalaryRange}, Growth: {r.Growth})"));
            if (string.IsNullOrWhiteSpace(context)) context = "No recommendations yet. Generate recommendations first.";
            var historyObjects = BuildChatHistoryObjects(conversationHistory);
            var aiReply = await _openAI.ChatAsync(message ?? "", historyObjects, context, ct);
            if (!string.IsNullOrWhiteSpace(aiReply)) return aiReply;
            return CareerChatFallback.BuildReply(AugmentMessageWithHistory(message ?? "", conversationHistory), recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat: unexpected error for user {UserId}", userId);
            try
            {
                return CareerChatFallback.BuildReply(AugmentMessageWithHistory(message ?? "", conversationHistory), recommendations);
            }
            catch (Exception ex2)
            {
                _logger.LogError(ex2, "Chat: fallback reply failed for user {UserId}", userId);
                return "Something went wrong while generating a reply. Refresh the page and try again.";
            }
        }
    }

    private static List<object> BuildChatHistoryObjects(IReadOnlyList<ChatMessageDto>? conversationHistory)
    {
        var list = new List<object>();
        if (conversationHistory == null) return list;
        foreach (var h in conversationHistory)
        {
            if (h == null) continue;
            var role = string.IsNullOrWhiteSpace(h.Role) ? "user" : h.Role.Trim().ToLowerInvariant();
            if (role == "model") role = "assistant";
            if (role != "assistant" && role != "user") role = "user";
            var content = h.Content ?? "";
            list.Add(new { role, content });
        }
        return list;
    }

    /// <summary>Prepends recent turns so rule-based fallback can answer follow-ups (e.g. ""what about the second one?"").</summary>
    private static string AugmentMessageWithHistory(string? message, IReadOnlyList<ChatMessageDto>? history)
    {
        if (history == null || history.Count == 0) return message ?? "";
        var lines = new List<string>();
        foreach (var h in history.TakeLast(12))
        {
            if (h == null) continue;
            var r = string.IsNullOrWhiteSpace(h.Role) ? "user" : h.Role.Trim();
            var c = (h.Content ?? "").Trim();
            if (c.Length == 0) continue;
            if (c.Length > 600) c = c[..600] + "…";
            lines.Add($"{r}: {c}");
        }
        if (lines.Count == 0) return message ?? "";
        return "Earlier in this chat:\n" + string.Join("\n", lines) + "\n\nCurrent message: " + (message ?? "");
    }

    public async Task<RecommendationResponse?> UpdateSavedAsync(int userId, int recommendationId, bool saved, CancellationToken ct = default)
    {
        var r = await _db.CareerRecommendations.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == recommendationId, ct);
        if (r == null) return null;
        r.Saved = saved;
        await _db.SaveChangesAsync(ct);
        return ToResponse(r);
    }

    private static RecommendationResponse ToResponse(CareerRecommendation r)
    {
        int? match = null;
        string? salary = null;
        string? growth = null;
        IReadOnlyList<string>? skills = null;
        IReadOnlyList<LearningPathStepDto>? path = null;
        if (!string.IsNullOrWhiteSpace(r.MetadataJson))
        {
            try
            {
                var meta = JsonSerializer.Deserialize<JsonElement>(r.MetadataJson);
                if (meta.TryGetProperty("matchPercentage", out var m) && m.TryGetInt32(out var mi)) match = mi;
                if (meta.TryGetProperty("salaryRange", out var s)) salary = s.GetString();
                if (meta.TryGetProperty("growth", out var g)) growth = g.GetString();
                if (meta.TryGetProperty("skills", out var sk) && sk.ValueKind == JsonValueKind.Array)
                    skills = sk.EnumerateArray().Select(x => x.GetString() ?? "").ToList();
                if (meta.TryGetProperty("learningPath", out var lp) && lp.ValueKind == JsonValueKind.Array)
                    path = lp.EnumerateArray().Select(p => new LearningPathStepDto(
                        p.TryGetProperty("step", out var st) && st.TryGetInt32(out var si) ? si : 0,
                        p.TryGetProperty("title", out var pt) ? pt.GetString() ?? "" : "",
                        p.TryGetProperty("duration", out var pd) ? pd.GetString() ?? "" : ""
                    )).ToList();
            }
            catch { /* ignore parse errors */ }
        }
        return new RecommendationResponse(r.Id, r.UserId, r.Title, r.Description, r.Category, r.Saved, r.SortOrder, r.CreatedAt, match, salary, growth, skills, path);
    }
}
