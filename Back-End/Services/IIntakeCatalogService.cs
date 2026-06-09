using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IIntakeCatalogService
{
    Task<IReadOnlyList<SpecializationOptionDto>> GetSpecializationsAsync(CancellationToken ct = default);

    Task<CareerPathsResponseDto> GetCareerPathsAsync(
        string specialization,
        string? search = null,
        CancellationToken ct = default);
}
