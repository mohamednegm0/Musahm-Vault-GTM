using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.Login;
using Core.DTOs.Register;
using Core.DTOs.Account;
using Core.DTOs.Country;
using static Core.Constants.ConstAppConfiguration;
using Core.DTOs.GRC;
using Microsoft.AspNetCore.Authorization;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IGRCService grcService, IServiceProvider serviceProvider) : ControllerBase
{
    private readonly IGRCService _grcService = grcService;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpPost("login")]
    public async Task<ActionResult<ResponseResult<LoginResponseDto>>> Login([FromBody] LoginRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<LoginResponseDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _grcService.LoginAsync(request));
    }

    [HttpPost("LoginByToken")]
    public async Task<ActionResult<ResponseResult<LoginResponseDto>>> LoginByToken([FromBody] LoginByTokenRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<LoginResponseDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _grcService.LoginByTokenAsync(request.Token));
    }

    [HttpPost("adminlogin")]
    public async Task<ActionResult<ResponseResult<LoginResponseDto>>> AdminLogin([FromBody] AdminLoginRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<LoginResponseDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _grcService.AdminLoginAsync(request));
    }

    [HttpPost("adminpartnerlogin")]
    public async Task<ActionResult<ResponseResult<LoginResponseDto>>> AdminPartnerLogin([FromBody] AdminPartnerLoginRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<LoginResponseDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _grcService.AdminPartnerLoginAsync(request));
    }

    [HttpPost("partnerlogin")]
    public async Task<ActionResult<ResponseResult<PartnerLoginResponseDto>>> PartnerLogin([FromBody] PartnerLoginRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<PartnerLoginResponseDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _grcService.PartnerLoginAsync(request));
    }

    [HttpPost("register")]
    public async Task<ActionResult<ResponseResult<StringModel>>> Register([FromBody] RegisterRequestDto input)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(input, new ValidationContext(input, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<StringModel>(errorMessage, ApiStatusCode.BadRequest));
        }

        var payload = new RegisterPayloadDto
        {
            CompanyNameAr = input.CompanyNameAr,
            CompanyNameEn = input.CompanyNameEn,

            EmployeeModel = new RegisterEmployeeDto
            {
                NameAr = input.FullNameAr,
                NameEn = input.FullNameEn,
                Email = input.Email,
                MobileNumber = null,
                MobileCountryCode = null,
                IdentityNumber = null,
                CompanyName = input.CompanyNameEn,
                Password = input.Password,
                ConfirmPassword = input.ConfirmPassword,
                // IsMain = true,
                // IsActive = true,
                CreatedDate = DateTime.UtcNow,
                // IsTwoFactorAuthentication = true,
                // IsAbsherDefaultOtp = true,
                // AuthorizationLetterPath = "",
                // AuthorizationLetterFile = "",
                // AuthorizationLetterFileName = ""
            }
        };

        return Ok(await _grcService.RegisterAsync(payload));
    }

    [HttpPost("forget-password")]
    public async Task<ActionResult<ResponseResult<StringModel>>> ForgetPassword([FromBody] ForgetPasswordRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<StringModel>(errorMessage, ApiStatusCode.BadRequest));
        }
        return Ok(await _grcService.ForgetPasswordAsync(request));
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<ResponseResult<StringModel>>> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<StringModel>(errorMessage, ApiStatusCode.BadRequest));
        }
        return Ok(await _grcService.ResetPasswordAsync(request));
    }

    [HttpPost("VerifyOTP")]
    public async Task<ActionResult<ResponseResult<LoginResponseDto>>> VerifyOTP([FromBody] VerifyOtpRequestDto request)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(request, new ValidationContext(request, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<LoginResponseDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _grcService.VerifyOtpAsync(request));
    }


    [HttpGet("Countries")]
    public async Task<ActionResult<ResponseResult<List<CountryDto>>>> GetCountries(CancellationToken cancellationToken)
    {
        var result = await _grcService.GetCountriesAsync(cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("GRCActiveCompany")]
    public async Task<ActionResult<ResponseResult<List<GRCActiveCompanyDto>>>> GetGRCActiveCompany(CancellationToken cancellationToken)
    {
        var result = await _grcService.GetGRCActiveCompanyAsync(cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [HttpGet("ActiveByEmail")]
    public async Task<ActionResult<ResponseResult<EmployeeShortDataDto>>> GetActiveEmployeeByEmail([FromQuery] string email, CancellationToken cancellationToken)
    {
        var result = await _grcService.GetActiveEmployeeByEmailAsync(email, cancellationToken);
        return StatusCode(result.ApiStatusCode, result);
    }

    [Authorize]
    [HttpPost("RedirectToGRC")]
    public async Task<ActionResult<ResponseResult<TokenDto>>> RedirectToGRC(CancellationToken cancellationToken)
    {
        string token = HttpContext.Request.Headers["Authorization"]
            .ToString()
            .Replace("Bearer ", "");

        if (string.IsNullOrWhiteSpace(token))
            return BadRequest(new ResponseResult<TokenDto>("Invalid or missing token.", ApiStatusCode.BadRequest));

        var result = await _grcService.RedirectToGRCAsync(token, cancellationToken);

        return StatusCode(result.ApiStatusCode, result);
    }
}

