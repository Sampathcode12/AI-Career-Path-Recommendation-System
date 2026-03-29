using System.Text;
using BackEnd.DTOs;

namespace BackEnd.Services;

/// <summary>
/// Rule-based replies when OpenAI is not configured or the API call fails.
/// Uses the user’s stored recommendations so answers stay grounded.
/// </summary>
internal static class CareerChatFallback
{
    /// <summary>When SQL is down, still answer using the same built-in careers as the UI sample cards.</summary>
    public static string BuildReplyUsingTemplateCatalog(string userMessage)
    {
        var now = DateTime.UtcNow;
        var fake = new List<RecommendationResponse>();
        for (var i = 0; i < RecommendationTemplateCatalog.Careers.Length; i++)
        {
            var (title, desc, cat) = RecommendationTemplateCatalog.Careers[i];
            fake.Add(new RecommendationResponse(
                Id: -(i + 1),
                UserId: 0,
                Title: title,
                Description: desc,
                Category: cat,
                Saved: false,
                SortOrder: i,
                CreatedAt: now,
                MatchPercentage: 75 + i,
                SalaryRange: "See market data",
                Growth: "+10–15%",
                Skills: new[] { "Communication", "Problem solving", "Domain knowledge" },
                LearningPath: null));
        }

        return BuildReply(userMessage, fake);
    }

    public static string BuildReply(string userMessage, IReadOnlyList<RecommendationResponse> recs)
    {
        var msg = userMessage.Trim();
        if (recs.Count == 0)
            return "You do not have career recommendations saved yet. Generate recommendations from this page (or complete your career survey), then you can ask about salaries, skills, learning paths, or how roles compare.";

        // Route intents using the *current* user line only. Augmented history contains past replies with words like "salary" and would break follow-ups (e.g. "hi" matching salary).
        var route = ExtractCurrentUserMessage(msg);
        var routeLower = route.ToLowerInvariant();

        if (IsGreeting(routeLower))
            return BuildGreeting(recs);

        if (IsCountrySalaryQuestion(routeLower))
            return BuildCountrySalaryGuidance(recs);

        if (ContainsAny(routeLower, "salary", "sallry", "salery", "pay", "wage", "money", "earn", "income", "compensation"))
            return BuildSalarySummary(recs);

        if (ContainsAny(routeLower, "skill", "skills", "learn", "need to know", "requirement"))
            return BuildSkillsSummary(recs);

        if (ContainsAny(routeLower, "path", "course", "how to start", "steps", "roadmap", "timeline"))
            return BuildLearningPathSummary(recs);

        if (ContainsAny(routeLower, "compare", "difference", "better", "best", "which one", "vs ", "versus", "top 2", "two recommendation"))
            return BuildCompareSummary(recs);

        if (ContainsAny(routeLower, "saved", "bookmark", "favorite"))
            return "You can save careers you like with the bookmark control on each card. Saved items stay on your list when you come back.";

        if (IsWebSearchRequest(routeLower))
            return BuildWebSearchGuidance(recs);

        var userOnlyContext = ConcatenateUserLinesFromAugmented(msg);
        var disambiguation = string.IsNullOrWhiteSpace(userOnlyContext) ? route : $"{userOnlyContext} {route}";

        var about = FindCareerMention(route, recs)
            ?? (IsVagueFollowUp(routeLower) ? FindCareerMention(disambiguation, recs) : null);
        if (about != null)
            return BuildSingleCareerParagraph(about);

        return BuildDefaultSummary(recs);
    }

    private static bool IsWebSearchRequest(string lower) =>
        ContainsAny(lower, "google", "search the web", "look up online", "check online", "can you search", "browse the", "internet for")
        || (lower.Contains("check", StringComparison.Ordinal) && ContainsAny(lower, "google", "online", "internet"));

    private static string BuildWebSearchGuidance(IReadOnlyList<RecommendationResponse> recs)
    {
        var sb = new StringBuilder();
        sb.AppendLine("I can’t open Google or browse the web from this chat. Use your browser instead:");
        sb.AppendLine("- Search: [job title] + [city or country] + salary or careers (e.g. “Data Scientist salary Germany 2025”).");
        sb.AppendLine("- Try Glassdoor, Indeed, Levels.fyi, LinkedIn, or official labour statistics for your country.");
        sb.AppendLine();
        sb.AppendLine("Roles from your list to look up:");
        foreach (var r in recs.Take(8))
            sb.AppendLine($"- {r.Title}");
        return sb.ToString().TrimEnd();
    }

