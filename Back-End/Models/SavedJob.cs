namespace BackEnd.Models;

public class SavedJob
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? Location { get; set; }
    public string? Url { get; set; }
    public string? Description { get; set; }
    public DateTime SavedAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
}
