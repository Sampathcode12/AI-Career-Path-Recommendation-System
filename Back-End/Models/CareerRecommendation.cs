namespace BackEnd.Models;

public class CareerRecommendation
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Category { get; set; }
    public bool Saved { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    /// <summary>JSON: matchPercentage, salaryRange, skills[], learningPath[], etc. from AI.</summary>
    public string? MetadataJson { get; set; }

    public virtual User User { get; set; } = null!;
}
