namespace Core.DTOs.Register;

public class RegisterEmployeeDto
{
    public int Id { get; set; } 
    public int CompanyId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty; // Usually required for register?
    public int? MobileCountryCode { get; set; }
    public string MobileNumber { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string ConfirmPassword { get; set; } = string.Empty;
    public bool IsMain { get; set; }
    public bool IsActive { get; set; }
    public string IdentityNumber { get; set; } = string.Empty;
    public bool IsAbsherDefaultOtp { get; set; }
    public bool IsTwoFactorAuthentication { get; set; }
    public string AuthorizationLetterPath { get; set; } = string.Empty;
    public string AuthorizationLetterFile { get; set; } = string.Empty;
    public string AuthorizationLetterFileName { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; }
}
