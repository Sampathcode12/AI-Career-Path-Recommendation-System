using BackEnd.DTOs;

namespace BackEnd.Services;

public interface IAuthService
{
    Task<AuthResponse> SignUpAsync(SignUpRequest request, CancellationToken ct = default);
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<UserResponse?> GetUserByIdAsync(int userId, CancellationToken ct = default);
}
