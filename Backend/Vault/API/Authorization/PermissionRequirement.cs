using Microsoft.AspNetCore.Authorization;

namespace API.Authorization;

/// <summary>
/// Represents a requirement that the user must have a specific permission
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}
