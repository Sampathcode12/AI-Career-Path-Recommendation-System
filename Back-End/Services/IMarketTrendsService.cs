using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IMarketTrendsService
{
    Task<IReadOnlyList<MarketTrendResponse>> GetAllAsync(CancellationToken ct = default);
}
