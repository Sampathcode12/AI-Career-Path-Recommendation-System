namespace BackEnd.Models;

public class IndustrySkillGap
{
    public int Id { get; set; }
    public string IndustryId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DemandGrowth { get; set; } = string.Empty;
    public string TopDemandSkillsJson { get; set; } = "[]";
    public string GapSkillsJson { get; set; } = "[]";
    public string SupplyLevel { get; set; } = "Medium";
    public string? TopRegionsJson { get; set; }
    public string? TypicalSalaryRange { get; set; }
    public string? TypicalEducation { get; set; }
    public string? TypicalCertifications { get; set; }
}
