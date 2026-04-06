using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;
using Core.Interfaces.Service;

namespace Api.Controllers;

[Authorize]
public class BaseApiController : ControllerBase, IAsyncActionFilter
{
    protected CurrentUser CurrentUser { get; private set; } = null!;

    [NonAction]
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Check if user is already loaded and cached (e.g. by PermissionAuthorizationHandler)
        if (HttpContext.Items.TryGetValue("CurrentUser", out var cachedUser) && cachedUser is CurrentUser user)
        {
            CurrentUser = user;
            await next();
            return;
        }

        var identity = HttpContext.User.Identity as ClaimsIdentity;
        var loadedUser = CurrentUser.FromClaimsIdentity(identity);

        if (loadedUser == null)
        {
            context.Result = Unauthorized();
            return;
        }

        // Load permissions and roles from database (since they are removed from token)
        if (!string.IsNullOrEmpty(loadedUser.UserId))
        {
            var userService = HttpContext.RequestServices.GetRequiredService<IUserService>();
            loadedUser = await userService.LoadUserPermissionsAsync(loadedUser);
        }

        CurrentUser = loadedUser;
        
        // Store in HttpContext items if needed by other filters/middleware
        HttpContext.Items["CurrentUser"] = loadedUser;

        await next();
    }
}
