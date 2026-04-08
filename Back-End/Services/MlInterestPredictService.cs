using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using BackEnd.DTOs;
using Microsoft.Extensions.Options;

namespace BackEnd.Services;

public sealed class MlSettings
{
    /// <summary>Base URL only (no trailing path), e.g. http://127.0.0.1:5052 (Flask) or http://127.0.0.1:5055 (FastAPI)</summary>
    public string PythonPredictBaseUrl { get; set; } = "";

    /// <summary>FastApi = ml/predict_api.py (uvicorn, /predict/json). Flask = ml/career_flask_api (POST /recommend-career, /recommend-top3).</summary>
    public string PythonPredictStyle { get; set; } = "FastApi";

    /// <summary>If true (typical in Development), the API spawns python app.py for career_flask_api when Flask is not already reachable.</summary>
    public bool AutoStartFlask { get; set; }

    /// <summary>Optional absolute path to ml/career_flask_api. Empty = sibling of Back-End: ../ml/career_flask_api</summary>
    public string? FlaskAppDirectory { get; set; }

    /// <summary>Python launcher, e.g. python, py, python3, or full path. Empty = python</summary>
    public string? PythonExecutable { get; set; }
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

internal sealed class FlaskRecommendCareerResponse
{
    [JsonPropertyName("best_career")]
    public string? BestCareer { get; set; }
}

internal sealed class FlaskTop3ItemDto
{
    [JsonPropertyName("career")]
    public string? Career { get; set; }

    [JsonPropertyName("probability")]
    public double Probability { get; set; }
}

internal sealed class FlaskRecommendTop3Response
{
    [JsonPropertyName("recommendations")]
    public List<FlaskTop3ItemDto>? Recommendations { get; set; }
}

internal sealed class FlaskErrorBody
{
    [JsonPropertyName("error")]
    public string? Error { get; set; }

