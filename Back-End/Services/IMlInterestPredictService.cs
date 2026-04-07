using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IMlInterestPredictService
{
    /// <summary>Calls the local Python FastAPI (ml/predict_api.py) when ML:PythonPredictBaseUrl is set.</summary>
    Task<PredictInterestResponse> PredictInterestAsync(
        string? interests,
        string? skills,
        string? certificateCourseTitle,
        string? ugCourse,
        string? ugSpecialization,
        int? topK,
        CancellationToken ct = default);
}
