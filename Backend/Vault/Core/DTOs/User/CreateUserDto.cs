namespace Core.DTOs.User;

public class CreateUserDto
{
    public int CompanyId { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? MobileCountryCode { get; set; }
    public string MobileNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public List<string> RoleIds { get; set; } = new();
}
