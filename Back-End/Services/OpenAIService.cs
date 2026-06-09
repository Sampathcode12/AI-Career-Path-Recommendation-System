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
    private readonly ILogger<OpenAIService> _logger;
    private readonly bool _llmAvailable;
    private readonly bool _isLocal;
    private readonly bool _isGemini;
    private readonly string _model;
    private readonly string _provider;

    public bool IsLlmAvailable => _llmAvailable;

    public string ConfiguredProvider => _provider;

    public string ConfiguredModel => _model;

    public OpenAIService(HttpClient http, IConfiguration config, ILogger<OpenAIService> logger)
    {
        _http = http;
        _logger = logger;

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
                "Gemini" => "gemini-2.5-flash",
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
        _isGemini = _provider.Equals("Gemini", StringComparison.OrdinalIgnoreCase);
        _llmAvailable = _isLocal || !string.IsNullOrWhiteSpace(apiKey);

        _http.BaseAddress = new Uri(baseUrl.TrimEnd('/') + "/");
        if (!string.IsNullOrWhiteSpace(apiKey))
            _http.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
    }

    public async Task<LlmCallResult<IReadOnlyList<AICareerSuggestion>>> GenerateRecommendationsAsync(
        string profileSummary,
        string assessmentSummary,
        CancellationToken ct = default,
        string? surveyMlHint = null)
    {
        if (!_llmAvailable)
            return LlmCallResult<IReadOnlyList<AICareerSuggestion>>.Fail("No LLM API key configured.");

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

Respond with a JSON object: {{""careers"":[...]}} where each career object has: title, description, category, matchPercentage (1-100), salaryRange (e.g. ""$80k - $120k"" or a realistic range for their region if inferable), growth (e.g. ""+15%""), skills (array of strings), learningPath (array of objects with step, title, duration).
Example: {{""careers"":[{{""title"":""Data Scientist"",""description"":""..."",""category"":""Technology"",""matchPercentage"":87,""salaryRange"":""$95k - $140k"",""growth"":""+18%"",""skills"":[""Python"",""ML""],""learningPath"":[{{""step"":1,""title"":""Learn Python"",""duration"":""2-3 months""}}]}}]}}
Return only valid JSON, no markdown or extra text.";

        var messages = new[] { new { role = "user", content = prompt } };
        string? lastError = null;
        int? lastStatus = null;

        foreach (var model in GetModelCandidates())
        {
            var chat = await TryChatCompletionAsync(model, messages, ct);
            if (chat.IsSuccess)
            {
                var json = NormalizeModelJson(chat.Content!);
                if (string.IsNullOrWhiteSpace(json))
                {
                    lastError = "The model returned no parseable JSON.";
                    continue;
                }

                try
                {
                    var parsed = ParseSuggestionList(JsonSerializer.Deserialize<JsonElement>(json));
                    if (parsed is { Count: > 0 })
                    {
                        if (!string.Equals(model, _model, StringComparison.OrdinalIgnoreCase))
                            _logger.LogInformation("Career generate succeeded with fallback model {Model} (configured: {Configured}).", model, _model);
                        return LlmCallResult<IReadOnlyList<AICareerSuggestion>>.Ok(parsed);
                    }

                    lastError = "The model response did not contain any careers with titles.";
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not parse LLM JSON from model {Model}.", model);
                    lastError = "The model response was not valid JSON.";
                }

                continue;
            }

            lastError = chat.ErrorMessage;
            lastStatus = chat.StatusCode;

            if (chat.StatusCode is 401 or 403)
                break;

            if (chat.StatusCode is not (404 or 429))
                break;
        }

        _logger.LogWarning(
            "Career generate LLM failed ({Provider}/{Model}): {Error}",
            _provider,
            _model,
            lastError ?? "unknown error");

        return LlmCallResult<IReadOnlyList<AICareerSuggestion>>.Fail(
            lastError ?? "The LLM call failed.",
            lastStatus);
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

            var chat = await TryChatCompletionAsync(_model, messages, ct);
            if (chat.IsSuccess)
                return chat.Content?.Trim();

            _logger.LogWarning("Chat LLM failed ({Provider}/{Model}): {Error}", _provider, _model, chat.ErrorMessage);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Chat LLM call threw for {Provider}/{Model}.", _provider, _model);
            return null;
        }
    }

    private IEnumerable<string> GetModelCandidates()
    {
        yield return _model;

        if (!_isGemini)
            yield break;

        foreach (var fallback in new[] { "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite" })
        {
            if (!string.Equals(fallback, _model, StringComparison.OrdinalIgnoreCase))
                yield return fallback;
        }
    }

    private async Task<ChatCompletionAttempt> TryChatCompletionAsync(
        string model,
        IEnumerable<object> messages,
        CancellationToken ct)
    {
        try
        {
            var body = BuildRequestBody(model, messages);
            var response = await _http.PostAsJsonAsync("chat/completions", body, ct);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(ct);
                var message = ExtractProviderErrorMessage(errorBody)
                    ?? $"HTTP {(int)response.StatusCode} from {_provider}.";

                _logger.LogWarning(
                    "LLM HTTP {Status} for model {Model}: {Message}",
                    (int)response.StatusCode,
                    model,
                    message);

                return ChatCompletionAttempt.Fail(message, (int)response.StatusCode);
            }

            var result = await response.Content.ReadFromJsonAsync<ChatCompletionResponse>(JsonOpts, ct);
            var raw = result?.Choices?[0]?.Message?.Content;
            if (string.IsNullOrWhiteSpace(raw))
                return ChatCompletionAttempt.Fail("The model returned an empty response.");

            return ChatCompletionAttempt.Ok(raw);
        }
        catch (HttpRequestException ex)
        {
            var hint = _isLocal
                ? "Could not reach Ollama at localhost:11434 — is it running?"
                : $"Network error calling {_provider}: {ex.Message}";
            return ChatCompletionAttempt.Fail(hint);
        }
        catch (TaskCanceledException) when (!ct.IsCancellationRequested)
        {
            return ChatCompletionAttempt.Fail("The LLM request timed out.");
        }
        catch (Exception ex)
        {
            return ChatCompletionAttempt.Fail(ex.Message);
        }
    }

    private static string? ExtractProviderErrorMessage(string errorBody)
    {
        if (string.IsNullOrWhiteSpace(errorBody))
            return null;

        try
        {
            using var doc = JsonDocument.Parse(errorBody);
            var root = doc.RootElement;

            if (root.ValueKind == JsonValueKind.Array && root.GetArrayLength() > 0)
                root = root[0];

            if (root.TryGetProperty("error", out var err) && err.ValueKind == JsonValueKind.Object)
            {
                if (err.TryGetProperty("message", out var msg))
                {
                    var text = msg.GetString()?.Trim();
                    if (!string.IsNullOrWhiteSpace(text))
                        return SanitizeProviderError(text);
                }
            }
        }
        catch
        {
            // ignore parse errors
        }

        return null;
    }

    private static string SanitizeProviderError(string message)
    {
        var firstLine = message.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .FirstOrDefault() ?? message;

        if (firstLine.Contains("reported as leaked", StringComparison.OrdinalIgnoreCase))
            return "Your Gemini API key was disabled (reported as leaked). Create a new key at Google AI Studio and update AI:Gemini:ApiKey.";

        if (firstLine.Contains("quota", StringComparison.OrdinalIgnoreCase)
            || firstLine.Contains("RESOURCE_EXHAUSTED", StringComparison.OrdinalIgnoreCase))
            return "Gemini free-tier quota is exhausted for this model. Wait for the limit to reset, switch to AI:Provider Local (Ollama), or use a new API key.";

        if (firstLine.Contains("API key not valid", StringComparison.OrdinalIgnoreCase)
            || firstLine.Contains("invalid api key", StringComparison.OrdinalIgnoreCase))
            return "The API key is invalid. Check AI:Gemini:ApiKey or GEMINI_API_KEY in appsettings / environment.";

        return firstLine.Length > 220 ? firstLine[..220] + "…" : firstLine;
    }

    private static object BuildRequestBody(string model, IEnumerable<object> messages) =>
        new { model, messages, temperature = 0.7, max_tokens = 2048 };

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
        else if (TryGetProp(parsed, "careers", out var c) && c.ValueKind == JsonValueKind.Array)
            arr = c;
        else if (TryGetProp(parsed, "recommendations", out var r) && r.ValueKind == JsonValueKind.Array)
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
            if (!TryGetProp(item, "title", out var titleEl))
                return null;

            var title = titleEl.GetString()?.Trim();
            if (string.IsNullOrWhiteSpace(title))
                return null;

            var desc = TryGetProp(item, "description", out var d) ? d.GetString() : null;
            var cat = TryGetProp(item, "category", out var catEl) ? catEl.GetString() : null;
            var match = TryGetProp(item, "matchPercentage", out var m) && m.TryGetInt32(out var mi) ? mi : (int?)null;
            var salary = TryGetProp(item, "salaryRange", out var sal) ? sal.GetString() : null;
            var growth = TryGetProp(item, "growth", out var g) ? g.GetString() : null;
            var skills = new List<string>();
            if (TryGetProp(item, "skills", out var sk) && sk.ValueKind == JsonValueKind.Array)
                foreach (var s in sk.EnumerateArray()) skills.Add(s.GetString() ?? "");
            var path = new List<LearningPathStep>();
            if (TryGetProp(item, "learningPath", out var lp) && lp.ValueKind == JsonValueKind.Array)
                foreach (var p in lp.EnumerateArray())
                {
                    var step = TryGetProp(p, "step", out var st) && st.TryGetInt32(out var si) ? si : path.Count + 1;
                    var t = TryGetProp(p, "title", out var pt) ? pt.GetString() ?? "" : "";
                    var dur = TryGetProp(p, "duration", out var pd) ? pd.GetString() ?? "" : "";
                    path.Add(new LearningPathStep(step, t, dur));
                }
            return new AICareerSuggestion(title, desc ?? "", cat ?? "", match, salary, growth, skills, path);
        }
        catch { return null; }
    }

    private static bool TryGetProp(JsonElement el, string name, out JsonElement value)
    {
        foreach (var prop in el.EnumerateObject())
        {
            if (prop.Name.Equals(name, StringComparison.OrdinalIgnoreCase))
            {
                value = prop.Value;
                return true;
            }
        }
        value = default;
        return false;
    }

    #endregion

    private sealed record ChatCompletionAttempt(string? Content, string? ErrorMessage, int? StatusCode)
    {
        public bool IsSuccess => Content != null;

        public static ChatCompletionAttempt Ok(string content) => new(content, null, null);

        public static ChatCompletionAttempt Fail(string message, int? status = null) => new(null, message, status);
    }

    private class ChatCompletionResponse
    {
        public List<Choice>? Choices { get; set; }
        public class Choice { public Msg? Message { get; set; } }
        public class Msg { public string? Content { get; set; } }
    }
}
