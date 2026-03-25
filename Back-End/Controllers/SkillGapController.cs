using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/skill-gap")]
[Authorize]
public class SkillGapController : ControllerBase
{
    private readonly ISkillGapService _skillGapService;

    public SkillGapController(ISkillGapService skillGapService) => _skillGapService = skillGapService;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? industry, CancellationToken ct)
    {
        var list = await _skillGapService.GetAllByIndustryAsync(industry, ct);
        return Ok(list);
    }
}
