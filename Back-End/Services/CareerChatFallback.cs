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

        var body = BuildReply(userMessage, fake);
        return body + Environment.NewLine + Environment.NewLine
            + "(Note: The database was not reachable, so this used built-in sample careers. Set ConnectionStrings:Default to a working SQL Server or LocalDB in appsettings, then restart the API.)";
    }

    public static string BuildReply(string userMessage, IReadOnlyList<RecommendationResponse> recs)
    {
        var msg = userMessage.Trim();
        if (recs.Count == 0)
            return "You do not have career recommendations saved yet. Generate recommendations from this page (or complete your career survey), then you can ask about salaries, skills, learning paths, or how roles compare.";

        var lower = msg.ToLowerInvariant();

        if (IsGreeting(lower))
            return BuildGreeting(recs);

        if (ContainsAny(lower, "salary", "pay", "wage", "money", "earn", "income"))
            return BuildSalarySummary(recs);

        if (ContainsAny(lower, "skill", "skills", "learn", "need to know", "requirement"))
            return BuildSkillsSummary(recs);

        if (ContainsAny(lower, "path", "course", "how to start", "steps", "roadmap", "timeline"))
            return BuildLearningPathSummary(recs);

        if (ContainsAny(lower, "compare", "difference", "better", "best", "which one", "vs ", "versus"))
            return BuildCompareSummary(recs);

        if (ContainsAny(lower, "saved", "bookmark", "favorite"))
            return "You can save careers you like with the bookmark control on each card. Saved items stay on your list when you come back.";

        var about = FindCareerMention(msg, recs);
        if (about != null)
            return BuildSingleCareerParagraph(about);

        return BuildDefaultSummary(recs, msg);
    }

    private static bool IsGreeting(string lower) =>
        lower is "hi" or "hello" or "hey" or "good morning" or "good afternoon" or "good evening"
        || lower.StartsWith("hi ") || lower.StartsWith("hello ") || lower.StartsWith("hey ");

    private static bool ContainsAny(string haystack, params string[] needles)
    {
        foreach (var n in needles)
            if (haystack.Contains(n, StringComparison.Ordinal)) return true;
        return false;
    }

    private static RecommendationResponse? FindCareerMention(string userMessage, IReadOnlyList<RecommendationResponse> recs)
    {
        foreach (var r in recs)
        {
            if (string.IsNullOrWhiteSpace(r.Title)) continue;
            if (userMessage.Contains(r.Title, StringComparison.OrdinalIgnoreCase)) return r;
        }
        foreach (var r in recs)
        {
            if (string.IsNullOrWhiteSpace(r.Title)) continue;
            foreach (var word in r.Title.Split(' ', StringSplitOptions.RemoveEmptyEntries))
            {
                if (word.Length < 4) continue;
                if (userMessage.Contains(word, StringComparison.OrdinalIgnoreCase)) return r;
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

    private static string BuildSalarySummary(IReadOnlyList<RecommendationResponse> recs)
    {
        var sb = new StringBuilder("Here is what we have on salary ranges for your recommendations:\n");
        foreach (var r in recs.Take(8))
        {
            var sal = string.IsNullOrWhiteSpace(r.SalaryRange) ? "Not specified in your data" : r.SalaryRange;
            sb.AppendLine($"- {r.Title}: {sal}");
        }
        sb.Append("These are estimates from your profile; check current job boards for your location.");
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
        if (ordered.Count == 0) return BuildDefaultSummary(recs, "");

        var top = ordered[0];
        var second = ordered.Count > 1 ? ordered[1] : null;
        var m1 = top.MatchPercentage.HasValue ? $"{top.MatchPercentage}% match" : "match not stored";
        if (second == null)
            return $"You only have one recommendation in view: {top.Title} ({m1}). Add more by regenerating recommendations.";

        var m2 = second.MatchPercentage.HasValue ? $"{second.MatchPercentage}% match" : "match not stored";
        return $"By stored match scores, {top.Title} ({m1}) ranks ahead of {second.Title} ({m2}). Compare salary ({top.SalaryRange ?? "n/a"} vs {second.SalaryRange ?? "n/a"}) and skills on the cards. Ask about a specific title for more detail.";
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

    private static string BuildDefaultSummary(IReadOnlyList<RecommendationResponse> recs, string originalQuestion)
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
        if (!string.IsNullOrWhiteSpace(originalQuestion) && originalQuestion.Length < 120)
            sb.AppendLine("(I matched your question loosely to this list. For open-ended coaching, add a free Gemini API key — see docs/OPENAI-SETUP.md.)");
        else
            sb.AppendLine("(For richer, conversational answers, add a free Gemini API key — see docs/OPENAI-SETUP.md.)");
        return sb.ToString().TrimEnd();
    }
}
