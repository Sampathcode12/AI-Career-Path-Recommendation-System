using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IRecommendationService
{
    Task<IReadOnlyList<RecommendationResponse>> GetAllByUserIdAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<RecommendationResponse>> GenerateAsync(int userId, CancellationToken ct = default);
    Task<RecommendationResponse?> UpdateSavedAsync(int userId, int recommendationId, bool saved, CancellationToken ct = default);
    Task<string> ChatAboutRecommendationsAsync(int userId, string message, IReadOnlyList<ChatMessageDto> conversationHistory, CancellationToken ct = default);
}

public record ChatMessageDto(string Role, string Content);
