using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Core.DTOs;
using Core.DTOs.Invitation;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class InvitationsController(IInvitationService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IInvitationService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet("document/{documentId}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<InvitationDetailsDto>>>> GetByDocument(string documentId) => Ok(await _service.GetByDocumentIdAsync(documentId));

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<InvitationDetailsDto>>> Get(string id) => Ok(await _service.GetByIdAsync(id));

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<InvitationDetailsDto>>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpPost]
    public async Task<ActionResult<ResponseResult<bool>>> Create([FromBody] CreateInvitationDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<bool>(errorMessage, ApiStatusCode.BadRequest));
        }

        try 
        {
             var result = await _service.CreateInvitationsAsync(dto, CurrentUser.UserId!, CurrentUser.TenantId!);
             return Ok(result);
        }
        catch (Exception ex)
        {
            return Ok(new ResponseResult<bool>(ex.Message, ApiStatusCode.BadRequest));
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<object>>> Delete(string id) 
    { 
        try
        {
            var result = await _service.DeleteAsync(id);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return Ok(new ResponseResult<object>(ex.Message, ApiStatusCode.BadRequest));
        }
    }

    [HttpGet("pending")]
    public async Task<ActionResult<ResponseResult<IEnumerable<InvitationDetailsDto>>>> GetPending()
    {
        return Ok(await _service.GetPendingAsync());
    }

    [HttpPost("{id}/accept")]
    public async Task<ActionResult<ResponseResult<string>>> Accept(string id)
    {
        await _service.AcceptAsync(id, CurrentUser.UserId!);
        return Ok(new ResponseResult<string>("Accepted successfully", ApiStatusCode.OK));
    }

    [AllowAnonymous]
    [HttpPost("generate-otp")]
    public async Task<ActionResult<ResponseResult<object>>> GenerateOtp([FromBody] GenerateOtpDto dto)
    {
        try 
        {
             var responseResult = await _service.GenerateOtpAsync(dto.InvitationId, dto.Email);
             return Ok(responseResult);
        }
        catch (Exception ex)
        {
             return Ok(new ResponseResult<object>(ex.Message, ApiStatusCode.BadRequest));
        }
    }

    [AllowAnonymous]
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto dto)
    {
        try 
        {
             var (stream, fileName, contentType) = await _service.VerifyOtpAsync(dto.InvitationId, dto.Email, dto.Otp);

             var encodedFileName = Uri.EscapeDataString(fileName);
             Response.Headers.Append("Content-Disposition", $"inline; filename*=UTF-8''{encodedFileName}");
             
             return File(stream, contentType);
        }
        catch (System.IO.FileNotFoundException)
        {
             return NotFound(new ResponseResult<string>("Invitation or file not found", ApiStatusCode.NotFound));
        }
        catch (Exception ex)
        {
             return BadRequest(new ResponseResult<string>(ex.Message, ApiStatusCode.BadRequest));
        }
    }


    [HttpPost("{id}/decline")]
    public async Task<ActionResult<ResponseResult<string>>> Decline(string id)
    {
        await _service.DeclineAsync(id);
        return Ok(new ResponseResult<string>("Declined successfully", ApiStatusCode.OK));
    }
}