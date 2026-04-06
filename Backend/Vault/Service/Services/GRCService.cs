using Core.Constants;
using Core.DTOs.Country;
using Core.DTOs.Identity;
using Core.DTOs.Role;
using Core.DTOs.User;
using Core.DTOs.GRC;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using RestSharp;
using Service.Helpers;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using ApiStatusCode = Core.Constants.ConstAppConfiguration.ApiStatusCode;
namespace Service;

public class GRCService : IGRCService
{

    private readonly string ExternalLoginUrl;
    private readonly string ExternalRegisterUrl;
    private readonly string ExternalForgetPasswordUrl;

    private readonly string ExternalResetPasswordUrl;
    private readonly string ExternalUserUrl;
    private readonly string ExternalCountriesUrl;

    private readonly string EmployeeUrl;
    private readonly string ActiveByEmailUrl;
    private readonly string PartnerUrl;
    private readonly string PartnerUpdateUrl;

    private readonly string ExternalChangePasswordUrl;
    private readonly string ExternalAdminLoginUrl;
    private readonly string ExternalPartnerLoginUrl;
    private readonly string ExternalAdminPartnerLoginUrl;
    private readonly string VerifyOtpUrl;
    private readonly string PartnerChangeCompanyUrl;
    private readonly string AdminAsEmployeeChangeCompanyUrl;
    private readonly string PartnerCompaniesUrl;
    private readonly string EmployeeChangeCompanyUrl;
    private readonly string EmployeeCompaniesUrl;

    private readonly string UsersUrl;
    private readonly string ActiveCompanyEmployeesUrl;
    private readonly string GrcLoginByTokenUrl;
    private readonly string grcWebAuthUrl;

    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;
    private readonly IServiceProvider _serviceProvider;

    private readonly RestClient _restClient;
    private readonly GrcServiceHelper _grcHelper;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IJsonLocalizationService _localizationService;

    public GRCService(GrcServiceHelper grcHelper, IHttpContextAccessor httpContextAccessor, IUnitOfWork unitOfWork, IConfiguration configuration, IServiceProvider serviceProvider, RestClient restClient, IJsonLocalizationService localizationService)
    {
        _restClient = restClient;
        _grcHelper = grcHelper ?? throw new ArgumentNullException(nameof(grcHelper));
        _httpContextAccessor = httpContextAccessor;
        _unitOfWork = unitOfWork;
        _configuration = configuration;
        _serviceProvider = serviceProvider;
        _localizationService = localizationService;

        var grcUrl = _configuration["GRCUrl"];
        var grcWebUrl = _configuration["GRCWebUrl"];
        if (string.IsNullOrEmpty(grcUrl))
        {
             // Fallback to default if not configured or throw exception?
             // Since user wants to edit without build, assume config MUST be present.
             // But for safety, let's keep the hardcoded value HERE as a fallback string literal, 
             // removing dependency on the deleted constant.
             grcUrl = "https://api-s2.musahm.com/"; 
        }

        if (!grcUrl.EndsWith("/")) grcUrl += "/";
        if (!grcWebUrl.EndsWith("/")) grcWebUrl += "/";

        ExternalLoginUrl = grcUrl + "api/Auth/EmployeeLogin";
        ExternalRegisterUrl = grcUrl + "api/Vault/Register";
        ExternalForgetPasswordUrl = grcUrl + "api/Auth/ForgetPassword";

        ExternalResetPasswordUrl = grcUrl + "api/Auth/ResetPassword";
        ExternalUserUrl = grcUrl + "api/Vault/User";
        ExternalCountriesUrl = grcUrl + "api/Countries";

        EmployeeUrl = grcUrl + "api/Employees/";
        ActiveByEmailUrl = grcUrl + "api/Auth/ActiveByEmail";
        PartnerUrl = grcUrl + "api/Partners/";
        PartnerUpdateUrl = grcUrl + "api/Partners/CustomPartner/";

        ExternalChangePasswordUrl = grcUrl + "api/Auth/ChangePassword";
        ExternalAdminLoginUrl = grcUrl + "api/Auth/AdminLogin";
        ExternalPartnerLoginUrl = grcUrl + "api/Auth/PartnerLogin";
        ExternalAdminPartnerLoginUrl = grcUrl + "api/Auth/AdminLoginAsPartner";
        VerifyOtpUrl = grcUrl + "api/Auth/VerifyOTP";
        PartnerChangeCompanyUrl = grcUrl + "api/Auth/PartnerChangeCompany/";
        AdminAsEmployeeChangeCompanyUrl = grcUrl + "api/Auth/AdminAsEmployeeChangeCompany/";
        PartnerCompaniesUrl = grcUrl + "api/Partners/V2.0/";
        EmployeeChangeCompanyUrl = grcUrl + "api/Auth/EmployeeChangeCompany/";
        EmployeeCompaniesUrl = grcUrl + "api/Employees/";

        UsersUrl = grcUrl + "api/Companies/{companyId}/AllActiveEmployeesAndPartners";
        ActiveCompanyEmployeesUrl = grcUrl + "api/Companies/ActiveWithActiveEmployees";

        GrcLoginByTokenUrl = grcUrl + "api/Auth/LoginByToken";
        grcWebAuthUrl = grcWebUrl + "auth";
    }

    private void AddCommonHeaders(RestRequest request, string? token = null)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var authHeader = httpContext?.Request.Headers["Authorization"].ToString();

        if (!string.IsNullOrEmpty(token))
        {
            request.AddHeader("Authorization", $"Bearer {token}");
        }
        else if (!string.IsNullOrEmpty(authHeader) && authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = authHeader.Substring(7).Trim();
            request.AddHeader("Authorization", $"Bearer {token}");
        }

        long currentTimeUTC = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        string resVal = "0";

        if (!string.IsNullOrEmpty(token))
        {
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
        }

        request.AddHeader("RefT", currentTimeUTC.ToString());
        request.AddHeader("ResVal", resVal);

