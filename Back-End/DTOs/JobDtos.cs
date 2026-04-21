namespace BackEnd.DTOs;

public record JobSearchRequest(
    string? Query,
    string? Location,
    string? Category,
    string? Sector,
    string? Country);

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
    string? Country,
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

/// <summary>Job Search category filter row — <see cref="Value"/> is sent to GET /api/jobs/top?category=.</summary>
public record JobCategoryOptionResponse(string Value, string Label);

/// <summary>Lightweight row for Industry Skill Gap page — search job titles from <see cref="Models.JobListing"/>.</summary>
public record JobRoleSearchResultDto(
    int Id,
    string Title,
    string? Company,
    string? Location,
    string? Category,
    string? Sector,
    IReadOnlyList<string> Skills);

/// <summary>Aggregated skill counts for Industry Skill Gap — grouped by inferred seniority from job title.</summary>
public record JobLevelSkillCountDto(string Name, int Count);

public record JobLevelSkillsGroupDto(string Level, IReadOnlyList<JobLevelSkillCountDto> Skills);

/// <summary>Autocomplete row for Job Search — distinct titles with listing counts.</summary>
public record JobTitleSuggestionDto(string Title, int ListingCount);

public record StringCountDto(string Value, int Count);

/// <summary>Typical education / certs from IndustrySkillGaps when the role category maps.</summary>
public record JobIndustryQualificationHintsDto(
    string IndustryName,
    string DemandGrowth,
    string? TypicalSalaryRange,
    string? TypicalEducation,
    string? TypicalCertifications);

/// <summary>Aggregated salary, growth, and skills across listings sharing the same title (plus industry hints).</summary>
public record JobRoleInsightsResponse(
    string Title,
    int MatchingListingCount,
    IReadOnlyList<StringCountDto> PostingSalaryRanges,
    IReadOnlyList<StringCountDto> PostingGrowthLabels,
    IReadOnlyList<StringCountDto> CommonSkills,
    JobIndustryQualificationHintsDto? IndustryHints);
