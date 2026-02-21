using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/market-trends")]
[Authorize]
public class MarketTrendsController : ControllerBase
{
    private readonly IMarketTrendsService _marketTrendsService;

    public MarketTrendsController(IMarketTrendsService marketTrendsService) => _marketTrendsService = marketTrendsService;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var list = await _marketTrendsService.GetAllAsync(ct);
        return Ok(list);
    }
}
