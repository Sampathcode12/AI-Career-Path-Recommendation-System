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
        var p = await _db.UserProfiles.AsNoTracking()
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.UserId == userId, ct);
        return p == null ? null : ToResponse(p);
    }

    public async Task<ProfileResponse> CreateAsync(int userId, ProfileCreateOrUpdateRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (!string.IsNullOrWhiteSpace(request.DisplayName) && user != null)
            user.Name = request.DisplayName.Trim();

        var profile = new UserProfile
        {
            UserId = userId,
            Skills = request.Skills,
            Interests = request.Interests,
            ExperienceLevel = request.ExperienceLevel,
            Education = request.Education,
            PreferredIndustries = request.PreferredIndustries,
            Location = request.Location,
            Bio = request.Bio,
            LinkedInUrl = request.LinkedInUrl,
            PortfolioUrl = request.PortfolioUrl,
            Gender = request.Gender,
            UgCourse = request.UgCourse,
            UgSpecialization = request.UgSpecialization,
            UgCgpaOrPercentage = request.UgCgpaOrPercentage,
            HasAdditionalCertifications = request.HasAdditionalCertifications,
            CertificateCourseTitles = request.CertificateCourseTitles,
            IsWorking = request.IsWorking,
            FirstJobTitle = request.FirstJobTitle,
            MastersField = request.MastersField,
            UpdatedAt = DateTime.UtcNow
        };
        _db.UserProfiles.Add(profile);
        await _db.SaveChangesAsync(ct);
        var reloaded = await _db.UserProfiles.AsNoTracking()
            .Include(x => x.User)
            .FirstAsync(x => x.Id == profile.Id, ct);
        return ToResponse(reloaded);
    }

    public async Task<ProfileResponse?> UpdateAsync(int userId, ProfileCreateOrUpdateRequest request, CancellationToken ct = default)
    {
        var profile = await _db.UserProfiles.Include(x => x.User).FirstOrDefaultAsync(x => x.UserId == userId, ct);
        // Upsert: survey "Save" often uses PUT; create row if missing (avoids 404 after reset DB or first-time race).
        if (profile == null)
            return await CreateAsync(userId, request, ct);

        if (!string.IsNullOrWhiteSpace(request.DisplayName) && profile.User != null)
            profile.User.Name = request.DisplayName.Trim();

        profile.Skills = request.Skills ?? profile.Skills;
        profile.Interests = request.Interests ?? profile.Interests;
        profile.ExperienceLevel = request.ExperienceLevel ?? profile.ExperienceLevel;
        profile.Education = request.Education ?? profile.Education;
        profile.PreferredIndustries = request.PreferredIndustries ?? profile.PreferredIndustries;
        profile.Location = request.Location ?? profile.Location;
        profile.Bio = request.Bio ?? profile.Bio;
        profile.LinkedInUrl = request.LinkedInUrl ?? profile.LinkedInUrl;
        profile.PortfolioUrl = request.PortfolioUrl ?? profile.PortfolioUrl;
        profile.Gender = request.Gender ?? profile.Gender;
        profile.UgCourse = request.UgCourse ?? profile.UgCourse;
        profile.UgSpecialization = request.UgSpecialization ?? profile.UgSpecialization;
        profile.UgCgpaOrPercentage = request.UgCgpaOrPercentage ?? profile.UgCgpaOrPercentage;
        if (request.HasAdditionalCertifications.HasValue) profile.HasAdditionalCertifications = request.HasAdditionalCertifications;
        profile.CertificateCourseTitles = request.CertificateCourseTitles ?? profile.CertificateCourseTitles;
        if (request.IsWorking.HasValue) profile.IsWorking = request.IsWorking;
        profile.FirstJobTitle = request.FirstJobTitle ?? profile.FirstJobTitle;
        profile.MastersField = request.MastersField ?? profile.MastersField;
        profile.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return ToResponse(profile);
    }

    private static ProfileResponse ToResponse(UserProfile p) =>
        new(
            p.Id,
            p.UserId,
            p.User?.Name,
            p.Skills,
            p.Interests,
            p.ExperienceLevel,
            p.Education,
            p.PreferredIndustries,
            p.Location,
            p.Bio,
            p.LinkedInUrl,
            p.PortfolioUrl,
            p.Gender,
            p.UgCourse,
            p.UgSpecialization,
            p.UgCgpaOrPercentage,
            p.HasAdditionalCertifications,
            p.CertificateCourseTitles,
            p.IsWorking,
            p.FirstJobTitle,
            p.MastersField,
            p.UpdatedAt);
}
