namespace BackEnd.Models;

public class Assessment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? AnswersJson { get; set; }
    public string? ResultSummary { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
}
