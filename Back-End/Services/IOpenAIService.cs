namespace BackEnd.Services;

/// <summary>AI service for career recommendations. Uses OpenAI API or an OpenAI-compatible local server (e.g. Ollama) when configured; otherwise returns null (template fallback).</summary>
public interface IOpenAIService
{
    /// <summary>True when a non-empty API key is set (or Local provider without requiring a key).</summary>
    bool IsLlmAvailable { get; }

    /// <summary>Configured AI:Provider value (e.g. Gemini, OpenAI, Groq, Local).</summary>
    string ConfiguredProvider { get; }

    /// <summary>Model id sent to the provider (e.g. gemini-2.0-flash).</summary>
    string ConfiguredModel { get; }

    /// <summary>Generate career recommendations from profile + assessment. Returns null if no LLM is configured or the call fails.</summary>
    /// <param name="surveyMlHint">Optional text from the Colab-trained interest classifier (interests/skills).</param>
    Task<IReadOnlyList<AICareerSuggestion>?> GenerateRecommendationsAsync(
        string profileSummary,
        string assessmentSummary,
        CancellationToken ct = default,
        string? surveyMlHint = null);

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
