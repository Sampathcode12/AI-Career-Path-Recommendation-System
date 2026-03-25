using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class SkillGapService : ISkillGapService
{
    private readonly ApplicationDbContext _db;

    public SkillGapService(ApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<SkillGapResponse>> GetAllByIndustryAsync(string? industryId, CancellationToken ct = default)
    {
        var query = _db.IndustrySkillGaps.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(industryId) && industryId != "all")
            query = query.Where(x => x.IndustryId == industryId);
        var list = await query.OrderBy(x => x.Name).ToListAsync(ct);
        return list.Select(ToResponse).ToList();
    }

    private static SkillGapResponse ToResponse(IndustrySkillGap g)
    {
        var top = ParseJsonArray(g.TopDemandSkillsJson);
        var gap = ParseJsonArray(g.GapSkillsJson);
        var regions = ParseJsonArray(g.TopRegionsJson ?? string.Empty);
        return new SkillGapResponse(g.Id, g.IndustryId, g.Name, g.Description, g.DemandGrowth, top, gap, g.SupplyLevel, regions.Count > 0 ? regions : null, g.TypicalSalaryRange, g.TypicalEducation, g.TypicalCertifications);
    }

    private static IReadOnlyList<string> ParseJsonArray(string s)
    {
        if (string.IsNullOrWhiteSpace(s)) return Array.Empty<string>();
        try
        {
            var arr = JsonSerializer.Deserialize<string[]>(s);
            return arr ?? Array.Empty<string>();
        }
        catch { return Array.Empty<string>(); }
    }
}
