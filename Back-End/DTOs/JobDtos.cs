namespace BackEnd.DTOs;

public record JobSearchRequest(
    string? Query,
    string? Location,
    string? Category,
    string? Sector);

public record JobItemResponse(
    int Id,
    string Title,
    string? Company,
    string? Location,
    string? Url,
    string? Description,
    DateTime SavedAt);

public record JobListingResponse(
    int Id,
    string Title,
    string? Company,
    string? Location,
    string? Sector,
    string? Category,
    string? SalaryRange,
    string? Growth,
    string? Description,
    string? Url,
    IReadOnlyList<string>? Skills,
    IReadOnlyList<CareerPathStepDto>? CareerPath);

public record CareerPathStepDto(int Step, string Title, string? Duration);

public record JobSaveRequest(
    string Title,
    string? Company,
    string? Location,
    string? Url,
    string? Description);
