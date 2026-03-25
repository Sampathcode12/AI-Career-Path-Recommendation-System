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

    public RecommendationService(ApplicationDbContext db, IOpenAIService openAI)
    {
        _db = db;
        _openAI = openAI;
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
            var samples = new[]
            {
                ("Software Developer", "Build applications and systems. Strong fit if you like problem-solving and coding.", "Technology"),
                ("Data Analyst", "Analyze data to drive decisions. Good fit for analytical and detail-oriented people.", "Data"),
                ("Product Manager", "Define product vision and work with engineering and design.", "Product"),
                ("UX Designer", "Design user experiences and interfaces. Ideal for creative and user-focused individuals.", "Design"),
                ("DevOps Engineer", "Bridge development and operations; focus on CI/CD and cloud infrastructure.", "Technology")
            };
            for (var i = 0; i < samples.Length; i++)
            {
                var (title, desc, category) = samples[i];
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

    public async Task<string?> ChatAboutRecommendationsAsync(int userId, string message, IReadOnlyList<ChatMessageDto> conversationHistory, CancellationToken ct = default)
    {
        var recommendations = await GetAllByUserIdAsync(userId, ct);
        var context = string.Join("\n", recommendations.Select(r =>
            $"- {r.Title}: {r.Description} (Category: {r.Category}, Match: {r.MatchPercentage}%, Salary: {r.SalaryRange}, Growth: {r.Growth})"));
        if (string.IsNullOrWhiteSpace(context)) context = "No recommendations yet. Generate recommendations first.";
        var history = conversationHistory.Select(h => (object)new { role = h.Role, content = h.Content }).ToList();
        return await _openAI.ChatAsync(message, history, context, ct);
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
