using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.DocumentVersion;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DocumentVersionsController(IDocumentVersionService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IDocumentVersionService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<DocumentVersion>>>> GetAll([FromQuery] string? documentId = null) => Ok(await _service.GetAllAsync(documentId));

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<DocumentVersion>>> Get(string id) => Ok(await _service.GetByIdAsync(id));

    [HttpPost("uploadDocumentVersion")]
    public async Task<ActionResult<ResponseResult<DocumentVersion>>> UploadDocumentVersion(IFormFile file, [FromForm] string documentId)
    {
        if (file == null || file.Length == 0) 
            return Ok(new ResponseResult<DocumentVersion>("File is empty.", ApiStatusCode.BadRequest));

        var result = await _service.UploadDocumentVersionAsync(documentId, file.OpenReadStream(), file.FileName, CurrentUser.UserId!, CurrentUser.TenantId!);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<StringModel>>> Delete(string id) 
    {
         return Ok(await _service.DeleteAsync(id));
    }

    [HttpGet("{id}/download")]
    public async Task<IActionResult> Download(string id)
    {
        try 
        {
            var (stream, fileName, contentType) = await _service.DownloadAsync(id);
            return File(stream, contentType ?? "application/octet-stream", fileName);
        }
        catch (System.IO.FileNotFoundException)
        {
            return NotFound();
        }
    }

}