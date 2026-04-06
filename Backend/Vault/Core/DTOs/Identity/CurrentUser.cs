using System.Security.Claims;

namespace Core.DTOs.Identity;

public class CurrentUser
{
    public long Id { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public long CompanyId { get; set; }
    public string CompanyNameAr { get; set; } = string.Empty;
    public string CompanyNameEn { get; set; } = string.Empty;
    public bool IsDefaultPassword { get; set; }
    public int UserType { get; set; }
    public bool IsAdmin { get; set; }
    public long AdminId { get; set; }
    public int CompanyTypeId { get; set; }
    public bool IsTwoFactorAuthentication { get; set; }
    public string? TenantId { get; set; }
    public string? UserId { get; set; }

    // Role-based permissions
    public List<string> Roles { get; set; } = new();
    public List<string> Permissions { get; set; } = new();

    public static CurrentUser? FromClaimsIdentity(ClaimsIdentity? identity)
    {
        if (identity == null || !identity.IsAuthenticated)
        {
            return null;
        }

        var user = new CurrentUser();

        user.NameAr = GetClaimValue(identity, "NameAr") ?? "";
        user.NameEn = GetClaimValue(identity, "NameEn") ?? "";
        user.Email = GetClaimValue(identity, "Email") ?? ""; // Or ClaimTypes.Email
        user.MobileNumber = GetClaimValue(identity, "MobileNumber") ?? "";
        
        user.CompanyNameAr = GetClaimValue(identity, "CompanyNameAr") ?? "";
        user.CompanyNameEn = GetClaimValue(identity, "CompanyNameEn") ?? "";

        if (int.TryParse(GetClaimValue(identity, "Id"), out var id))
            user.Id = id;

        if (int.TryParse(GetClaimValue(identity, "CompanyId"), out var companyId))
            user.CompanyId = companyId;

        if (bool.TryParse(GetClaimValue(identity, "IsDefaultPassword"), out var isDefault))
            user.IsDefaultPassword = isDefault;

        var userTypeStr = GetClaimValue(identity, "UserType");
        if (int.TryParse(userTypeStr, out var userType))
            user.UserType = userType;
        
        if (bool.TryParse(GetClaimValue(identity, "IsAdmin"), out var isAdmin))
            user.IsAdmin = isAdmin;

        if (int.TryParse(GetClaimValue(identity, "AdminId"), out var adminId))
            user.AdminId = adminId;

        if (int.TryParse(GetClaimValue(identity, "CompanyTypeId"), out var companyTypeId))
            user.CompanyTypeId = companyTypeId;

        if (bool.TryParse(GetClaimValue(identity, "IsTwoFactorAuthentication"), out var is2fa))
            user.IsTwoFactorAuthentication = is2fa;

        user.TenantId = GetClaimValue(identity, "tenant_id");
        if (string.IsNullOrEmpty(user.TenantId))
            user.TenantId = GetClaimValue(identity, "CompanyId");

        user.UserId = GetClaimValue(identity, "user_id");
        if (string.IsNullOrEmpty(user.UserId))
            user.UserId = GetClaimValue(identity, "Id");

        // Parse roles from JWT token
        var rolesJson = GetClaimValue(identity, "roles");
        if (!string.IsNullOrEmpty(rolesJson))
        {
            try
            {
                user.Roles = System.Text.Json.JsonSerializer.Deserialize<List<string>>(rolesJson) ?? new();
            }
            catch
            {
                user.Roles = new List<string>();
            }
        }

        return user;
    }

    private static string? GetClaimValue(ClaimsIdentity identity, string claimType)
    {
        return identity.FindFirst(claimType)?.Value;
    }
}
