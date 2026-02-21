using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class ProfileService : IProfileService
{
    private readonly ApplicationDbContext _db;

    public ProfileService(ApplicationDbContext db) => _db = db;

    public async Task<ProfileResponse?> GetByUserIdAsync(int userId, CancellationToken ct = default)
    {
        var p = await _db.UserProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, ct);
        return p == null ? null : ToResponse(p);
    }

    public async Task<ProfileResponse> CreateAsync(int userId, ProfileCreateOrUpdateRequest request, CancellationToken ct = default)
    {
        var profile = new UserProfile
        {
            UserId = userId,
            Skills = request.Skills,
            Interests = request.Interests,
            ExperienceLevel = request.ExperienceLevel,
            Education = request.Education,
            PreferredIndustries = request.PreferredIndustries,
            UpdatedAt = DateTime.UtcNow
        };
        _db.UserProfiles.Add(profile);
        await _db.SaveChangesAsync(ct);
        return ToResponse(profile);
    }

    public async Task<ProfileResponse?> UpdateAsync(int userId, ProfileCreateOrUpdateRequest request, CancellationToken ct = default)
    {
        var profile = await _db.UserProfiles.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (profile == null) return null;

        profile.Skills = request.Skills ?? profile.Skills;
        profile.Interests = request.Interests ?? profile.Interests;
        profile.ExperienceLevel = request.ExperienceLevel ?? profile.ExperienceLevel;
        profile.Education = request.Education ?? profile.Education;
        profile.PreferredIndustries = request.PreferredIndustries ?? profile.PreferredIndustries;
        profile.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ToResponse(profile);
    }

    private static ProfileResponse ToResponse(UserProfile p) =>
        new(p.Id, p.UserId, p.Skills, p.Interests, p.ExperienceLevel, p.Education, p.PreferredIndustries, p.UpdatedAt);
}
