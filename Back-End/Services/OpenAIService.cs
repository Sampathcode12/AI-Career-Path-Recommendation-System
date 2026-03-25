using System.Net.Http.Json;
using System.Text.Json;

namespace BackEnd.Services;

public class OpenAIService : IOpenAIService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly string? _apiKey;
    private readonly string _model;

    public OpenAIService(HttpClient http, IConfiguration config)
    {
        _http = http;
        _config = config;
        _apiKey = config["OpenAI:ApiKey"];
        _model = config["OpenAI:Model"] ?? "gpt-4o-mini";
        var baseUrl = config["OpenAI:BaseUrl"] ?? "https://api.openai.com/v1/";
        _http.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
        if (!string.IsNullOrWhiteSpace(_apiKey))
            _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");
    }

    public async Task<IReadOnlyList<AICareerSuggestion>?> GenerateRecommendationsAsync(string profileSummary, string assessmentSummary, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey)) return null;

        var prompt = $@"You are a career advisor. Given the following structured student/graduate profile (name, gender, UG course, major, interests, skills, grades, certifications, work status, job title, masters) and optional assessment, suggest 5-7 careers that fit well.

Profile:
{profileSummary}

Assessment:
{assessmentSummary}

Respond with a JSON array of objects. Each object must have: title, description, category, matchPercentage (1-100), salaryRange (e.g. ""$80k - $120k""), growth (e.g. ""+15%""), skills (array of strings), learningPath (array of objects with step, title, duration).
Example: [{{""title"":""Data Scientist"",""description"":""..."",""category"":""Technology"",""matchPercentage"":87,""salaryRange"":""$95k - $140k"",""growth"":""+18%"",""skills"":[""Python"",""ML""],""learningPath"":[{{""step"":1,""title"":""Learn Python"",""duration"":""2-3 months""}}]}}]
Return only valid JSON, no markdown or extra text.";

        var body = new
        {
            model = _model,
            messages = new[] { new { role = "user", content = prompt } },
            response_format = new { type = "json_object" },
            temperature = 0.7
        };

        try
        {
            var response = await _http.PostAsJsonAsync("chat/completions", body, ct);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<OpenAIResponse>(ct);
            var content = result?.Choices?[0]?.Message?.Content;
            if (string.IsNullOrWhiteSpace(content)) return null;

            var parsed = JsonSerializer.Deserialize<JsonElement>(content);
            if (parsed.ValueKind == JsonValueKind.Array)
            {
                var list = new List<AICareerSuggestion>();
                foreach (var item in parsed.EnumerateArray())
                {
                    var s = ParseSuggestion(item);
                    if (s != null) list.Add(s);
                }
                return list;
            }
            if (parsed.TryGetProperty("careers", out var arr))
            {
                var list = new List<AICareerSuggestion>();
                foreach (var item in arr.EnumerateArray())
                {
                    var s = ParseSuggestion(item);
                    if (s != null) list.Add(s);
                }
                return list;
            }
            return null;
        }
        catch
        {
            return null;
        }
    }

    private static AICareerSuggestion? ParseSuggestion(JsonElement item)
    {
        try
        {
            var title = item.GetProperty("title").GetString() ?? "Career";
            var desc = item.TryGetProperty("description", out var d) ? d.GetString() : null;
            var cat = item.TryGetProperty("category", out var c) ? c.GetString() : null;
            var match = item.TryGetProperty("matchPercentage", out var m) && m.TryGetInt32(out var mi) ? mi : (int?)null;
            var salary = item.TryGetProperty("salaryRange", out var sal) ? sal.GetString() : null;
            var growth = item.TryGetProperty("growth", out var g) ? g.GetString() : null;
            var skills = new List<string>();
            if (item.TryGetProperty("skills", out var sk) && sk.ValueKind == JsonValueKind.Array)
                foreach (var s in sk.EnumerateArray()) skills.Add(s.GetString() ?? "");
            var path = new List<LearningPathStep>();
            if (item.TryGetProperty("learningPath", out var lp) && lp.ValueKind == JsonValueKind.Array)
                foreach (var p in lp.EnumerateArray())
                {
                    var step = p.TryGetProperty("step", out var st) && st.TryGetInt32(out var si) ? si : path.Count + 1;
                    var t = p.TryGetProperty("title", out var pt) ? pt.GetString() ?? "" : "";
                    var dur = p.TryGetProperty("duration", out var pd) ? pd.GetString() ?? "" : "";
                    path.Add(new LearningPathStep(step, t, dur));
                }
            return new AICareerSuggestion(title, desc ?? "", cat ?? "", match, salary, growth, skills, path);
        }
        catch { return null; }
    }

    public async Task<string?> ChatAsync(string userMessage, IReadOnlyList<object> conversationHistory, string recommendationsContext, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_apiKey)) return null;

        var messages = new List<object>
        {
            new { role = "system", content = $@"You are a helpful career advisor. The user has received these career recommendations. Answer their follow-up questions about these careers, learning paths, skills, salary, or related topics. Be concise and helpful.

Recommended careers:
{recommendationsContext}" }
        };
        foreach (var m in conversationHistory) messages.Add(m);
        messages.Add(new { role = "user", content = userMessage });

        var body = new { model = _model, messages, temperature = 0.7 };

        try
        {
            var response = await _http.PostAsJsonAsync("chat/completions", body, ct);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<OpenAIResponse>(ct);
            return result?.Choices?[0]?.Message?.Content?.Trim();
        }
        catch
        {
            return null;
        }
    }

    private class OpenAIResponse
    {
        public List<Choice>? Choices { get; set; }
        public class Choice { public Message? Message { get; set; } }
        public class Message { public string? Content { get; set; } }
    }
}
