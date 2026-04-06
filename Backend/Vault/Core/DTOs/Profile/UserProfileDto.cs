namespace Core.DTOs.Profile
{
    public class UserProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int MobileCountryCode { get; set; }
        public string MobileNumber { get; set; } = string.Empty;
    }
}
