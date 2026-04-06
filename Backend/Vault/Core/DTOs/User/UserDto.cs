namespace Core.DTOs.User;

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int MobileCountryCode { get; set; }
    public string MobileNumber { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    
    // Properties for local usage (Roles)
    // Properties for local usage (Roles)
    public List<UserRoleDto> Roles { get; set; } = new();
}

public class UserRoleDto
{
    public string RoleId { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}
