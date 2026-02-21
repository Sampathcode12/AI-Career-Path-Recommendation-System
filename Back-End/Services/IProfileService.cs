using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IProfileService
{
    Task<ProfileResponse?> GetByUserIdAsync(int userId, CancellationToken ct = default);
    Task<ProfileResponse> CreateAsync(int userId, ProfileCreateOrUpdateRequest request, CancellationToken ct = default);
    Task<ProfileResponse?> UpdateAsync(int userId, ProfileCreateOrUpdateRequest request, CancellationToken ct = default);
}