    /// <summary>Only past user lines — never assistant text (which lists all careers and causes wrong matches).</summary>
    private static string ConcatenateUserLinesFromAugmented(string fullMessage)
    {
        const string prefix = "Earlier in this chat:\n";
        const string marker = "\n\nCurrent message: ";
        var p = fullMessage.IndexOf(prefix, StringComparison.Ordinal);
        if (p < 0) return "";

        var start = p + prefix.Length;
        var end = fullMessage.IndexOf(marker, start, StringComparison.Ordinal);
        var block = end >= 0 ? fullMessage[start..end] : fullMessage[start..];

        var sb = new StringBuilder();
        foreach (var raw in block.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries))
        {
            var line = raw.Trim();
            if (line.Length < 6) continue;
            if (!line.StartsWith("user:", StringComparison.OrdinalIgnoreCase)) continue;
            var content = line[5..].Trim();
            if (content.Length > 0) sb.Append(content).Append(' ');
        }

        return sb.ToString().Trim();
    }

    private static bool IsVagueFollowUp(string lower)
    {
        var t = lower.TrimEnd('.', '!', '?', '…').Trim();
        if (t.Length > 72) return false;
        return ContainsAny(t, "tell me more", "tel me more", "say more", "more detail", "more details", "more about it", "go on", "continue", "what else", "expand on that", "elaborate", "anything else")
            || t is "more" or "yes" or "ok" or "okay" or "sure" or "yep" or "yeah";
    }

    /// <summary>Uses only the latest user message for keyword routing when history was prepended (multi-turn fallback).</summary>
    private static string ExtractCurrentUserMessage(string fullMessage)
    {
        const string marker = "\n\nCurrent message: ";
        var i = fullMessage.LastIndexOf(marker, StringComparison.Ordinal);
        if (i >= 0)
        {
            var tail = fullMessage[(i + marker.Length)..].Trim();
            if (tail.Length > 0) return tail;
        }

        return fullMessage.Trim();
    }

    private static bool IsCountrySalaryQuestion(string lower) =>
        ContainsAny(lower, "country", "countries", "country-wise", "country wise", "by country", "per country", "each country")
        || (lower.Contains("region", StringComparison.Ordinal) && ContainsAny(lower, "salary", "pay", "wage", "compensation"))
        || ContainsAny(lower, "worldwide", "international", "globally", "geo", "location-based", "location based");

    private static string BuildCountrySalaryGuidance(IReadOnlyList<RecommendationResponse> recs)
    {
        var sb = new StringBuilder();
        sb.AppendLine("We don’t store country-by-country salary tables in your profile here. Use this as a guide, then verify on local job boards:");
        sb.AppendLine();
        sb.AppendLine("How to compare by country");
        sb.AppendLine("- United States — Often highest nominal tech pay; strong variation by city (SF/NYC vs smaller metros). Try Levels.fyi, Glassdoor, BLS.");
        sb.AppendLine("- United Kingdom / EU — Gross figures differ from US; check Indeed, Reed, Eurostat-style sources, or country unions.");
        sb.AppendLine("- Canada / Australia — Mid-high vs global; use Glassdoor.ca, Seek, government labour surveys.");
        sb.AppendLine("- India / Southeast Asia / LATAM — Big spread between local employers vs multinationals; use Naukri, Glassdoor regional, LinkedIn salary insights.");
        sb.AppendLine();
        sb.AppendLine("Rough order of magnitude (mid-level tech/data roles, not a quote—verify): US often leads, Western Europe/Canada/Australia next, then wide ranges in emerging markets by company tier.");
        sb.AppendLine();
        sb.AppendLine("Your current recommendation titles (for role-specific research):");
        foreach (var r in recs.Take(8))
            sb.AppendLine($"- {r.Title}");
        sb.AppendLine();
        sb.AppendLine("If you add an AI API key in appsettings, the chat can tailor numbers to a country you name.");
        return sb.ToString().TrimEnd();
    }

    private static bool IsGreeting(string lower)
    {
        var t = lower.TrimEnd('.', '!', '?', '…').Trim();
        return t is "hi" or "hello" or "hey" or "good morning" or "good afternoon" or "good evening"
            || t.StartsWith("hi ", StringComparison.Ordinal) || t.StartsWith("hello ", StringComparison.Ordinal)
            || t.StartsWith("hey ", StringComparison.Ordinal) || t == "hiya" || t == "yo";
    }

    private static bool ContainsAny(string haystack, params string[] needles)
    {
        foreach (var n in needles)
            if (haystack.Contains(n, StringComparison.Ordinal)) return true;
        return false;
    }

    /// <summary>Words that match many roles if used alone (e.g. "Data" → wrong career).</summary>
    private static readonly HashSet<string> AmbiguousTitleWords = new(StringComparer.OrdinalIgnoreCase)
    {
        "data", "senior", "junior", "lead", "staff", "software", "web", "cloud", "digital", "product",
        "business", "machine", "user", "full", "front", "back", "mobile", "ux", "ui", "it", "ai",
    };

    private static RecommendationResponse? FindCareerMention(string userMessage, IReadOnlyList<RecommendationResponse> recs)
    {
        if (string.IsNullOrWhiteSpace(userMessage)) return null;

        var orderedByTitleLength = recs
            .Where(r => !string.IsNullOrWhiteSpace(r.Title))
            .OrderByDescending(r => r.Title!.Length)
            .ToList();

        foreach (var r in orderedByTitleLength)
        {
            if (userMessage.Contains(r.Title!, StringComparison.OrdinalIgnoreCase))
                return r;
        }

        foreach (var r in orderedByTitleLength)
        {
            foreach (var word in r.Title!.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            {
                if (word.Length < 4) continue;
                if (AmbiguousTitleWords.Contains(word)) continue;
                if (userMessage.Contains(word, StringComparison.OrdinalIgnoreCase))
                    return r;
            }
        }

        return null;
    }

    private static string BuildGreeting(IReadOnlyList<RecommendationResponse> recs)
    {
        var titles = string.Join(", ", recs.Take(5).Select(r => r.Title));
        var more = recs.Count > 5 ? $" and {recs.Count - 5} more" : "";
        return $"Hi. I am answering from your current recommendations ({titles}{more}). Ask about salaries, skills, learning paths, or say which role you want to explore.";
    }

    private static bool IsGenericStoredSalary(string? s) =>
        string.IsNullOrWhiteSpace(s)
        || s.Equals("See market data", StringComparison.OrdinalIgnoreCase)
        || s.Equals("n/a", StringComparison.OrdinalIgnoreCase);

    private static string BuildSalarySummary(IReadOnlyList<RecommendationResponse> recs)
    {
        var rows = recs.Take(8).ToList();
        if (rows.Count == 0)
            return "No roles in your list yet. Generate recommendations first.";

        if (rows.All(r => IsGenericStoredSalary(r.SalaryRange)))
        {
            return
                "Your saved recommendations don’t include specific salary numbers yet (they show as generic placeholders).\n\n"
                + "What to do:\n"
                + "- For country or city ranges: ask “salary by country” or use Glassdoor, Levels.fyi, Indeed, or government labour sites.\n"
                + "- After the database and AI generation run with full metadata, ranges can appear per role.\n\n"
                + "Roles you’re exploring:\n"
                + string.Join("\n", rows.Select(r => $"- {r.Title}"));
        }

        var sb = new StringBuilder("Salary ranges stored with your recommendations:\n");
        foreach (var r in rows)
        {
            var sal = IsGenericStoredSalary(r.SalaryRange) ? "Not specified in your data" : r.SalaryRange!;
            sb.AppendLine($"- {r.Title}: {sal}");
        }
        sb.Append("Verify on current job postings for your country and city.");
        return sb.ToString();
    }

    private static string BuildSkillsSummary(IReadOnlyList<RecommendationResponse> recs)
    {
        var sb = new StringBuilder("Skills mentioned for your recommendations:\n");
        foreach (var r in recs.Take(8))
        {
            if (r.Skills == null || r.Skills.Count == 0)
                sb.AppendLine($"- {r.Title}: (no skill list stored; try the description on the card)");
            else
                sb.AppendLine($"- {r.Title}: {string.Join(", ", r.Skills)}");
        }
        return sb.ToString().TrimEnd();
    }

    private static string BuildLearningPathSummary(IReadOnlyList<RecommendationResponse> recs)
    {
        var sb = new StringBuilder();
        foreach (var r in recs.Take(5))
        {
            sb.AppendLine($"{r.Title}:");
            if (r.LearningPath == null || r.LearningPath.Count == 0)
            {
                sb.AppendLine("  No step-by-step path stored. Use the card description and skills as a starting point, or enable AI chat with an API key for tailored steps.");
            }
            else
            {
                foreach (var step in r.LearningPath.OrderBy(x => x.Step))
                    sb.AppendLine($"  {step.Step}. {step.Title} ({step.Duration})");
            }
            sb.AppendLine();
        }
        return sb.ToString().TrimEnd();
    }

    private static string BuildCompareSummary(IReadOnlyList<RecommendationResponse> recs)
    {
        var ordered = recs.OrderByDescending(r => r.MatchPercentage ?? 0).ToList();
        if (ordered.Count == 0) return BuildDefaultSummary(recs);

        var top = ordered[0];
        var second = ordered.Count > 1 ? ordered[1] : null;
        var m1 = top.MatchPercentage.HasValue ? $"{top.MatchPercentage}% match" : "match not stored";
        if (second == null)
            return $"You only have one recommendation in view: {top.Title} ({m1}). Add more by regenerating recommendations.";

        var m2 = second.MatchPercentage.HasValue ? $"{second.MatchPercentage}% match" : "match not stored";
        static string Truncate(string? s, int max)
        {
            if (string.IsNullOrWhiteSpace(s)) return "(no description stored)";
            s = s.Trim();
            return s.Length <= max ? s : s[..max].TrimEnd() + "…";
        }

        static bool IsGenericSalary(string? s) =>
            string.IsNullOrWhiteSpace(s) ||
            s.Equals("See market data", StringComparison.OrdinalIgnoreCase) ||
            s.Equals("n/a", StringComparison.OrdinalIgnoreCase);

        var sal1 = top.SalaryRange;
        var sal2 = second.SalaryRange;
        var salaryLine = "";
        if (!IsGenericSalary(sal1) && !IsGenericSalary(sal2) &&
            !string.Equals(sal1, sal2, StringComparison.OrdinalIgnoreCase))
            salaryLine = $" Salary ranges in your data: {sal1} vs {sal2}.";
        else if (!IsGenericSalary(sal1) || !IsGenericSalary(sal2))
            salaryLine = $" Salary hints: {sal1 ?? "n/a"} vs {sal2 ?? "n/a"}.";
        else
            salaryLine = " Use job sites for local salary; your cards may not store ranges yet.";

        var skills1 = top.Skills is { Count: > 0 } ? string.Join(", ", top.Skills) : "see card / description";
        var skills2 = second.Skills is { Count: > 0 } ? string.Join(", ", second.Skills) : "see card / description";

        return
            $"**Top two by match:** {top.Title} ({m1}) and {second.Title} ({m2}).{salaryLine}\n\n" +
            $"**{top.Title}** ({top.Category ?? "category n/a"}): {Truncate(top.Description, 160)}\n" +
            $"Skills: {skills1}\n\n" +
            $"**{second.Title}** ({second.Category ?? "category n/a"}): {Truncate(second.Description, 160)}\n" +
            $"Skills: {skills2}\n\n" +
            "Ask a follow-up about either role (e.g. day-to-day work, first steps to learn).";
    }

    private static string BuildSingleCareerParagraph(RecommendationResponse r)
    {
        var parts = new List<string> { r.Title + ":" };
        if (!string.IsNullOrWhiteSpace(r.Description)) parts.Add(r.Description);
        if (!string.IsNullOrWhiteSpace(r.Category)) parts.Add($"Category: {r.Category}.");
        if (r.MatchPercentage.HasValue) parts.Add($"Estimated fit: {r.MatchPercentage}%.");
        if (!string.IsNullOrWhiteSpace(r.SalaryRange)) parts.Add($"Salary range (from your data): {r.SalaryRange}.");
        if (!string.IsNullOrWhiteSpace(r.Growth)) parts.Add($"Growth outlook: {r.Growth}.");
        if (r.Skills != null && r.Skills.Count > 0) parts.Add($"Skills: {string.Join(", ", r.Skills)}.");
        if (r.LearningPath != null && r.LearningPath.Count > 0)
        {
            var steps = string.Join("; ", r.LearningPath.OrderBy(x => x.Step).Select(s => $"{s.Title} ({s.Duration})"));
            parts.Add($"Learning path: {steps}.");
        }
        return string.Join(" ", parts);
    }

    private static string BuildDefaultSummary(IReadOnlyList<RecommendationResponse> recs)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Here is a quick recap of your recommendations. Ask about salary, skills, learning path, or name a specific role.");
        foreach (var r in recs.Take(6))
        {
            var bits = new List<string>();
            if (r.MatchPercentage.HasValue) bits.Add($"{r.MatchPercentage}% fit");
            if (!string.IsNullOrWhiteSpace(r.Category)) bits.Add(r.Category);
            if (!string.IsNullOrWhiteSpace(r.SalaryRange)) bits.Add(r.SalaryRange);
            sb.AppendLine($"- {r.Title}: {string.Join(" · ", bits)}");
        }
        return sb.ToString().TrimEnd();
    }
}
