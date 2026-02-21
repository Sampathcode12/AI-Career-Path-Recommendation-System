using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.DTOs;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) => _authService = authService;

    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request, CancellationToken ct)
    {
        try
        {
            var response = await _authService.SignUpAsync(request, ct);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { detail = ex.Message });
        }
    }

    [HttpPost("login-json")]
    public async Task<IActionResult> LoginJson([FromBody] LoginRequest request, CancellationToken ct)
    {
        var response = await _authService.LoginAsync(request, ct);
        if (response == null)
            return Unauthorized(new { detail = "Invalid email or password." });
        return Ok(response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var user = await _authService.GetUserByIdAsync(userId.Value, ct);
        if (user == null) return NotFound(new { detail = "User not found." });
        return Ok(user);
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
