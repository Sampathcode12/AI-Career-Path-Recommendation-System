using System.Text.Json.Serialization;

namespace BackEnd.DTOs;

/// <summary>POST /api/recommendations/generate response — tells the UI whether rows came from the LLM or template fallback.</summary>
/// <summary>GET /api/recommendations/ai-setup-status — no secrets exposed.</summary>
public sealed record AiSetupStatusResponse(
    [property: JsonPropertyName("llm_configured")]
    bool LlmConfigured,
    [property: JsonPropertyName("provider")]
    string Provider,
    [property: JsonPropertyName("model")]
    string Model);

public sealed record RecommendationGenerateResponse(
    [property: JsonPropertyName("recommendations")]
    IReadOnlyList<RecommendationResponse> Recommendations,
    /// <summary>ai | template_no_key | template_llm_failed | template_error</summary>
    [property: JsonPropertyName("generation_source")]
    string GenerationSource);

public record RecommendationResponse(
    int Id,
    int UserId,
    string Title,
    string? Description,
    string? Category,
    bool Saved,
    int SortOrder,
    DateTime CreatedAt,
    int? MatchPercentage = null,
    string? SalaryRange = null,
    string? Growth = null,
    IReadOnlyList<string>? Skills = null,
    IReadOnlyList<LearningPathStepDto>? LearningPath = null);

public record LearningPathStepDto(int Step, string Title, string Duration);
