using System.Collections.Generic;
using System.IO;

namespace Service.Helpers;

public static class MimeTypes
{
    private static readonly Dictionary<string, string> _mappings = new(System.StringComparer.OrdinalIgnoreCase)
    {
        { ".pdf", "application/pdf" },
        { ".doc", "application/msword" },
        { ".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
        { ".xls", "application/vnd.ms-excel" },
        { ".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
        { ".png", "image/png" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".gif", "image/gif" },
        { ".csv", "text/csv" },
        { ".txt", "text/plain" },
        { ".json", "application/json" },
        { ".zip", "application/zip" }
    };

    public static string GetMimeType(string fileName)
    {
        var extension = Path.GetExtension(fileName);
        return _mappings.TryGetValue(extension, out var mimeType) ? mimeType : "application/octet-stream";
    }
}
