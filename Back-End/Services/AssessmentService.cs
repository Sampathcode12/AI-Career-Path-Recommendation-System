using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class AssessmentService : IAssessmentService
{
    private readonly ApplicationDbContext _db;

    public AssessmentService(ApplicationDbContext db) => _db = db;

    public async Task<AssessmentResponse?> GetLatestByUserIdAsync(int userId, CancellationToken ct = default)
    {
        var a = await _db.Assessments.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);
        return a == null ? null : ToResponse(a);
    }

    public async Task<AssessmentResponse> CreateAsync(int userId, AssessmentCreateRequest request, CancellationToken ct = default)
    {
        var assessment = new Assessment
        {
            UserId = userId,
            AnswersJson = request.AnswersJson,
            ResultSummary = request.ResultSummary,
            CreatedAt = DateTime.UtcNow
        };
        _db.Assessments.Add(assessment);
        await _db.SaveChangesAsync(ct);
        return ToResponse(assessment);
    }

    private static AssessmentResponse ToResponse(Assessment a) =>
        new(a.Id, a.UserId, a.AnswersJson, a.ResultSummary, a.CreatedAt);
}
