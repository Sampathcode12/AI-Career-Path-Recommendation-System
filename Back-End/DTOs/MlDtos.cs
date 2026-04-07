using System.Text.Json.Serialization;

namespace BackEnd.DTOs;

public sealed class PredictInterestRequest
{
    public string? Interests { get; set; }
    public string? Skills { get; set; }
    public string? CertificateCourseTitle { get; set; }
    public string? UgCourse { get; set; }
    public string? UgSpecialization { get; set; }
    /// <summary>If set (e.g. 3), Python may return top_predictions when the model supports predict_proba.</summary>
    public int? TopK { get; set; }
}

public sealed class MlTopPredictionItem
{
    [JsonPropertyName("label")]
    public string Label { get; set; } = "";

    [JsonPropertyName("probability")]
    public double Probability { get; set; }
}

/// <summary>Unified response so the SPA can show a hint without treating "unavailable" as HTTP error.</summary>
public sealed class PredictInterestResponse
{
    [JsonPropertyName("available")]
    public bool Available { get; init; }

    [JsonPropertyName("predicted_category")]
    public string? PredictedCategory { get; init; }

    [JsonPropertyName("label_index")]
    public int? LabelIndex { get; init; }

    [JsonPropertyName("classes")]
    public IReadOnlyList<string>? Classes { get; init; }

    [JsonPropertyName("top_predictions")]
    public IReadOnlyList<MlTopPredictionItem>? TopPredictions { get; init; }

    [JsonPropertyName("message")]
    public string? Message { get; init; }
}
