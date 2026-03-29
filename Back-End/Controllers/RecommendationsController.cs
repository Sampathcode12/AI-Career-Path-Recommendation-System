using System.Security.Claims;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Services;

namespace BackEnd.Controllers;

/// <summary>Chat POST body. Accepts camelCase or snake_case for history (frontend variants).</summary>
public sealed class ChatRequest
{
    public string? Message { get; set; }

    public IReadOnlyList<ChatMessageDto>? ConversationHistory { get; set; }

    [JsonPropertyName("conversation_history")]
    public IReadOnlyList<ChatMessageDto>? ConversationHistorySnake { get; set; }

    public IReadOnlyList<ChatMessageDto> ResolvedHistory =>
        ConversationHistory ?? ConversationHistorySnake ?? Array.Empty<ChatMessageDto>();
}

[ApiController]
[Route("api/recommendations")]
[Authorize]
public class RecommendationsController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;

    public RecommendationsController(IRecommendationService recommendationService)
    {
        _recommendationService = recommendationService;
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
        var history = request.ResolvedHistory;
        var reply = await _recommendationService.ChatAboutRecommendationsAsync(userId.Value, request.Message.Trim(), history, ct);
        return Ok(new { reply });
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
