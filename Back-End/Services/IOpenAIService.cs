namespace BackEnd.Services;

/// <summary>AI service for career recommendations. Uses OpenAI API or an OpenAI-compatible local server (e.g. Ollama) when configured; otherwise returns null (template fallback).</summary>
public interface IOpenAIService
{
    /// <summary>Generate career recommendations from profile + assessment. Returns null if no LLM is configured or the call fails.</summary>
    Task<IReadOnlyList<AICareerSuggestion>?> GenerateRecommendationsAsync(string profileSummary, string assessmentSummary, CancellationToken ct = default);

    /// <summary>Continue conversation about recommendations. Returns null if no LLM is configured or the call fails.</summary>
    Task<string?> ChatAsync(string userMessage, IReadOnlyList<object> conversationHistory, string recommendationsContext, CancellationToken ct = default);
}

public record AICareerSuggestion(
    string Title,
    string Description,
    string Category,
    int? MatchPercentage,
    string? SalaryRange,
    string? Growth,
    IReadOnlyList<string>? Skills,
    IReadOnlyList<LearningPathStep>? LearningPath);

public record LearningPathStep(int Step, string Title, string Duration);
