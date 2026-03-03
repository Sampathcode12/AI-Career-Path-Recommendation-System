namespace BackEnd.Models;

public class UserProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? Skills { get; set; }
    public string? Interests { get; set; }
    public string? ExperienceLevel { get; set; }
    public string? Education { get; set; }
    public string? PreferredIndustries { get; set; }
    public string? Location { get; set; }
    public string? Bio { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? PortfolioUrl { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
