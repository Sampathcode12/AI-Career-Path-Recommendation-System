using BackEnd.DTOs;

namespace BackEnd.Services;

public interface ISkillGapService
{
    Task<IReadOnlyList<SkillGapResponse>> GetAllByIndustryAsync(string? industryId, CancellationToken ct = default);
}
