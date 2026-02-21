using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class RecommendationService : IRecommendationService
{
    private readonly ApplicationDbContext _db;

    public RecommendationService(ApplicationDbContext db) => _db = db;

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
        // Placeholder: generate sample recommendations based on profile/assessment if available
        var profile = await _db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, ct);
        var existing = await _db.CareerRecommendations.Where(x => x.UserId == userId).ToListAsync(ct);
        _db.CareerRecommendations.RemoveRange(existing);
        await _db.SaveChangesAsync(ct);

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
        await _db.SaveChangesAsync(ct);

        var newList = await _db.CareerRecommendations.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        return newList.Select(ToResponse).ToList();
    }

    public async Task<RecommendationResponse?> UpdateSavedAsync(int userId, int recommendationId, bool saved, CancellationToken ct = default)
    {
        var r = await _db.CareerRecommendations.FirstOrDefaultAsync(x => x.UserId == userId && x.Id == recommendationId, ct);
        if (r == null) return null;
        r.Saved = saved;
        await _db.SaveChangesAsync(ct);
        return ToResponse(r);
    }

    private static RecommendationResponse ToResponse(CareerRecommendation r) =>
        new(r.Id, r.UserId, r.Title, r.Description, r.Category, r.Saved, r.SortOrder, r.CreatedAt);
}
