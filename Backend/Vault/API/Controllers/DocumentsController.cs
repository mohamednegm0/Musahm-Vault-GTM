using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.Document;
using Microsoft.AspNetCore.Authorization;
using static Core.Constants.ConstAppConfiguration;
using static Core.Constants.ConstPermissions;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController(IDocumentService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IDocumentService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    [Authorize(Policy = Documents.View)]
    public async Task<ActionResult<ResponseResult<IEnumerable<DocumentDetailsDto>>>> Get()
    {
        return Ok(await _service.GetAllAsync(CurrentUser));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<DocumentDetailsDto>>> Get(string id)
    {
        return Ok(await _service.GetByIdAsync(id, CurrentUser));
    }

    [HttpGet("workspace/{workspaceId}")]
    public async Task<ActionResult<ResponseResult<IEnumerable<DocumentDetailsDto>>>> GetByWorkspace(string workspaceId)
    {
        return Ok(await _service.GetByWorkspaceIdAsync(workspaceId, CurrentUser));
    }

    [HttpPost("uploadDocument")]
    [Authorize(Policy = Documents.Create)]
    public async Task<ActionResult<ResponseResult<Document>>> UploadDocument([FromForm] CreateDocumentDto dto, IFormFile file)
    {
        if (file == null || file.Length == 0) 
            return Ok(new ResponseResult<Document>("File is empty.", ApiStatusCode.BadRequest));

        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<Document>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _service.UploadDocumentAsync(dto, file.OpenReadStream(), file.FileName, CurrentUser));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = Documents.Edit)]
    public async Task<ActionResult<ResponseResult<Document>>> Put(string id, [FromBody] UpdateDocumentDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<Document>(errorMessage, ApiStatusCode.BadRequest));
        }

        return Ok(await _service.UpdateAsync(id, dto, CurrentUser));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = Documents.Delete)]
    public async Task<ActionResult<ResponseResult<StringModel>>> Delete(string id)
    {
        return Ok(await _service.DeleteAsync(id, CurrentUser));
    }

    [HttpGet("{id}/download")]
    [Authorize(Policy = Documents.Download)]
    public async Task<IActionResult> Download(string id)
    {
        try 
        {
            var (stream, fileName, contentType) = await _service.DownloadAsync(id, CurrentUser);
            return File(stream, contentType ?? "application/octet-stream", fileName);
        }
        catch (System.IO.FileNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("{id}/preview")]
    public async Task<IActionResult> Preview(string id)
    {
        try 
        {
            var (stream, fileName, contentType) = await _service.DownloadAsync(id, CurrentUser, true);
            
            // Set Content-Disposition to inline so the browser attempts to render it (e.g. PDF view) 
            // instead of downloading it.
            // NOTE: Kestrel does not allow non-ASCII characters in headers.
            // We must use RFC 5987 encoding (filename*=UTF-8'') for filenames with non-ASCII characters (e.g. Arabic).
            var encodedFileName = Uri.EscapeDataString(fileName);
            Response.Headers.Append("Content-Disposition", $"inline; filename*=UTF-8''{encodedFileName}");

            return File(stream, contentType ?? "application/octet-stream");
        }
        catch (System.IO.FileNotFoundException)
        {
            return NotFound();
        }
    }

}
