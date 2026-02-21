using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IRecommendationService
{
    Task<IReadOnlyList<RecommendationResponse>> GetAllByUserIdAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<RecommendationResponse>> GenerateAsync(int userId, CancellationToken ct = default);
    Task<RecommendationResponse?> UpdateSavedAsync(int userId, int recommendationId, bool saved, CancellationToken ct = default);
}
