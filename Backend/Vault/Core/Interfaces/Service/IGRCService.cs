using Core.DTOs.Country;
using Core.DTOs.User;
using Core.DTOs.GRC;
using Core.DTOs.Login;
using System.Threading;
namespace Core.Interfaces.Service;

public interface IGRCService
{
    Task<ResponseResult<LoginResponseDto>> LoginAsync(LoginRequestDto request);
    Task<ResponseResult<LoginResponseDto>> LoginByTokenAsync(string token, CancellationToken cancellationToken = default);
    Task<ResponseResult<StringModel>> RegisterAsync(RegisterPayloadDto payload, CancellationToken cancellationToken = default);
    Task<ResponseResult<StringModel>> ForgetPasswordAsync(ForgetPasswordRequestDto request, CancellationToken cancellationToken = default);
    Task<ResponseResult<StringModel>> ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken cancellationToken = default);
    Task<ResponseResult<bool>> CreateUserAsync(CreateUserDto payload, CurrentUser currentUser, CancellationToken cancellationToken = default);
    Task<ResponseResult<List<CountryDto>>> GetCountriesAsync(CancellationToken cancellationToken = default);
    Task<ResponseResult<UserProfileDto>> GetProfileAsync(CancellationToken cancellationToken = default);
    Task<ResponseResult<StringModel>> UpdateProfileAsync(UserProfileDto request, CancellationToken cancellationToken = default);
    Task<ResponseResult<StringModel>> ChangePasswordAsync(ChangePasswordRequestDto request, CancellationToken cancellationToken = default);
    Task<ResponseResult<IEnumerable<CompanyUserDto>>> GetUsersAsync(CancellationToken cancellationToken = default);
    Task<ResponseResult<UserProfileDto>> GetExternalUserProfileAsync(int id, string type, CancellationToken cancellationToken = default);

    Task<ResponseResult<ExternalEmployeeDto>> GetEmployeeAsync(int id, string? token = null, CancellationToken cancellationToken = default);
    Task<ResponseResult<EmployeeShortDataDto>> GetActiveEmployeeByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<ResponseResult<ExternalPartnerDto>> GetPartnerAsync(int id, string? token = null, CancellationToken cancellationToken = default);
    Task<ResponseResult<bool>> UpdateExternalUserAsync(UpdateExternalUserDto payload, string? token = null, CancellationToken cancellationToken = default);
    Task<ResponseResult<List<GRCActiveCompanyDto>>> GetGRCActiveCompanyAsync(CancellationToken cancellationToken = default);
    Task<ResponseResult<LoginResponseDto>> AdminLoginAsync(AdminLoginRequestDto request);
    Task<ResponseResult<LoginResponseDto>> AdminPartnerLoginAsync(AdminPartnerLoginRequestDto request);
    Task<ResponseResult<PartnerLoginResponseDto>> PartnerLoginAsync(PartnerLoginRequestDto request);
    Task<ResponseResult<LoginResponseDto>> VerifyOtpAsync(VerifyOtpRequestDto request);
    Task<ResponseResult<LoginResponseDto>> PartnerChangeCompanyAsync(int companyId, CancellationToken cancellationToken = default);
    Task<ResponseResult<LoginResponseDto>> AdminAsEmployeeChangeCompanyAsync(int companyId, CancellationToken cancellationToken = default);
    Task<ResponseResult<List<PartnerCompanyDto>>> GetPartnerCompaniesAsync(int partnerId, int? pageIndex = null, int? pageSize = null, string searchTerm = "", CancellationToken cancellationToken = default);
    Task<ResponseResult<int>> GetPartnerCompaniesCountAsync(int partnerId, CancellationToken cancellationToken = default);
    Task<ResponseResult<List<PartnerCompanyListDto>>> GetPartnerCompaniesListAsync(int partnerId, CancellationToken cancellationToken = default);

    Task<ResponseResult<LoginResponseDto>> EmployeeChangeCompanyAsync(int companyId, CancellationToken cancellationToken = default);
    Task<ResponseResult<List<EmployeeCompanyDto>>> GetEmployeeCompaniesAsync(int employeeId, int? pageIndex = null, int? pageSize = null, string searchTerm = "", CancellationToken cancellationToken = default);
    Task<ResponseResult<int>> GetEmployeeCompaniesCountAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<ResponseResult<List<EmployeeCompanyListDto>>> GetEmployeeCompaniesListAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<ResponseResult<StringModel>> RedirectToGRCAsync(string token, CancellationToken cancellationToken = default);
}
