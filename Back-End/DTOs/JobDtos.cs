namespace BackEnd.DTOs;

public record JobSearchRequest(
    string? Query,
    string? Location,
    string? Category);

public record JobItemResponse(
    int Id,
    string Title,
    string? Company,
    string? Location,
    string? Url,
    string? Description,
    DateTime SavedAt);

public record JobSaveRequest(
    string Title,
    string? Company,
    string? Location,
    string? Url,
    string? Description);