        var lang = _grcHelper.GetCurrentLanguage();
        request.AddHeader("lang", lang);
        request.AddHeader("Issuer", "External");
    }

    public async Task<ResponseResult<LoginResponseDto>> LoginAsync(LoginRequestDto request)
    {
        // Console.WriteLine($"[DEBUG] LoginAsync called for email: {request?.Email}");
        if (request == null)
            return new ResponseResult<LoginResponseDto>("Request is null", ApiStatusCode.BadRequest);

        var result = await LoginAsync(request.Email, request.Password, CancellationToken.None);

        if (result.IsSucceeded && result.ReturnData != null && !string.IsNullOrEmpty(result.ReturnData.Value))
        {
            return await ProcessLoginTokenAsync(result.ReturnData.Value);
        }


        return new ResponseResult<LoginResponseDto>(result.ErrorMessage ?? "Login failed", ApiStatusCode.BadRequest);
    }

    public async Task<ResponseResult<LoginResponseDto>> LoginByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
            return new ResponseResult<LoginResponseDto>("Token is required", ApiStatusCode.BadRequest);

        var handler = new JwtSecurityTokenHandler();
        if (!handler.CanReadToken(token))
            return new ResponseResult<LoginResponseDto>("Invalid token format", ApiStatusCode.BadRequest);

        return await ProcessLoginTokenAsync(token);
    }

    private string GenerateJwtToken(JwtSecurityToken originalToken, string tenantId, string? userId)
    {
        var claims = originalToken.Claims.ToList();

        // Remove existing claims that valid for the new token
        // We want to remove 'aud' as we are the audience now? Or keep it?
        // Remove our custom claims if they exist to avoid duplication
        claims.RemoveAll(c => c.Type == "tenant_id");
        if (userId != null) claims.RemoveAll(c => c.Type == "user_id");

        // Extract and explicitly re-add critical claims to ensure they're preserved with correct type names
        var userTypeValue = originalToken.Claims.FirstOrDefault(c => c.Type.Equals("UserType", StringComparison.OrdinalIgnoreCase))?.Value;
        var idValue = originalToken.Claims.FirstOrDefault(c => c.Type.Equals("Id", StringComparison.OrdinalIgnoreCase))?.Value;
        var companyIdValue = originalToken.Claims.FirstOrDefault(c => c.Type.Equals("CompanyId", StringComparison.OrdinalIgnoreCase))?.Value;

        // Remove old versions to avoid duplication
        claims.RemoveAll(c => c.Type.Equals("UserType", StringComparison.OrdinalIgnoreCase));
        claims.RemoveAll(c => c.Type.Equals("Id", StringComparison.OrdinalIgnoreCase));
        claims.RemoveAll(c => c.Type.Equals("CompanyId", StringComparison.OrdinalIgnoreCase));

        // Add them back with exact names
        if (!string.IsNullOrEmpty(userTypeValue))
            claims.Add(new Claim("UserType", userTypeValue));
        if (!string.IsNullOrEmpty(idValue))
            claims.Add(new Claim("Id", idValue));
        if (!string.IsNullOrEmpty(companyIdValue))
            claims.Add(new Claim("CompanyId", companyIdValue));

        // Add new claims
        claims.Add(new Claim("tenant_id", tenantId));
        if (!string.IsNullOrEmpty(userId))
        {
            claims.Add(new Claim("user_id", userId));

            // Permissions and Roles are now loaded dynamically via UserService, not embedded in token
        }

        var tokenSecretKey = _configuration["TokenSecretKey"];
        if (string.IsNullOrEmpty(tokenSecretKey))
            throw new Exception("TokenSecretKey is missing in configuration");

        // The key used in Program.cs
        var key = Encoding.UTF8.GetBytes("401b09eab3c013d4ca54922bb802bec8fd5318192b0aAMK167d8b3727429090fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1" + tokenSecretKey);
        var securityKey = new SymmetricSecurityKey(key);
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // Expiration
        var exp = originalToken.Claims.FirstOrDefault(x => x.Type == "exp")?.Value;
        var expires = DateTime.UtcNow.AddDays(1);
        if (long.TryParse(exp, out var expSeconds))
        {
            expires = DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime;

            // Remove time-related claims to let handler set them
            claims.RemoveAll(c => c.Type == "exp");
            claims.RemoveAll(c => c.Type == "iat");
            claims.RemoveAll(c => c.Type == "nbf");
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expires,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    private string UnescapeResponse(string content)
    {
        if (string.IsNullOrWhiteSpace(content)) return content;
        try
        {
            var unescaped = JsonSerializer.Deserialize<string>(content);
            return unescaped ?? content;
        }
        catch
        {
            return content;
        }
    }

    private async Task<ResponseResult<StringModel>> LoginAsync(string emailAddress, string password, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ExternalLoginUrl, Method.Post);
        AddCommonHeaders(request);

        var payload = new { emailAddress, password, isExternal = true };
        request.AddJsonBody(payload);

        RestResponse? response = null;
        try
        {
            response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.ErrorException != null)
                throw response.ErrorException;
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>($"{UnescapeResponse(response?.Content ?? ex.Message)}");
        }

        var body = response.Content ?? "";

        if (!response.IsSuccessful)
        {
            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }

        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("token", out var tokenEl) && tokenEl.ValueKind == JsonValueKind.String)
                return new ResponseResult<StringModel>(new StringModel { Value = tokenEl.GetString() ?? string.Empty }, ApiStatusCode.OK);

            if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Object
                && dataEl.TryGetProperty("token", out var token2) && token2.ValueKind == JsonValueKind.String)
                return new ResponseResult<StringModel>(new StringModel { Value = token2.GetString() ?? string.Empty }, ApiStatusCode.OK);

            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }
        catch
        {
            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }
    }


    public async Task<ResponseResult<StringModel>> RegisterAsync(RegisterPayloadDto payload, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ExternalRegisterUrl, Method.Post);
        AddCommonHeaders(request);
        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never
        };
        var json = JsonSerializer.Serialize(payload, options);
        request.AddParameter("application/json", json, ParameterType.RequestBody);

        RestResponse response;
        try
        {
            response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.StatusCode != HttpStatusCode.OK)
                return new ResponseResult<StringModel>($"{UnescapeResponse(response.Content ?? "Registration failed.")}");
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>($"{ex.Message}");
        }

        var body = response.Content ?? "";

        // After successful registration, auto-login to provision local entities
        // (CompanyMap, UserMap, CompanyUserMap, UserRole, default Workspaces)
        try
        {
            var loginResult = await LoginAsync(
                payload.EmployeeModel.Email!, payload.EmployeeModel.Password!, cancellationToken);
            if (loginResult.IsSucceeded && loginResult.ReturnData != null
                && !string.IsNullOrEmpty(loginResult.ReturnData.Value))
            {
                await ProcessLoginTokenAsync(loginResult.ReturnData.Value);
            }
        }
        catch
        {
            // Auto-provisioning failed — user will be provisioned on first manual login
        }

        return new ResponseResult<StringModel>(new StringModel { Value = UnescapeResponse(body) }, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<StringModel>> ForgetPasswordAsync(ForgetPasswordRequestDto dto, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ExternalForgetPasswordUrl, Method.Post);
        AddCommonHeaders(request);
        var payload = new { emailAddress = dto.Email };
        request.AddJsonBody(payload);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.IsSuccessful)
            {
                return new ResponseResult<StringModel>(new StringModel { Value = UnescapeResponse(response.Content ?? "") }, ApiStatusCode.OK);
            }
            return new ResponseResult<StringModel>(UnescapeResponse(response.Content ?? ""));
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>($"{ex.Message}");
        }
    }

    public async Task<ResponseResult<StringModel>> ResetPasswordAsync(ResetPasswordRequestDto dto, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ExternalResetPasswordUrl, Method.Post);
        AddCommonHeaders(request);
        var payload = new
        {
            emailAddress = dto.Email,
            newPassword = dto.NewPassword,
            confirmNewPassword = dto.ConfirmNewPassword,
            code = dto.Code
        };
        request.AddJsonBody(payload);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.IsSuccessful)
            {
                return new ResponseResult<StringModel>(new StringModel { Value = UnescapeResponse(response.Content ?? "") }, ApiStatusCode.OK);
            }
            return new ResponseResult<StringModel>(UnescapeResponse(response.Content ?? ""));
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>($"{ex.Message}");
        }
    }


    public async Task<ResponseResult<bool>> CreateUserAsync(CreateUserDto payload, CurrentUser currentUser, CancellationToken cancellationToken = default)
    {
        // ... (existing code for call)
        var request = new RestRequest(ExternalUserUrl, Method.Post);
        AddCommonHeaders(request);
        request.AddJsonBody(payload);

        RestResponse response;
        try
        {
            response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.StatusCode != HttpStatusCode.OK)
                return new ResponseResult<bool>(false, ApiStatusCode.BadRequest, false, UnescapeResponse(response.Content ?? "User creation failed."));
        }
        catch (Exception ex)
        {
            return new ResponseResult<bool>(false, ApiStatusCode.BadRequest, false, ex.Message);
        }

        var body = response.Content ?? "";
        var resultModel = new StringModel { Value = UnescapeResponse(body) };

        // Post-creation logic: Assign Roles
        if (response.StatusCode == HttpStatusCode.OK && payload.RoleIds != null && payload.RoleIds.Any())
        {
            try
            {
                // Parse body to get External Id
                using var doc = JsonDocument.Parse(resultModel.Value);
                var root = doc.RootElement;
                int externalUserId = 0;

                if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Object)
                {
                    if (dataEl.TryGetProperty("id", out var idEl)) externalUserId = idEl.GetInt32();
                }
                else if (root.TryGetProperty("id", out var idEl2))
                {
                    externalUserId = idEl2.GetInt32();
                }

                if (externalUserId > 0)
                {
                    // Ensure UserMap exists
                    var userMap = (await _unitOfWork.UserMaps.FindAsync(x => x.GrcUserId == externalUserId && x.GrcUserType == "Employee")).FirstOrDefault();

                    string localUserId;
                    if (userMap == null)
                    {
                        userMap = new UserMap
                        {
                            GrcUserId = externalUserId,
                            GrcUserType = "Employee",
                            GrcNameAr = payload.NameAr,
                            GrcNameEn = payload.NameEn
                        };
                        var added = await _unitOfWork.UserMaps.AddAsync(userMap);
                        localUserId = added.Id!;
                    }
                    else
                    {
                        localUserId = userMap.Id!;
                    }

                    // Assign roles
                    // Resolve IUserService manually to break circular dependency
                    var userService = _serviceProvider.GetRequiredService<Core.Interfaces.Service.IUserService>();

                    foreach (var roleId in payload.RoleIds)
                    {
                        await userService.AssignRoleToUserAsync(new AssignRoleDto
                        {
                            UserId = localUserId,
                            RoleId = roleId
                        }, currentUser);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error assigning roles: {ex.Message}");
            }
        }

        return new ResponseResult<bool>(true, ApiStatusCode.OK, "User created successfully");
    }

    public async Task<ResponseResult<List<CountryDto>>> GetCountriesAsync(CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ExternalCountriesUrl, Method.Get);
        AddCommonHeaders(request);

        RestResponse response;
        try
        {
            response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.StatusCode != HttpStatusCode.OK)
                return new ResponseResult<List<CountryDto>>("Failed to fetch countries", ApiStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<CountryDto>>(ex.Message, ApiStatusCode.BadRequest);
        }

        var body = response.Content ?? "";
        try
        {
            var countries = JsonSerializer.Deserialize<List<CountryDto>>(body, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (countries == null)
                return new ResponseResult<List<CountryDto>>("No countries found", ApiStatusCode.NotFound);

            return new ResponseResult<List<CountryDto>>(countries, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<CountryDto>>($"Failed to parse countries: {ex.Message}", ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<UserProfileDto>> GetProfileAsync(CancellationToken cancellationToken = default)
    {
        var (token, userId, userType, companyId) = _grcHelper.GetTokenInfo();

        var validationError = _grcHelper.ValidateTokenInfo(token, userId, userType);
        if (validationError != null)
            return new ResponseResult<UserProfileDto>(validationError, 401);

        string url;
        if (userType == ConstUserType.Employee)
        {
            url = $"{EmployeeUrl}{userId}";
        }
        else if (userType == ConstUserType.Partner) // Partner
        {
            url = $"{PartnerUrl}{userId}";
        }
        else
        {
            return new ResponseResult<UserProfileDto>("Invalid User Type or Unauthorized", 401);
        }

        var request = new RestRequest(url, Method.Get);
        AddCommonHeaders(request);

        try
        {
            var resp = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!resp.IsSuccessful)
            {
                var errorBody = resp.Content ?? "";
                var errorMsg = $"Failed to fetch profile. Status: {resp.StatusCode}, Response: {errorBody}";
                try { errorMsg = System.Text.RegularExpressions.Regex.Unescape(errorMsg); } catch { }
                return new ResponseResult<UserProfileDto>(errorMsg, (int)resp.StatusCode);
            }

            var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var root = JsonSerializer.Deserialize<JsonElement>(resp.Content ?? "{}", jsonOpt);

            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
            {
                root = dataProp;
            }

            var profile = new UserProfileDto();

            var headers = _httpContextAccessor.HttpContext?.Request.Headers;
            var lang = headers?["lang"].ToString();
            if (string.IsNullOrEmpty(lang)) 
                lang = headers?["Accept-Language"].ToString();

            bool isEnglish = !string.IsNullOrEmpty(lang) && lang.Contains("en", StringComparison.OrdinalIgnoreCase);

            string nameAr = GetString(root, "nameAr") ?? GetString(root, "fullNameAr") ?? "";
            string nameEn = GetString(root, "nameEn") ?? GetString(root, "fullNameEn") ?? "";

            profile.Name = isEnglish 
                ? (!string.IsNullOrEmpty(nameEn) ? nameEn : nameAr)
                : (!string.IsNullOrEmpty(nameAr) ? nameAr : nameEn);

            // Company name fields
            var companyName = "";
            string compNameAr = "";
            string compNameEn = "";

            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    var jwtToken = handler.ReadJwtToken(token);
                    
                    companyName = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("CompanyName", StringComparison.OrdinalIgnoreCase))?.Value ?? "";
                    compNameAr = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("CompanyNameAr", StringComparison.OrdinalIgnoreCase))?.Value ?? companyName;
                    compNameEn = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("CompanyNameEn", StringComparison.OrdinalIgnoreCase))?.Value ?? companyName;
                }
                catch { }
            }

            if (string.IsNullOrEmpty(compNameAr) && string.IsNullOrEmpty(compNameEn))
            {
                companyName = GetString(root, "companyName") ?? "";
                compNameAr = GetString(root, "companyNameAr") ?? companyName;
                compNameEn = GetString(root, "companyNameEn") ?? companyName;
            }

            profile.CompanyName = isEnglish 
                ? (!string.IsNullOrEmpty(compNameEn) ? compNameEn : compNameAr) 
                : (!string.IsNullOrEmpty(compNameAr) ? compNameAr : compNameEn);

            profile.Email = GetString(root, "email") ?? "";
            profile.MobileNumber = GetString(root, "mobileNumber") ?? "";
            profile.MobileCountryCode = int.TryParse(GetString(root, "mobileCountryCode"), out int code) ? code : 0;
            return new ResponseResult<UserProfileDto>(profile, 200);
        }
        catch (Exception ex) { return new ResponseResult<UserProfileDto>($"Exception: {ex.Message}", 500); }
    }

    private string? GetString(JsonElement element, string propName)
    {
        if (element.ValueKind != JsonValueKind.Object) return null;

        if (element.TryGetProperty(propName, out var prop))
        {
            if (prop.ValueKind == JsonValueKind.String) return prop.GetString();
            if (prop.ValueKind == JsonValueKind.Null) return null;
        }
        return null;
    }

    public async Task<ResponseResult<StringModel>> UpdateProfileAsync(UserProfileDto request, CancellationToken cancellationToken = default)
    {
        var (token, userId, userType, companyId) = _grcHelper.GetTokenInfo();

        var validationError = _grcHelper.ValidateTokenInfo(token, userId, userType);
        if (validationError != null || companyId == null)
            return new ResponseResult<StringModel>("Unauthorized", 401);

        Dictionary<string, object?>? profileData = null;
        try
        {
            string getUrl = userType == ConstUserType.Employee ? $"{EmployeeUrl}{userId}" : $"{PartnerUrl}{userId}";

            var getRequest = new RestRequest(getUrl, Method.Get);
            AddCommonHeaders(getRequest);

            var getResp = await _restClient.ExecuteAsync(getRequest, cancellationToken);
            if (getResp.IsSuccessful)
            {
                var root = JsonSerializer.Deserialize<JsonElement>(getResp.Content ?? "{}");
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
                    profileData = JsonSerializer.Deserialize<Dictionary<string, object?>>(dataProp.GetRawText());
                else
                    profileData = JsonSerializer.Deserialize<Dictionary<string, object?>>(root.GetRawText());
            }
        }
        catch { }

        profileData ??= new Dictionary<string, object?>();

        // We only have request.Name now, so we map it to all language fields to keep them in sync on remote
        profileData["nameAr"] = request.Name;
        profileData["fullNameAr"] = request.Name;
        profileData["nameEn"] = request.Name;
        profileData["fullNameEn"] = request.Name;

        profileData["companyName"] = request.CompanyName;
        profileData["companyNameAr"] = request.CompanyName;
        profileData["companyNameEn"] = request.CompanyName;

        profileData["password"] = " ";
        profileData["confirmPassword"] = " ";

        string url = userType == ConstUserType.Employee ? $"{EmployeeUrl}{userId}" : $"{PartnerUpdateUrl}{userId}";

        try
        {
            var updateRequest = new RestRequest(url, Method.Put);
            AddCommonHeaders(updateRequest);
            updateRequest.AddJsonBody(profileData);

            var resp = await _restClient.ExecuteAsync(updateRequest, cancellationToken);
            var result = resp.Content ?? "";

            if (!resp.IsSuccessful)
            {
                string errorMsg = result;
                try
                {
                    using var doc = JsonDocument.Parse(result);
                    if (doc.RootElement.TryGetProperty("message", out var msg)) errorMsg = msg.GetString() ?? result;
                    else if (doc.RootElement.TryGetProperty("messages", out var msgs) && msgs.ValueKind == JsonValueKind.Array && msgs.GetArrayLength() > 0)
                        errorMsg = msgs[0].GetString() ?? result;
                }
                catch { }
                try { errorMsg = System.Text.RegularExpressions.Regex.Unescape(errorMsg); } catch { }

                return new ResponseResult<StringModel>(errorMsg, (int)resp.StatusCode);
            }

            return new ResponseResult<StringModel>(new StringModel { Value = result }, 200, "Profile updated successfully");
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>(ex.Message, 500);
        }
    }

    public async Task<ResponseResult<StringModel>> ChangePasswordAsync(ChangePasswordRequestDto request, CancellationToken cancellationToken = default)
    {
        var (token, userId, userType, _) = _grcHelper.GetTokenInfo();

        var validationError = _grcHelper.ValidateTokenInfo(token, userId, userType);
        if (validationError != null)
            return new ResponseResult<StringModel>(validationError, 401);

        var payload = new
        {
            oldPassword = request.OldPassword,
            newPassword = request.NewPassword,
            confirmNewPassword = request.ConfirmPassword
        };

        try
        {
            var changeReq = new RestRequest(ExternalChangePasswordUrl, Method.Post);
            AddCommonHeaders(changeReq);
            changeReq.AddJsonBody(payload);

            var resp = await _restClient.ExecuteAsync(changeReq, cancellationToken);
            var body = resp.Content ?? "";

            if (!resp.IsSuccessful)
            {
                string errorMsg = body;
                try
                {
                    using var doc = JsonDocument.Parse(body);
                    if (doc.RootElement.TryGetProperty("message", out var msg)) errorMsg = msg.GetString() ?? body;
                    else if (doc.RootElement.TryGetProperty("messages", out var msgs) && msgs.ValueKind == JsonValueKind.Array && msgs.GetArrayLength() > 0)
                        errorMsg = msgs[0].GetString() ?? body;
                }
                catch { }
                try { errorMsg = System.Text.RegularExpressions.Regex.Unescape(errorMsg); } catch { }

                return new ResponseResult<StringModel>(errorMsg, (int)resp.StatusCode);
            }

            return new ResponseResult<StringModel>(new StringModel { Value = body }, 200, "Password changed successfully");
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>(ex.Message, 500);
        }
    }

    public async Task<ResponseResult<IEnumerable<CompanyUserDto>>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        var (token, userId, userType, companyId) = _grcHelper.GetTokenInfo();

        var validationError = _grcHelper.ValidateTokenInfo(token, userId, userType);
        if (validationError != null)
            return new ResponseResult<IEnumerable<CompanyUserDto>>(validationError, 401);

        if (companyId == null)
            return new ResponseResult<IEnumerable<CompanyUserDto>>(_localizationService.Get("Msg_CompanyIdMissing"), 400);

        var url = UsersUrl.Replace("{companyId}", companyId.ToString());

        try
        {
            var request = new RestRequest(url, Method.Get);
            AddCommonHeaders(request);

            var resp = await _restClient.ExecuteAsync(request, cancellationToken);
            var body = resp.Content ?? "";

            if (!resp.IsSuccessful)
            {
                string errorMsg = body;
                try
                {
                    using var doc = JsonDocument.Parse(body);
                    if (doc.RootElement.TryGetProperty("message", out var msg)) errorMsg = msg.GetString() ?? body;
                }
                catch { }
                return new ResponseResult<IEnumerable<CompanyUserDto>>(errorMsg, (int)resp.StatusCode);
            }

            // We need to parse raw JSON to get Ar/En names and select one based on language
            // The CompanyUserDto has 'Name'.
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            // Intermediate deserialization to JsonElement array to access properties manually
            var rootArray = JsonSerializer.Deserialize<List<JsonElement>>(body, options);

            var users = new List<CompanyUserDto>();
            if (rootArray != null)
            {
                var lang = _grcHelper.GetCurrentLanguage();
                bool isEnglish = lang.Equals("en", StringComparison.OrdinalIgnoreCase);

                foreach (var el in rootArray)
                {
                    // Map manually
                    var dto = new CompanyUserDto();
                    if (el.TryGetProperty("id", out var idProp) && idProp.ValueKind == JsonValueKind.Number) dto.Id = idProp.GetInt32();

                    string nameAr = GetString(el, "nameAr") ?? "";
                    string nameEn = GetString(el, "nameEn") ?? "";
                    dto.Name = isEnglish ? nameEn : nameAr;
                    if (string.IsNullOrEmpty(dto.Name)) dto.Name = nameEn; // Fallback to EN
                    if (string.IsNullOrEmpty(dto.Name)) dto.Name = nameAr; // Fallback to AR

                    dto.NameAr = nameAr;
                    dto.NameEn = nameEn;

                    dto.Type = GetString(el, "type");

                    users.Add(dto);
                }
            }

            // Enrich with Vault User IDs
            var grcIds = users.Select(u => u.Id).Distinct().ToList();
            if (grcIds.Any())
            {
                var repo = _unitOfWork.UserMaps;
                var userMaps = await repo.FindAsync(u => grcIds.Contains(u.GrcUserId));

                foreach (var user in users)
                {
                    var match = userMaps.FirstOrDefault(m => m.GrcUserId == user.Id && (string.IsNullOrEmpty(user.Type) || string.Equals(m.GrcUserType, user.Type, StringComparison.OrdinalIgnoreCase)));
                    if (match != null)
                    {
                        user.VaultUserId = match.Id;
                    }
                }
            }

            return new ResponseResult<IEnumerable<CompanyUserDto>>(users, 200);
        }
        catch (Exception ex)
        {
            return new ResponseResult<IEnumerable<CompanyUserDto>>(ex.Message, 500);
        }
    }

    public async Task<ResponseResult<UserProfileDto>> GetExternalUserProfileAsync(int id, string type, CancellationToken cancellationToken = default)
    {
        var (token, _, _, _) = _grcHelper.GetTokenInfo();

        string url;
        if (type == ConstUserType.Employee.ToString())
        {
            url = $"{EmployeeUrl}{id}";
        }
        else if (type == ConstUserType.Partner.ToString())
        {
            url = $"{PartnerUrl}{id}";
        }
        else
        {
            return new ResponseResult<UserProfileDto>("Invalid User Type", 400);
        }

        var request = new RestRequest(url, Method.Get);
        AddCommonHeaders(request);

        try
        {
            var resp = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!resp.IsSuccessful)
            {
                return new ResponseResult<UserProfileDto>($"Failed to fetch profile: {resp.StatusCode}", (int)resp.StatusCode);
            }

            var root = JsonSerializer.Deserialize<JsonElement>(resp.Content ?? "{}");
            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
            {
                root = dataProp;
            }

            var profile = new UserProfileDto();

            var lang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
            bool isEnglish = lang.Contains("en", StringComparison.OrdinalIgnoreCase);

            string nameAr = GetString(root, "nameAr") ?? GetString(root, "fullNameAr") ?? "";
            string nameEn = GetString(root, "nameEn") ?? GetString(root, "fullNameEn") ?? "";

            profile.Name = isEnglish ? nameEn : nameAr;

            return new ResponseResult<UserProfileDto>(profile, 200);
        }
        catch (Exception ex)
        {
            return new ResponseResult<UserProfileDto>(ex.Message, 500);
        }
    }

    public async Task<ResponseResult<PartnerLoginResponseDto>> PartnerLoginAsync(PartnerLoginRequestDto request)
    {
        var restRequest = new RestRequest(ExternalPartnerLoginUrl, Method.Get);
        AddCommonHeaders(restRequest);

        restRequest.AddQueryParameter("identityNumber", request.IdentityNumber);
        restRequest.AddQueryParameter("isResend", request.IsResend.ToString().ToLower()); // bool to string

        try
        {
            var response = await _restClient.ExecuteAsync(restRequest, CancellationToken.None);
            var body = response.Content ?? "";

            if (!response.IsSuccessful)
            {
                string errorMsg = body;
                try
                {
                    using var doc = JsonDocument.Parse(body);
                    if (doc.RootElement.TryGetProperty("message", out var msg)) errorMsg = msg.GetString() ?? body;
                    else if (doc.RootElement.TryGetProperty("messages", out var msgs) && msgs.ValueKind == JsonValueKind.Array && msgs.GetArrayLength() > 0)
                        errorMsg = msgs[0].GetString() ?? body;
                }
                catch { }
                try { errorMsg = System.Text.RegularExpressions.Regex.Unescape(errorMsg); } catch { }

                return new ResponseResult<PartnerLoginResponseDto>(errorMsg, (int)response.StatusCode);
            }

            var result = JsonSerializer.Deserialize<PartnerLoginResponseDto>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            if (result == null)
                 return new ResponseResult<PartnerLoginResponseDto>("Failed to parse response", ApiStatusCode.InternalServerError);

            return new ResponseResult<PartnerLoginResponseDto>(result, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<PartnerLoginResponseDto>(ex.Message, ApiStatusCode.InternalServerError);
        }
    }

    public async Task<ResponseResult<ExternalEmployeeDto>> GetEmployeeAsync(int id, string? token = null, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{EmployeeUrl}{id}", Method.Get);
        AddCommonHeaders(request, token);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<ExternalEmployeeDto>(UnescapeResponse(response.Content ?? "Failed to fetch employee"), (int)response.StatusCode);
            }

            var content = response.Content ?? "{}";
            var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            ExternalEmployeeDto? employee = null;

            try 
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
                {
                    employee = JsonSerializer.Deserialize<ExternalEmployeeDto>(dataProp.GetRawText(), jsonOpt);
                }
                else
                {
                    employee = JsonSerializer.Deserialize<ExternalEmployeeDto>(content, jsonOpt);
                }
            }
            catch
            {
                 employee = JsonSerializer.Deserialize<ExternalEmployeeDto>(content, jsonOpt);
            }

            if (employee == null)
                 return new ResponseResult<ExternalEmployeeDto>("Failed to deserialize employee", ApiStatusCode.BadRequest);

            return new ResponseResult<ExternalEmployeeDto>(employee, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<ExternalEmployeeDto>(ex.Message, ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<ExternalPartnerDto>> GetPartnerAsync(int id, string? token = null, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{PartnerUrl}{id}", Method.Get);
        AddCommonHeaders(request, token);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<ExternalPartnerDto>(UnescapeResponse(response.Content ?? "Failed to fetch partner"), (int)response.StatusCode);
            }

            var content = response.Content ?? "{}";
            var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            ExternalPartnerDto? partner = null;

            try 
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
                {
                    partner = JsonSerializer.Deserialize<ExternalPartnerDto>(dataProp.GetRawText(), jsonOpt);
                }
                else
                {
                     partner = JsonSerializer.Deserialize<ExternalPartnerDto>(content, jsonOpt);
                }
            }
             catch
            {
                 partner = JsonSerializer.Deserialize<ExternalPartnerDto>(content, jsonOpt);
            }

            if (partner == null)
                 return new ResponseResult<ExternalPartnerDto>("Failed to deserialize partner", ApiStatusCode.BadRequest);

            return new ResponseResult<ExternalPartnerDto>(partner, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<ExternalPartnerDto>(ex.Message, ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<bool>> UpdateExternalUserAsync(UpdateExternalUserDto payload, string? token = null, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ExternalUserUrl, Method.Put);
        AddCommonHeaders(request, token);
        request.AddJsonBody(payload);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.StatusCode != HttpStatusCode.OK)
            {
                // Use constructor: (T returnData, int apiStatusCode, bool isSucceeded, string errorMessage)
                return new ResponseResult<bool>(false, (int)response.StatusCode, false, UnescapeResponse(response.Content ?? "Update failed"));
            }

            return new ResponseResult<bool>(true, ApiStatusCode.OK, "User updated successfully");
        }
        catch (Exception ex)
        {
            return new ResponseResult<bool>(false, ApiStatusCode.BadRequest, false, ex.Message);
        }
    }
    public async Task<ResponseResult<List<GRCActiveCompanyDto>>> GetGRCActiveCompanyAsync(CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ActiveCompanyEmployeesUrl, Method.Get);
        AddCommonHeaders(request);

        RestResponse response;
        try
        {
            response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.StatusCode != HttpStatusCode.OK)
                return new ResponseResult<List<GRCActiveCompanyDto>>("Failed to fetch active companies", ApiStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<GRCActiveCompanyDto>>(ex.Message, ApiStatusCode.BadRequest);
        }

        var body = response.Content ?? "";
        try
        {
            var companies = JsonSerializer.Deserialize<List<GRCActiveCompanyDto>>(body, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (companies == null)
                return new ResponseResult<List<GRCActiveCompanyDto>>("No active companies found", ApiStatusCode.NotFound);

            return new ResponseResult<List<GRCActiveCompanyDto>>(companies, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<GRCActiveCompanyDto>>($"Failed to parse active companies: {ex.Message}", ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<LoginResponseDto>> AdminLoginAsync(AdminLoginRequestDto request)
    {
         if (request == null)
            return new ResponseResult<LoginResponseDto>("Request is null", ApiStatusCode.BadRequest);

        var result = await AdminLoginAsync(request.CompanyId, request.AdminEmail, request.AdminPassword, CancellationToken.None);

         if (result.IsSucceeded && result.ReturnData != null && !string.IsNullOrEmpty(result.ReturnData.Value))
        {
            return await ProcessLoginTokenAsync(result.ReturnData.Value);
        }
         return new ResponseResult<LoginResponseDto>(result.ErrorMessage ?? "Login failed", ApiStatusCode.BadRequest);
    }

    private async Task<ResponseResult<StringModel>> AdminLoginAsync(int companyId, string adminEmail, string adminPassword, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ExternalAdminLoginUrl, Method.Post);
        AddCommonHeaders(request);

        var payload = new { companyId, adminEmail, adminPassword, isExternal = true };
        request.AddJsonBody(payload);

        RestResponse? response = null;
        try
        {
            response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.ErrorException != null)
                throw response.ErrorException;
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>($"{UnescapeResponse(response?.Content ?? ex.Message)}");
        }

        var body = response.Content ?? "";

        if (!response.IsSuccessful)
        {
            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }

        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("token", out var tokenEl) && tokenEl.ValueKind == JsonValueKind.String)
                return new ResponseResult<StringModel>(new StringModel { Value = tokenEl.GetString() ?? string.Empty }, ApiStatusCode.OK);

            if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Object
                && dataEl.TryGetProperty("token", out var token2) && token2.ValueKind == JsonValueKind.String)
                return new ResponseResult<StringModel>(new StringModel { Value = token2.GetString() ?? string.Empty }, ApiStatusCode.OK);

            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }
        catch
        {
            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }
    }

    public async Task<ResponseResult<LoginResponseDto>> AdminPartnerLoginAsync(AdminPartnerLoginRequestDto request)
    {
         if (request == null)
            return new ResponseResult<LoginResponseDto>("Request is null", ApiStatusCode.BadRequest);

        var result = await AdminPartnerLoginAsync(request.IdentityNumber, request.AdminEmail, request.AdminPassword, CancellationToken.None);

         if (result.IsSucceeded && result.ReturnData != null && !string.IsNullOrEmpty(result.ReturnData.Value))
        {
            return await ProcessLoginTokenAsync(result.ReturnData.Value);
        }
         return new ResponseResult<LoginResponseDto>(result.ErrorMessage ?? "Login failed", ApiStatusCode.BadRequest);
    }

    private async Task<ResponseResult<StringModel>> AdminPartnerLoginAsync(string identityNumber, string adminEmail, string adminPassword, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ExternalAdminPartnerLoginUrl, Method.Post);
        AddCommonHeaders(request);

        var payload = new { identityNumber, adminEmail, adminPassword };
        request.AddJsonBody(payload);

        RestResponse? response = null;
        try
        {
            response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (response.ErrorException != null)
                throw response.ErrorException;
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>($"{UnescapeResponse(response?.Content ?? ex.Message)}");
        }

        var body = response.Content ?? "";

        if (!response.IsSuccessful)
        {
            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }

        try
        {
            using var doc = JsonDocument.Parse(body);
            var root = doc.RootElement;

            if (root.TryGetProperty("token", out var tokenEl) && tokenEl.ValueKind == JsonValueKind.String)
                return new ResponseResult<StringModel>(new StringModel { Value = tokenEl.GetString() ?? string.Empty }, ApiStatusCode.OK);

            if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Object
                && dataEl.TryGetProperty("token", out var token2) && token2.ValueKind == JsonValueKind.String)
                return new ResponseResult<StringModel>(new StringModel { Value = token2.GetString() ?? string.Empty }, ApiStatusCode.OK);

            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }
        catch
        {
            return new ResponseResult<StringModel>(UnescapeResponse(body));
        }
    }

    /// <summary>
    /// Provisions all local entities for a user: CompanyMap, UserMap, CompanyUserMap, UserRole, and default Workspaces.
    /// This is the single source of truth for user/tenant provisioning — called by all login and registration flows.
    /// </summary>
    private async Task<(string tenantId, string? userId)> ProvisionTenantUserAsync(
        int grcCompanyId, int grcUserId, string userType,
        string? nameAr, string? nameEn, string token, int? companyTypeId = null)
    {
        // 1. CompanyMap — ensure tenant exists
        string tenantId;
        var existingMap = (await _unitOfWork.CompanyMaps.FindAsync(x => x.GrcCompanyId == grcCompanyId)).FirstOrDefault();
        if (existingMap != null)
        {
            tenantId = existingMap.Id!;
        }
        else
        {
            var newMap = new Core.Entities.CompanyMap { GrcCompanyId = grcCompanyId };
            var addedMap = await _unitOfWork.CompanyMaps.AddAsync(newMap);
            tenantId = addedMap.Id!;
        }

        // 2. UserMap — ensure user exists and is up-to-date
        string? myUserId = null;
        if (!string.IsNullOrEmpty(userType))
        {
            string? extEmail = null;
            string? extMobile = null;
            int? extMobileCode = null;
            bool extIsActive = true;

            int uTypeInt = 0;
            if (!int.TryParse(userType, out uTypeInt))
            {
                if (string.Equals(userType, "Employee", StringComparison.OrdinalIgnoreCase)) uTypeInt = Core.Constants.ConstUserType.Employee;
                else if (string.Equals(userType, "Partner", StringComparison.OrdinalIgnoreCase)) uTypeInt = Core.Constants.ConstUserType.Partner;
            }

            if (uTypeInt == Core.Constants.ConstUserType.Employee)
            {
                try
                {
                    var empRes = await GetEmployeeAsync(grcUserId, token);
                    if (empRes.IsSucceeded && empRes.ReturnData != null)
                    {
                        extEmail = empRes.ReturnData.Email;
                        extMobile = empRes.ReturnData.MobileNumber;
                        extMobileCode = empRes.ReturnData.MobileCountryCode;
                        extIsActive = empRes.ReturnData.IsActive;
                    }
                } catch {}
            }
            else if (uTypeInt == Core.Constants.ConstUserType.Partner)
            {
                try
                {
                    var ptrRes = await GetPartnerAsync(grcUserId, token);
                    if (ptrRes.IsSucceeded && ptrRes.ReturnData != null)
                    {
                        extEmail = ptrRes.ReturnData.Email;
                        extMobile = ptrRes.ReturnData.MobileNumber;
                        extMobileCode = ptrRes.ReturnData.MobileCountryCode;
                        extIsActive = ptrRes.ReturnData.IsActive;
                    }
                } catch {}
            }

            var existingUser = (await _unitOfWork.UserMaps.FindAsync(x => x.GrcUserId == grcUserId && x.GrcUserType == userType)).FirstOrDefault();

            if (existingUser != null)
            {
                myUserId = existingUser.Id;
                bool isUpdated = false;

                if (existingUser.GrcNameAr != nameAr) { existingUser.GrcNameAr = nameAr; isUpdated = true; }
                if (existingUser.GrcNameEn != nameEn) { existingUser.GrcNameEn = nameEn; isUpdated = true; }
                if (string.IsNullOrEmpty(existingUser.Email) || existingUser.Email != extEmail) { existingUser.Email = extEmail; isUpdated = true; }
                if (string.IsNullOrEmpty(existingUser.MobileNumber) || existingUser.MobileNumber != extMobile) { existingUser.MobileNumber = extMobile; isUpdated = true; }
                if (existingUser.MobileCountryCode != extMobileCode) { existingUser.MobileCountryCode = extMobileCode; isUpdated = true; }
                if (existingUser.IsActive != extIsActive) { existingUser.IsActive = extIsActive; isUpdated = true; }

                if (isUpdated)
                    await _unitOfWork.UserMaps.UpdateAsync(existingUser.Id!, existingUser);
            }
            else
            {
                var newUser = new Core.Entities.UserMap
                {
                    GrcUserId = grcUserId,
                    GrcUserType = userType,
                    GrcNameAr = nameAr,
                    GrcNameEn = nameEn,
                    Email = extEmail,
                    MobileNumber = extMobile,
                    MobileCountryCode = extMobileCode,
                    IsActive = extIsActive
                };
                var addedUser = await _unitOfWork.UserMaps.AddAsync(newUser);
                myUserId = addedUser.Id;
            }

            // 3. UserRole — auto-assign based on user type
            if (!string.IsNullOrEmpty(myUserId))
            {
                var existingRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == myUserId && ur.TenantId == tenantId);

                if (!existingRoles.Any())
                {
                    int userTypeInt = 0;
                    if (!int.TryParse(userType, out userTypeInt))
                    {
                        if (string.Equals(userType, "Employee", StringComparison.OrdinalIgnoreCase)) userTypeInt = Core.Constants.ConstUserType.Employee;
                        else if (string.Equals(userType, "Partner", StringComparison.OrdinalIgnoreCase)) userTypeInt = Core.Constants.ConstUserType.Partner;
                        else if (string.Equals(userType, "Guest", StringComparison.OrdinalIgnoreCase)) userTypeInt = Core.Constants.ConstUserType.Guest;
                    }

                    string roleCode = userTypeInt switch
                    {
                        Core.Constants.ConstUserType.Employee => Core.Constants.ConstRoles.Admin,
                        Core.Constants.ConstUserType.Partner => Core.Constants.ConstRoles.Commenter,
                        _ => Core.Constants.ConstRoles.Viewer
                    };

                    var role = (await _unitOfWork.Roles.FindAsync(r => r.Code == roleCode && r.IsActive)).FirstOrDefault();
                    if (role != null)
                    {
                        await _unitOfWork.UserRoles.AddAsync(new Core.Entities.UserRole
                        {
                            UserId = myUserId,
                            RoleId = role.Id!,
                            TenantId = tenantId,
                            AssignedAt = DateTime.UtcNow,
                            AssignedBy = myUserId
                        });
                    }
                }

                // 4. CompanyUserMap — link user to tenant
                var existingCum = (await _unitOfWork.CompanyUserMaps.FindAsync(
                    cum => cum.UserId == myUserId && cum.TenantId == tenantId)).FirstOrDefault();
                if (existingCum == null)
                {
                    await _unitOfWork.CompanyUserMaps.AddAsync(new Core.Entities.CompanyUserMap
                    {
                        UserId = myUserId,
                        GrcUserId = grcUserId,
                        TenantId = tenantId,
                        GrcCompanyId = grcCompanyId
                    });
                }
            }
        }

        // 5. Seed Default Workspaces
        if (companyTypeId.HasValue && companyTypeId.Value != 4)
        {
            foreach (var ws in ConstDefaultWorkspaces.Defaults)
            {
                var existingWs = (await _unitOfWork.Workspaces.FindAsync(w => w.TenantId == tenantId && w.Name == ws.Key)).FirstOrDefault();
                if (existingWs == null)
                {
                    var tenantPrefix = tenantId.Length >= 8 ? tenantId[..8] : tenantId;
                    var slug = $"{tenantPrefix}-{ws.Key.Replace(" ", "-")}";

                    try
                    {
                        await _unitOfWork.Workspaces.AddAsync(new Workspace
                        {
                            TenantId = tenantId,
                            Name = ws.Key,
                            Slug = slug,
                            Description = ws.Key,
                            LegalHold = true,
                            CreatedBy = myUserId,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow,
                            UpdatedBy = myUserId,
                            IsActive = true,
                            Type = ws.Value,
                            Stats = new WorkspaceStats(),
                            Settings = new WorkspaceSettings
                            {
                                Privacy = "private",
                                AllowInvites = false,
                                StorageLimitMb = 1024
                            }
                        });
                    }
                    catch (Exception wsEx) when (wsEx.Message.Contains("DuplicateKey") || wsEx.Message.Contains("11000"))
                    {
                        Console.WriteLine($"[Workspace Seed] Skipped duplicate slug for '{ws.Key}': {wsEx.Message}");
                    }
                }
            }
        }

        return (tenantId, myUserId);
    }

    private async Task<ResponseResult<LoginResponseDto>> ProcessLoginTokenAsync(string token)
    {
        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (handler.CanReadToken(token))
            {
                var jwtToken = handler.ReadJwtToken(token);

                var companyIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("CompanyId", StringComparison.OrdinalIgnoreCase))?.Value;
                var oldUserIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("Id", StringComparison.OrdinalIgnoreCase))?.Value;
                var userType = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("UserType", StringComparison.OrdinalIgnoreCase))?.Value;
                var nameAr = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("NameAr", StringComparison.OrdinalIgnoreCase) || c.Type.Equals("fullNameAr", StringComparison.OrdinalIgnoreCase))?.Value;
                var nameEn = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("NameEn", StringComparison.OrdinalIgnoreCase) || c.Type.Equals("fullNameEn", StringComparison.OrdinalIgnoreCase))?.Value;

                if (int.TryParse(companyIdStr, out int companyId) && int.TryParse(oldUserIdStr, out int oldUserId))
                {
                    string? companyTypeIdStr = jwtToken.Claims.FirstOrDefault(c => c.Type.Equals("CompanyTypeId", StringComparison.OrdinalIgnoreCase))?.Value;
                    int? companyTypeId = int.TryParse(companyTypeIdStr, out int ctid) ? ctid : null;

                    var (tenantId, myUserId) = await ProvisionTenantUserAsync(
                        companyId, oldUserId, userType!, nameAr, nameEn, token, companyTypeId);

                    var newToken = GenerateJwtToken(jwtToken, tenantId, myUserId);
                    return new ResponseResult<LoginResponseDto>(new LoginResponseDto { Token = newToken }, ApiStatusCode.OK);
                }
            }
        }
        catch (Exception ex)
        {
            return new ResponseResult<LoginResponseDto>($"Error enriching token: {ex.Message}", 500);
        }

        if (token.Split('.').Length == 3)
        {
            return new ResponseResult<LoginResponseDto>(new LoginResponseDto { Token = token }, ApiStatusCode.OK);
        }
        return new ResponseResult<LoginResponseDto>("Processing token failed", ApiStatusCode.BadRequest);
    }

    public async Task<ResponseResult<LoginResponseDto>> VerifyOtpAsync(VerifyOtpRequestDto request)
    {
        var verifyRequest = new RestRequest(VerifyOtpUrl, Method.Post);
        AddCommonHeaders(verifyRequest);
        verifyRequest.AddJsonBody(request);

        try
        {
            var response = await _restClient.ExecuteAsync(verifyRequest);
            var body = response.Content ?? "";

            if (!response.IsSuccessful)
            {
                string errorMsg = body;
                try
                {
                    using var doc = JsonDocument.Parse(body);
                    if (doc.RootElement.TryGetProperty("message", out var msg)) errorMsg = msg.GetString() ?? body;
                    else if (doc.RootElement.TryGetProperty("messages", out var msgs) && msgs.ValueKind == JsonValueKind.Array && msgs.GetArrayLength() > 0)
                        errorMsg = msgs[0].GetString() ?? body;
                }
                catch { }
                try { errorMsg = System.Text.RegularExpressions.Regex.Unescape(errorMsg); } catch { }

                return new ResponseResult<LoginResponseDto>(errorMsg, (int)response.StatusCode);
            }

            // If response is {"token": "string"}
            string? token = null;
            try
            {
               using var doc = JsonDocument.Parse(body);
               var root = doc.RootElement;
                
               if (root.ValueKind == JsonValueKind.Object)
               {
                   if (root.TryGetProperty("token", out var tokenProp))
                   {
                        token = tokenProp.GetString();
                   }
                   else if (root.TryGetProperty("data", out var dataProp))
                   {
                       if (dataProp.ValueKind == JsonValueKind.Object && dataProp.TryGetProperty("token", out var innerToken))
                       {
                           token = innerToken.GetString();
                       }
                       else if (dataProp.ValueKind == JsonValueKind.String)
                       {
                           token = dataProp.GetString();
                       }
                   }
               }
            }
            catch {}

            if (!string.IsNullOrEmpty(token))
            {
                return await ProcessLoginTokenAsync(token);
            }
            
            return new ResponseResult<LoginResponseDto>("Invalid response from GRC", ApiStatusCode.InternalServerError);

        }
        catch (Exception ex)
        {
             return new ResponseResult<LoginResponseDto>(ex.Message, ApiStatusCode.InternalServerError);
        }
    }

    public async Task<ResponseResult<LoginResponseDto>> PartnerChangeCompanyAsync(int companyId, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{PartnerChangeCompanyUrl}{companyId}", Method.Get);
        AddCommonHeaders(request);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            var body = response.Content ?? "";

            if (!response.IsSuccessful)
            {
                string errorMsg = body;
                try
                {
                    using var doc = JsonDocument.Parse(body);
                    if (doc.RootElement.TryGetProperty("message", out var msg)) errorMsg = msg.GetString() ?? body;
                    else if (doc.RootElement.TryGetProperty("messages", out var msgs) && msgs.ValueKind == JsonValueKind.Array && msgs.GetArrayLength() > 0)
                        errorMsg = msgs[0].GetString() ?? body;
                }
                catch { }
                try { errorMsg = System.Text.RegularExpressions.Regex.Unescape(errorMsg); } catch { }

                return new ResponseResult<LoginResponseDto>(errorMsg, (int)response.StatusCode);
            }

            string? token = null;
            try
            {
               using var doc = JsonDocument.Parse(body);
               var root = doc.RootElement;
                
               if (root.ValueKind == JsonValueKind.Object)
               {
                   if (root.TryGetProperty("token", out var tokenProp))
                   {
                        token = tokenProp.GetString();
                   }
                   else if (root.TryGetProperty("data", out var dataProp))
                   {
                       if (dataProp.ValueKind == JsonValueKind.Object && dataProp.TryGetProperty("token", out var innerToken))
                       {
                           token = innerToken.GetString();
                       }
                       else if (dataProp.ValueKind == JsonValueKind.String)
                       {
                           token = dataProp.GetString();
                       }
                   }
               }
            }
            catch {}

            if (!string.IsNullOrEmpty(token))
            {
                return await ProcessLoginTokenAsync(token);
            }
            
            return new ResponseResult<LoginResponseDto>("Invalid response from GRC", ApiStatusCode.InternalServerError);
        }
        catch (Exception ex)
        {
             return new ResponseResult<LoginResponseDto>(ex.Message, ApiStatusCode.InternalServerError);
        }
    }

    public async Task<ResponseResult<LoginResponseDto>> AdminAsEmployeeChangeCompanyAsync(int companyId, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{AdminAsEmployeeChangeCompanyUrl}{companyId}", Method.Get);
        AddCommonHeaders(request);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            var body = response.Content ?? "";

            if (!response.IsSuccessful)
            {
                string errorMsg = body;
                try
                {
                    using var doc = JsonDocument.Parse(body);
                    if (doc.RootElement.TryGetProperty("message", out var msg)) errorMsg = msg.GetString() ?? body;
                    else if (doc.RootElement.TryGetProperty("messages", out var msgs) && msgs.ValueKind == JsonValueKind.Array && msgs.GetArrayLength() > 0)
                        errorMsg = msgs[0].GetString() ?? body;
                }
                catch { }
                try { errorMsg = System.Text.RegularExpressions.Regex.Unescape(errorMsg); } catch { }

                return new ResponseResult<LoginResponseDto>(errorMsg, (int)response.StatusCode);
            }

            string? token = null;
            try
            {
               using var doc = JsonDocument.Parse(body);
               var root = doc.RootElement;
                
               if (root.ValueKind == JsonValueKind.Object)
               {
                   if (root.TryGetProperty("token", out var tokenProp))
                   {
                        token = tokenProp.GetString();
                   }
                   else if (root.TryGetProperty("data", out var dataProp))
                   {
                       if (dataProp.ValueKind == JsonValueKind.Object && dataProp.TryGetProperty("token", out var innerToken))
                       {
                           token = innerToken.GetString();
                       }
                       else if (dataProp.ValueKind == JsonValueKind.String)
                       {
                           token = dataProp.GetString();
                       }
                   }
               }
            }
            catch {}

            if (!string.IsNullOrEmpty(token))
            {
                return await ProcessLoginTokenAsync(token);
            }
            
            return new ResponseResult<LoginResponseDto>("Invalid response from GRC", ApiStatusCode.InternalServerError);
        }
        catch (Exception ex)
        {
             return new ResponseResult<LoginResponseDto>(ex.Message, ApiStatusCode.InternalServerError);
        }
    }

    public async Task<ResponseResult<List<PartnerCompanyDto>>> GetPartnerCompaniesAsync(int partnerId, int? pageIndex = null, int? pageSize = null, string searchTerm = "", CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{PartnerCompaniesUrl}{partnerId}/Companies", Method.Get);
        AddCommonHeaders(request);
        
        if (pageIndex.HasValue)
            request.AddQueryParameter("pageIndex", pageIndex.Value.ToString());
        if (pageSize.HasValue)
            request.AddQueryParameter("pageSize", pageSize.Value.ToString());
        if (!string.IsNullOrEmpty(searchTerm))
            request.AddQueryParameter("searchTerm", searchTerm);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<List<PartnerCompanyDto>>(UnescapeResponse(response.Content ?? "Failed to fetch partner companies"), (int)response.StatusCode);
            }

            var content = response.Content ?? "[]";
            var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            List<PartnerCompanyDto>? companies = null;

            try 
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
                {
                    companies = JsonSerializer.Deserialize<List<PartnerCompanyDto>>(dataProp.GetRawText(), jsonOpt);
                }
                else
                {
                    companies = JsonSerializer.Deserialize<List<PartnerCompanyDto>>(content, jsonOpt);
                }
            }
             catch
            {
                 companies = JsonSerializer.Deserialize<List<PartnerCompanyDto>>(content, jsonOpt);
            }

            if (companies == null)
                 return new ResponseResult<List<PartnerCompanyDto>>("Failed to deserialize partner companies", ApiStatusCode.BadRequest);

            return new ResponseResult<List<PartnerCompanyDto>>(companies, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<PartnerCompanyDto>>(ex.Message, ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<int>> GetPartnerCompaniesCountAsync(int partnerId, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{PartnerUrl}{partnerId}/CompaniesCount", Method.Get);
        AddCommonHeaders(request);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<int>(UnescapeResponse(response.Content ?? "Failed to fetch partner companies count"), (int)response.StatusCode);
            }

            var content = response.Content ?? "0";
            int count = 0;

            try
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("value", out var valueProp) && valueProp.ValueKind == JsonValueKind.Number)
                {
                    count = valueProp.GetInt32();
                }                
                else if (root.ValueKind == JsonValueKind.Number)
                {
                    count = root.GetInt32();
                }
            }
            catch
            {
                if (!int.TryParse(content.Trim(), out count))
                    count = 0;
            }

            return new ResponseResult<int>(count, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<int>(ex.Message, ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<List<PartnerCompanyListDto>>> GetPartnerCompaniesListAsync(int partnerId, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{PartnerUrl}{partnerId}/CompaniesList", Method.Get);
        AddCommonHeaders(request);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<List<PartnerCompanyListDto>>(UnescapeResponse(response.Content ?? "Failed to fetch partner companies list"), (int)response.StatusCode);
            }

            var content = response.Content ?? "[]";
            var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            List<PartnerCompanyListDto>? companies = null;

            try 
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
                {
                    companies = JsonSerializer.Deserialize<List<PartnerCompanyListDto>>(dataProp.GetRawText(), jsonOpt);
                }
                else
                {
                    companies = JsonSerializer.Deserialize<List<PartnerCompanyListDto>>(content, jsonOpt);
                }
            }
             catch
            {
                 companies = JsonSerializer.Deserialize<List<PartnerCompanyListDto>>(content, jsonOpt);
            }

            if (companies == null)
                 return new ResponseResult<List<PartnerCompanyListDto>>("Failed to deserialize partner companies list", ApiStatusCode.BadRequest);

            return new ResponseResult<List<PartnerCompanyListDto>>(companies, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<PartnerCompanyListDto>>(ex.Message, ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<LoginResponseDto>> EmployeeChangeCompanyAsync(int companyId, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{EmployeeChangeCompanyUrl}{companyId}", Method.Get);
        AddCommonHeaders(request);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            var body = response.Content ?? "";

            if (!response.IsSuccessful)
            {
                string errorMsg = body;
                try
                {
                    using var doc = JsonDocument.Parse(body);
                    if (doc.RootElement.TryGetProperty("message", out var msg)) errorMsg = msg.GetString() ?? body;
                    else if (doc.RootElement.TryGetProperty("messages", out var msgs) && msgs.ValueKind == JsonValueKind.Array && msgs.GetArrayLength() > 0)
                        errorMsg = msgs[0].GetString() ?? body;
                }
                catch { }
                try { errorMsg = System.Text.RegularExpressions.Regex.Unescape(errorMsg); } catch { }

                return new ResponseResult<LoginResponseDto>(errorMsg, (int)response.StatusCode);
            }

            string? token = null;
            try
            {
                using var doc = JsonDocument.Parse(body);
                var root = doc.RootElement;

                if (root.ValueKind == JsonValueKind.Object)
                {
                    if (root.TryGetProperty("token", out var tokenProp))
                    {
                        token = tokenProp.GetString();
                    }
                    else if (root.TryGetProperty("data", out var dataProp))
                    {
                        if (dataProp.ValueKind == JsonValueKind.Object && dataProp.TryGetProperty("token", out var innerToken))
                        {
                            token = innerToken.GetString();
                        }
                        else if (dataProp.ValueKind == JsonValueKind.String)
                        {
                            token = dataProp.GetString();
                        }
                    }
                }
            }
            catch {}

            if (!string.IsNullOrEmpty(token))
            {
                return await ProcessLoginTokenAsync(token);
            }

            return new ResponseResult<LoginResponseDto>("Invalid response from GRC", ApiStatusCode.InternalServerError);
        }
        catch (Exception ex)
        {
            return new ResponseResult<LoginResponseDto>(ex.Message, ApiStatusCode.InternalServerError);
        }
    }

    public async Task<ResponseResult<List<EmployeeCompanyDto>>> GetEmployeeCompaniesAsync(int employeeId, int? pageIndex = null, int? pageSize = null, string searchTerm = "", CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{EmployeeCompaniesUrl}{employeeId}/Companies", Method.Get);
        AddCommonHeaders(request);

        if (pageIndex.HasValue)
            request.AddQueryParameter("pageIndex", pageIndex.Value.ToString());
        if (pageSize.HasValue)
            request.AddQueryParameter("pageSize", pageSize.Value.ToString());
        if (!string.IsNullOrEmpty(searchTerm))
            request.AddQueryParameter("searchTerm", searchTerm);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<List<EmployeeCompanyDto>>(UnescapeResponse(response.Content ?? "Failed to fetch employee companies"), (int)response.StatusCode);
            }

            var content = response.Content ?? "[]";
            var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            List<EmployeeCompanyDto>? companies = null;

            try
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
                {
                    companies = JsonSerializer.Deserialize<List<EmployeeCompanyDto>>(dataProp.GetRawText(), jsonOpt);
                }
                else
                {
                    companies = JsonSerializer.Deserialize<List<EmployeeCompanyDto>>(content, jsonOpt);
                }
            }
            catch
            {
                companies = JsonSerializer.Deserialize<List<EmployeeCompanyDto>>(content, jsonOpt);
            }

            if (companies == null)
                return new ResponseResult<List<EmployeeCompanyDto>>("Failed to deserialize employee companies", ApiStatusCode.BadRequest);

            return new ResponseResult<List<EmployeeCompanyDto>>(companies, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<EmployeeCompanyDto>>(ex.Message, ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<int>> GetEmployeeCompaniesCountAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{EmployeeUrl}{employeeId}/CompaniesCount", Method.Get);
        AddCommonHeaders(request);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<int>(UnescapeResponse(response.Content ?? "Failed to fetch employee companies count"), (int)response.StatusCode);
            }

            var content = response.Content ?? "0";
            int count = 0;

            try
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("value", out var valueProp) && valueProp.ValueKind == JsonValueKind.Number)
                {
                    count = valueProp.GetInt32();
                }
                else if (root.ValueKind == JsonValueKind.Number)
                {
                    count = root.GetInt32();
                }
            }
            catch
            {
                if (!int.TryParse(content.Trim(), out count))
                    count = 0;
            }

            return new ResponseResult<int>(count, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<int>(ex.Message, ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<List<EmployeeCompanyListDto>>> GetEmployeeCompaniesListAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest($"{EmployeeUrl}{employeeId}/CompaniesList", Method.Get);
        AddCommonHeaders(request);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<List<EmployeeCompanyListDto>>(UnescapeResponse(response.Content ?? "Failed to fetch employee companies list"), (int)response.StatusCode);
            }

            var content = response.Content ?? "[]";
            var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            List<EmployeeCompanyListDto>? companies = null;

            try
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
                {
                    companies = JsonSerializer.Deserialize<List<EmployeeCompanyListDto>>(dataProp.GetRawText(), jsonOpt);
                }
                else
                {
                    companies = JsonSerializer.Deserialize<List<EmployeeCompanyListDto>>(content, jsonOpt);
                }
            }
            catch
            {
                companies = JsonSerializer.Deserialize<List<EmployeeCompanyListDto>>(content, jsonOpt);
            }

            if (companies == null)
                return new ResponseResult<List<EmployeeCompanyListDto>>("Failed to deserialize employee companies list", ApiStatusCode.BadRequest);

            return new ResponseResult<List<EmployeeCompanyListDto>>(companies, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<List<EmployeeCompanyListDto>>(ex.Message, ApiStatusCode.BadRequest);
        }
    }

    public async Task<ResponseResult<EmployeeShortDataDto>> GetActiveEmployeeByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        var request = new RestRequest(ActiveByEmailUrl, Method.Get);
        request.AddQueryParameter("email", email);
        AddCommonHeaders(request);

        try
        {
            var response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
            {
                return new ResponseResult<EmployeeShortDataDto>(UnescapeResponse(response.Content ?? "Failed to fetch active employee by email"), (int)response.StatusCode);
            }

            var content = response.Content ?? "{}";
            var jsonOpt = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            EmployeeShortDataDto? employee = null;

            try
            {
                using var doc = JsonDocument.Parse(content);
                var root = doc.RootElement;
                if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var dataProp) && dataProp.ValueKind != JsonValueKind.Null)
                {
                    employee = JsonSerializer.Deserialize<EmployeeShortDataDto>(dataProp.GetRawText(), jsonOpt);
                }
                else
                {
                    employee = JsonSerializer.Deserialize<EmployeeShortDataDto>(content, jsonOpt);
                }
            }
            catch
            {
                employee = JsonSerializer.Deserialize<EmployeeShortDataDto>(content, jsonOpt);
            }

            if (employee == null)
                return new ResponseResult<EmployeeShortDataDto>("Failed to deserialize employee data", ApiStatusCode.BadRequest);

            return new ResponseResult<EmployeeShortDataDto>(employee, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<EmployeeShortDataDto>(ex.Message, ApiStatusCode.BadRequest);
        }
    }
    public async Task<ResponseResult<StringModel>> RedirectToGRCAsync(string token, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(token))
            return new ResponseResult<StringModel>("Token is required", ApiStatusCode.BadRequest);

        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token))
                return new ResponseResult<StringModel>("Invalid token format", ApiStatusCode.BadRequest);

        var request = new RestRequest(GrcLoginByTokenUrl, Method.Post);
        AddCommonHeaders(request);

        var payload = new { token };
        request.AddJsonBody(payload);

        RestResponse? response = null;
  
            response = await _restClient.ExecuteAsync(request, cancellationToken);
            if (!response.IsSuccessful)
                return new ResponseResult<StringModel>(
                    UnescapeResponse(response.Content ?? "Failed to get GRC token"),
                    ApiStatusCode.BadRequest);

            // بارس الـ token من الـ JSON response: {"token":"eyJ..."}
            var body = response.Content ?? "";
            string? grcToken = null;

            try
            {
                using var doc = JsonDocument.Parse(body);
                var root = doc.RootElement;

                if (root.TryGetProperty("token", out var tokenEl) && tokenEl.ValueKind == JsonValueKind.String)
                    grcToken = tokenEl.GetString();
                else if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == JsonValueKind.Object
                    && dataEl.TryGetProperty("token", out var t) && t.ValueKind == JsonValueKind.String)
                    grcToken = t.GetString();
            }
            catch
            {
                grcToken = UnescapeResponse(body);
            }

            if (string.IsNullOrWhiteSpace(grcToken))
                return new ResponseResult<StringModel>("No token returned from GRC", ApiStatusCode.BadRequest);

            string redirectUrl = $"{grcWebAuthUrl}?token={grcToken}";
            //string redirectUrl = $"https://localhost:64368/?token={grcToken}";
            
            return new ResponseResult<StringModel>(new StringModel { Value = redirectUrl }, ApiStatusCode.OK);
        }
        catch (Exception ex)
        {
            return new ResponseResult<StringModel>(ex.Message, ApiStatusCode.BadRequest);
        }
    }
}

