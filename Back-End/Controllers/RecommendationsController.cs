using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/recommendations")]
[Authorize]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;

    public RecommendationsController(IRecommendationService recommendationService) => _recommendationService = recommendationService;

    [HttpPost("generate")]
    public async Task<IActionResult> Generate(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var list = await _recommendationService.GenerateAsync(userId.Value, ct);
        return Ok(list);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var list = await _recommendationService.GetAllByUserIdAsync(userId.Value, ct);
        return Ok(list);
    }

    [HttpPut("{id}/save")]
    public async Task<IActionResult> Save(int id, [FromQuery] bool saved, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var updated = await _recommendationService.UpdateSavedAsync(userId.Value, id, saved, ct);
        if (updated == null) return NotFound(new { detail = "Recommendation not found." });
        return Ok(updated);
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
