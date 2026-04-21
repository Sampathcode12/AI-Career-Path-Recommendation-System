using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class JobService : IJobService
{
    private readonly ApplicationDbContext _db;

    /// <summary>Infer career level from posting title for skill aggregation (heuristic).</summary>
    private static readonly Regex RxEntryTitle = new(
        @"\b(junior|intern|internship|trainee|graduate|entry[-\s]?level|associate\s+(software|developer|engineer)|\bjr\.?\b)\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex RxSeniorTitle = new(
        @"\b(senior|principal(\s+|$)|staff\s+(software|engineer|data|ml)|\bsr\.?\b|chief\s+|director|vice\s+president|\bvp\b|architect|head\s+of|tech\s+lead|team\s+lead|engineering\s+manager|lead\s+(software|developer|engineer))\b",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    /// <summary>Maps <see cref="JobListing.Category"/> labels to <see cref="IndustrySkillGap.IndustryId"/> (seed JSON).</summary>
    private static readonly Dictionary<string, string> JobCategoryToGapIndustryId = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Technology"] = "technology",
        ["Finance"] = "finance",
        ["Healthcare"] = "healthcare",
        ["Education"] = "education",
        ["Manufacturing"] = "manufacturing",
        ["Energy & Utilities"] = "energy",
        ["Energy"] = "energy",
        ["Retail"] = "retail",
        ["Construction"] = "construction",
        ["Hospitality"] = "hospitality",
        ["Transportation"] = "transportation",
        ["Real Estate"] = "realestate",
        ["Media & Entertainment"] = "media",
        ["Legal"] = "legal",
        ["Government"] = "government",
        ["Agriculture"] = "agriculture",
        ["Mining"] = "mining",
        ["Professional Services"] = "professional",
        ["Creative & Design"] = "creative",
        ["Nonprofit"] = "nonprofit",
        ["Telecom"] = "telecom",
        ["Aerospace"] = "aerospace",
    };

    public JobService(ApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<JobCategoryOptionResponse>> GetJobCategoryOptionsAsync(CancellationToken ct = default)
    {
        var trimmed = await _db.JobListings.AsNoTracking()
            .Where(j => j.Category != null && j.Category.Trim() != "")
            .Select(j => j.Category!.Trim())
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync(ct);

        var result = new List<JobCategoryOptionResponse> { new("All", "All categories") };
        foreach (var c in trimmed)
            result.Add(new JobCategoryOptionResponse(c, c));
        return result;
    }

    /// <summary>
    /// Matches job-search / Top 10 category values against <see cref="JobListing.Category"/> or <see cref="JobListing.Sector"/>
    /// (exact after trim, case-insensitive), plus sector labels like "Technology &amp; Analytics" when filter is "Technology".
    /// </summary>
    private static IQueryable<JobListing> WhereMatchesCategoryOrSector(IQueryable<JobListing> query, string categoryTrimmed)
    {
        var catLower = categoryTrimmed.ToLowerInvariant();
        var sectorPrefixSpace = catLower + " ";
        var sectorPrefixAmp = catLower + "&";
        var sectorPrefixSlash = catLower + "/";
        return query.Where(j =>
            (j.Category != null && j.Category.Trim().ToLower() == catLower)
            || (j.Sector != null && j.Sector.Trim().ToLower() == catLower)
            || (j.Sector != null && j.Sector.Trim().ToLower().StartsWith(sectorPrefixSpace))
            || (j.Sector != null && j.Sector.Trim().ToLower().StartsWith(sectorPrefixAmp))
            || (j.Sector != null && j.Sector.Trim().ToLower().StartsWith(sectorPrefixSlash)));
    }

    public async Task<IReadOnlyList<JobListingResponse>> SearchAsync(JobSearchRequest request, int? userId, CancellationToken ct = default)
    {
        var query = _db.JobListings.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            var q = request.Query.ToLower();
            query = query.Where(j =>
                (j.Title != null && j.Title.ToLower().Contains(q)) ||
                (j.Company != null && j.Company.ToLower().Contains(q)) ||
                (j.Sector != null && j.Sector.ToLower().Contains(q)) ||
                (j.Category != null && j.Category.ToLower().Contains(q)));
        }
        if (!string.IsNullOrWhiteSpace(request.Location))
            query = query.Where(j => j.Location != null && j.Location.ToLower().Contains(request.Location.ToLower()));
        if (!string.IsNullOrWhiteSpace(request.Category)
            && !string.Equals(request.Category.Trim(), "All", StringComparison.OrdinalIgnoreCase))
        {
            var cat = request.Category.Trim();
            query = WhereMatchesCategoryOrSector(query, cat);
        }
        if (!string.IsNullOrWhiteSpace(request.Sector))
            query = query.Where(j => j.Sector != null && j.Sector.ToLower().Contains(request.Sector.ToLower()));
        if (!string.IsNullOrWhiteSpace(request.Country))
        {
            var c = request.Country.Trim();
            query = query.Where(j => j.Country != null && j.Country == c);
        }
        var list = await query.OrderBy(j => j.Title).Take(100).ToListAsync(ct);
        return list.Select(ToListingResponse).ToList();
    }

    public async Task<IReadOnlyList<JobListingResponse>> GetTopJobsAsync(string? category, int limit, string? country, CancellationToken ct = default)
    {
        var query = _db.JobListings.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category)
            && !string.Equals(category.Trim(), "All", StringComparison.OrdinalIgnoreCase))
        {
            var cat = category.Trim();
            query = WhereMatchesCategoryOrSector(query, cat);
        }
        if (!string.IsNullOrWhiteSpace(country))
        {
            var c = country.Trim();
            query = query.Where(j => j.Country != null && j.Country == c);
        }
        var list = await query.OrderBy(j => j.Title).Take(limit).ToListAsync(ct);
        return list.Select(ToListingResponse).ToList();
    }

    public async Task<IReadOnlyList<JobRoleSearchResultDto>> SearchJobRolesAsync(string? query, int limit, CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 50);
        var baseQuery = _db.JobListings.AsNoTracking();
        List<JobListing> list;
        if (!string.IsNullOrWhiteSpace(query))
        {
            var t = query.Trim().ToLowerInvariant();
            list = await baseQuery
                .Where(j =>
                    (j.Title != null && j.Title.ToLower().Contains(t))
                    || (j.Company != null && j.Company.ToLower().Contains(t)))
                .OrderBy(j => j.Title)
                .Take(limit)
                .ToListAsync(ct);
        }
        else
        {
            list = await baseQuery
                .OrderByDescending(j => j.Id)
                .Take(limit)
                .ToListAsync(ct);
        }

        return list.Select(j => new JobRoleSearchResultDto(
            j.Id,
            j.Title,
            j.Company,
            j.Location,
            j.Category,
            j.Sector,
            ParseJsonArray(j.SkillsJson))).ToList();
    }

    public async Task<IReadOnlyList<JobTitleSuggestionDto>> GetJobTitleSuggestionsAsync(
        string? query,
        string? category,
        string? country,
        int limit,
        CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 30);
        var baseQuery = _db.JobListings.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category)
            && !string.Equals(category.Trim(), "All", StringComparison.OrdinalIgnoreCase))
            baseQuery = WhereMatchesCategoryOrSector(baseQuery, category.Trim());
        if (!string.IsNullOrWhiteSpace(country))
        {
            var c = country.Trim();
            baseQuery = baseQuery.Where(j => j.Country != null && j.Country == c);
        }

        var searchLower = query?.Trim().ToLowerInvariant() ?? "";
        var titleRows = await baseQuery
            .Where(j => j.Title != null && j.Title != "")
            .Where(j => searchLower.Length == 0 || j.Title!.ToLower().Contains(searchLower))
            .Select(j => j.Title!)
            .Take(4000)
            .ToListAsync(ct);

        return titleRows
            .Select(t => t.Trim())
            .Where(t => t.Length > 0)
            .GroupBy(t => t, StringComparer.OrdinalIgnoreCase)
            .Select(g => new JobTitleSuggestionDto(g.Key, g.Count()))
            .OrderByDescending(x => x.ListingCount)
            .ThenBy(x => x.Title, StringComparer.OrdinalIgnoreCase)
            .Take(limit)
            .ToList();
    }

    public async Task<JobRoleInsightsResponse> GetJobRoleInsightsAsync(string title, string? category, string? country, CancellationToken ct = default)
    {
        var tnorm = title.Trim();
        if (tnorm.Length == 0)
            return new JobRoleInsightsResponse(title, 0, Array.Empty<StringCountDto>(), Array.Empty<StringCountDto>(), Array.Empty<StringCountDto>(), null);

        var tLower = tnorm.ToLowerInvariant();
        var baseQuery = _db.JobListings.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category)
            && !string.Equals(category.Trim(), "All", StringComparison.OrdinalIgnoreCase))
            baseQuery = WhereMatchesCategoryOrSector(baseQuery, category.Trim());
        if (!string.IsNullOrWhiteSpace(country))
        {
            var c = country.Trim();
            baseQuery = baseQuery.Where(j => j.Country != null && j.Country == c);
        }

        var list = await baseQuery
            .Where(j => j.Title != null && j.Title.Trim().ToLower() == tLower)
            .Take(120)
            .ToListAsync(ct);

        if (list.Count == 0)
            return new JobRoleInsightsResponse(tnorm, 0, Array.Empty<StringCountDto>(), Array.Empty<StringCountDto>(), Array.Empty<StringCountDto>(), null);

        static List<StringCountDto> PackCounts(Dictionary<string, (int Count, string Display)> dict, int max)
        {
            return dict
                .OrderByDescending(kv => kv.Value.Count)
                .ThenBy(kv => kv.Value.Display, StringComparer.OrdinalIgnoreCase)
                .Take(max)
                .Select(kv => new StringCountDto(kv.Value.Display, kv.Value.Count))
                .ToList();
        }

        var salaryDict = new Dictionary<string, (int Count, string Display)>(StringComparer.OrdinalIgnoreCase);
        var growthDict = new Dictionary<string, (int Count, string Display)>(StringComparer.OrdinalIgnoreCase);
        var skillDict = new Dictionary<string, (int Count, string Display)>(StringComparer.OrdinalIgnoreCase);

        foreach (var j in list)
        {
            var sr = j.SalaryRange?.Trim();
            if (!string.IsNullOrEmpty(sr))
            {
                var k = sr.ToLowerInvariant();
                if (salaryDict.TryGetValue(k, out var cur))
                    salaryDict[k] = (cur.Count + 1, cur.Display);
                else
                    salaryDict[k] = (1, sr);
            }

            var gr = j.Growth?.Trim();
            if (!string.IsNullOrEmpty(gr))
            {
                var k = gr.ToLowerInvariant();
                if (growthDict.TryGetValue(k, out var cur))
                    growthDict[k] = (cur.Count + 1, cur.Display);
                else
                    growthDict[k] = (1, gr);
            }

            foreach (var raw in ParseJsonArray(j.SkillsJson))
            {
                var trimmed = raw.Trim();
                if (trimmed.Length == 0) continue;
                var sk = trimmed.ToLowerInvariant();
                if (skillDict.TryGetValue(sk, out var cur))
                    skillDict[sk] = (cur.Count + 1, cur.Display);
                else
                    skillDict[sk] = (1, trimmed);
            }
        }

        var gapIds = await _db.IndustrySkillGaps.AsNoTracking()
            .Select(g => g.IndustryId)
            .ToListAsync(ct);
        var gapIdSet = new HashSet<string>(gapIds, StringComparer.OrdinalIgnoreCase);

        var topCategory = list
            .Where(j => !string.IsNullOrWhiteSpace(j.Category))
            .GroupBy(j => j.Category!.Trim(), StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(g => g.Count())
            .FirstOrDefault()?.Key;

        JobListing? sampleForSector = null;
        if (topCategory != null)
        {
            sampleForSector = list.FirstOrDefault(j =>
                string.Equals(j.Category?.Trim(), topCategory, StringComparison.OrdinalIgnoreCase));
        }
        if (sampleForSector == null)
            sampleForSector = list.FirstOrDefault();
        var industryId = ResolveGapIndustryId(topCategory, sampleForSector?.Sector, gapIdSet);

        JobIndustryQualificationHintsDto? hints = null;
        if (!string.IsNullOrEmpty(industryId))
        {
            var row = await _db.IndustrySkillGaps.AsNoTracking()
                .FirstOrDefaultAsync(g => g.IndustryId == industryId, ct);
            if (row != null)
            {
                hints = new JobIndustryQualificationHintsDto(
                    row.Name,
                    row.DemandGrowth,
                    row.TypicalSalaryRange,
                    row.TypicalEducation,
                    row.TypicalCertifications);
            }
        }

        return new JobRoleInsightsResponse(
            tnorm,
            list.Count,
            PackCounts(salaryDict, 8),
            PackCounts(growthDict, 6),
            PackCounts(skillDict, 24),
            hints);
    }

    private static string? ResolveGapIndustryId(string? category, string? sector, HashSet<string> gapIdSet)
    {
        if (!string.IsNullOrWhiteSpace(category) && JobCategoryToGapIndustryId.TryGetValue(category.Trim(), out var mapped))
            return mapped;
        var catLower = (category ?? "").Trim().ToLowerInvariant();
        if (catLower.Length > 0 && gapIdSet.Contains(catLower))
            return catLower;
        var secLower = (sector ?? "").Trim().ToLowerInvariant();
        if (secLower.Length > 0 && gapIdSet.Contains(secLower))
            return secLower;
        foreach (var gid in gapIdSet)
        {
            if (secLower.StartsWith(gid + " ", StringComparison.Ordinal)
                || secLower.StartsWith(gid + "&", StringComparison.Ordinal)
                || secLower.StartsWith(gid + "/", StringComparison.Ordinal))
                return gid;
        }
        return null;
    }

    private static string ClassifyJobTitleLevel(string? title)
    {
        if (string.IsNullOrWhiteSpace(title)) return "Mid-level";
        var t = title.Trim();
        if (RxSeniorTitle.IsMatch(t)) return "Senior-level";
        if (RxEntryTitle.IsMatch(t)) return "Entry-level";
        return "Mid-level";
    }

    public async Task<IReadOnlyList<JobLevelSkillsGroupDto>> GetCommonSkillsByJobLevelAsync(
        int minCount,
        int maxPerLevel,
        CancellationToken ct = default)
    {
        minCount = Math.Clamp(minCount, 1, 100);
        maxPerLevel = Math.Clamp(maxPerLevel, 5, 200);

        var rows = await _db.JobListings.AsNoTracking()
            .Where(j => j.SkillsJson != null && j.SkillsJson != "" && j.SkillsJson != "[]")
            .Select(j => new { j.Title, j.SkillsJson })
            .ToListAsync(ct);

        var entry = new Dictionary<string, (int Count, string Display)>(StringComparer.OrdinalIgnoreCase);
        var mid = new Dictionary<string, (int Count, string Display)>(StringComparer.OrdinalIgnoreCase);
        var senior = new Dictionary<string, (int Count, string Display)>(StringComparer.OrdinalIgnoreCase);

        foreach (var row in rows)
        {
            var level = ClassifyJobTitleLevel(row.Title);
            var dict = level switch
            {
                "Entry-level" => entry,
                "Senior-level" => senior,
                _ => mid,
            };
            foreach (var raw in ParseJsonArray(row.SkillsJson))
            {
                var trimmed = raw.Trim();
                if (trimmed.Length == 0) continue;
                var key = trimmed.ToLowerInvariant();
                if (dict.TryGetValue(key, out var cur))
                    dict[key] = (cur.Count + 1, cur.Display);
                else
                    dict[key] = (1, trimmed);
            }
        }

        static IReadOnlyList<JobLevelSkillCountDto> Pack(
            Dictionary<string, (int Count, string Display)> dict,
            int min,
            int max)
        {
            return dict
                .Where(kv => kv.Value.Count >= min)
                .OrderByDescending(kv => kv.Value.Count)
                .ThenBy(kv => kv.Value.Display, StringComparer.OrdinalIgnoreCase)
                .Take(max)
                .Select(kv => new JobLevelSkillCountDto(kv.Value.Display, kv.Value.Count))
                .ToList();
        }

        return new[]
        {
            new JobLevelSkillsGroupDto("Entry-level", Pack(entry, minCount, maxPerLevel)),
            new JobLevelSkillsGroupDto("Mid-level", Pack(mid, minCount, maxPerLevel)),
            new JobLevelSkillsGroupDto("Senior-level", Pack(senior, minCount, maxPerLevel)),
        };
    }

    public async Task<IReadOnlyList<JobItemResponse>> GetSavedByUserIdAsync(int userId, CancellationToken ct = default)
    {
        var list = await _db.SavedJobs.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.SavedAt)
            .ToListAsync(ct);
        return list.Select(j => new JobItemResponse(j.Id, j.Title, j.Company, j.Location, j.Url, j.Description, j.SavedAt)).ToList();
    }

    public async Task<JobItemResponse> SaveJobAsync(int userId, JobSaveRequest request, CancellationToken ct = default)
    {
        var job = new SavedJob
        {
            UserId = userId,
            Title = request.Title,
            Company = request.Company,
            Location = request.Location,
            Url = request.Url,
            Description = request.Description,
            SavedAt = DateTime.UtcNow
        };
        _db.SavedJobs.Add(job);
        await _db.SaveChangesAsync(ct);
        return new JobItemResponse(job.Id, job.Title, job.Company, job.Location, job.Url, job.Description, job.SavedAt);
    }

    private static JobListingResponse ToListingResponse(JobListing j)
    {
        var skills = ParseJsonArray(j.SkillsJson);
        var path = ParseCareerPath(j.CareerPathJson);
        return new JobListingResponse(j.Id, j.Title, j.Company, j.Location, j.Country, j.Sector, j.Category, j.SalaryRange, j.Growth, j.Description, j.Url, skills, path);
    }

    private static IReadOnlyList<string> ParseJsonArray(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return Array.Empty<string>();
        try
        {
            var arr = JsonSerializer.Deserialize<string[]>(s);
            return arr ?? Array.Empty<string>();
        }
        catch { return Array.Empty<string>(); }
    }

    private static IReadOnlyList<CareerPathStepDto>? ParseCareerPath(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        try
        {
            var arr = JsonSerializer.Deserialize<JsonElement>(s);
            if (arr.ValueKind != JsonValueKind.Array) return null;
            var list = new List<CareerPathStepDto>();
            foreach (var el in arr.EnumerateArray())
            {
                var step = el.TryGetProperty("step", out var st) && st.TryGetInt32(out var si) ? si : 0;
                var title = el.TryGetProperty("title", out var t) ? t.GetString() ?? "" : "";
                var dur = el.TryGetProperty("duration", out var d) ? d.GetString() : null;
                list.Add(new CareerPathStepDto(step, title, dur));
            }
            return list;
        }
        catch { return null; }
    }
}
