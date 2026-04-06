using Core.DTOs;
using Core.DTOs.Integration;
using Core.Interfaces.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static Core.Constants.ConstAppConfiguration;

namespace Api.Controllers;

/// <summary>
/// Integration Controller — نقطة الدخول لعمليات التكامل مع الأنظمة الخارجية (GRC وغيرها).
/// يُعيد استخدام الـ services الموجودة (WorkspaceService + DocumentService) عبر call واحدة.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IntegrationController(IIntegrationService integrationService) : BaseApiController
{
    private readonly IIntegrationService _integrationService = integrationService;

    // ─────────────────────────────────────────────────────────────────────────
    // POST api/Integration/workspace/sub-with-files
    // ─────────────────────────────────────────────────────────────────────────

    /// <summary>
    /// إنشاء Sub-Workspace داخل Workspace موجودة ورفع مجموعة ملفات داخلها — كل ده في call واحدة.
    ///
    /// الـ Request: multipart/form-data
    ///   - ParentWorkspaceId   (required) — معرف الـ Workspace الأب
    ///   - Name                (required) — اسم الـ Sub-Workspace (3 أحرف على الأقل)
    ///   - Description         (optional) — الوصف
    ///   - Type                (optional) — النوع، الافتراضي: "folder"
    ///   - files[]             (optional) — الملفات المرفقة
    ///   - FilesMeta[i].Title        (optional) — عنوان الملف رقم i
    ///   - FilesMeta[i].DocumentType (optional) — نوع الوثيقة
    ///   - FilesMeta[i].Status       (optional) — الحالة (Default: Active)
    ///   - FilesMeta[i].Tags[]       (optional) — Tags
    /// </summary>
    [HttpPost("workspace/sub-with-files")]
    public async Task<ActionResult<ResponseResult<CreateSubWorkspaceWithFilesResult>>> CreateSubWorkspaceWithFiles([FromForm] CreateSubWorkspaceWithFilesFormRequest formRequest, IFormFileCollection files, CancellationToken cancellationToken)
    {
        // ── Validation ───────────────────────────────────────────────────────
        if (string.IsNullOrWhiteSpace(formRequest.WorkspaceType))
            return Ok(new ResponseResult<CreateSubWorkspaceWithFilesResult>("WorkspaceType is required.", ApiStatusCode.BadRequest));

        if (string.IsNullOrWhiteSpace(formRequest.Name) || formRequest.Name.Length < 3)
            return Ok(new ResponseResult<CreateSubWorkspaceWithFilesResult>("Name must be at least 3 characters.", ApiStatusCode.BadRequest));

        // ── تحويل IFormFile إلى (Stream, FileName) قبل تمريرها للـ Service ──
        var fileStreams = files.Select(f => (FileStream: f.OpenReadStream(), FileName: f.FileName)).ToList<(Stream FileStream, string FileName)>();

        var request = new CreateSubWorkspaceWithFilesRequest
        {
            WorkspaceType = formRequest.WorkspaceType,
            Name          = formRequest.Name,
            Description   = formRequest.Description ?? string.Empty,
            Type          = formRequest.Type ?? "folder",
            Files         = formRequest.FilesMeta ?? new List<SubWorkspaceFileDto>()
        };

        var result = await _integrationService.CreateSubWorkspaceWithFilesAsync(request, fileStreams, CurrentUser, cancellationToken);
        if (!result.IsSucceeded)
            return this.StatusCode(result.ApiStatusCode, result.ErrorMessage);

        return Ok(result);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Form Request DTO (multipart/form-data)
// ─────────────────────────────────────────────────────────────────────────────

/// <summary>
/// DTO لاستقبال بيانات الـ multipart/form-data في الـ IntegrationController.
/// يفصل بين المعلومات الأساسية والملفات وبياناتها.
/// </summary>
public class CreateSubWorkspaceWithFilesFormRequest
{
    /// <summary>نوع الـ Workspace الأب</summary>
    public string WorkspaceType { get; set; } = string.Empty;

    /// <summary>اسم الـ Sub-Workspace (3 أحرف على الأقل)</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>الوصف (اختياري)</summary>
    public string? Description { get; set; }

    /// <summary>النوع (folder, etc.) — الافتراضي: folder</summary>
    public string? Type { get; set; } = "folder";

    /// <summary>
    /// Metadata للملفات — اختياري.
    /// كل عنصر يتوافق مع ملف واحد في نفس الترتيب.
    /// إذا لم تُرسل، يُستخدم اسم الملف كعنوان للوثيقة.
    /// </summary>
    public List<SubWorkspaceFileDto>? FilesMeta { get; set; }
}
