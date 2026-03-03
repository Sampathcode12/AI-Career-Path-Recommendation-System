namespace BackEnd.DTOs;

public record ProfileResponse(
    int Id,
    int UserId,
    string? Skills,
    string? Interests,
    string? ExperienceLevel,
    string? Education,
    string? PreferredIndustries,
    string? Location,
    string? Bio,
    string? LinkedInUrl,
    string? PortfolioUrl,
    DateTime? UpdatedAt);

public record ProfileCreateOrUpdateRequest(
    string? Skills,
    string? Interests,
    string? ExperienceLevel,
    string? Education,
    string? PreferredIndustries,
    string? Location,
    string? Bio,
    string? LinkedInUrl,
    string? PortfolioUrl);
