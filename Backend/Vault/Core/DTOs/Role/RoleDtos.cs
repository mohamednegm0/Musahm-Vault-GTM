namespace Core.DTOs.Role;

public class RoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public int Level { get; set; }
    public bool IsActive { get; set; }
    public bool IsSystemRole { get; set; }
    public List<string> PermissionCodes { get; set; } = new();
}

public class CreateRoleDto
{
    public string Code { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public int Level { get; set; }
}

public class UpdateRoleDto
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string? DescriptionAr { get; set; }
    public string? DescriptionEn { get; set; }
    public bool IsActive { get; set; }
}

public class AssignRoleDto
{
    public string UserId { get; set; } = string.Empty;
    public string RoleId { get; set; } = string.Empty;
    // TenantId will be automatically set from CurrentUser.TenantId
}

public class AssignPermissionsToRoleDto
{
    public List<string> PermissionIds { get; set; } = new();
}
