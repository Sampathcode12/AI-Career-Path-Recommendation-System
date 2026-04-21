using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IJobService
{
    Task<IReadOnlyList<JobCategoryOptionResponse>> GetJobCategoryOptionsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<JobListingResponse>> SearchAsync(JobSearchRequest request, int? userId, CancellationToken ct = default);
    Task<IReadOnlyList<JobListingResponse>> GetTopJobsAsync(string? category, int limit, string? country, CancellationToken ct = default);
    Task<IReadOnlyList<JobItemResponse>> GetSavedByUserIdAsync(int userId, CancellationToken ct = default);
    Task<JobItemResponse> SaveJobAsync(int userId, JobSaveRequest request, CancellationToken ct = default);

    /// <summary>Search job listings by title/company for role picker UIs (e.g. Industry Skill Gap).</summary>
    Task<IReadOnlyList<JobRoleSearchResultDto>> SearchJobRolesAsync(string? query, int limit, CancellationToken ct = default);

    /// <summary>Common skills across job postings, bucketed by title-inferred career level (entry / mid / senior).</summary>
    Task<IReadOnlyList<JobLevelSkillsGroupDto>> GetCommonSkillsByJobLevelAsync(int minCount, int maxPerLevel, CancellationToken ct = default);

    /// <summary>Distinct job titles for autocomplete, scoped by category/country like top jobs.</summary>
    Task<IReadOnlyList<JobTitleSuggestionDto>> GetJobTitleSuggestionsAsync(
        string? query,
        string? category,
        string? country,
        int limit,
        CancellationToken ct = default);

    /// <summary>Aggregate salary, growth, skills for listings with the same title; industry hints from IndustrySkillGaps.</summary>
    Task<JobRoleInsightsResponse> GetJobRoleInsightsAsync(string title, string? category, string? country, CancellationToken ct = default);
}
