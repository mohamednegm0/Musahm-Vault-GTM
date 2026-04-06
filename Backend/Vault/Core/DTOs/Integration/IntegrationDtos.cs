using System.ComponentModel.DataAnnotations;
using Core.DTOs.Workspace;

namespace Core.DTOs.Integration;

// ─────────────────────────────────────────────────────────────
// Request: إنشاء workspace داخل workspace أخرى مع ملفات
// ─────────────────────────────────────────────────────────────

/// <summary>
/// طلب إنشاء sub-workspace داخل workspace أخرى مع رفع مجموعة ملفات داخلها
/// </summary>
public class CreateSubWorkspaceWithFilesRequest
{
    /// <summary>
    /// نوع الـ Workspace الأب (Parent Type)
    /// </summary>
    [Required]
    public string WorkspaceType { get; set; } = string.Empty;

    /// <summary>
    /// اسم الـ Sub-Workspace الجديدة
    /// </summary>
    [Required]
    [MinLength(3)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// الوصف
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// نوع الـ Workspace
    /// </summary>
    public string Type { get; set; } = "folder";

    /// <summary>
    /// إعدادات الـ Workspace
    /// </summary>
    public WorkspaceSettingsDto? Settings { get; set; }

    /// <summary>
    /// الملفات المراد رفعها داخل الـ Sub-Workspace
    /// </summary>
    public List<SubWorkspaceFileDto> Files { get; set; } = new();
}

/// <summary>
/// بيانات ملف واحد يُرفع ضمن الـ Sub-Workspace
/// </summary>
public class SubWorkspaceFileDto
{
    /// <summary>
    /// عنوان الوثيقة
    /// </summary>
    [Required]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// نوع الوثيقة
    /// </summary>
    public string DocumentType { get; set; } = string.Empty;

    /// <summary>
    /// حالة الوثيقة
    /// </summary>
    public string Status { get; set; } = "Active";

    /// <summary>
    /// Tags الوثيقة
    /// </summary>
    public List<string> Tags { get; set; } = new();
}

// ─────────────────────────────────────────────────────────────
// Response: نتيجة إنشاء Sub-Workspace مع الملفات
// ─────────────────────────────────────────────────────────────

/// <summary>
/// نتيجة إنشاء Sub-Workspace مع قائمة الوثائق المُنشأة
/// </summary>
public class CreateSubWorkspaceWithFilesResult
{
    /// <summary>
    /// بيانات الـ Workspace الجديدة
    /// </summary>
    public SubWorkspaceSummary Workspace { get; set; } = new();

    /// <summary>
    /// الوثائق التي تم إنشاؤها
    /// </summary>
    public List<SubWorkspaceDocumentSummary> CreatedDocuments { get; set; } = new();

    /// <summary>
    /// عدد الوثائق التي نجح إنشاؤها
    /// </summary>
    public int SuccessCount { get; set; }

    /// <summary>
    /// عدد الوثائق التي فشل إنشاؤها
    /// </summary>
    public int FailedCount { get; set; }
}

public class SubWorkspaceSummary
{
    public string? Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? ParentId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SubWorkspaceDocumentSummary
{
    public string? Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsUploaded { get; set; }
    public string? ErrorMessage { get; set; }
}
