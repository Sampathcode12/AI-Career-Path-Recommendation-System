using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using BackEnd.Models;
using BackEnd.Services;
using BackEnd.Services.JobListingApiSeed;

namespace BackEnd.Data;

/// <summary>
/// Database seed: industry skill gaps from JSON or optional HTTP catalog; job listings from public job APIs;
/// market trends from JSON; demo user in Development.
/// </summary>
public static class DataSeeder
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    /// <summary>Sets <see cref="JobListing.Country"/> from <see cref="JobListing.Location"/> when not already stored.</summary>
    private static async Task BackfillJobListingCountriesAsync(ApplicationDbContext db, CancellationToken ct)
    {
        var rows = await db.JobListings.Where(j => j.Country == null || j.Country == "").ToListAsync(ct);
        if (rows.Count == 0) return;
        foreach (var j in rows)
            j.Country = JobLocationCountryResolver.Resolve(j.Location);
        await db.SaveChangesAsync(ct);
    }

    private static async Task SeedIndustrySkillGapsAsync(
        ApplicationDbContext db,
        IHostEnvironment env,
        IConfiguration config,
        IHttpClientFactory http,
        ILogger logger,
        CancellationToken ct)
    {
        var existingIds = await db.IndustrySkillGaps.Select(x => x.IndustryId).ToListAsync(ct);
        var existingSet = existingIds.ToHashSet(StringComparer.OrdinalIgnoreCase);

        string json;
        var catalogUrl = config["JobImport:IndustryCatalogUrl"];
        if (!string.IsNullOrWhiteSpace(catalogUrl))
        {
            try
            {
                var client = http.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(45);
                json = await client.GetStringAsync(catalogUrl, ct).ConfigureAwait(false);
                logger.LogInformation("Loaded industry skill-gap catalog from {Url}", catalogUrl);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to download industry catalog from {Url}; falling back to local file", catalogUrl);
                json = await ReadLocalIndustryCatalogAsync(env, logger, ct).ConfigureAwait(false);
            }
        }
        else
        {
            json = await ReadLocalIndustryCatalogAsync(env, logger, ct).ConfigureAwait(false);
        }

        if (string.IsNullOrWhiteSpace(json))
            return;

        List<IndustrySkillGap>? gaps;
        try
        {
            gaps = JsonSerializer.Deserialize<List<IndustrySkillGap>>(json, JsonOptions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not parse industry skill-gap JSON");
            return;
        }

        if (gaps == null || gaps.Count == 0) return;

        var toAdd = gaps.Where(g => !string.IsNullOrWhiteSpace(g.IndustryId) && !existingSet.Contains(g.IndustryId)).ToList();
        if (toAdd.Count == 0) return;

        await db.IndustrySkillGaps.AddRangeAsync(toAdd, ct).ConfigureAwait(false);
        logger.LogInformation("Seeded {Count} industry skill-gap rows", toAdd.Count);
    }

    private static async Task<string> ReadLocalIndustryCatalogAsync(
        IHostEnvironment env,
        ILogger logger,
        CancellationToken ct)
    {
        var path = Path.Combine(env.ContentRootPath, "Data", "industry-skill-gaps.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Industry catalog file missing: {Path}", path);
            return string.Empty;
        }

        logger.LogInformation("Loading industry skill-gap catalog from {Path}", path);
        return await File.ReadAllTextAsync(path, ct).ConfigureAwait(false);
    }

    private static async Task SeedJobListingsFromApisAsync(
        ApplicationDbContext db,
        IExternalJobListingSeedService jobApi,
        CancellationToken ct)
    {
        var existingUrls = await db.JobListings.AsNoTracking()
            .Where(j => j.Url != null && j.Url != "")
            .Select(j => j.Url!)
            .ToListAsync(ct).ConfigureAwait(false);
        var urlSet = existingUrls.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var existingTitles = await db.JobListings.AsNoTracking()
            .Where(j => j.Title != null && j.Title != "")
            .Select(j => j.Title!)
            .ToListAsync(ct).ConfigureAwait(false);
        var titleSet = existingTitles.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var fetched = await jobApi.FetchJobListingsAsync(ct).ConfigureAwait(false);
        var missing = new List<JobListing>();
        foreach (var j in fetched)
        {
            if (string.IsNullOrWhiteSpace(j.Title)) continue;
            // Prefer URL de-duplication (API rows always have URLs); fall back to title for legacy rows.
            if (!string.IsNullOrWhiteSpace(j.Url))
            {
                if (!urlSet.Add(j.Url)) continue;
            }
            else if (!titleSet.Add(j.Title))
            {
                continue;
            }

            missing.Add(j);
        }

        if (missing.Count == 0) return;
        await db.JobListings.AddRangeAsync(missing, ct).ConfigureAwait(false);
    }

    /// <summary>
    /// Public APIs (Remotive, Arbeitnow) rarely return on-site Sri Lanka rows. Inserts deterministic demo
    /// listings so Job Search can show up to 10 roles for LK + category filters without implying more live data exists.
    /// </summary>
    private static async Task SeedSriLankaTechnologyDemoJobsIfNeeded(
        ApplicationDbContext db,
        ILogger logger,
        CancellationToken ct)
    {
        const int target = 10;
        const string urlPrefix = "https://demo-careerpath.local/jobs/lk/tech/";

        var matchCount = await db.JobListings.AsNoTracking()
            .Where(j => j.Country != null && j.Country.Trim() == "Sri Lanka")
            .Where(j =>
                (j.Category != null && j.Category.Trim().ToLower() == "technology")
                || (j.Sector != null && j.Sector.Trim().ToLower() == "technology"))
            .CountAsync(ct)
            .ConfigureAwait(false);

        if (matchCount >= target)
            return;

        // Use single-arg StartsWith — EF Core cannot translate StartsWith(..., StringComparison).
        var existingDemoUrls = await db.JobListings.AsNoTracking()
            .Where(j => j.Url != null && j.Url.StartsWith(urlPrefix))
            .Select(j => j.Url!)
            .ToListAsync(ct)
            .ConfigureAwait(false);
        var seen = existingDemoUrls.ToHashSet(StringComparer.OrdinalIgnoreCase);

        var templates = BuildSriLankaTechnologyDemoJobs(urlPrefix);
        var need = target - matchCount;
        var toAdd = new List<JobListing>();
        foreach (var j in templates)
        {
            if (need <= 0) break;
            if (string.IsNullOrWhiteSpace(j.Url) || !seen.Add(j.Url)) continue;
            toAdd.Add(j);
            need--;
        }

        if (toAdd.Count == 0)
            return;

        await db.JobListings.AddRangeAsync(toAdd, ct).ConfigureAwait(false);
        logger.LogInformation(
            "Seeded {Count} Sri Lanka Technology demo job rows so regional filters can reach up to {Target} listings.",
            toAdd.Count,
            target);
    }

    private static List<JobListing> BuildSriLankaTechnologyDemoJobs(string urlPrefix)
    {
        const string sector = "Technology";
        const string category = "Technology";
        const string country = "Sri Lanka";
        const string growth = "+12%";
        var path = """[{"step":1,"title":"Degree or focused bootcamp","duration":"3–4 years"},{"step":2,"title":"Ship production features","duration":"1–2 years"}]""";

        (string slug, string title, string company, string location, string salary, string desc, string skills)[] rows =
        [
            ("sl-tech-001", "Senior .NET Engineer", "IslandStack Labs", "Colombo", "LKR 3.0M – 5.2M / yr",
                "Design APIs and microservices for banking integrations.", """["C#",".NET","SQL Server","Azure"]"""),
            ("sl-tech-002", "Full Stack Developer (React)", "CoconutCode", "Kandy", "LKR 2.2M – 4.0M / yr",
                "Product engineering for SaaS dashboards and admin portals.", """["React","TypeScript","Node.js","PostgreSQL"]"""),
            ("sl-tech-003", "Mobile Engineer (Flutter)", "PearlBay Apps", "Colombo", "LKR 2.5M – 4.5M / yr",
                "Build cross-platform consumer apps with strong UX.", """["Flutter","Dart","Firebase","REST"]"""),
            ("sl-tech-004", "DevOps / Platform Engineer", "TealOps LK", "Negombo", "LKR 3.2M – 5.5M / yr",
                "CI/CD, Kubernetes, and observability for distributed systems.", """["Kubernetes","Docker","GitHub Actions","Linux"]"""),
            ("sl-tech-005", "Data Engineer", "Monsoon Analytics", "Colombo", "LKR 2.8M – 4.8M / yr",
                "Pipelines, warehousing, and BI feeds for enterprise clients.", """["Python","dbt","Snowflake","Airflow"]"""),
            ("sl-tech-006", "QA Automation Lead", "Ceylon QualityWorks", "Galle", "LKR 2.4M – 4.2M / yr",
                "Test strategy, automation frameworks, and release quality gates.", """["Selenium","C#","API testing","CI"]"""),
            ("sl-tech-007", "Cloud Solutions Architect", "Lanka Cloud Partners", "Colombo", "LKR 4.0M – 6.5M / yr",
                "Presales, landing zones, and migration roadmaps on hyperscalers.", """["AWS","Azure","Terraform","Security"]"""),
            ("sl-tech-008", "Application Security Engineer", "FortShore Cyber", "Colombo", "LKR 3.1M – 5.0M / yr",
                "Threat modeling, secure SDLC, and vulnerability management.", """["AppSec","OWASP","Burp",".NET"]"""),
            ("sl-tech-009", "Engineering Manager", "HarborScale", "Colombo", "LKR 4.5M – 7.0M / yr",
                "Lead squads shipping B2B platforms; hiring and delivery ownership.", """["Leadership","Agile","System design","Coaching"]"""),
            ("sl-tech-010", "Site Reliability Engineer", "BasinWatch SRE", "Kandy", "LKR 2.9M – 5.1M / yr",
                "SLOs, incident response, and performance tuning for high-traffic APIs.", """["SRE","Prometheus","Go","Kubernetes"]"""),
            ("sl-tech-011", "Backend Engineer (Java)", "SpiceRoute FinTech", "Colombo", "LKR 2.7M – 4.6M / yr",
                "Ledger services, reconciliation jobs, and event-driven workflows.", """["Java","Spring Boot","Kafka","SQL"]"""),
            ("sl-tech-012", "Machine Learning Engineer", "Rainforest ML", "Colombo", "LKR 3.4M – 5.8M / yr",
                "Model training, deployment, and monitoring for recommendation systems.", """["Python","PyTorch","MLOps","SQL"]"""),
        ];

        var list = new List<JobListing>(rows.Length);
        foreach (var (slug, title, company, location, salary, desc, skills) in rows)
        {
            list.Add(new JobListing
            {
                Title = title,
                Company = company,
                Location = location,
                Country = country,
                Sector = sector,
                Category = category,
                SalaryRange = salary,
                Growth = growth,
                Description = desc,
                Url = urlPrefix + slug,
                SkillsJson = skills,
                CareerPathJson = path,
            });
        }

        return list;
    }

    private static async Task SeedMarketTrendsAsync(
        ApplicationDbContext db,
        IHostEnvironment env,
        ILogger logger,
        CancellationToken ct)
    {
        if (await db.MarketTrends.AnyAsync(ct).ConfigureAwait(false)) return;

        var path = Path.Combine(env.ContentRootPath, "Data", "market-trends.json");
        if (!File.Exists(path))
        {
            logger.LogWarning("Market trends file missing: {Path}", path);
            return;
        }

        var json = await File.ReadAllTextAsync(path, ct).ConfigureAwait(false);
        var rows = JsonSerializer.Deserialize<List<MarketTrendFileRow>>(json, JsonOptions);
        if (rows == null || rows.Count == 0) return;

        var now = DateTime.UtcNow;
        foreach (var r in rows)
        {
            db.MarketTrends.Add(new MarketTrend
            {
                Category = r.Category ?? "Technology",
                Title = r.Title ?? "Trend",
                Description = r.Description,
                TrendDataJson = r.TrendDataJson,
                UpdatedAt = now,
            });
        }

        logger.LogInformation("Seeded {Count} market trend rows from file", rows.Count);
    }

    public static async Task SeedAsync(
        ApplicationDbContext db,
        IHostEnvironment env,
        IConfiguration config,
        IHttpClientFactory http,
        IExternalJobListingSeedService jobApi,
        ILogger logger,
        CancellationToken ct = default)
    {
        await SeedIndustrySkillGapsAsync(db, env, config, http, logger, ct).ConfigureAwait(false);

        await SeedJobListingsFromApisAsync(db, jobApi, ct).ConfigureAwait(false);

        await SeedSriLankaTechnologyDemoJobsIfNeeded(db, logger, ct).ConfigureAwait(false);

        // Align legacy demo rows with the expanded global category list (Job Search / Top 10 filters).
        await db.JobListings
            .Where(j => j.Category == "Creative" && j.Sector == "Creative")
            .ExecuteUpdateAsync(s => s
                .SetProperty(j => j.Category, "Creative & Design")
                .SetProperty(j => j.Sector, "Creative & Design"), ct)
            .ConfigureAwait(false);

        await SeedMarketTrendsAsync(db, env, logger, ct).ConfigureAwait(false);

        await db.SaveChangesAsync(ct).ConfigureAwait(false);

        await BackfillJobListingCountriesAsync(db, ct).ConfigureAwait(false);

        if (env.IsDevelopment())
        {
            const string demoEmail = "demo@careerpath.local";
            if (!await db.Users.AnyAsync(u => u.Email == demoEmail, ct).ConfigureAwait(false))
            {
                db.Users.Add(new User
                {
                    Name = "Demo User",
                    Email = demoEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo123!"),
                    CreatedAt = DateTime.UtcNow,
                });
                await db.SaveChangesAsync(ct).ConfigureAwait(false);
            }
        }
    }

    private sealed class MarketTrendFileRow
    {
        public string? Category { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? TrendDataJson { get; set; }
    }
}