    [JsonPropertyName("code")]
    public string? Code { get; set; }
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
                Message =
                    "ML Python service URL is not configured. Set ML:PythonPredictBaseUrl in appsettings.json "
                    + "(Flask: http://127.0.0.1:5052, FastAPI: http://127.0.0.1:5055) — see ml/career_flask_api/README.md or ml/HOWTO-USE-MODEL.md.",
            };
        }

        var combined = CombinedSurveyText(interests, skills, certificateCourseTitle, ugCourse, ugSpecialization);
        if (string.IsNullOrWhiteSpace(combined))
        {
            return new PredictInterestResponse
            {
                Available = false,
                Message = "Provide at least one non-empty field (interests, skills, certificates, or education).",
            };
        }

        var style = (_settings.PythonPredictStyle ?? "FastApi").Trim();
        if (string.Equals(style, "Flask", StringComparison.OrdinalIgnoreCase))
            return await PredictViaFlaskAsync(baseUrl, combined, topK, ct);

        return await PredictViaFastApiAsync(baseUrl, interests, skills, certificateCourseTitle, ugCourse, ugSpecialization, topK, ct);
    }

    private static string CombinedSurveyText(
        string? interests,
        string? skills,
        string? certificateCourseTitle,
        string? ugCourse,
        string? ugSpecialization)
    {
        IEnumerable<string> parts =
        [
            (interests ?? "").Trim(),
            (skills ?? "").Trim(),
            (certificateCourseTitle ?? "").Trim(),
            (ugCourse ?? "").Trim(),
            (ugSpecialization ?? "").Trim(),
        ];
        return string.Join(" ", parts.Where(p => p.Length > 0)).ToLowerInvariant();
    }

    private async Task<PredictInterestResponse> PredictViaFlaskAsync(
        string baseUrl,
        string combinedText,
        int? topK,
        CancellationToken ct)
    {
        var root = baseUrl.TrimEnd('/');
        var client = _httpFactory.CreateClient();
        client.Timeout = TimeSpan.FromSeconds(25);

        try
        {
            if (topK is > 1)
            {
                var topUrl = root + "/recommend-top3";
                using var topResp = await client.PostAsJsonAsync(topUrl, new Dictionary<string, string> { ["text"] = combinedText }, ct);
                if (topResp.IsSuccessStatusCode)
                {
                    var topData = await topResp.Content.ReadFromJsonAsync<FlaskRecommendTop3Response>(JsonReadOpts, ct);
                    if (topData?.Recommendations is { Count: > 0 })
                    {
                        var items = topData.Recommendations
                            .Where(x => !string.IsNullOrWhiteSpace(x.Career))
                            .Select(x => new MlTopPredictionItem { Label = x.Career!.Trim(), Probability = x.Probability })
                            .ToList();
                        var k = Math.Min(topK.Value, items.Count);
                        if (k < items.Count)
                            items = items.Take(k).ToList();
                        var best = items[0].Label;
                        return new PredictInterestResponse
                        {
                            Available = true,
                            PredictedCategory = best,
                            TopPredictions = items,
                        };
                    }
                }
                else if (topResp.StatusCode == System.Net.HttpStatusCode.NotImplemented) // 501 — no predict_proba
                {
                    _logger.LogInformation("Flask /recommend-top3 returned 501; falling back to /recommend-career.");
                }
                else
                {
                    var errBody = await TryReadFlaskErrorAsync(topResp, ct);
                    _logger.LogWarning("Flask recommend-top3 failed {Status}: {Body}", (int)topResp.StatusCode, errBody);
                }
            }

            var url = root + "/recommend-career";
            using var response = await client.PostAsJsonAsync(url, new Dictionary<string, string> { ["text"] = combinedText }, ct);
            if (!response.IsSuccessStatusCode)
            {
                var body = await TryReadFlaskErrorAsync(response, ct);
                _logger.LogWarning("Flask recommend-career failed {Status}: {Body}", (int)response.StatusCode, body);
                return new PredictInterestResponse
                {
                    Available = false,
                    Message = response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable
                        ? "Flask model service returned 503 — copy vectorizer.pkl, career_model.pkl, label_encoder.pkl into career_flask_api/models (or set CAREER_MODEL_DIR) and run python app.py."
                        : body ?? "Flask career API returned an error. Is career_flask_api running on the configured URL?",
                };
            }

            var data = await response.Content.ReadFromJsonAsync<FlaskRecommendCareerResponse>(JsonReadOpts, ct);
            if (data == null || string.IsNullOrWhiteSpace(data.BestCareer))
            {
                return new PredictInterestResponse
                {
                    Available = false,
                    Message = "Unexpected response from Flask career API.",
                };
            }

            return new PredictInterestResponse
            {
                Available = true,
                PredictedCategory = data.BestCareer.Trim(),
            };
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not reach Flask career API at {Base}", root);
            var hint = ex is HttpRequestException hre && !string.IsNullOrWhiteSpace(hre.Message)
                ? $" ({hre.Message.Trim()})"
                : "";
            return new PredictInterestResponse
            {
                Available = false,
                Message =
                    "Could not reach the Flask career API."
                    + hint
                    + " Nothing is listening on that address — start Python in a separate window and leave it open: "
                    + "from repo root run scripts/start-flask-career-api-window.ps1, or from ml/career_flask_api run start-career-api.ps1 "
                    + "(it installs Flask/sklearn via pip if missing). Default URL http://127.0.0.1:5052 must match ML:PythonPredictBaseUrl in appsettings.json.",
            };
        }
    }

    private static async Task<string?> TryReadFlaskErrorAsync(HttpResponseMessage response, CancellationToken ct)
    {
        try
        {
            var raw = await response.Content.ReadAsStringAsync(ct);
            var err = JsonSerializer.Deserialize<FlaskErrorBody>(raw, JsonReadOpts);
            if (!string.IsNullOrWhiteSpace(err?.Error))
                return err.Error;
            return string.IsNullOrWhiteSpace(raw) ? null : raw;
        }
        catch
        {
            return null;
        }
    }

    private async Task<PredictInterestResponse> PredictViaFastApiAsync(
        string baseUrl,
        string? interests,
        string? skills,
        string? certificateCourseTitle,
        string? ugCourse,
        string? ugSpecialization,
        int? topK,
        CancellationToken ct)
    {
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
