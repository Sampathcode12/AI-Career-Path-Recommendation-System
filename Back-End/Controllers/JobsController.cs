using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.DTOs;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/jobs")]
[Authorize]
public class JobsController : ControllerBase
{
    private readonly IJobService _jobService;

    public JobsController(IJobService jobService) => _jobService = jobService;

    /// <summary>Distinct JobListing.Category values plus an All row — drives Job Search category dropdown.</summary>
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories(CancellationToken ct)
    {
        var list = await _jobService.GetJobCategoryOptionsAsync(ct);
        return Ok(list);
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] JobSearchRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var list = await _jobService.SearchAsync(request, userId, ct);
        return Ok(list);
    }

    [HttpGet("top")]
    public async Task<IActionResult> GetTop([FromQuery] string? category, [FromQuery] int limit = 10, [FromQuery] string? country = null, CancellationToken ct = default)
    {
        var list = await _jobService.GetTopJobsAsync(category, limit, country, ct);
        return Ok(list);
    }

    /// <summary>Distinct job titles for Job Search autocomplete, scoped by category and country like GET /top.</summary>
    [HttpGet("title-suggestions")]
    public async Task<IActionResult> TitleSuggestions(
        [FromQuery] string? q,
        [FromQuery] string? category,
        [FromQuery] string? country,
        [FromQuery] int limit = 15,
        CancellationToken ct = default)
    {
        var list = await _jobService.GetJobTitleSuggestionsAsync(q, category, country, limit, ct);
        return Ok(list);
    }

    /// <summary>Aggregated salary, growth, skills for listings with the same title; industry education/certs when category maps.</summary>
    [HttpGet("role-insights")]
    public async Task<IActionResult> RoleInsights(
        [FromQuery] string title,
        [FromQuery] string? category,
        [FromQuery] string? country,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(title))
            return BadRequest(new { detail = "Query parameter 'title' is required." });
        var insights = await _jobService.GetJobRoleInsightsAsync(title, category, country, ct);
        return Ok(insights);
    }

    /// <summary>Search job titles/companies for Industry Skill Gap role picker (empty query = latest listings).</summary>
    [HttpGet("role-search")]
    public async Task<IActionResult> RoleSearch([FromQuery] string? q, [FromQuery] int limit = 25, CancellationToken ct = default)
    {
        var list = await _jobService.SearchJobRolesAsync(q, limit, ct);
        return Ok(list);
    }

    /// <summary>Aggregated common skills from JobListings by inferred role level (Industry Skill Gap page).</summary>
    [HttpGet("skills-by-level")]
    public async Task<IActionResult> SkillsByLevel(
        [FromQuery] int minCount = 2,
        [FromQuery] int maxPerLevel = 60,
        CancellationToken ct = default)
    {
        var list = await _jobService.GetCommonSkillsByJobLevelAsync(minCount, maxPerLevel, ct);
        return Ok(list);
    }

    [HttpGet("saved")]
    public async Task<IActionResult> GetSaved(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var list = await _jobService.GetSavedByUserIdAsync(userId.Value, ct);
        return Ok(list);
    }

    [HttpPost("save")]
    public async Task<IActionResult> Save([FromBody] JobSaveRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var job = await _jobService.SaveJobAsync(userId.Value, request, ct);
        return Ok(job);
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
