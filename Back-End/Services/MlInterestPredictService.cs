using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using BackEnd.DTOs;
using Microsoft.Extensions.Options;

namespace BackEnd.Services;

public sealed class MlSettings
{
    public string PythonPredictBaseUrl { get; set; } = "";
}

internal sealed class PythonTopPredictionDto
{
    [JsonPropertyName("label")]
    public string? Label { get; set; }

    [JsonPropertyName("probability")]
    public double Probability { get; set; }
}

internal sealed class PythonPredictJsonResponse
{
    [JsonPropertyName("predicted_category")]
    public string? PredictedCategory { get; set; }

    [JsonPropertyName("label_index")]
    public int LabelIndex { get; set; }

    [JsonPropertyName("classes")]
    public List<string>? Classes { get; set; }

    [JsonPropertyName("top_predictions")]
    public List<PythonTopPredictionDto>? TopPredictions { get; set; }
}

public sealed class MlInterestPredictService : IMlInterestPredictService
{
    private static readonly JsonSerializerOptions JsonReadOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private readonly IHttpClientFactory _httpFactory;
    private readonly MlSettings _settings;
    private readonly ILogger<MlInterestPredictService> _logger;

    public MlInterestPredictService(
        IHttpClientFactory httpFactory,
        IOptions<MlSettings> settings,
        ILogger<MlInterestPredictService> logger)
    {
        _httpFactory = httpFactory;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<PredictInterestResponse> PredictInterestAsync(
        string? interests,
        string? skills,
        string? certificateCourseTitle,
        string? ugCourse,
        string? ugSpecialization,
        int? topK,
        CancellationToken ct = default)
    {
        var baseUrl = (_settings.PythonPredictBaseUrl ?? "").Trim();
        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            return new PredictInterestResponse
            {
                Available = false,
                Message = "ML Python service URL is not configured. Set ML:PythonPredictBaseUrl in appsettings.json (e.g. http://127.0.0.1:5055) and run ml/predict_api.py — see ml/HOWTO-USE-MODEL.md.",
            };
        }

        var url = baseUrl.TrimEnd('/') + "/predict/json";
        var payload = new Dictionary<string, object?>
        {
            ["interests"] = interests ?? "",
            ["skills"] = skills ?? "",
            ["certificate_course_title"] = certificateCourseTitle ?? "",
            ["ug_course"] = ugCourse ?? "",
            ["ug_specialization"] = ugSpecialization ?? "",
        };
        if (topK is > 1)
            payload["top_k"] = topK.Value;

        try
        {
            var client = _httpFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(25);
            using var response = await client.PostAsJsonAsync(url, payload, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct);
                _logger.LogWarning("ML predict failed {Status}: {Body}", (int)response.StatusCode, body);
                return new PredictInterestResponse
                {
                    Available = false,
                    Message = response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable
                        ? "Python model service returned 503 — add vectorizer.pkl + career_model.pkl + label_encoder.pkl (or joblib trio) to ml/artifacts/ or start uvicorn."
                        : "Python model service returned an error. Is predict_api running?",
                };
            }

            var data = await response.Content.ReadFromJsonAsync<PythonPredictJsonResponse>(JsonReadOpts, ct);
            if (data == null || string.IsNullOrWhiteSpace(data.PredictedCategory))
            {
                return new PredictInterestResponse
                {
                    Available = false,
                    Message = "Unexpected response from Python model service.",
                };
            }

            IReadOnlyList<MlTopPredictionItem>? tops = null;
            if (data.TopPredictions is { Count: > 0 })
            {
                tops = data.TopPredictions
                    .Where(t => !string.IsNullOrWhiteSpace(t.Label))
                    .Select(t => new MlTopPredictionItem { Label = t.Label!.Trim(), Probability = t.Probability })
                    .ToList();
            }

            return new PredictInterestResponse
            {
                Available = true,
                PredictedCategory = data.PredictedCategory,
                LabelIndex = data.LabelIndex,
                Classes = data.Classes,
                TopPredictions = tops,
            };
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not reach ML Python service at {Url}", url);
            return new PredictInterestResponse
            {
                Available = false,
                Message = "Could not reach the Python prediction service. Start it with: uvicorn predict_api:app --port 5055 (from the ml folder).",
            };
        }
    }
}
