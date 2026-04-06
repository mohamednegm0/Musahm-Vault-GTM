using System.ComponentModel.DataAnnotations;

namespace Core.DTOs.Login;

public class VerifyOtpRequestDto
{
    public string IdentityNumber { get; set; } = null!;
    public string Otp { get; set; } = null!;
    public bool RememberMe { get; set; }
    public string? FirebaseToken { get; set; }
    public string? DeviceName { get; set; }
}
