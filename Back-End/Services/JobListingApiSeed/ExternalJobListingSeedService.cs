using System.Collections.Concurrent;
using System.Text.Json;
using BackEnd.Models;
using Microsoft.Extensions.Configuration;

namespace BackEnd.Services.JobListingApiSeed;

public interface IExternalJobListingSeedService
{
    /// <summary>Fetches live job rows from configured public APIs (Remotive, Arbeitnow).</summary>
    Task<IReadOnlyList<JobListing>> FetchJobListingsAsync(CancellationToken ct = default);
}

/// <summary>
/// Pulls job listings from public HTTP APIs instead of hard-coded C# arrays.
/// Remotive: https://remotive.com/api-documentation — please respect rate limits and attribution.
/// Arbeitnow: https://www.arbeitnow.com/api/job-board-api
/// </summary>
public sealed class ExternalJobListingSeedService : IExternalJobListingSeedService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    private static readonly ConcurrentDictionary<string, (string Sector, string Category)> RemotiveCategoryMap =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ["Software Development"] = ("Technology", "Technology"),
            ["Data"] = ("Technology", "Technology"),
            ["DevOps / Sysadmin"] = ("Technology", "Technology"),
            ["Engineering"] = ("Technology", "Technology"),
            ["QA"] = ("Technology", "Technology"),
            ["Product"] = ("Technology", "Technology"),
            ["Design"] = ("Creative & Design", "Creative & Design"),
            ["Marketing"] = ("Media & Entertainment", "Media & Entertainment"),
            ["Sales"] = ("Retail", "Retail"),
            ["Customer Service"] = ("Retail", "Retail"),
            ["Finance / Legal"] = ("Finance", "Finance"),
            ["HR and Recruiting"] = ("Professional Services", "Professional Services"),
            ["Writing"] = ("Media & Entertainment", "Media & Entertainment"),
            ["Teaching"] = ("Education", "Education"),
            ["Medical / Health"] = ("Healthcare", "Healthcare"),
            ["Business"] = ("Professional Services", "Professional Services"),
        };

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ExternalJobListingSeedService> _logger;

    public ExternalJobListingSeedService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<ExternalJobListingSeedService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<IReadOnlyList<JobListing>> FetchJobListingsAsync(CancellationToken ct = default)
    {
        var list = new List<JobListing>();
        list.AddRange(await FetchRemotiveAsync(ct).ConfigureAwait(false));
        list.AddRange(await FetchArbeitnowAsync(ct).ConfigureAwait(false));

        // De-dupe within this batch by URL (APIs can overlap conceptually).
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var unique = new List<JobListing>();
        foreach (var j in list)
        {
            if (string.IsNullOrWhiteSpace(j.Url)) continue;
            if (!seen.Add(j.Url)) continue;
            unique.Add(j);
        }

        return unique;
    }

    private async Task<IReadOnlyList<JobListing>> FetchRemotiveAsync(CancellationToken ct)
    {
        var baseUrl = _configuration["JobImport:RemotiveUrl"] ?? "https://remotive.com/api/remote-jobs";
        var limit = _configuration.GetValue("JobImport:RemotiveLimit", 80);
        var url = $"{baseUrl.TrimEnd('/')}?limit={limit}";
        try
        {
            var client = _httpClientFactory.CreateClient(nameof(ExternalJobListingSeedService));
            client.Timeout = TimeSpan.FromSeconds(45);
            using var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct)
                .ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
            await using var stream = await response.Content.ReadAsStreamAsync(ct).ConfigureAwait(false);
            var doc = await JsonSerializer.DeserializeAsync<RemotiveJobsResponse>(stream, JsonOptions, ct)
                .ConfigureAwait(false);
            var jobs = doc?.Jobs;
            if (jobs == null || jobs.Count == 0)
            {
                _logger.LogWarning("Remotive API returned no jobs from {Url}", url);
                return Array.Empty<JobListing>();
            }

            var rows = new List<JobListing>(jobs.Count);
            foreach (var j in jobs)
            {
                if (string.IsNullOrWhiteSpace(j.Title)) continue;
                var (sector, category) = MapRemotiveCategory(j.Category);
                rows.Add(new JobListing
                {
                    Title = j.Title.Trim(),
                    Company = string.IsNullOrWhiteSpace(j.CompanyName) ? null : j.CompanyName.Trim(),
                    Location = string.IsNullOrWhiteSpace(j.CandidateRequiredLocation)
                        ? "Remote"
                        : j.CandidateRequiredLocation.Trim(),
                    Sector = sector,
                    Category = category,
                    SalaryRange = string.IsNullOrWhiteSpace(j.Salary) ? null : j.Salary.Trim(),
                    Growth = "+10%",
                    Description = string.IsNullOrWhiteSpace(j.Description) ? null : j.Description.Trim(),
                    Url = string.IsNullOrWhiteSpace(j.Url) ? null : j.Url.Trim(),
                    SkillsJson = j.Tags is { Count: > 0 }
                        ? JsonSerializer.Serialize(j.Tags)
                        : "[]",
                    CareerPathJson = "[]",
                });
            }

            _logger.LogInformation("Fetched {Count} jobs from Remotive", rows.Count);
            return rows;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Remotive jobs from {Url}", url);
            return Array.Empty<JobListing>();
        }
    }

    private async Task<IReadOnlyList<JobListing>> FetchArbeitnowAsync(CancellationToken ct)
    {
        var url = _configuration["JobImport:ArbeitnowUrl"] ?? "https://www.arbeitnow.com/api/job-board-api";
        var max = _configuration.GetValue("JobImport:ArbeitnowMax", 120);
        try
        {
            var client = _httpClientFactory.CreateClient(nameof(ExternalJobListingSeedService));
            client.Timeout = TimeSpan.FromSeconds(60);
            using var response = await client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct)
                .ConfigureAwait(false);
            response.EnsureSuccessStatusCode();
            await using var stream = await response.Content.ReadAsStreamAsync(ct).ConfigureAwait(false);
            var doc = await JsonSerializer.DeserializeAsync<ArbeitnowJobsResponse>(stream, JsonOptions, ct)
                .ConfigureAwait(false);
            var data = doc?.Data;
            if (data == null || data.Count == 0)
            {
                _logger.LogWarning("Arbeitnow API returned no jobs from {Url}", url);
                return Array.Empty<JobListing>();
            }

            var take = Math.Min(max, data.Count);
            var rows = new List<JobListing>(take);
            for (var i = 0; i < take; i++)
            {
                var j = data[i];
                if (string.IsNullOrWhiteSpace(j.Title)) continue;
                var text = $"{j.Title} {j.Description}".ToLowerInvariant();
                var (sector, category) = ClassifyArbeitnow(text, j.Remote);
                rows.Add(new JobListing
                {
                    Title = j.Title.Trim(),
                    Company = string.IsNullOrWhiteSpace(j.CompanyName) ? null : j.CompanyName.Trim(),
                    Location = j.Remote ? "Remote" : FormatArbeitnowLocation(j.Location),
                    Sector = sector,
                    Category = category,
                    SalaryRange = null,
                    Growth = "+8%",
                    Description = string.IsNullOrWhiteSpace(j.Description) ? null : j.Description.Trim(),
                    Url = string.IsNullOrWhiteSpace(j.Url) ? null : j.Url.Trim(),
                    SkillsJson = j.Tags is { Count: > 0 }
                        ? JsonSerializer.Serialize(j.Tags)
                        : "[]",
                    CareerPathJson = "[]",
                });
            }

            _logger.LogInformation("Fetched {Count} jobs from Arbeitnow (cap {Max})", rows.Count, max);
            return rows;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to fetch Arbeitnow jobs from {Url}", url);
            return Array.Empty<JobListing>();
        }
    }

    private static (string Sector, string Category) MapRemotiveCategory(string? category)
    {
        if (string.IsNullOrWhiteSpace(category))
            return ("Professional Services", "Professional Services");
        return RemotiveCategoryMap.TryGetValue(category.Trim(), out var mapped)
            ? mapped
            : ("Professional Services", "Professional Services");
    }

    private static (string Sector, string Category) ClassifyArbeitnow(string blob, bool remote)
    {
        if (blob.Contains("nurse", StringComparison.Ordinal) ||
            blob.Contains("clinical", StringComparison.Ordinal) ||
            blob.Contains("patient", StringComparison.Ordinal) ||
            blob.Contains("pharma", StringComparison.Ordinal) ||
            blob.Contains("arzt", StringComparison.Ordinal) ||
            blob.Contains("medical", StringComparison.Ordinal))
            return ("Healthcare", "Healthcare");

        if (blob.Contains("teacher", StringComparison.Ordinal) ||
            blob.Contains("schule", StringComparison.Ordinal) ||
            blob.Contains("education", StringComparison.Ordinal) ||
            blob.Contains("university", StringComparison.Ordinal))
            return ("Education", "Education");

        if (blob.Contains("bank", StringComparison.Ordinal) ||
            blob.Contains("finance", StringComparison.Ordinal) ||
            blob.Contains("account", StringComparison.Ordinal) ||
            blob.Contains("tax", StringComparison.Ordinal))
            return ("Finance", "Finance");

        if (blob.Contains("design", StringComparison.Ordinal) ||
            blob.Contains("ux", StringComparison.Ordinal) ||
            blob.Contains("brand", StringComparison.Ordinal) ||
            blob.Contains("creative", StringComparison.Ordinal))
            return ("Creative & Design", "Creative & Design");

        if (blob.Contains("engineer", StringComparison.Ordinal) ||
            blob.Contains("developer", StringComparison.Ordinal) ||
            blob.Contains("software", StringComparison.Ordinal) ||
            blob.Contains("data ", StringComparison.Ordinal) ||
            blob.Contains("python", StringComparison.Ordinal) ||
            blob.Contains("java", StringComparison.Ordinal) ||
            blob.Contains("devops", StringComparison.Ordinal))
            return ("Technology", "Technology");

        if (remote && (blob.Contains("remote", StringComparison.Ordinal) ||
                       blob.Contains("home office", StringComparison.Ordinal)))
            return ("Technology", "Technology");

        return ("Professional Services", "Professional Services");
    }

    private static string FormatArbeitnowLocation(JsonElement location)
    {
        try
        {
            if (location.ValueKind == JsonValueKind.String)
                return location.GetString() ?? "On-site";
            if (location.ValueKind == JsonValueKind.Object)
            {
                if (location.TryGetProperty("display_name", out var dn) && dn.ValueKind == JsonValueKind.String)
                    return dn.GetString() ?? "On-site";
                if (location.TryGetProperty("city", out var c) && c.ValueKind == JsonValueKind.String)
                    return c.GetString() ?? "On-site";
            }
        }
        catch
        {
            /* ignore */
        }

        return "On-site";
    }
}
