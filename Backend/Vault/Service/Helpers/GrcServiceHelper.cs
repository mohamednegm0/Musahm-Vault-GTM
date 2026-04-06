using Core.Constants;
using Core.Interfaces.Service;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;

namespace Service.Helpers;

public class GrcServiceHelper
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IJsonLocalizationService _localizationService;

    public GrcServiceHelper(IHttpContextAccessor httpContextAccessor, IJsonLocalizationService localizationService)
    {
        _httpContextAccessor = httpContextAccessor;
        _localizationService = localizationService;
    }

    /// <summary>
    /// Extracts token information from the current HTTP context
    /// </summary>
    /// <returns>Tuple of (Token, UserId, UserType, CompanyId)</returns>
    public (string? Token, int? UserId, int? UserType, int? CompanyId) GetTokenInfo()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var authHeader = httpContext?.Request.Headers["Authorization"].ToString();
        string? token = null;

        if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = authHeader.Substring(7).Trim();
        }

        if (string.IsNullOrEmpty(token)) return (null, null, null, null);

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            var idClaim = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("Id", StringComparison.OrdinalIgnoreCase))?.Value;
            var typeClaim = jwtToken.Claims.FirstOrDefault(c =>
                c.Type.Equals("UserType", StringComparison.OrdinalIgnoreCase) ||
                c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            var companyIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("CompanyId", StringComparison.OrdinalIgnoreCase))?.Value;

            int? userId = int.TryParse(idClaim, out int uid) ? uid : null;

            // Handle UserType - can be either string ("Employee", "Partner") or int (1, 2)
            int? userType = null;
            if (!string.IsNullOrEmpty(typeClaim))
            {
                if (int.TryParse(typeClaim, out int utype))
                {
                    userType = utype;
                }
                else if (typeClaim.Equals("Employee", StringComparison.OrdinalIgnoreCase))
                {
                    userType = ConstUserType.Employee; // 2
                }
                else if (typeClaim.Equals("Partner", StringComparison.OrdinalIgnoreCase))
                {
                    userType = ConstUserType.Partner; // 1
                }
            }

            int? companyId = int.TryParse(companyIdClaim, out int cid) ? cid : null;

            return (token, userId, userType, companyId);
        }
        catch
        {
            return (token, null, null, null);
        }
    }

    /// <summary>
    /// Gets the current language from request headers (lang header or Accept-Language).
    /// Priority: lang header → Accept-Language header → default "ar"
    /// </summary>
    public string GetCurrentLanguage()
    {
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext == null) return "ar";

        // 1. Check custom 'lang' header (highest priority)
        var langHeader = httpContext.Request.Headers["lang"].ToString();
        if (!string.IsNullOrWhiteSpace(langHeader))
        {
            if (langHeader.StartsWith("ar", StringComparison.OrdinalIgnoreCase)) return "ar";
            if (langHeader.StartsWith("en", StringComparison.OrdinalIgnoreCase)) return "en";
        }

        // 2. Check standard Accept-Language header
        var acceptLang = httpContext.Request.Headers["Accept-Language"].ToString();
        if (!string.IsNullOrWhiteSpace(acceptLang))
        {
            if (acceptLang.StartsWith("ar", StringComparison.OrdinalIgnoreCase)) return "ar";
            if (acceptLang.StartsWith("en", StringComparison.OrdinalIgnoreCase)) return "en";
        }

        return "ar"; // Default: Arabic
    }

    /// <summary>
    /// Adds common headers required by GRC external APIs (RefT, ResVal, lang, Authorization)
    /// </summary>
    public void AddCommonHeaders(HttpClient httpClient, string token)
    {
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var lang = GetCurrentLanguage();

        // Calculate RefT and ResVal
        long currentTimeUTC = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        string resVal = "0";

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(token);

            var expClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "exp")?.Value;
            var idClaim = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("Id", StringComparison.OrdinalIgnoreCase))?.Value;
            var companyIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("CompanyId", StringComparison.OrdinalIgnoreCase))?.Value;

            if (long.TryParse(expClaim, out long exp) &&
                long.TryParse(idClaim, out long userId) &&
                long.TryParse(companyIdClaim, out long companyId))
            {
                long tokenExpiryTimeUTC = exp * 1000;
                long ids = userId + companyId;
                resVal = ((tokenExpiryTimeUTC - currentTimeUTC) * ids).ToString();
            }
        }
        catch { }

        httpClient.DefaultRequestHeaders.Remove("RefT");
        httpClient.DefaultRequestHeaders.Add("RefT", currentTimeUTC.ToString());

        httpClient.DefaultRequestHeaders.Remove("ResVal");
        httpClient.DefaultRequestHeaders.Add("ResVal", resVal);

        httpClient.DefaultRequestHeaders.Remove("lang");
        httpClient.DefaultRequestHeaders.Add("lang", lang);
    }

    /// <summary>
    /// Validates that required token information is present.
    /// Returns localized error message if validation fails, null if valid.
    /// </summary>
    public string? ValidateTokenInfo(string? token, int? userId, int? userType)
    {
        if (token == null || userId == null || userType == null)
            return _localizationService.Get("Msg_Unauthorized");

        return null;
    }
}
