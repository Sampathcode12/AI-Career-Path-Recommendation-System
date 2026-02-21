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

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] JobSearchRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var list = await _jobService.SearchAsync(request, userId, ct);
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
