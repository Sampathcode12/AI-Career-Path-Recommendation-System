using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.DTOs;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService) => _profileService = profileService;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var profile = await _profileService.GetByUserIdAsync(userId.Value, ct);
        if (profile == null) return NotFound(new { detail = "Profile not found." });
        return Ok(profile);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProfileCreateOrUpdateRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var profile = await _profileService.CreateAsync(userId.Value, request, ct);
        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ProfileCreateOrUpdateRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();
        var profile = await _profileService.UpdateAsync(userId.Value, request, ct);
        if (profile == null) return NotFound(new { detail = "Profile not found." });
        return Ok(profile);
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
