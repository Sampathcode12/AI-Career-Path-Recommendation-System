using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class JobService : IJobService
{
    private readonly ApplicationDbContext _db;

    public JobService(ApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<JobListingResponse>> SearchAsync(JobSearchRequest request, int? userId, CancellationToken ct = default)
    {
        var query = _db.JobListings.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var q = request.Query.ToLower();
            query = query.Where(j =>
                (j.Title != null && j.Title.ToLower().Contains(q)) ||
                (j.Company != null && j.Company.ToLower().Contains(q)) ||
                (j.Sector != null && j.Sector.ToLower().Contains(q)) ||
                (j.Category != null && j.Category.ToLower().Contains(q)));
        }
        if (!string.IsNullOrWhiteSpace(request.Location))
            query = query.Where(j => j.Location != null && j.Location.ToLower().Contains(request.Location.ToLower()));
        if (!string.IsNullOrWhiteSpace(request.Category)
            && !string.Equals(request.Category.Trim(), "All", StringComparison.OrdinalIgnoreCase))
        {
            var cat = request.Category.Trim();
            query = query.Where(j =>
                j.Category != null
                && string.Equals(j.Category, cat, StringComparison.OrdinalIgnoreCase));
        }
        if (!string.IsNullOrWhiteSpace(request.Sector))
            query = query.Where(j => j.Sector != null && j.Sector.ToLower().Contains(request.Sector.ToLower()));
        var list = await query.OrderBy(j => j.Title).Take(100).ToListAsync(ct);
        return list.Select(ToListingResponse).ToList();
    }

    public async Task<IReadOnlyList<JobListingResponse>> GetTopJobsAsync(string? category, int limit, CancellationToken ct = default)
    {
        var query = _db.JobListings.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category)
            && !string.Equals(category.Trim(), "All", StringComparison.OrdinalIgnoreCase))
        {
            var cat = category.Trim();
            query = query.Where(j =>
                j.Category != null
                && string.Equals(j.Category, cat, StringComparison.OrdinalIgnoreCase));
        }
        var list = await query.OrderBy(j => j.Title).Take(limit).ToListAsync(ct);
        return list.Select(ToListingResponse).ToList();
    }

    public async Task<IReadOnlyList<JobItemResponse>> GetSavedByUserIdAsync(int userId, CancellationToken ct = default)
    {
        var list = await _db.SavedJobs.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SavedAt)
            .ToListAsync(ct);
        return list.Select(j => new JobItemResponse(j.Id, j.Title, j.Company, j.Location, j.Url, j.Description, j.SavedAt)).ToList();
    }

    public async Task<JobItemResponse> SaveJobAsync(int userId, JobSaveRequest request, CancellationToken ct = default)
    {
        var job = new SavedJob
        {
            UserId = userId,
            Title = request.Title,
            Company = request.Company,
            Location = request.Location,
            Url = request.Url,
            Description = request.Description,
            SavedAt = DateTime.UtcNow
        };
        _db.SavedJobs.Add(job);
        await _db.SaveChangesAsync(ct);
        return new JobItemResponse(job.Id, job.Title, job.Company, job.Location, job.Url, job.Description, job.SavedAt);
    }

    private static JobListingResponse ToListingResponse(JobListing j)
    {
        var skills = ParseJsonArray(j.SkillsJson);
        var path = ParseCareerPath(j.CareerPathJson);
        return new JobListingResponse(j.Id, j.Title, j.Company, j.Location, j.Sector, j.Category, j.SalaryRange, j.Growth, j.Description, j.Url, skills, path);
    }

    private static IReadOnlyList<string> ParseJsonArray(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return Array.Empty<string>();
        try
        {
            var arr = JsonSerializer.Deserialize<string[]>(s);
            return arr ?? Array.Empty<string>();
        }
        catch { return Array.Empty<string>(); }
    }

    private static IReadOnlyList<CareerPathStepDto>? ParseCareerPath(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        try
        {
            var arr = JsonSerializer.Deserialize<JsonElement>(s);
            if (arr.ValueKind != JsonValueKind.Array) return null;
            var list = new List<CareerPathStepDto>();
            foreach (var el in arr.EnumerateArray())
            {
                var step = el.TryGetProperty("step", out var st) && st.TryGetInt32(out var si) ? si : 0;
                var title = el.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                var dur = el.TryGetProperty("duration", out var d) ? d.GetString() : null;
                list.Add(new CareerPathStepDto(step, title, dur));
            }
            return list;
        }
        catch { return null; }
    }
}
