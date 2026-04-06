using Microsoft.AspNetCore.Authorization;
using Core.DTOs.Identity;
using Core.Interfaces.Service;

namespace API.Authorization;

/// <summary>
/// Authorization handler that checks if the user has the required permission
/// Permissions are loaded from database using UserService
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PermissionAuthorizationHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null)
        {
            return;
        }

        // Check if user is already loaded and cached
        if (httpContext.Items.TryGetValue("CurrentUser", out var cachedUser) && cachedUser is CurrentUser user)
        {
            // Use cached user with permissions already loaded
            if (user.Permissions != null && user.Permissions.Contains(requirement.Permission))
            {
                context.Succeed(requirement);
            }
            return;
        }

        // Get basic user info from claims
        var identity = httpContext.User.Identity as System.Security.Claims.ClaimsIdentity;
        if (identity == null || !identity.IsAuthenticated)
        {
            return;
        }

        // Use FromClaimsIdentity to create basic user object with all properties
        var currentUser = CurrentUser.FromClaimsIdentity(identity);
        if (currentUser == null || string.IsNullOrEmpty(currentUser.UserId))
        {
            return;
        }

        // Load permissions from database
        var userService = httpContext.RequestServices.GetRequiredService<IUserService>();
        currentUser = await userService.LoadUserPermissionsAsync(currentUser);

        // Cache the user for subsequent requests
        httpContext.Items["CurrentUser"] = currentUser;

        // Check if user has the required permission
        if (currentUser.Permissions != null && currentUser.Permissions.Contains(requirement.Permission))
        {
            context.Succeed(requirement);
        }
    }
}
