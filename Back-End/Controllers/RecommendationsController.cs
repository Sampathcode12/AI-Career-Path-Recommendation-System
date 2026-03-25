using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Services;

namespace BackEnd.Controllers;

public record ChatRequest(string Message, IReadOnlyList<ChatMessageDto>? ConversationHistory);

[ApiController]
[Route("api/recommendations")]
[Authorize]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;
    private readonly ILogger<RecommendationsController> _logger;

    public RecommendationsController(IRecommendationService recommendationService, ILogger<RecommendationsController> logger)
    {
        _recommendationService = recommendationService;
        _logger = logger;
    }

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

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized(new { detail = "Please log in again." });
        if (string.IsNullOrWhiteSpace(request?.Message)) return BadRequest(new { detail = "Message is required." });
        var history = request.ConversationHistory ?? Array.Empty<ChatMessageDto>();
        try
        {
            var response = await _recommendationService.ChatAboutRecommendationsAsync(userId.Value, request.Message, history, ct);
            var reply = response ?? "The AI chat feature requires an OpenAI API key. Add OpenAI:ApiKey to appsettings.json or user secrets (see docs/OPENAI-SETUP.md). Until then, explore your recommendations above — each career shows skills, salary, growth, and learning paths.";
            return Ok(new { reply });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Chat request failed");
            return StatusCode(503, new { detail = "AI service unavailable. Add OpenAI:ApiKey to configuration, or try again later." });
        }
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
