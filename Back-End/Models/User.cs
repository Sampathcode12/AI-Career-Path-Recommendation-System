namespace BackEnd.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual UserProfile? Profile { get; set; }
    public virtual ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();
    public virtual ICollection<CareerRecommendation> Recommendations { get; set; } = new List<CareerRecommendation>();
    public virtual ICollection<SavedJob> SavedJobs { get; set; } = new List<SavedJob>();
}
