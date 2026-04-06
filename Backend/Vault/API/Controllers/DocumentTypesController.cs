using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Core.Repository;
using Core.DTOs.DocumentType;
using Api.Controllers;

namespace API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DocumentTypesController : BaseApiController
{
    private readonly IUnitOfWork _unitOfWork;

    public DocumentTypesController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DocumentTypeDto>>> GetAllDocumentTypes()
    {
        try
        {
            var tenantId = CurrentUser?.TenantId;
            var documentTypes = await _unitOfWork.DocumentTypes.FindAsync(x => x.TenantId == tenantId || x.TenantId == null);
            
            var documentTypeDtos = documentTypes
                .Where(dt => dt.IsActive)
                .Select(dt => new DocumentTypeDto
                {
                    Id = dt.Id!,
                    Code = dt.Code,
                    NameAr = dt.NameAr,
                    NameEn = dt.NameEn,
                    Description = dt.Description,
                    Icon = dt.Icon,
                    IsActive = dt.IsActive
                })
                .ToList();

            return Ok(documentTypeDtos);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving document types", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DocumentTypeDto>> GetDocumentTypeById(string id)
    {
        try
        {
            var documentType = await _unitOfWork.DocumentTypes.GetByIdAsync(id);
            
            if (documentType == null)
            {
                return NotFound(new { message = "Document type not found" });
            }

            var tenantId = CurrentUser?.TenantId;
            if (documentType.TenantId != null && documentType.TenantId != tenantId)
            {
                return NotFound(new { message = "Document type not found" });
            }

            var dto = new DocumentTypeDto
            {
                Id = documentType.Id!,
                Code = documentType.Code,
                NameAr = documentType.NameAr,
                NameEn = documentType.NameEn,
                Description = documentType.Description,
                Icon = documentType.Icon,
                IsActive = documentType.IsActive
            };

            return Ok(dto);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error retrieving document type", error = ex.Message });
        }
    }
    [HttpPost]
    public async Task<ActionResult<DocumentTypeDto>> CreateDocumentType(CreateDocumentTypeDto dto)
    {
        try
        {
            var documentType = new Core.Entities.DocumentType
            {
                TenantId = CurrentUser?.TenantId,
                Code = !string.IsNullOrEmpty(dto.Code) ? dto.Code : (!string.IsNullOrEmpty(dto.NameEn) ? dto.NameEn.ToLower().Replace(" ", "_") : Guid.NewGuid().ToString()),
                NameAr = dto.NameAr ?? string.Empty,
                NameEn = dto.NameEn ?? string.Empty,
                Description = dto.Description,
                Icon = dto.Icon,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.DocumentTypes.AddAsync(documentType);
            
            var result = new DocumentTypeDto
            {
                Id = documentType.Id!,
                Code = documentType.Code,
                NameAr = documentType.NameAr,
                NameEn = documentType.NameEn,
                Description = documentType.Description,
                Icon = documentType.Icon,
                IsActive = documentType.IsActive
            };

            return CreatedAtAction(nameof(GetDocumentTypeById), new { id = documentType.Id }, result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error creating document type", error = ex.Message });
        }
    }
}
