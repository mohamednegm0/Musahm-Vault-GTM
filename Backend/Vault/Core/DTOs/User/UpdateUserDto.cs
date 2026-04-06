namespace Core.DTOs.User;

public class UpdateUserDto
{
    public string Id { get; set; } = string.Empty;
    public string? NameAr { get; set; }
    public string? NameEn { get; set; }
    public string? Email { get; set; }
    public int? MobileCountryCode { get; set; }
    public string? MobileNumber { get; set; }
    public bool? IsActive { get; set; }
    public List<string>? RoleIds { get; set; }
}

