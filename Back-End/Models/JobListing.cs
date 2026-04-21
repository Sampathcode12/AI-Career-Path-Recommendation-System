namespace BackEnd.Models;

public class JobListing
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? Location { get; set; }
    /// <summary>Canonical country for filters (e.g. United States, Sri Lanka). Null for Remote or unmapped locations.</summary>
    public string? Country { get; set; }
    public string? Sector { get; set; }
    public string? Category { get; set; }
    public string? SalaryRange { get; set; }
    public string? Growth { get; set; }
    public string? Description { get; set; }
    public string? Url { get; set; }
    public string? SkillsJson { get; set; }
    public string? CareerPathJson { get; set; }
}
