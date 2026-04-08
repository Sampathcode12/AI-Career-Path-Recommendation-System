using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IMlInterestPredictService
{
    /// <summary>Calls the local Python service when ML:PythonPredictBaseUrl is set — Flask (career_flask_api) or FastAPI (predict_api); see ML:PythonPredictStyle.</summary>
    Task<PredictInterestResponse> PredictInterestAsync(
        string? interests,
        string? skills,
        string? certificateCourseTitle,
        string? ugCourse,
        string? ugSpecialization,
        int? topK,
        CancellationToken ct = default);
}
