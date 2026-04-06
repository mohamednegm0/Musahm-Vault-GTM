using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.DTOs;
using Core.DTOs.Identity;

namespace Core.Interfaces.Service;

public interface IRecycleBinService
{
    Task<ResponseResult<IEnumerable<RecycleBinItemDto>>> GetDeletedItemsAsync(CurrentUser currentUser);
    Task<ResponseResult<StringModel>> RestoreItemAsync(string itemType, string id, CurrentUser currentUser);
    Task<ResponseResult<StringModel>> HardDeleteItemAsync(string itemType, string id, CurrentUser currentUser);
    Task<ResponseResult<StringModel>> EmptyRecycleBinAsync(CurrentUser currentUser);
}

public class RecycleBinItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string ItemType { get; set; } = string.Empty; // "Workspace", "Folder", "Document"
    public string? DeletedBy { get; set; }
    public string? DeletedByName { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? ParentId { get; set; }
}
