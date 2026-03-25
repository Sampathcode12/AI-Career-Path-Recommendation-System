using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IJobService
{
    Task<IReadOnlyList<JobListingResponse>> SearchAsync(JobSearchRequest request, int? userId, CancellationToken ct = default);
    Task<IReadOnlyList<JobListingResponse>> GetTopJobsAsync(string? category, int limit, CancellationToken ct = default);
    Task<IReadOnlyList<JobItemResponse>> GetSavedByUserIdAsync(int userId, CancellationToken ct = default);
    Task<JobItemResponse> SaveJobAsync(int userId, JobSaveRequest request, CancellationToken ct = default);
}
