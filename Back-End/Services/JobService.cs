using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class JobService : IJobService
{
    private readonly ApplicationDbContext _db;

    public JobService(ApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<JobItemResponse>> SearchAsync(JobSearchRequest request, int? userId, CancellationToken ct = default)
    {
        // Placeholder: return sample jobs; in production you would call an external job API or search DB
        var samples = new List<JobItemResponse>
        {
            new(0, "Software Engineer", "Tech Corp", "Remote", "https://example.com/job/1", "Build scalable systems.", DateTime.UtcNow),
            new(0, "Data Scientist", "Data Inc", "New York", "https://example.com/job/2", "Analyze and model data.", DateTime.UtcNow),
            new(0, "Frontend Developer", "Web Co", "London", "https://example.com/job/3", "Create beautiful UIs.", DateTime.UtcNow)
        };
        if (!string.IsNullOrWhiteSpace(request.Query))
            samples = samples.Where(j => j.Title.Contains(request.Query, StringComparison.OrdinalIgnoreCase)).ToList();
        return await Task.FromResult(samples);
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
}
