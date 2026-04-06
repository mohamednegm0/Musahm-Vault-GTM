namespace Core.DTOs.GRC
{
    public class ExternalEmployeeDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public string? NameAr { get; set; }
        public string? NameEn { get; set; }
        public string? Email { get; set; }
        public int? MobileCountryCode { get; set; }
        public string? MobileNumber { get; set; }
        public string? Password { get; set; }
        public string? ConfirmPassword { get; set; }
        public string? Otp { get; set; }
        public bool IsMain { get; set; }
        public bool IsActive { get; set; }
        public string? IdentityNumber { get; set; }
        public bool IsAbsherDefaultOtp { get; set; }
        public bool IsTwoFactorAuthentication { get; set; }
        public string? AuthorizationLetterPath { get; set; }
        public string? AuthorizationLetterFile { get; set; }
        public string? AuthorizationLetterFileName { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
