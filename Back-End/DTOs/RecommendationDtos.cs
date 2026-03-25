namespace BackEnd.DTOs;

public record RecommendationResponse(
    int Id,
    int UserId,
    string Title,
    string? Description,
    string? Category,
    bool Saved,
    int SortOrder,
    DateTime CreatedAt,
    int? MatchPercentage = null,
    string? SalaryRange = null,
    string? Growth = null,
    IReadOnlyList<string>? Skills = null,
    IReadOnlyList<LearningPathStepDto>? LearningPath = null);

public record LearningPathStepDto(int Step, string Title, string Duration);
