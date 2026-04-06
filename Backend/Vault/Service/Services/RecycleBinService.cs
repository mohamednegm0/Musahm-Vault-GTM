using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Core.DTOs;
using Core.DTOs.Identity;
using Core.Interfaces.Service;
using Core.Interfaces;
using Core.Constants;
using Microsoft.AspNetCore.Http;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Driver.GridFS;

namespace Service.Services;

public class RecycleBinService : IRecycleBinService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJsonLocalizationService _localizationService;
    private readonly IAuditLogService _auditLogService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IGridFSBucket _gridFS;

    public RecycleBinService(IUnitOfWork unitOfWork, IJsonLocalizationService localizationService, IAuditLogService auditLogService, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _localizationService = localizationService;
        _auditLogService = auditLogService;
        _httpContextAccessor = httpContextAccessor;
        _gridFS = new GridFSBucket(_unitOfWork.Database);
    }

    public async Task<ResponseResult<IEnumerable<RecycleBinItemDto>>> GetDeletedItemsAsync(CurrentUser currentUser)
    {
        var deletedWorkspaces = await _unitOfWork.Workspaces.FindAsync(w => w.TenantId == currentUser.TenantId && w.IsDeleted);
        var deletedDocuments = await _unitOfWork.Documents.FindAsync(d => d.TenantId == currentUser.TenantId && d.IsDeleted);

        var items = new List<RecycleBinItemDto>();

        var userIdsToFetch = new HashSet<string>();

        foreach (var w in deletedWorkspaces)
        {
            items.Add(new RecycleBinItemDto
            {
                Id = w.Id!,
                Name = w.Name,
                ItemType = string.Equals(w.Type, "Folder", StringComparison.OrdinalIgnoreCase) ? "Folder" : "Workspace",
                DeletedAt = w.DeletedAt,
                DeletedBy = w.DeletedBy,
                ParentId = w.ParentId
            });
            if (!string.IsNullOrEmpty(w.DeletedBy)) userIdsToFetch.Add(w.DeletedBy);
        }

        foreach (var d in deletedDocuments)
        {
            items.Add(new RecycleBinItemDto
            {
                Id = d.Id!,
                Name = d.Title,
                ItemType = "Document",
                DeletedAt = d.DeletedAt,
                DeletedBy = d.DeletedBy,
                ParentId = d.WorkspaceId ?? d.ParentId
            });
            if (!string.IsNullOrEmpty(d.DeletedBy)) userIdsToFetch.Add(d.DeletedBy);
        }

        var sortedItems = items.OrderByDescending(i => i.DeletedAt).ToList();

        if (userIdsToFetch.Any())
        {
            var userMaps = await _unitOfWork.UserMaps.FindAsync(u => u.Id != null && userIdsToFetch.Contains(u.Id));
            var userMapDict = userMaps.Where(u => u.Id != null).ToDictionary(u => u.Id!, u => u);
            var lang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
            bool isEnglish = lang.Contains("en", StringComparison.OrdinalIgnoreCase);

            foreach (var item in sortedItems)
            {
                if (!string.IsNullOrEmpty(item.DeletedBy) && userMapDict.TryGetValue(item.DeletedBy, out var userMap))
                {
                    item.DeletedByName = isEnglish ? userMap.GrcNameEn : userMap.GrcNameAr;
                }
            }
        }

        return new ResponseResult<IEnumerable<RecycleBinItemDto>>(sortedItems, ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<StringModel>> RestoreItemAsync(string itemType, string id, CurrentUser currentUser)
    {
        if (itemType.Equals("Workspace", StringComparison.OrdinalIgnoreCase) || itemType.Equals("Folder", StringComparison.OrdinalIgnoreCase))
        {
            var item = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == id && w.TenantId == currentUser.TenantId && w.IsDeleted)).FirstOrDefault();
            if (item == null) return new ResponseResult<StringModel>("Item not found", ConstAppConfiguration.ApiStatusCode.NotFound);

            item.IsDeleted = false;
            item.DeletedAt = null;
            item.DeletedBy = null;
            await _unitOfWork.Workspaces.UpdateAsync(id, item);

            await _auditLogService.LogAsync(currentUser.UserId!, currentUser.TenantId!, "Restore Item", "workspace", id, $"Restored {itemType}: {item.Name}");
        }
        else if (itemType.Equals("Document", StringComparison.OrdinalIgnoreCase))
        {
            var item = (await _unitOfWork.Documents.FindAsync(d => d.Id == id && d.TenantId == currentUser.TenantId && d.IsDeleted)).FirstOrDefault();
            if (item == null) return new ResponseResult<StringModel>("Item not found", ConstAppConfiguration.ApiStatusCode.NotFound);

            item.IsDeleted = false;
            item.DeletedAt = null;
            item.DeletedBy = null;
            await _unitOfWork.Documents.UpdateAsync(id, item);

            await _auditLogService.LogAsync(currentUser.UserId!, currentUser.TenantId!, "Restore Item", "document", id, $"Restored document: {item.Title}");
        }
        else
        {
            return new ResponseResult<StringModel>("Invalid item type", ConstAppConfiguration.ApiStatusCode.BadRequest);
        }

        return new ResponseResult<StringModel>(new StringModel { Value = _localizationService.Get("Msg_RestoredSuccessfully") }, ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<StringModel>> HardDeleteItemAsync(string itemType, string id, CurrentUser currentUser)
    {
        if (itemType.Equals("Workspace", StringComparison.OrdinalIgnoreCase) || itemType.Equals("Folder", StringComparison.OrdinalIgnoreCase))
        {
            var item = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == id && w.TenantId == currentUser.TenantId && w.IsDeleted)).FirstOrDefault();
            if (item == null) return new ResponseResult<StringModel>("Item not found", ConstAppConfiguration.ApiStatusCode.NotFound);

            // Fetch and delete children if necessary, or just rely on cascade delete logic later. 
            // For now, hard deleting workspaces just deletes it. A robust way would be finding children.
            await _unitOfWork.Workspaces.DeleteAsync(id);

            await _auditLogService.LogAsync(currentUser.UserId!, currentUser.TenantId!, "Hard Delete Item", "workspace", id, $"Hard deleted {itemType}: {item.Name}");
        }
        else if (itemType.Equals("Document", StringComparison.OrdinalIgnoreCase))
        {
            var item = (await _unitOfWork.Documents.FindAsync(d => d.Id == id && d.TenantId == currentUser.TenantId && d.IsDeleted)).FirstOrDefault();
            if (item == null) return new ResponseResult<StringModel>("Item not found", ConstAppConfiguration.ApiStatusCode.NotFound);

            var versions = await _unitOfWork.DocumentVersions.FindAsync(v => v.DocumentId == id && v.TenantId == currentUser.TenantId);
            foreach (var v in versions)
            {
                if (!string.IsNullOrEmpty(v.FileId))
                {
                    try { await _gridFS.DeleteAsync(new ObjectId(v.FileId)); } catch (GridFSFileNotFoundException) { }
                }
                await _unitOfWork.DocumentVersions.DeleteAsync(v.Id!);
            }
            await _unitOfWork.Documents.DeleteAsync(id);

            await _auditLogService.LogAsync(currentUser.UserId!, currentUser.TenantId!, "Hard Delete Item", "document", id, $"Hard deleted document: {item.Title}");
        }

        return new ResponseResult<StringModel>(new StringModel { Value = _localizationService.Get("Msg_DeletedSuccessfully") }, ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<StringModel>> EmptyRecycleBinAsync(CurrentUser currentUser)
    {
        var deletedWorkspaces = await _unitOfWork.Workspaces.FindAsync(w => w.TenantId == currentUser.TenantId && w.IsDeleted);
        foreach (var w in deletedWorkspaces)
        {
            await _unitOfWork.Workspaces.DeleteAsync(w.Id!);
        }

        var deletedDocuments = await _unitOfWork.Documents.FindAsync(d => d.TenantId == currentUser.TenantId && d.IsDeleted);
        foreach (var d in deletedDocuments)
        {
            var versions = await _unitOfWork.DocumentVersions.FindAsync(v => v.DocumentId == d.Id && v.TenantId == currentUser.TenantId);
            foreach (var v in versions)
            {
                if (!string.IsNullOrEmpty(v.FileId))
                {
                    try { await _gridFS.DeleteAsync(new ObjectId(v.FileId)); } catch (GridFSFileNotFoundException) { }
                }
                await _unitOfWork.DocumentVersions.DeleteAsync(v.Id!);
            }
            await _unitOfWork.Documents.DeleteAsync(d.Id!);
        }

        await _auditLogService.LogAsync(currentUser.UserId!, currentUser.TenantId!, "Empty Recycle Bin", "system", null, $"Emptied recycle bin");

        return new ResponseResult<StringModel>(new StringModel { Value = _localizationService.Get("Msg_DeletedSuccessfully") }, ConstAppConfiguration.ApiStatusCode.OK);
    }
}
