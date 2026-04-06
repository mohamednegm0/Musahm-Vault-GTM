namespace Core.DTOs.GRC
{
    public class UpdateExternalUserDto
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? NameAr { get; set; }
        public string? NameEn { get; set; }
        public int? MobileCountryCode { get; set; }
        public string? MobileNumber { get; set; }
        public string? Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
