using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackEnd.DTOs;
using BackEnd.Services;

namespace BackEnd.Controllers;

[ApiController]
[Route("api/ml")]
[Authorize]
public class MlController : ControllerBase
{
    private readonly IMlInterestPredictService _ml;

    public MlController(IMlInterestPredictService ml) => _ml = ml;

    /// <summary>Proxy to Colab-trained TF-IDF + XGBoost interest classifier (Python FastAPI).</summary>
    [HttpPost("predict-interest")]
    public async Task<IActionResult> PredictInterest([FromBody] PredictInterestRequest request, CancellationToken ct)
    {
        if (GetUserId() == null) return Unauthorized();
        var result = await _ml.PredictInterestAsync(
            request.Interests,
            request.Skills,
            request.CertificateCourseTitle,
            request.UgCourse,
            request.UgSpecialization,
            request.TopK,
            ct);
        return Ok(result);
    }

    private int? GetUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(sub, out var id) ? id : null;
    }
}
