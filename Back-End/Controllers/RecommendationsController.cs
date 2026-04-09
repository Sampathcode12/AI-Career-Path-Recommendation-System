using System.Security.Claims;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.DTOs;
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
    private readonly IOpenAIService _openAI;
    private readonly ILogger<RecommendationsController> _logger;

    public RecommendationsController(
        IRecommendationService recommendationService,
        IOpenAIService openAI,
        ILogger<RecommendationsController> logger)
    {
        _recommendationService = recommendationService;
        _openAI = openAI;
        _logger = logger;
    }

    /// <summary>Whether an API key (or Local) is configured so Gemini/ChatGPT/etc. can run — does not expose keys.</summary>
    [HttpGet("ai-setup-status")]
    public IActionResult GetAiSetupStatus()
    {
        if (GetUserId() == null) return Unauthorized();
        return Ok(new AiSetupStatusResponse(
            _openAI.IsLlmAvailable,
            _openAI.ConfiguredProvider,
            _openAI.ConfiguredModel));
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var result = await _recommendationService.GenerateAsync(userId.Value, ct);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        try
        {
            var list = await _recommendationService.GetAllByUserIdAsync(userId.Value, ct);
            return Ok(list);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GET /api/recommendations failed for user {UserId}", userId);
            return Ok(Array.Empty<RecommendationResponse>());
        }
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

    /// <summary>Career Advisor chat. On unexpected failure returns 200 with a short fallback so the UI never shows a bare 500.</summary>
    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized(new { detail = "Please log in again." });
            if (string.IsNullOrWhiteSpace(request?.Message)) return BadRequest(new { detail = "Message is required." });
            var history = request.ResolvedHistory;
            var reply = await _recommendationService.ChatAboutRecommendationsAsync(userId.Value, request.Message.Trim(), history, ct);
            return Ok(new { reply });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "POST /api/recommendations/chat failed unexpectedly");
            return Ok(new
            {
                reply =
                    "I could not finish that reply. Your recommendations are still listed above—try asking about a specific job title from those cards. "
                    + "If this keeps happening, confirm the dev server proxies /api to your API (Front End/vite.config.js → default http://localhost:8000)."
            });
        }
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
