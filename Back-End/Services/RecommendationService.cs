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
    private readonly ILogger<RecommendationService> _logger;

    public RecommendationService(ApplicationDbContext db, IOpenAIService openAI, ILogger<RecommendationService> logger)
    {
        _db = db;
        _openAI = openAI;
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

    public async Task<IReadOnlyList<RecommendationResponse>> GenerateAsync(int userId, CancellationToken ct = default)
    {
        try
        {
            return await GenerateCoreAsync(userId, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI recommendation generation failed for user {UserId}; using template careers.", userId);
            try
            {
                return await PersistTemplateRecommendationsAsync(userId, ct);
            }
            catch (Exception ex2)
            {
                _logger.LogError(ex2, "Could not save template recommendations for user {UserId}; returning in-memory list.", userId);
                return BuildInMemoryTemplateResponses(userId);
            }
        }
    }

    private async Task<IReadOnlyList<RecommendationResponse>> GenerateCoreAsync(int userId, CancellationToken ct)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        var profile = await _db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, ct);
        var assessment = await _db.Assessments.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);

        var profileSummary = BuildProfileSummary(user, profile);
        var assessmentSummary = assessment?.ResultSummary ?? assessment?.AnswersJson ?? "No assessment data yet.";

        var aiSuggestions = await _openAI.GenerateRecommendationsAsync(profileSummary, assessmentSummary, ct);

        var existing = await _db.CareerRecommendations.Where(x => x.UserId == userId).ToListAsync(ct);
        _db.CareerRecommendations.RemoveRange(existing);
        await _db.SaveChangesAsync(ct);

        if (aiSuggestions != null && aiSuggestions.Count > 0)
        {
            for (var i = 0; i < aiSuggestions.Count; i++)
            {
                var s = aiSuggestions[i];
                var meta = new
                {
                    matchPercentage = s.MatchPercentage,
                    salaryRange = s.SalaryRange,
                    growth = s.Growth,
                    skills = s.Skills,
                    learningPath = s.LearningPath?.Select(lp => new { lp.Step, lp.Title, lp.Duration }).ToList()
                };
                _db.CareerRecommendations.Add(new CareerRecommendation
                {
                    UserId = userId,
                    Title = s.Title,
                    Description = s.Description,
                    Category = s.Category,
                    Saved = false,
                    SortOrder = i,
                    CreatedAt = DateTime.UtcNow,
                    MetadataJson = JsonSerializer.Serialize(meta)
                });
            }
        }
        else
        {
            for (var i = 0; i < RecommendationTemplateCatalog.Careers.Length; i++)
            {
                var (title, desc, category) = RecommendationTemplateCatalog.Careers[i];
                _db.CareerRecommendations.Add(new CareerRecommendation
                {
                    UserId = userId,
                    Title = title,
                    Description = desc,
                    Category = category,
                    Saved = false,
                    SortOrder = i,
                    CreatedAt = DateTime.UtcNow
                });
            }
        }
        await _db.SaveChangesAsync(ct);

        var newList = await _db.CareerRecommendations.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        return newList.Select(ToResponse).ToList();
    }

    private async Task<IReadOnlyList<RecommendationResponse>> PersistTemplateRecommendationsAsync(int userId, CancellationToken ct)
    {
        var existing = await _db.CareerRecommendations.Where(x => x.UserId == userId).ToListAsync(ct);
        _db.CareerRecommendations.RemoveRange(existing);
        await _db.SaveChangesAsync(ct);
        for (var i = 0; i < RecommendationTemplateCatalog.Careers.Length; i++)
        {
            var (title, desc, category) = RecommendationTemplateCatalog.Careers[i];
            _db.CareerRecommendations.Add(new CareerRecommendation
            {
                UserId = userId,
                Title = title,
                Description = desc,
                Category = category,
                Saved = false,
                SortOrder = i,
                CreatedAt = DateTime.UtcNow
            });
        }
        await _db.SaveChangesAsync(ct);
        var newList = await _db.CareerRecommendations.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        return newList.Select(ToResponse).ToList();
    }

    private static IReadOnlyList<RecommendationResponse> BuildInMemoryTemplateResponses(int userId)
    {
        var now = DateTime.UtcNow;
        var list = new List<RecommendationResponse>();
        for (var i = 0; i < RecommendationTemplateCatalog.Careers.Length; i++)
        {
            var (title, desc, category) = RecommendationTemplateCatalog.Careers[i];
            list.Add(new RecommendationResponse(
                Id: -(i + 1),
                UserId: userId,
                Title: title,
                Description: desc,
                Category: category,
                Saved: false,
                SortOrder: i,
                CreatedAt: now,
                MatchPercentage: 75 + i,
                SalaryRange: "See market data",
                Growth: "+10–15%",
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

    public async Task<string> ChatAboutRecommendationsAsync(int userId, string message, IReadOnlyList<ChatMessageDto> conversationHistory, CancellationToken ct = default)
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
                    "Database unavailable. The app may show built-in sample careers (Software Developer, Data Analyst, Product Manager, UX Designer, DevOps Engineer). Answer using the user's message; focus on any job title they mention.";
                var aiReply = await _openAI.ChatAsync(message, historyObjects, degradedContext, ct);
                if (!string.IsNullOrWhiteSpace(aiReply))
                    return aiReply + "\n\n(Note: SQL Server was not reachable — this reply used AI without your saved list. Fix ConnectionStrings:Default in appsettings, e.g. LocalDB, and restart the API.)";
            }
            catch { /* ignore */ }

            return CareerChatFallback.BuildReplyUsingTemplateCatalog(message);
        }

        try
        {
            var context = string.Join("\n", recommendations.Select(r =>
                $"- {r.Title}: {r.Description} (Category: {r.Category}, Match: {r.MatchPercentage}%, Salary: {r.SalaryRange}, Growth: {r.Growth})"));
            if (string.IsNullOrWhiteSpace(context)) context = "No recommendations yet. Generate recommendations first.";
            var historyObjects = BuildChatHistoryObjects(conversationHistory);
            var aiReply = await _openAI.ChatAsync(message, historyObjects, context, ct);
            if (!string.IsNullOrWhiteSpace(aiReply)) return aiReply;
            return CareerChatFallback.BuildReply(message, recommendations);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Chat: unexpected error for user {UserId}", userId);
            try
            {
                return CareerChatFallback.BuildReply(message, recommendations);
            }
            catch (Exception ex2)
            {
                _logger.LogError(ex2, "Chat: fallback reply failed for user {UserId}", userId);
                return "Something went wrong while generating a reply. Refresh the page and try again.";
            }
        }
    }

    private static List<object> BuildChatHistoryObjects(IReadOnlyList<ChatMessageDto> conversationHistory)
    {
        var list = new List<object>();
        foreach (var h in conversationHistory)
        {
            if (h == null) continue;
            var role = string.IsNullOrWhiteSpace(h.Role) ? "user" : h.Role.Trim();
            var content = h.Content ?? "";
            list.Add(new { role, content });
        }
        return list;
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
