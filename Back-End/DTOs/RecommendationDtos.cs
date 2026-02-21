namespace BackEnd.DTOs;

public record RecommendationResponse(
    int Id,
    int UserId,
    string Title,
    string? Description,
    string? Category,
    bool Saved,
    int SortOrder,
    DateTime CreatedAt);
