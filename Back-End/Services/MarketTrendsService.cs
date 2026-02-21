using Microsoft.EntityFrameworkCore;
using BackEnd.Data;
using BackEnd.DTOs;

namespace BackEnd.Services;

public class MarketTrendsService : IMarketTrendsService
{
    private readonly ApplicationDbContext _db;

    public MarketTrendsService(ApplicationDbContext db) => _db = db;

    public async Task<IReadOnlyList<MarketTrendResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _db.MarketTrends.AsNoTracking().OrderBy(x => x.Category).ToListAsync(ct);
        return list.Select(t => new MarketTrendResponse(t.Id, t.Category, t.Title, t.Description, t.TrendDataJson, t.UpdatedAt)).ToList();
    }
}
