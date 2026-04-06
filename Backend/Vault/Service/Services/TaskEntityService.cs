using Core.DTOs;
using Core.DTOs.Identity;
using Core.DTOs.Task;
using Core.Constants;
using static Core.Constants.ConstAppConfiguration;
using MongoDB.Bson;
using Microsoft.AspNetCore.Http; // Added

namespace Service;

public class TaskEntityService : ITaskEntityService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWorkflowInstanceService _workflowInstanceService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IAuditLogService _auditLogService;

    public TaskEntityService(IUnitOfWork unitOfWork, IWorkflowInstanceService workflowInstanceService, IHttpContextAccessor httpContextAccessor, IAuditLogService auditLogService)
    {
        _unitOfWork = unitOfWork;
        _workflowInstanceService = workflowInstanceService;
        _httpContextAccessor = httpContextAccessor;
        _auditLogService = auditLogService;
    }

    public async Task<ResponseResult<IEnumerable<TaskDetailsDto>>> GetAllAsync(CurrentUser currentUser)
    {
        var tasks = await _unitOfWork.Tasks.FindAsync(t => t.TenantId == currentUser.TenantId);
        var dtos = await EnrichWithUserNames(tasks);
        return new ResponseResult<IEnumerable<TaskDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<TaskDetailsDto>> GetByIdAsync(string id, CurrentUser currentUser)
    {
        var entity = (await _unitOfWork.Tasks.FindAsync(t => t.Id == id && t.TenantId == currentUser.TenantId)).FirstOrDefault();
        if (entity == null) return new ResponseResult<TaskDetailsDto>("Task not found", ApiStatusCode.NotFound);
        
        var dtos = await EnrichWithUserNames(new[] { entity });
        return new ResponseResult<TaskDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }
    
    public async Task<ResponseResult<TaskDetailsDto>> CreateAsync(CreateTaskDto dto, CurrentUser currentUser) 
    {
        var entity = new TaskEntity
        {
            TenantId = currentUser.TenantId,
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            Status = dto.Status,
            WorkspaceId = dto.WorkspaceId,
            CreatedBy = currentUser.UserId,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Tasks.AddAsync(entity);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Create Task",
            entityType: "task",
            entityId: entity.Id,
            details: $"Created task: {entity.Title}"
        );

        var dtos = await EnrichWithUserNames(new[] { entity });
        return new ResponseResult<TaskDetailsDto>(dtos.First(), ApiStatusCode.OK);
    } 

    public async Task<ResponseResult<TaskDetailsDto>> UpdateAsync(string id, UpdateTaskDto dto, CurrentUser currentUser) 
    {
         var existing = (await _unitOfWork.Tasks.FindAsync(t => t.Id == id && t.TenantId == currentUser.TenantId)).FirstOrDefault();
         if (existing == null) return new ResponseResult<TaskDetailsDto>("Task not found", ApiStatusCode.NotFound);

         existing.Title = dto.Title;
         existing.Description = dto.Description ?? existing.Description;
         existing.DueDate = dto.DueDate;
         existing.Status = dto.Status;

         await _unitOfWork.Tasks.UpdateAsync(id, existing);

         await _auditLogService.LogAsync(
             actorUserId: currentUser.UserId!,
             tenantId: currentUser.TenantId!,
             action: "Update Task",
             entityType: "task",
             entityId: id,
             details: $"Updated task: {existing.Title}"
         );

         var dtos = await EnrichWithUserNames(new[] { existing });
         return new ResponseResult<TaskDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id, CurrentUser currentUser) 
    {
        var existing = (await _unitOfWork.Tasks.FindAsync(t => t.Id == id && t.TenantId == currentUser.TenantId)).FirstOrDefault();
        if (existing == null) return new ResponseResult<object>("Task not found", ApiStatusCode.NotFound);

        await _unitOfWork.Tasks.DeleteAsync(id);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Delete Task",
            entityType: "task",
            entityId: id,
            details: $"Deleted task: {existing.Title}"
        );

        return new ResponseResult<object>(null, ApiStatusCode.OK, "Deleted Successfully");
    }

    public async Task<ResponseResult<IEnumerable<TaskDetailsDto>>> GetByUserIdAsync(string userId, CurrentUser currentUser)
    {
        // Get the user's role IDs from user_roles collection
        var userRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == userId);
        var userRoleIds = userRoles.Select(ur => ur.RoleId).ToHashSet();

        Console.WriteLine($"[Tasks] GetByUserId userId={userId}, roleIds=[{string.Join(",", userRoleIds)}]");

        var tasks = await _unitOfWork.Tasks.FindAsync(t =>
            t.TenantId == currentUser.TenantId &&
            (
                t.AssignedTo == userId ||
                t.CandidateUsers.Contains(userId) ||
                (t.CandidateRoles != null && t.CandidateRoles.Count > 0)
            )
        );

        // Post-filter: include tasks where user has a matching role
        var filteredTasks = tasks.Where(t =>
            t.AssignedTo == userId ||
            t.CandidateUsers.Contains(userId) ||
            (
                t.CandidateRoles != null &&
                t.CandidateRoles.Any(r => userRoleIds.Contains(r))
            )
        ).ToList();

        Console.WriteLine($"[Tasks] Found {filteredTasks.Count} tasks for user {userId}");

        var dtos = await EnrichWithUserNames(filteredTasks);
        return new ResponseResult<IEnumerable<TaskDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> CompleteTaskAsync(string id, CurrentUser currentUser, string outcome = "Completed", BsonDocument? data = null)
    {
        var task = (await _unitOfWork.Tasks.FindAsync(t => t.Id == id && t.TenantId == currentUser.TenantId)).FirstOrDefault();
        if (task != null)
        {
            // MUS-736: Block actions on tasks whose workspace has been deleted
            if (!string.IsNullOrEmpty(task.WorkspaceId))
            {
                var workspace = (await _unitOfWork.Workspaces.FindAsync(w =>
                    w.Id == task.WorkspaceId && w.TenantId == currentUser.TenantId)).FirstOrDefault();
                if (workspace == null || workspace.IsDeleted)
                {
                    return new ResponseResult<object>(
                        "Cannot complete task: the associated workspace has been deleted.",
                        ApiStatusCode.BadRequest);
                }
            }

            task.Status = outcome;
            await _unitOfWork.Tasks.UpdateAsync(id, task);
            
            if (task.RelatedEntity?.Type == "WorkflowInstance" && !string.IsNullOrEmpty(task.RelatedEntity.Id))
            {
                  await _workflowInstanceService.ProcessTaskCompletionAsync(id, currentUser.UserId ?? "", outcome, data);
            }
            else
            {
                // Manual Task Completion Activity Log
                var activity = new Activity
                {
                    TenantId = task.TenantId,
                    WorkspaceId = task.WorkspaceId,
                    UserId = currentUser.UserId,
                    Action = "Task Completed",
                    Details = $"Task '{task.Title}' was marked as {outcome.ToLower()} manually.",
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Activities.AddAsync(activity);

                await _auditLogService.LogAsync(
                    actorUserId: currentUser.UserId!,
                    tenantId: currentUser.TenantId!,
                    action: "Complete Task",
                    entityType: "task",
                    entityId: id,
                    details: $"Manually completed task: {task.Title} with outcome: {outcome}"
                );
            }
            return new ResponseResult<object>(null, ApiStatusCode.OK, "Task Completed");
        }
        return new ResponseResult<object>("Task not found", ApiStatusCode.NotFound);
    }

    private async Task<List<TaskDetailsDto>> EnrichWithUserNames(IEnumerable<TaskEntity> tasks)
    {
        var dtos = tasks.Select(t => new TaskDetailsDto
        {
            Id = t.Id,
            TenantId = t.TenantId,
            Title = t.Title,
            Description = t.Description,
            WorkspaceId = t.WorkspaceId,
            RelatedEntity = t.RelatedEntity,
            AssignedTo = t.AssignedTo,
            CandidateUsers = t.CandidateUsers,
            CandidateRoles = t.CandidateRoles,
            ActionConfig = t.ActionConfig, // Map ActionConfig
            DueDate = t.DueDate,
            Status = t.Status,
            CreatedBy = t.CreatedBy,
            CreatedAt = t.CreatedAt,
            TargetDocumentId = t.TargetDocumentId
        }).ToList();

        var userIds = new HashSet<string>();
        var workflowInstanceIds = new HashSet<string>();

        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
            if (!string.IsNullOrEmpty(dto.AssignedTo)) userIds.Add(dto.AssignedTo);
            
            if (dto.RelatedEntity?.Type == "WorkflowInstance" && !string.IsNullOrEmpty(dto.RelatedEntity.Id))
            {
                workflowInstanceIds.Add(dto.RelatedEntity.Id);
            }
        }

        if (!userIds.Any() && !workflowInstanceIds.Any()) return dtos;

        var userMaps = userIds.Any() ? await _unitOfWork.UserMaps.FindAsync(u => u.Id != null && userIds.Contains(u.Id)) : new List<Core.Entities.UserMap>();
        var userMapDict = userMaps.Where(u => u.Id != null).ToDictionary(u => u.Id!, u => u);

        var lang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
        bool isEnglish = lang.Contains("en", StringComparison.OrdinalIgnoreCase);

        Dictionary<string, Core.Entities.WorkflowInstance> workflowInstancesDict = new();
        var documentIds = new HashSet<string>();
        var workspaceIds = new HashSet<string>();

        if (workflowInstanceIds.Any())
        {
            var workflowInstances = await _unitOfWork.WorkflowInstances.FindAsync(w => w.Id != null && workflowInstanceIds.Contains(w.Id));
            workflowInstancesDict = workflowInstances.ToDictionary(w => w.Id!);

            foreach (var w in workflowInstancesDict.Values)
            {
                if (w.Context != null)
                {
                    if (w.Context.Contains("target_type") && w.Context.Contains("target_id"))
                    {
                        var targetType = w.Context["target_type"].AsString;
                        var targetId = w.Context["target_id"].AsString;
                        
                        if (targetType.Equals("Document", StringComparison.OrdinalIgnoreCase)) documentIds.Add(targetId);
                        else if (targetType.Equals("Workspace", StringComparison.OrdinalIgnoreCase)) workspaceIds.Add(targetId);
                    }
                    else if (w.Context.Contains("target_id"))
                    {
                        documentIds.Add(w.Context["target_id"].AsString); // Assume document if no target_type
                    }
                    else if (w.Context.Contains("document_id"))
                    {
                        documentIds.Add(w.Context["document_id"].AsString);
                    }
                }
            }
        }

        Dictionary<string, string> docNames = new();
        if (documentIds.Any())
        {
            var docs = await _unitOfWork.Documents.FindAsync(d => d.Id != null && documentIds.Contains(d.Id));
            foreach(var d in docs) docNames[d.Id!] = d.Title;
        }

        Dictionary<string, string> workspaceNames = new();
        if (workspaceIds.Any())
        {
            var wss = await _unitOfWork.Workspaces.FindAsync(w => w.Id != null && workspaceIds.Contains(w.Id));
            foreach(var w in wss) workspaceNames[w.Id!] = w.Name;
        }

        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy) && userMapDict.TryGetValue(dto.CreatedBy, out var createdByMap))
            {
                dto.CreatedByName = isEnglish ? createdByMap.GrcNameEn : createdByMap.GrcNameAr;
            }

            if (!string.IsNullOrEmpty(dto.AssignedTo) && userMapDict.TryGetValue(dto.AssignedTo, out var assignedToMap))
            {
                dto.AssignedToName = isEnglish ? assignedToMap.GrcNameEn : assignedToMap.GrcNameAr;
            }

            if (dto.RelatedEntity?.Type == "WorkflowInstance" && !string.IsNullOrEmpty(dto.RelatedEntity.Id))
            {
                if (workflowInstancesDict.TryGetValue(dto.RelatedEntity.Id, out var instance))
                {
                    dto.WorkflowName = instance.WorkflowName;
                    
                    if (instance.Context != null)
                    {
                        if (instance.Context.Contains("trigger_code"))
                        {
                            dto.TriggerType = instance.Context["trigger_code"].AsString;
                        }
                        else if (instance.Context.Contains("trigger_type"))
                        {
                            dto.TriggerType = instance.Context["trigger_type"].AsString;
                        }
                        
                        if (instance.Context.Contains("target_type") && instance.Context.Contains("target_id"))
                        {
                            var tType = instance.Context["target_type"].AsString;
                            var tId = instance.Context["target_id"].AsString;
                            
                            dto.RelatedItemType = tType;
                            if (tType.Equals("Document", StringComparison.OrdinalIgnoreCase) && docNames.TryGetValue(tId, out var dName))
                            {
                                dto.RelatedItemName = dName;
                            }
                            else if (tType.Equals("Workspace", StringComparison.OrdinalIgnoreCase) && workspaceNames.TryGetValue(tId, out var wName))
                            {
                                dto.RelatedItemName = wName;
                            }
                            else
                            {
                                dto.RelatedItemName = tId; // Fallback to ID if not found
                            }
                        }
                        else if (instance.Context.Contains("target_id"))
                        {
                            var tId = instance.Context["target_id"].AsString;
                            dto.RelatedItemType = "Document";
                            dto.RelatedItemName = docNames.TryGetValue(tId, out var dName) ? dName : tId;
                        }
                        else if (instance.Context.Contains("document_id"))
                        {
                            var tId = instance.Context["document_id"].AsString;
                            dto.RelatedItemType = "Document";
                            dto.RelatedItemName = docNames.TryGetValue(tId, out var dName) ? dName : tId;
                        }
                    }
                }
            }
        }

        return dtos;
    }
}
