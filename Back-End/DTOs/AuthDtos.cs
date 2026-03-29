using System.Text.Json.Serialization;

namespace BackEnd.DTOs;

public record SignUpRequest(string Name, string Email, string Password);

/// <summary>Login body — supports camelCase JSON from the SPA ({ "email", "password" }).</summary>
public sealed class LoginRequest
{
    [JsonPropertyName("email")]
    public string? Email { get; set; }

    [JsonPropertyName("password")]
    public string? Password { get; set; }
}

public record UserResponse(int Id, string Name, string Email);

public record AuthResponse(string AccessToken, UserResponse User);
