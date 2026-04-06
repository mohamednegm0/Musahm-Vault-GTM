using System.ComponentModel.DataAnnotations;
using System.Linq;
using Core.DTOs;
using Core.DTOs.DocumentAcl;
using Core.Entities;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Mvc;
using Core.Interfaces.Service;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DocumentAclsController(IDocumentAclService service, IUserMapService userMapService, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IDocumentAclService _service = service;
    private readonly IUserMapService _userMapService = userMapService;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<object>>> GetAll([FromQuery] string? document_id)
    {
        if (!string.IsNullOrEmpty(document_id))
        {
            return Ok(await _service.GetDetailsByDocumentIdAsync(document_id));
        }
        return Ok(await _service.GetAllAsync());
    }

    [HttpPut]
    public async Task<ActionResult<ResponseResult<string>>> Update([FromBody] CreateDocumentAclDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<DocumentAcl>(errorMessage, ApiStatusCode.BadRequest));
        }

        await _service.UpdatePermissionAsync(dto.DocumentId!, dto.UserId!, dto.Permission ?? "", CurrentUser.UserId ?? "", CurrentUser.TenantId ?? "");
        return Ok(new ResponseResult<string>("Updated successfully", ApiStatusCode.OK));
    }

    [HttpPost]
    public async Task<ActionResult<ResponseResult<DocumentAcl>>> Create([FromBody] CreateDocumentAclDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<DocumentAcl>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entity = new DocumentAcl
        {
            DocumentId = dto.DocumentId,
            Permission = "viewer", // Defaulting to viewer since permission level was removed from backend
            CreatedAt = DateTime.UtcNow,
            CreatedBy = CurrentUser.UserId,
            TenantId = CurrentUser.TenantId
        };

        await _service.CreateAsync(entity, dto.GrcUserId, dto.GrcUserType);
        return Ok(new ResponseResult<DocumentAcl>(entity, ApiStatusCode.OK));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        await _service.DeleteAsync(id, CurrentUser.UserId ?? "", CurrentUser.TenantId ?? ""); 
        return Ok(new ResponseResult<string>("Deleted successfully", ApiStatusCode.OK)); 
    }
}