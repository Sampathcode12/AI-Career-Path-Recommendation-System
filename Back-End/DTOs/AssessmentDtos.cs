namespace BackEnd.DTOs;

public record AssessmentResponse(
    int Id,
    int UserId,
    string? AnswersJson,
    string? ResultSummary,
    DateTime CreatedAt);

public record AssessmentCreateRequest(string? AnswersJson, string? ResultSummary);
