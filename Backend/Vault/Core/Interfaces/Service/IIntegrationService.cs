using Core.DTOs.Integration;

namespace Core.Interfaces.Service;

/// <summary>
/// Interface للتكامل مع الأنظمة الخارجية (GRC وغيرها)
/// </summary>
public interface IIntegrationService
{
    /// <summary>
    /// إنشاء Sub-Workspace داخل Workspace موجودة مع رفع مجموعة من الملفات داخلها
    /// </summary>
    /// <param name="request">بيانات الطلب</param>
    /// <param name="fileStreams">
    /// قائمة بالـ (Stream, FileName) لكل ملف مرفوع.
    /// الـ Controller هو المسؤول عن تحويل IFormFile لـ streams قبل تمريرها هنا.
    /// </param>
    /// <param name="currentUser">المستخدم الحالي</param>
    /// <param name="cancellationToken"></param>
    Task<ResponseResult<CreateSubWorkspaceWithFilesResult>> CreateSubWorkspaceWithFilesAsync(
        CreateSubWorkspaceWithFilesRequest request,
        IEnumerable<(Stream FileStream, string FileName)> fileStreams,
        CurrentUser currentUser,
        CancellationToken cancellationToken = default);
}
