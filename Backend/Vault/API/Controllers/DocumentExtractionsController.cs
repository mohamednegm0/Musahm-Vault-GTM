using System.ComponentModel.DataAnnotations;
using Core.DTOs;
using Core.DTOs.DocumentExtraction;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DocumentExtractionsController(IDocumentExtractionService service, IServiceProvider serviceProvider) : BaseApiController
{
    private readonly IDocumentExtractionService _service = service;
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    [HttpGet]
    public async Task<ActionResult<ResponseResult<IEnumerable<DocumentExtractionDto>>>> GetAll()
    {
        return Ok(await _service.GetAllAsync());
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ResponseResult<DocumentExtractionDto>>> Get(string id)
    {
        return Ok(await _service.GetByIdAsync(id));
    }

    [HttpPost]
    public async Task<ActionResult<ResponseResult<DocumentExtractionDto>>> Create([FromBody] CreateDocumentExtractionDto dto)
    {
        var validationResults = new List<ValidationResult>();
        if (!Validator.TryValidateObject(dto, new ValidationContext(dto, _serviceProvider, null), validationResults, true))
        {
            var errorMessage = string.Join("; ", validationResults.Select(v => v.ErrorMessage));
            return Ok(new ResponseResult<DocumentExtractionDto>(errorMessage, ApiStatusCode.BadRequest));
        }

        var entity = new DocumentExtraction
        {
            DocumentId = dto.DocumentId,
            DocumentType = dto.DocumentType,
            Confidence = dto.Confidence,
            CreatedAt = DateTime.UtcNow,
            TenantId = CurrentUser.TenantId,
            CreatedBy = CurrentUser.UserId
        };

        await _service.CreateAsync(entity);
        return Ok(new ResponseResult<DocumentExtractionDto>(MapToDto(entity), ApiStatusCode.OK));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ResponseResult<string>>> Delete(string id) 
    { 
        await _service.DeleteAsync(id); 
        return Ok(new ResponseResult<string>("Deleted successfully", ApiStatusCode.OK)); 
    }

    [HttpGet("pending")]
    public async Task<ActionResult<ResponseResult<IEnumerable<DocumentExtractionDto>>>> GetPending()
    {
        return Ok(await _service.GetPendingAsync());
    }

    [HttpPut("{id}/approve")]
    public async Task<ActionResult<ResponseResult<string>>> Approve(string id)
    {
        await _service.ApproveAsync(id);
        return Ok(new ResponseResult<string>("Approved successfully", ApiStatusCode.OK));
    }

    [HttpPost("extract/{documentId}")]
    public async Task<ActionResult<ResponseResult<DocumentExtractionDto>>> Extract(string documentId)
    {
        var result = await _service.ExtractDocumentAsync(documentId, CurrentUser.UserId!, CurrentUser.TenantId!);
        return Ok(new ResponseResult<DocumentExtractionDto>(MapToDto(result.ReturnData!), ApiStatusCode.OK));
    }

    [HttpPut("{id}/reject")]
    public async Task<ActionResult<ResponseResult<string>>> Reject(string id)
    {
        await _service.RejectAsync(id);
        return Ok(new ResponseResult<string>("Rejected successfully", ApiStatusCode.OK));
    }

    private static DocumentExtractionDto MapToDto(DocumentExtraction entity)
    {
        return new DocumentExtractionDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            DocumentId = entity.DocumentId,
            DocumentType = entity.DocumentType,
            Confidence = entity.Confidence,
            Fields = entity.Fields == null ? null : MongoDB.Bson.BsonTypeMapper.MapToDotNetValue(entity.Fields),
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy
        };
    }
}