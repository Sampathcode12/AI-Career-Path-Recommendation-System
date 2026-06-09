using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/intake")]
public class IntakeController : ControllerBase
{
    private readonly IIntakeCatalogService _intakeCatalog;

    public IntakeController(IIntakeCatalogService intakeCatalog) => _intakeCatalog = intakeCatalog;

    /// <summary>Distinct UG specializations that have career paths in the catalog.</summary>
    [HttpGet("specializations")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSpecializations(CancellationToken ct)
    {
        var list = await _intakeCatalog.GetSpecializationsAsync(ct);
        return Ok(list);
    }

    /// <summary>Career paths for a specialization; optional search filters path labels server-side.</summary>
    [HttpGet("career-paths")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCareerPaths(
        [FromQuery] string specialization,
        [FromQuery] string? q = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(specialization))
            return BadRequest(new { detail = "specialization is required." });

        var result = await _intakeCatalog.GetCareerPathsAsync(specialization, q, ct);
        return Ok(result);
    }
}
