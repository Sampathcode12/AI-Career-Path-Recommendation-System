namespace BackEnd.DTOs;

public record SignUpRequest(string Name, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record UserResponse(int Id, string Name, string Email);

public record AuthResponse(string AccessToken, UserResponse User);
