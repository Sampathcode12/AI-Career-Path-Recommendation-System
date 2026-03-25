namespace BackEnd.DTOs;

public record SkillGapResponse(
    int Id,
    string IndustryId,
    string Name,
    string? Description,
    string DemandGrowth,
    IReadOnlyList<string> TopDemandSkills,
    IReadOnlyList<string> GapSkills,
    string SupplyLevel,
    IReadOnlyList<string>? TopRegions,
    string? TypicalSalaryRange,
    string? TypicalEducation,
    string? TypicalCertifications);
