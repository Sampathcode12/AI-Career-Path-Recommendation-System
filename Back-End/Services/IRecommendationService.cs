using System.Text.Json.Serialization;
using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IRecommendationService
{
    Task<IReadOnlyList<RecommendationResponse>> GetAllByUserIdAsync(int userId, CancellationToken ct = default);
    Task<RecommendationGenerateResponse> GenerateAsync(int userId, CancellationToken ct = default);
    Task<RecommendationResponse?> UpdateSavedAsync(int userId, int recommendationId, bool saved, CancellationToken ct = default);
    Task<string> ChatAboutRecommendationsAsync(int userId, string message, IReadOnlyList<ChatMessageDto> conversationHistory, CancellationToken ct = default);
}

/// <summary>One turn in the chat; JSON uses role/content (user | assistant).</summary>
public sealed class ChatMessageDto
{
    [JsonPropertyName("role")]
    public string? Role { get; set; }

    [JsonPropertyName("content")]
    public string? Content { get; set; }
}
