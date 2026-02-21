using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IAssessmentService
{
    Task<AssessmentResponse?> GetLatestByUserIdAsync(int userId, CancellationToken ct = default);
    Task<AssessmentResponse> CreateAsync(int userId, AssessmentCreateRequest request, CancellationToken ct = default);
}
