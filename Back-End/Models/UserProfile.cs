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
    /// <summary>Undergraduate degree / course name (e.g. B.Sc. Computer Science).</summary>
    public string? UgCourse { get; set; }
    /// <summary>UG major / specialization (e.g. Mathematics).</summary>
    public string? UgSpecialization { get; set; }
    public string? UgCgpaOrPercentage { get; set; }
    public string? Gender { get; set; }
    public bool? HasAdditionalCertifications { get; set; }
    public string? CertificateCourseTitles { get; set; }
    public bool? IsWorking { get; set; }
    /// <summary>First job title in current field, or NA.</summary>
    public string? FirstJobTitle { get; set; }
    /// <summary>Masters field if applicable; empty if no masters.</summary>
    public string? MastersField { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
