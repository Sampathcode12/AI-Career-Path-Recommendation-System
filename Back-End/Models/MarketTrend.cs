namespace BackEnd.Models;

public class MarketTrend
{
    public int Id { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? TrendDataJson { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
