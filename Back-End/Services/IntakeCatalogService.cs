using BackEnd.Data;
using BackEnd.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BackEnd.Services;

public class IntakeCatalogService : IIntakeCatalogService
{
    private const string FallbackSpecialization = "General / Undeclared";

    private readonly ApplicationDbContext _db;

    public IntakeCatalogService(ApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<SpecializationOptionDto>> GetSpecializationsAsync(CancellationToken ct = default)
    {
        var specs = await _db.SubjectCareerPaths.AsNoTracking()
            .Select(x => x.Specialization)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync(ct);

        return specs.Select(s => new SpecializationOptionDto(s, s)).ToList();
    }

    public async Task<CareerPathsResponseDto> GetCareerPathsAsync(
        string specialization,
        string? search = null,
        CancellationToken ct = default)
    {
        var input = (specialization ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(input))
        {
            return new CareerPathsResponseDto(string.Empty, string.Empty, Array.Empty<CareerPathOptionDto>());
        }

        var resolved = await ResolveSpecializationKeyAsync(input, ct);
        var q = (search ?? string.Empty).Trim();

        var query = _db.SubjectCareerPaths.AsNoTracking()
            .Where(x => x.Specialization == resolved);

        if (!string.IsNullOrEmpty(q))
        {
            var pattern = $"%{EscapeLikePattern(q)}%";
            query = query.Where(x => EF.Functions.Like(x.PathLabel, pattern));
        }

        var rows = await query
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.PathLabel)
            .Select(x => new CareerPathOptionDto(x.PathLabel, x.PathLabel))
            .ToListAsync(ct);

        return new CareerPathsResponseDto(input, resolved, rows);
    }

    private async Task<string> ResolveSpecializationKeyAsync(string input, CancellationToken ct)
    {
        var exact = await _db.SubjectCareerPaths.AsNoTracking()
            .Where(x => x.Specialization == input)
            .Select(x => x.Specialization)
            .FirstOrDefaultAsync(ct);
        if (!string.IsNullOrEmpty(exact)) return exact;

        var all = await _db.SubjectCareerPaths.AsNoTracking()
            .Select(x => x.Specialization)
            .Distinct()
            .ToListAsync(ct);

        var ci = all.FirstOrDefault(s => string.Equals(s, input, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrEmpty(ci)) return ci;

        return all.Contains(FallbackSpecialization) ? FallbackSpecialization : input;
    }

    private static string EscapeLikePattern(string value) =>
        value.Replace("[", "[[]").Replace("%", "[%]").Replace("_", "[_]");
}
