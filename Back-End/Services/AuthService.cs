using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BackEnd.Data;
using BackEnd.DTOs;
using BackEnd.Models;

namespace BackEnd.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _db;
    private readonly IConfiguration _config;

    public AuthService(ApplicationDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponse> SignUpAsync(SignUpRequest request, CancellationToken ct = default)
    {
        var email = request.Email?.Trim() ?? "";
        if (string.IsNullOrEmpty(email))
            throw new ArgumentException("Email is required.");
        var emailLower = email.ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email != null && u.Email.ToLower() == emailLower, ct))
            throw new ArgumentException("Email already registered.");
        if (string.IsNullOrEmpty(request.Password))
            throw new ArgumentException("Password is required.");

        var user = new User
        {
            Name = request.Name?.Trim() ?? "",
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            CreatedAt = DateTime.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        // Record first sign-in (sign-up) in UserSignInDetails
        _db.UserSignInDetails.Add(new UserSignInDetail { UserId = user.Id, Email = user.Email, SignedInAt = DateTime.UtcNow });
        await _db.SaveChangesAsync(ct);

        var userResponse = new UserResponse(user.Id, user.Name, user.Email);
        var token = GenerateJwt(user);
        return new AuthResponse(token, userResponse);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email?.Trim();
        var password = request.Password;
        if (string.IsNullOrEmpty(email) || password is null)
            return null;

        // Case-insensitive match (handles different DB casing / typos in email case)
        var emailLower = email.ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(
            u => u.Email != null && u.Email.ToLower() == emailLower,
            ct);
        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            return null;

        if (!BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        // Save sign-in details (aligned with frontend login: email + timestamp)
        _db.UserSignInDetails.Add(new UserSignInDetail { UserId = user.Id, Email = user.Email, SignedInAt = DateTime.UtcNow });
        await _db.SaveChangesAsync(ct);

        var userResponse = new UserResponse(user.Id, user.Name, user.Email);
        var token = GenerateJwt(user);
        return new AuthResponse(token, userResponse);
    }

    public async Task<UserResponse?> GetUserByIdAsync(int userId, CancellationToken ct = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
        return user == null ? null : new UserResponse(user.Id, user.Name, user.Email);
    }

    private string GenerateJwt(User user)
    {
        var key = _config["Jwt:Key"] ?? "your-256-bit-secret-key-for-signing-tokens!!";
        var keyBytes = Encoding.UTF8.GetBytes(key);
        var creds = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
