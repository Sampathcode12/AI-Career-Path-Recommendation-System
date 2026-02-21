namespace BackEnd.Models;

/// <summary>
/// Stores each user sign-in event (aligned with frontend login: email + successful sign-in).
/// </summary>
public class UserSignInDetail
{
    public int Id { get; set; }
    public int UserId { get; set; }
    /// <summary>Email used to sign in (matches frontend login field).</summary>
    public string Email { get; set; } = string.Empty;
    public DateTime SignedInAt { get; set; } = DateTime.UtcNow;

    public virtual User User { get; set; } = null!;
}
