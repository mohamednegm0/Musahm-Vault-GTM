using Core.DTOs;
using Core.DTOs.Workflow;
using Core.Constants;
using static Core.Constants.ConstAppConfiguration;
using MongoDB.Bson;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Http; // Added

namespace Service;

public class WorkflowService : IWorkflowService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public WorkflowService(IUnitOfWork unitOfWork, IServiceProvider serviceProvider, IHttpContextAccessor httpContextAccessor) 
    { 
        _unitOfWork = unitOfWork; 
        _serviceProvider = serviceProvider;
        _httpContextAccessor = httpContextAccessor;
    }

    private IAuditLogService AuditLog => _serviceProvider.GetRequiredService<IAuditLogService>();

    private string? GetCurrentTenantId() =>
        _httpContextAccessor.HttpContext?.User?.FindFirst("tenant_id")?.Value
        ?? _httpContextAccessor.HttpContext?.User?.FindFirst("CompanyId")?.Value;

    public async Task<ResponseResult<IEnumerable<WorkflowDetailsDto>>> GetAllAsync()
    {
        var tenantId = GetCurrentTenantId();
        var workflows = string.IsNullOrEmpty(tenantId)
            ? await _unitOfWork.Workflows.GetAllAsync()
            : await _unitOfWork.Workflows.FindAsync(w => w.TenantId == tenantId);
        var dtos = await EnrichWithUserNames(workflows);
        return new ResponseResult<IEnumerable<WorkflowDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<WorkflowDetailsDto>> GetByIdAsync(string id)
    {
        var tenantId = GetCurrentTenantId();
        var entity = string.IsNullOrEmpty(tenantId)
            ? await _unitOfWork.Workflows.GetByIdAsync(id)
            : (await _unitOfWork.Workflows.FindAsync(w => w.Id == id && w.TenantId == tenantId)).FirstOrDefault();
        if (entity == null) return new ResponseResult<WorkflowDetailsDto>("Workflow not found", ApiStatusCode.NotFound);
        
        var dtos = await EnrichWithUserNames(new[] { entity });
        return new ResponseResult<WorkflowDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }
    
    public async Task<ResponseResult<Workflow>> CreateAsync(Workflow entity)
    {
        await _unitOfWork.Workflows.AddAsync(entity);

        var creatorId = entity.CreatedBy ?? "000000000000000000000000";
        if (!string.IsNullOrEmpty(entity.TenantId))
        {
            await AuditLog.LogAsync(creatorId, entity.TenantId, "Create Workflow", "workflow", entity.Id, $"Created workflow: {entity.Name}");
            // MUS-751: Log activity for workflow creation
            await _unitOfWork.Activities.AddAsync(new Activity
            {
                TenantId = entity.TenantId,
                WorkspaceId = entity.WorkspaceId,
                UserId = creatorId,
                Action = "Workflow Created",
                Details = $"Workflow '{entity.Name}' was created.",
                CreatedAt = DateTime.UtcNow
            });
        }

        return new ResponseResult<Workflow>(entity, ApiStatusCode.OK);
    }
    
    public async Task<ResponseResult<Workflow>> UpdateAsync(string id, Workflow entity)
    {
        await _unitOfWork.Workflows.UpdateAsync(id, entity);

        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("user_id")?.Value
                     ?? _httpContextAccessor.HttpContext?.User?.FindFirst("Id")?.Value
                     ?? entity.UpdatedBy
                     ?? "000000000000000000000000";
        var tenantId = entity.TenantId ?? "";
        if (!string.IsNullOrEmpty(tenantId))
        {
            try {
                await AuditLog.LogAsync(
                    actorUserId: userId,
                    tenantId: tenantId,
                    action: "Update Workflow",
                    entityType: "workflow",
                    entityId: id,
                    details: $"Updated workflow: {entity.Name}"
                );
                // MUS-751: Log activity for workflow update
                await _unitOfWork.Activities.AddAsync(new Activity
                {
                    TenantId = tenantId,
                    WorkspaceId = entity.WorkspaceId,
                    UserId = userId,
                    Action = "Workflow Updated",
                    Details = $"Workflow '{entity.Name}' was updated.",
                    CreatedAt = DateTime.UtcNow
                });
            } catch (Exception ex) {
                Console.WriteLine($"[WorkflowService] Audit Log failed: {ex.Message}");
            }
        }

        return new ResponseResult<Workflow>(entity, ApiStatusCode.OK);
    }
    
    public async Task<ResponseResult<object>> DeleteAsync(string id) 
    {
        var workflow = await _unitOfWork.Workflows.GetByIdAsync(id);

        // Delete Assignments related to this Workflow
        var assignments = await _unitOfWork.WorkflowAssignments.FindAsync(a => a.WorkflowId == id);
        foreach (var assignment in assignments)
        {
             if (assignment.Id != null) 
                 await _unitOfWork.WorkflowAssignments.DeleteAsync(assignment.Id);
        }

        await _unitOfWork.Workflows.DeleteAsync(id);

        if (workflow != null && !string.IsNullOrEmpty(workflow.CreatedBy) && !string.IsNullOrEmpty(workflow.TenantId))
        {
            await AuditLog.LogAsync(workflow.CreatedBy, workflow.TenantId, "Delete Workflow", "workflow", id, $"Deleted workflow: {workflow.Name}");
            // MUS-751: Log activity for workflow deletion
            await _unitOfWork.Activities.AddAsync(new Activity
            {
                TenantId = workflow.TenantId,
                WorkspaceId = workflow.WorkspaceId,
                UserId = workflow.CreatedBy,
                Action = "Workflow Deleted",
                Details = $"Workflow '{workflow.Name}' was deleted.",
                CreatedAt = DateTime.UtcNow
            });
        }

        return new ResponseResult<object>(null, ApiStatusCode.OK, "Deleted Successfully");
    }

    public async Task<ResponseResult<object>> ToggleActiveStatusAsync(string id, bool isActive, bool activateAssignments = false)
    {
        var workflow = await _unitOfWork.Workflows.GetByIdAsync(id);
        if (workflow == null) return new ResponseResult<object>("Workflow not found", ApiStatusCode.NotFound);

        // Update the Workflow
        workflow.IsActive = isActive;
        await _unitOfWork.Workflows.UpdateAsync(id, workflow);

        // If deactivated, we must terminate running instances and deactivate its assignments
        if (!isActive)
        {
            try 
            {
                var instances = await _unitOfWork.WorkflowInstances.FindAsync(i => i.WorkflowId == id && i.Status == Core.Enums.WorkflowStatus.Active);
                foreach (var instance in instances)
                {
                    instance.Status = Core.Enums.WorkflowStatus.Terminated;
                    if (instance.Id != null)
                    {
                        await _unitOfWork.WorkflowInstances.UpdateAsync(instance.Id, instance);
                    }
                }

                var assignments = await _unitOfWork.WorkflowAssignments.FindAsync(a => a.WorkflowId == id && a.IsActive);
                foreach (var assignment in assignments)
                {
                    assignment.IsActive = false;
                    if (assignment.Id != null)
                    {
                        await _unitOfWork.WorkflowAssignments.UpdateAsync(assignment.Id, assignment);
                    }
                }
            }
            catch (Exception ex)
            {
                // We don't want to fail the whole toggle if some instances/assignments fail to update, 
                // but we should log it.
                Console.WriteLine($"Error during workflow deactivation cleanup: {ex.Message}");
            }
        }
        else if (isActive && activateAssignments)
        {
            try 
            {
                var assignments = await _unitOfWork.WorkflowAssignments.FindAsync(a => a.WorkflowId == id && !a.IsActive);
                foreach (var assignment in assignments)
                {
                    assignment.IsActive = true;
                    if (assignment.Id != null)
                    {
                        await _unitOfWork.WorkflowAssignments.UpdateAsync(assignment.Id, assignment);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error activating workflow assignments: {ex.Message}");
            }
        }

        try 
        {
            var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("user_id")?.Value
                         ?? _httpContextAccessor.HttpContext?.User?.FindFirst("Id")?.Value
                         ?? "000000000000000000000000";
            var tenantId = workflow.TenantId ?? "";
            var actionName = isActive ? "Activate Workflow" : "Deactivate Workflow";
            if (!string.IsNullOrEmpty(tenantId))
                await AuditLog.LogAsync(userId, tenantId, actionName, "workflow", id, $"{actionName}: {workflow.Name}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error logging workflow toggle: {ex.Message}");
        }

        return new ResponseResult<object>(new { id, isActive }, ApiStatusCode.OK, "Workflow status updated successfully");
    }

    public async Task<ResponseResult<object>> EvaluateTriggersAsync(BsonDocument context)
    {
        var workflows = await _unitOfWork.Workflows.FindAsync(w => w.IsActive == true);
        
        int triggeredCount = 0;

        foreach (var workflow in workflows)
        {
            var triggerGroups = workflow.Triggers.GroupBy(t => t.GroupId ?? Guid.NewGuid().ToString());

            foreach (var group in triggerGroups)
            {
                bool groupMatch = true;


                foreach (var trigger in group)
                {
                    bool triggerMatch = false;

                    if (!string.IsNullOrEmpty(trigger.TriggerCode))
                    {
                         if (context.Contains("event") && 
                            string.Equals(context["event"].AsString, trigger.TriggerCode, StringComparison.OrdinalIgnoreCase))
                        {
                            triggerMatch = true;
                        }
                    }
                    else
                    {
                        switch (trigger.Type)
                    {
                        case Core.Enums.WorkflowTriggerType.Workspace:
                            if (context.Contains("workspace_id") && context["workspace_id"] == trigger.Value)
                                triggerMatch = true;
                            break;
                        
                        case Core.Enums.WorkflowTriggerType.FileFormat:
                            if (context.Contains("file_extension") && 
                                string.Equals(context["file_extension"].AsString, trigger.Value, StringComparison.OrdinalIgnoreCase))
                                triggerMatch = true;
                            break;

                        case Core.Enums.WorkflowTriggerType.Person:
                            if (context.Contains("user_id") && context["user_id"] == trigger.Value)
                                triggerMatch = true;
                            break;

                        case Core.Enums.WorkflowTriggerType.FolderEvent:
                             if (context.Contains("folder_id") && context["folder_id"] == trigger.Value)
                                triggerMatch = true;
                            break;

                        case Core.Enums.WorkflowTriggerType.DocumentType:
                             if (context.Contains("document_type_id") && context["document_type_id"] == trigger.Value)
                                triggerMatch = true;
                            break;

                        case Core.Enums.WorkflowTriggerType.Document:
                             if (context.Contains("document_id") && context["document_id"] == trigger.Value)
                                triggerMatch = true;
                            break;
                    }
                }

                    if (!triggerMatch)
                    {
                        groupMatch = false;
                        break;
                    }
                }

                if (groupMatch)
                {
                    using var scope = _serviceProvider.CreateScope();
                    var instanceService = scope.ServiceProvider.GetRequiredService<Core.Interfaces.Service.IWorkflowInstanceService>();
                    
                    string workspaceId = context.Contains("workspace_id") ? context["workspace_id"].AsString : workflow.WorkspaceId!;
                    string userId = context.Contains("user_id") ? context["user_id"].AsString : "SYSTEM";
                    
                    if (!context.Contains("trigger_type"))
                        context.Add("trigger_type", "Automatic");
                    
                    await instanceService.StartWorkflowAsync(workflow.Id!, workspaceId, userId, context);

                    // MUS-751: Log trigger evaluation activity
                    await _unitOfWork.Activities.AddAsync(new Activity
                    {
                        TenantId = workflow.TenantId,
                        WorkspaceId = workspaceId,
                        UserId = userId,
                        Action = "Workflow Triggered",
                        Details = $"Workflow '{workflow.Name}' automatically triggered. Trigger type: {(context.Contains("trigger_type") ? context["trigger_type"].AsString : "Unknown")}",
                        CreatedAt = DateTime.UtcNow
                    });

                    triggeredCount++;
                    break;
                }
            }
        }

        return new ResponseResult<object>(new { Triggered = triggeredCount }, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<ActionDefinition>>> GetActionsAsync()
    {
        var actions = await _unitOfWork.Actions.GetAllAsync();
        return new ResponseResult<IEnumerable<ActionDefinition>>(actions, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkflowTriggerDefinition>>> GetTriggersAsync()
    {
        var triggers = await _unitOfWork.Triggers.GetAllAsync();
        return new ResponseResult<IEnumerable<WorkflowTriggerDefinition>>(triggers, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkflowEventDefinition>>> GetEventsAsync()
    {
        var events = await _unitOfWork.WorkflowEvents.GetAllAsync();
        return new ResponseResult<IEnumerable<WorkflowEventDefinition>>(events, ApiStatusCode.OK);
    }

    private async Task<List<WorkflowDetailsDto>> EnrichWithUserNames(IEnumerable<Workflow> workflows)
    {
        var dtos = workflows.Select(w => new WorkflowDetailsDto
        {
            Id = w.Id,
            TenantId = w.TenantId,
            WorkspaceId = w.WorkspaceId,
            Name = w.Name,
            Description = w.Description,
            Steps = w.Steps,
            Triggers = w.Triggers,
            MinConfidenceScore = w.MinConfidenceScore,
            IsActive = w.IsActive,
            CreatedBy = w.CreatedBy,
            CreatedAt = w.CreatedAt,
            UpdatedBy = w.UpdatedBy,
            UpdatedAt = w.UpdatedAt,
            Reviewers = new List<string>(),
            Approvers = new List<string>()
        }).ToList();

        var wfIds = dtos.Where(d => !string.IsNullOrEmpty(d.Id)).Select(d => d.Id!).ToList();
        
        // Fetch Assignments & Instances
        var assignments = wfIds.Any() 
            ? (await _unitOfWork.WorkflowAssignments.FindAsync(a => a.WorkflowId != null && wfIds.Contains(a.WorkflowId))).ToList()
            : new List<WorkflowAssignment>();
            
        var instances = wfIds.Any()
            ? (await _unitOfWork.WorkflowInstances.FindAsync(i => i.WorkflowId != null && wfIds.Contains(i.WorkflowId))).ToList()
            : new List<WorkflowInstance>();

        var userIds = new HashSet<string>();
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
            if (!string.IsNullOrEmpty(dto.UpdatedBy)) userIds.Add(dto.UpdatedBy);
            
            // Collect User IDs from Step Definitions — with safe null checks
            if (dto.Steps != null)
            {
                foreach(var step in dto.Steps)
                {
                    if (step?.ActionConfig != null)
                    {
                        if (!string.IsNullOrEmpty(step.ActionConfig.AssigneeId)) userIds.Add(step.ActionConfig.AssigneeId);
                        if (step.ActionConfig.AssigneeIds != null) 
                        {
                            foreach(var id in step.ActionConfig.AssigneeIds) 
                            {
                                if (!string.IsNullOrEmpty(id)) userIds.Add(id);
                            }
                        }
                    }
                }
            }
        }

        var userMaps = new Dictionary<string, UserMap>();
        if (userIds.Any())
        {
             // CRITICAL: Filter for valid ObjectIds only to prevent MongoDB query crash
             var userIdsList = userIds.Where(IsValidObjectId).ToList();
             var users = userIdsList.Any() 
                ? await _unitOfWork.UserMaps.FindAsync(u => u.Id != null && userIdsList.Contains(u.Id))
                : new List<UserMap>();
             
             // Safely build dictionary avoiding duplicate keys
             foreach(var u in users) { if (u.Id != null && !userMaps.ContainsKey(u.Id)) userMaps[u.Id] = u; }
        }

        var lang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
        bool isEnglish = lang.Contains("en", StringComparison.OrdinalIgnoreCase);

        List<Core.DTOs.Profile.CompanyUserDto>? externalUsers = null;
        try
        {
             var grcService = _serviceProvider.GetService<IGRCService>();
             if (grcService != null)
             {
                 var result = await grcService.GetUsersAsync();
                 if (result.IsSucceeded && result.ReturnData != null)
                 {
                     externalUsers = result.ReturnData.ToList();
                 }
             }
        } 
        catch { }

        foreach (var dto in dtos)
        {
            // Populate Counts & Lists
            dto.ActiveInstancesCount = instances.Count(i => i.WorkflowId == dto.Id && i.Status == Core.Enums.WorkflowStatus.Active);
            // Names
            if (!string.IsNullOrEmpty(dto.CreatedBy) && userMaps.TryGetValue(dto.CreatedBy, out var createdByMap))
                dto.CreatedByName = isEnglish ? createdByMap.GrcNameEn : createdByMap.GrcNameAr;

            if (!string.IsNullOrEmpty(dto.UpdatedBy) && userMaps.TryGetValue(dto.UpdatedBy, out var updatedByMap))
                dto.UpdatedByName = isEnglish ? updatedByMap.GrcNameEn : updatedByMap.GrcNameAr;

            // Stats
            var wfAssignments = assignments.Where(a => a.WorkflowId == dto.Id).ToList();
            dto.AssignedDocumentsCount = wfAssignments.Count(a => string.Equals(a.TargetType, "Document", StringComparison.OrdinalIgnoreCase));
            dto.AssignedFoldersCount = wfAssignments.Count(a => 
                string.Equals(a.TargetType, "Workspace", StringComparison.OrdinalIgnoreCase) || 
                string.Equals(a.TargetType, "Folder", StringComparison.OrdinalIgnoreCase));

            var wfInstances = instances.Where(i => i.WorkflowId == dto.Id).ToList();
            dto.ActiveInstancesCount = wfInstances.Count(i => i.Status == Core.Enums.WorkflowStatus.Active);
            dto.CompletedInstancesCount = wfInstances.Count(i => i.Status == Core.Enums.WorkflowStatus.Completed);

            // Reviewers & Approvers
            if (dto.Steps != null)
            {
                foreach(var step in dto.Steps)
                {
                if (step.ActionConfig == null) continue;
                
                var names = new List<string>();
                
                // 1. By ID
                if (!string.IsNullOrEmpty(step.ActionConfig.AssigneeId) && userMaps.TryGetValue(step.ActionConfig.AssigneeId, out var u))
                {
                    string nameToAdd = isEnglish ? (u.GrcNameEn ?? "") : (u.GrcNameAr ?? "");
                    if (string.IsNullOrWhiteSpace(nameToAdd))
                    {
                         var extUser = externalUsers?.FirstOrDefault(eu => eu.Id == u.GrcUserId);
                         if (extUser != null) nameToAdd = extUser.Name ?? "";
                    }
                    if (!string.IsNullOrWhiteSpace(nameToAdd)) names.Add(nameToAdd);
                }
                
                // 2. By IDs
                if (step.ActionConfig.AssigneeIds != null)
                {
                    foreach(var id in step.ActionConfig.AssigneeIds)
                    {
                        if (userMaps.TryGetValue(id, out var um))
                        {
                            string nameToAdd = isEnglish ? (um.GrcNameEn ?? "") : (um.GrcNameAr ?? "");
                            if (string.IsNullOrWhiteSpace(nameToAdd))
                            {
                                 var extUser = externalUsers?.FirstOrDefault(eu => eu.Id == um.GrcUserId);
                                 if (extUser != null) nameToAdd = extUser.Name ?? "";
                            }
                            if (!string.IsNullOrWhiteSpace(nameToAdd)) names.Add(nameToAdd);
                        }
                    }
                }

                // 3. By Role (Just append Role Name)
                if (!string.IsNullOrEmpty(step.ActionConfig.AssigneeRole))
                    names.Add($"{step.ActionConfig.AssigneeRole} (Role)");

                // 4. By Roles
                if (step.ActionConfig.AssigneeRoles != null)
                {
                     foreach(var r in step.ActionConfig.AssigneeRoles) names.Add($"{r} (Role)");
                }

                    if (names.Any())
                    {
                        // Safe check for null Title
                        bool isReviewTitle = string.Equals(step.Title, "Review", StringComparison.OrdinalIgnoreCase);
                        
                        if (step.ActionConfig.ActionType == Core.Enums.WorkflowActionType.Review || isReviewTitle)
                            dto.Reviewers.AddRange(names);
                        else if (step.ActionConfig.ActionType == Core.Enums.WorkflowActionType.Approve)
                            dto.Approvers.AddRange(names);
                        else
                            dto.Assignees.AddRange(names);
                    }
                }
            }
            
            dto.Reviewers = dto.Reviewers.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToList();
            dto.Approvers = dto.Approvers.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToList();
            dto.Assignees = dto.Assignees.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToList();
        }

        return dtos;
    }

    private static bool IsValidObjectId(string? id)
    {
        if (string.IsNullOrEmpty(id)) return false;
        return id.Length == 24 && id.All(c => (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'));
    }
}
