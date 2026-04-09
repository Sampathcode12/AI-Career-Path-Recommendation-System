using System.Net.Http.Json;
using System.Text.Json;

namespace BackEnd.Services;

/// <summary>
/// Calls any OpenAI-compatible chat/completions API.
/// Supported providers (set AI:Provider in appsettings):
///   Gemini  — Google Gemini (free tier, https://aistudio.google.com)
///   OpenAI  — OpenAI cloud
///   Groq    — Groq cloud (free tier)
///   Local   — Ollama / LM Studio on localhost
/// </summary>
public class OpenAIService : IOpenAIService
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _http;
    private readonly bool _llmAvailable;
    private readonly bool _isLocal;
    private readonly string _model;
    private readonly string _provider;

    public bool IsLlmAvailable => _llmAvailable;

    public string ConfiguredProvider => _provider;

    public string ConfiguredModel => _model;

    public OpenAIService(HttpClient http, IConfiguration config)
    {
        _http = http;

        _provider = (config["AI:Provider"] ?? "Gemini").Trim();
        var section = $"AI:{_provider}";

        var baseUrl = config[$"{section}:BaseUrl"]
            ?? _provider switch
            {
                "Gemini" => "https://generativelanguage.googleapis.com/v1beta/openai/",
                "Groq"   => "https://api.groq.com/openai/v1/",
                "Local"  => "http://localhost:11434/v1/",
                _        => "https://api.openai.com/v1/"
            };

        _model = config[$"{section}:Model"]
            ?? _provider switch
            {
                "Gemini" => "gemini-2.0-flash",
                "Groq"   => "llama-3.3-70b-versatile",
                "Local"  => "llama3.2",
                _        => "gpt-4o-mini"
            };

        var apiKey = (config[$"{section}:ApiKey"] ?? "").Trim();
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            apiKey = _provider switch
            {
                var p when p.Equals("Gemini", StringComparison.OrdinalIgnoreCase)
                    => Environment.GetEnvironmentVariable("GEMINI_API_KEY")?.Trim() ?? "",
                var p when p.Equals("Groq", StringComparison.OrdinalIgnoreCase)
                    => Environment.GetEnvironmentVariable("GROQ_API_KEY")?.Trim() ?? "",
                var p when p.Equals("OpenAI", StringComparison.OrdinalIgnoreCase)
                    => Environment.GetEnvironmentVariable("OPENAI_API_KEY")?.Trim() ?? "",
                _ => ""
            };
        }

        _isLocal = _provider.Equals("Local", StringComparison.OrdinalIgnoreCase);
        _llmAvailable = _isLocal || !string.IsNullOrWhiteSpace(apiKey);

        _http.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
        if (!string.IsNullOrWhiteSpace(apiKey))
            _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
    }

    public async Task<IReadOnlyList<AICareerSuggestion>?> GenerateRecommendationsAsync(
        string profileSummary,
        string assessmentSummary,
        CancellationToken ct = default,
        string? surveyMlHint = null)
    {
        if (!_llmAvailable) return null;

        var mlBlock = string.IsNullOrWhiteSpace(surveyMlHint)
            ? ""
            : $"""

Survey-trained interest classifier (from the same kind of interests/skills text as your training data — prioritize careers consistent with this signal when it matches the rest of the profile):
{surveyMlHint.Trim()}
""";

        var prompt = $@"You are a career advisor. Given the profile and assessment below, suggest 5-7 careers that specifically fit THIS person — use their education, skills, interests, location, and assessment answers. Do not output a generic unrelated list; tie each role to evidence from the profile/assessment in the description. If a survey ML hint is included below, weight suggested careers toward those clusters when they align with the user's stated interests and skills.
{mlBlock}
Profile:
{profileSummary}

Assessment:
{assessmentSummary}

Respond with a JSON array of objects. Each object must have: title, description, category, matchPercentage (1-100), salaryRange (e.g. ""$80k - $120k"" or a realistic range for their region if inferable), growth (e.g. ""+15%""), skills (array of strings), learningPath (array of objects with step, title, duration).
Example: [{{""title"":""Data Scientist"",""description"":""..."",""category"":""Technology"",""matchPercentage"":87,""salaryRange"":""$95k - $140k"",""growth"":""+18%"",""skills"":[""Python"",""ML""],""learningPath"":[{{""step"":1,""title"":""Learn Python"",""duration"":""2-3 months""}}]}}]
Return only valid JSON, no markdown or extra text.";

        try
        {
            var body = BuildRequestBody(new[] { new { role = "user", content = prompt } });
            var response = await _http.PostAsJsonAsync("chat/completions", body, ct);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<ChatCompletionResponse>(JsonOpts, ct);
            var raw = result?.Choices?[0]?.Message?.Content;
            if (string.IsNullOrWhiteSpace(raw)) return null;

            var json = NormalizeModelJson(raw);
            if (string.IsNullOrWhiteSpace(json)) return null;

            return ParseSuggestionList(JsonSerializer.Deserialize<JsonElement>(json));
        }
        catch
        {
            return null;
        }
    }

    public async Task<string?> ChatAsync(
        string userMessage, IReadOnlyList<object> conversationHistory,
        string recommendationsContext, CancellationToken ct = default)
    {
        if (!_llmAvailable) return null;

        try
        {
            var messages = new List<object>
            {
                new { role = "system", content = $@"You are a helpful career advisor (like ChatGPT for careers). The user has career recommendations below.

Rules:
- This is a multi-turn conversation: you see prior user and assistant messages in the thread. Use that context—answer follow-ups, clarifications, and ""what about..."" questions naturally.
- Stay grounded in the recommended careers when relevant; you may add general career advice if helpful.
- Be clear and concise; use short paragraphs or bullets when listing steps or skills.

Recommended careers:
{recommendationsContext ?? ""}" }
            };
            foreach (var m in conversationHistory ?? Array.Empty<object>())
                if (m != null) messages.Add(m);
            messages.Add(new { role = "user", content = userMessage ?? "" });

            var body = BuildRequestBody(messages);
            var response = await _http.PostAsJsonAsync("chat/completions", body, ct);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<ChatCompletionResponse>(JsonOpts, ct);
            return result?.Choices?[0]?.Message?.Content?.Trim();
        }
        catch
        {
            return null;
        }
    }

    private object BuildRequestBody(object messages) =>
        new { model = _model, messages, temperature = 0.7, max_tokens = 2048 };

    #region JSON helpers

    private static string? NormalizeModelJson(string raw)
    {
        var s = raw.Trim();
        if (s.StartsWith("```", StringComparison.Ordinal))
        {
            var firstNl = s.IndexOf('\n');
            if (firstNl >= 0) s = s[(firstNl + 1)..].TrimStart();
            var fence = s.LastIndexOf("```", StringComparison.Ordinal);
            if (fence >= 0) s = s[..fence].TrimEnd();
        }

        s = s.Trim();
        if (s.Length == 0) return null;

        var objStart = s.IndexOf('{');
        var arrStart = s.IndexOf('[');
        if (arrStart >= 0 && (objStart < 0 || arrStart < objStart))
        {
            var end = s.LastIndexOf(']');
            if (end > arrStart) return s.Substring(arrStart, end - arrStart + 1);
        }
        if (objStart >= 0)
        {
            var depth = 0;
            for (var i = objStart; i < s.Length; i++)
            {
                if (s[i] == '{') depth++;
                else if (s[i] == '}') { depth--; if (depth == 0) return s.Substring(objStart, i - objStart + 1); }
            }
        }
        return s;
    }

    private static IReadOnlyList<AICareerSuggestion>? ParseSuggestionList(JsonElement parsed)
    {
        JsonElement arr;
        if (parsed.ValueKind == JsonValueKind.Array)
            arr = parsed;
        else if (parsed.TryGetProperty("careers", out var c) && c.ValueKind == JsonValueKind.Array)
            arr = c;
        else if (parsed.TryGetProperty("recommendations", out var r) && r.ValueKind == JsonValueKind.Array)
            arr = r;
        else
            return null;

        var list = new List<AICareerSuggestion>();
        foreach (var item in arr.EnumerateArray())
        {
            var s = ParseSuggestion(item);
            if (s != null) list.Add(s);
        }
        return list;
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

    #endregion

    private class ChatCompletionResponse
    {
        public List<Choice>? Choices { get; set; }
        public class Choice { public Msg? Message { get; set; } }
        public class Msg { public string? Content { get; set; } }
    }
}
