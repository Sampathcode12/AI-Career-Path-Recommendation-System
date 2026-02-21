using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.DTOs;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/assessment")]
[Authorize]
public class AssessmentController : ControllerBase
{
    private readonly IAssessmentService _assessmentService;

    public AssessmentController(IAssessmentService assessmentService) => _assessmentService = assessmentService;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var assessment = await _assessmentService.GetLatestByUserIdAsync(userId.Value, ct);
        if (assessment == null) return NotFound(new { detail = "No assessment found." });
        return Ok(assessment);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AssessmentCreateRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var assessment = await _assessmentService.CreateAsync(userId.Value, request, ct);
        return Ok(assessment);
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
