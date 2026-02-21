namespace BackEnd.DTOs;

public record MarketTrendResponse(
    int Id,
    string Category,
    string Title,
    string? Description,
    string? TrendDataJson,
    DateTime UpdatedAt);
