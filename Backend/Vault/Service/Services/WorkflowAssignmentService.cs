using Core.DTOs;
using Core.DTOs.Workflow;
using Core.Entities;
using Core.Interfaces.Service;
using Core.Repository;
using Core.Constants;
using Core.Enums;

namespace Service.Services;

public class WorkflowAssignmentService : IWorkflowAssignmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IWorkflowInstanceService _workflowInstanceService;
    private readonly IJsonLocalizationService _localizationService;
    private readonly IAuditLogService _auditLogService;

    public WorkflowAssignmentService(IUnitOfWork unitOfWork, IWorkflowInstanceService workflowInstanceService, IJsonLocalizationService localizationService, IAuditLogService auditLogService)
    {
        _unitOfWork = unitOfWork;
        _workflowInstanceService = workflowInstanceService;
        _localizationService = localizationService;
        _auditLogService = auditLogService;
    }

    public async Task<ResponseResult<WorkflowAssignmentDto>> CreateAsync(CreateWorkflowAssignmentDto dto, string userId)
    {
        if (dto.RoleIds == null || !dto.RoleIds.Any())
        {
            return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfAtLeastOneRole"), ConstAppConfiguration.ApiStatusCode.BadRequest);
        }

        if ((dto.TargetType == "Workspace" || dto.TargetType == "Folder") && (dto.DocumentTypeIds == null || !dto.DocumentTypeIds.Any()))
        {
            return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfAtLeastOneDocType"), ConstAppConfiguration.ApiStatusCode.BadRequest);
        }

        // Check if workflow is already assigned to this target
        var existingDuplicate = (await _unitOfWork.WorkflowAssignments.FindAsync(x => x.TargetId == dto.TargetId && x.WorkflowId == dto.WorkflowId)).FirstOrDefault();
        if (existingDuplicate != null)
        {
            return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfAlreadyAssigned"), ConstAppConfiguration.ApiStatusCode.Conflict);
        }

        Console.WriteLine($"[WorkflowAssignmentService] Checking for duplicates: TargetId={dto.TargetId}, New WorkflowId={dto.WorkflowId}");
        // We need to check against ALL assignments on this target to ensure no conflicting triggers, even from DIFFERENT workflows.
        var existingAssignments = await _unitOfWork.WorkflowAssignments.FindAsync(x => x.TargetId == dto.TargetId);
        
        // Fetch the new workflow to get its triggers
        var newWorkflow = await _unitOfWork.Workflows.GetByIdAsync(dto.WorkflowId);
        if (newWorkflow == null) return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfNotFound"), ConstAppConfiguration.ApiStatusCode.NotFound);
        
        var newTriggerKeys = GetTriggerKeys(newWorkflow);
        
        // Prevent assigning "Update" trigger to anything other than a Workspace
        if (!string.Equals(dto.TargetType, "Workspace", StringComparison.OrdinalIgnoreCase))
        {
            if (newTriggerKeys.Any(t => string.Equals(t, "Update", StringComparison.OrdinalIgnoreCase)))
            {
                return new ResponseResult<WorkflowAssignmentDto>("Workflows with an 'Update' trigger can only be assigned to Workspaces. / سير العمل الذي يحتوي على محفز 'تحديث' يمكن تعيينه لمساحات العمل فقط.", ConstAppConfiguration.ApiStatusCode.BadRequest);
            }
        }

        foreach (var existing in existingAssignments)
        {
             // 1. Check Document Type Overlap
             bool docTypeOverlap = false;
             if ((existing.DocumentTypeIds == null || !existing.DocumentTypeIds.Any()) || 
                 (dto.DocumentTypeIds == null || !dto.DocumentTypeIds.Any()))
             {
                 docTypeOverlap = true;
             }
             else
             {
                 docTypeOverlap = existing.DocumentTypeIds.Intersect(dto.DocumentTypeIds).Any();
             }

             if (!docTypeOverlap) continue; // No overlap in document types, safe to proceed with this existing one.

             // 2. Check Trigger Overlap
             var existingWorkflow = await _unitOfWork.Workflows.GetByIdAsync(existing.WorkflowId);
             if (existingWorkflow == null) continue; // Should not happen, but safe to skip

             var existingTriggerKeys = GetTriggerKeys(existingWorkflow);

             // Check if any trigger matches
             var overlappingTriggers = newTriggerKeys.Intersect(existingTriggerKeys, StringComparer.OrdinalIgnoreCase).ToList();
             
             if (overlappingTriggers.Any())
             {
                  return new ResponseResult<WorkflowAssignmentDto>($"Conflict: A workflow ('{existingWorkflow.Name}') is already assigned to this target for the following triggers: {string.Join(", ", overlappingTriggers)}. / تعارض: يوجد سير عمل معين بالفعل لهذا الهدف لهذه المحفزات.", ConstAppConfiguration.ApiStatusCode.Conflict);
             }
        }

        var assignment = new WorkflowAssignment
        {
            WorkflowId = dto.WorkflowId,
            TargetId = dto.TargetId,
            TargetType = dto.TargetType,
            DocumentTypeIds = dto.DocumentTypeIds ?? new List<string>(),
            RoleIds = dto.RoleIds,
            ExceptionUserIds = dto.ExceptionUserIds,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        var result = await _unitOfWork.WorkflowAssignments.AddAsync(assignment);
        if (result == null)
            return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfAssignmentCreateFailed"), ConstAppConfiguration.ApiStatusCode.InternalServerError);

        // Audit Log
        var tenantId = (await _unitOfWork.Workflows.GetByIdAsync(dto.WorkflowId))?.TenantId ?? "";
        await _auditLogService.LogAsync(
            actorUserId: userId,
            tenantId: tenantId,
            action: "Assign Workflow",
            entityType: "WorkflowAssignment",
            entityId: result.Id,
            details: $"Assigned workflow '{newWorkflow.Name}' to {dto.TargetType} ({dto.TargetId})"
        );

        // If target is a document, trigger processing immediately
        if (string.Equals(dto.TargetType, "Document", StringComparison.OrdinalIgnoreCase))
        {
            try {
                await ProcessAssignmentsAsync(dto.TargetId, userId);
            } catch (Exception ex) {
                Console.WriteLine($"[WorkflowAssignmentService] Error auto-processing assignment on create: {ex.Message}");
            }
        }

        return new ResponseResult<WorkflowAssignmentDto>(MapToDto(result), ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<WorkflowAssignmentDto>> UpdateAsync(string id, UpdateWorkflowAssignmentDto dto, string userId)
    {
        var assignment = await _unitOfWork.WorkflowAssignments.GetByIdAsync(id);
        if (assignment == null)
            return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfAssignmentNotFound"), ConstAppConfiguration.ApiStatusCode.NotFound);

        if (dto.RoleIds != null && !dto.RoleIds.Any())
        {
            return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfAtLeastOneRole"), ConstAppConfiguration.ApiStatusCode.BadRequest);
        }

        if ((assignment.TargetType == "Workspace" || assignment.TargetType == "Folder") && dto.DocumentTypeIds != null && !dto.DocumentTypeIds.Any())
        {
            return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfAtLeastOneDocType"), ConstAppConfiguration.ApiStatusCode.BadRequest);
        }

        // Update fields if provided
        if (dto.WorkflowId != null) 
        {
             // Check for conflict with OTHER workflows on the same target (regardless of WorkflowId in DTO)
             // Fetch the new workflow to get its triggers
             var newWorkflow = await _unitOfWork.Workflows.GetByIdAsync(dto.WorkflowId);
             if (newWorkflow != null)
             {
                 var newTriggerKeys = GetTriggerKeys(newWorkflow);
                 
                 // Prevent assigning "Update" trigger to anything other than a Workspace
                 if (!string.Equals(assignment.TargetType, "Workspace", StringComparison.OrdinalIgnoreCase))
                 {
                     if (newTriggerKeys.Any(t => string.Equals(t, "Update", StringComparison.OrdinalIgnoreCase)))
                     {
                         return new ResponseResult<WorkflowAssignmentDto>("Workflows with an 'Update' trigger can only be assigned to Workspaces. / سير العمل الذي يحتوي على محفز 'تحديث' يمكن تعيينه لمساحات العمل فقط.", ConstAppConfiguration.ApiStatusCode.BadRequest);
                     }
                 }

                 // Find all assignments on this target (excluding current one)
                 var otherAssignments = await _unitOfWork.WorkflowAssignments.FindAsync(x => x.TargetId == assignment.TargetId && x.Id != id);
                 
                 foreach (var existing in otherAssignments)
                 {
                     // Use current or new doc types for the assignment being updated
                     var myDocTypeIds = dto.DocumentTypeIds ?? assignment.DocumentTypeIds;
                     
                     bool docTypeOverlap = false;
                     if ((existing.DocumentTypeIds == null || !existing.DocumentTypeIds.Any()) || 
                         (myDocTypeIds == null || !myDocTypeIds.Any()))
                     {
                         docTypeOverlap = true;
                     }
                     else
                     {
                         docTypeOverlap = existing.DocumentTypeIds.Intersect(myDocTypeIds).Any();
                     }

                     if (!docTypeOverlap) continue;

                     // Check Trigger Overlap
                     var existingWorkflow = await _unitOfWork.Workflows.GetByIdAsync(existing.WorkflowId);
                     if (existingWorkflow == null) continue;

                     var existingTriggerKeys = GetTriggerKeys(existingWorkflow);
                     var overlappingTriggers = newTriggerKeys.Intersect(existingTriggerKeys, StringComparer.OrdinalIgnoreCase).ToList();
                     
                     if (overlappingTriggers.Any())
                     {
                          return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfTriggerConflict", existingWorkflow.Name ?? "", string.Join(", ", overlappingTriggers)), ConstAppConfiguration.ApiStatusCode.Conflict);
                     }
                 }
             }
             
             assignment.WorkflowId = dto.WorkflowId;
        }
        if (dto.DocumentTypeIds != null) assignment.DocumentTypeIds = dto.DocumentTypeIds;
        if (dto.RoleIds != null) assignment.RoleIds = dto.RoleIds;
        if (dto.ExceptionUserIds != null) assignment.ExceptionUserIds = dto.ExceptionUserIds;
        if (dto.IsActive.HasValue) assignment.IsActive = dto.IsActive.Value;

        var result = await _unitOfWork.WorkflowAssignments.UpdateAsync(assignment.Id!, assignment);
        
        // Audit Log
        var workflow = await _unitOfWork.Workflows.GetByIdAsync(assignment.WorkflowId);
        await _auditLogService.LogAsync(
            actorUserId: userId,
            tenantId: workflow?.TenantId ?? "",
            action: "Update Assignment",
            entityType: "WorkflowAssignment",
            entityId: id,
            details: $"Updated assignment for workflow '{workflow?.Name}' on {assignment.TargetType} ({assignment.TargetId}). Active: {assignment.IsActive}"
        );

        // If activated and target is document, trigger processing
        if (dto.IsActive == true && string.Equals(assignment.TargetType, "Document", StringComparison.OrdinalIgnoreCase))
        {
            try {
                await ProcessAssignmentsAsync(assignment.TargetId, userId);
            } catch (Exception ex) {
                 Console.WriteLine($"[WorkflowAssignmentService] Error auto-processing assignment on update: {ex.Message}");
            }
        }
        
        return new ResponseResult<WorkflowAssignmentDto>(MapToDto(result), ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<StringModel>> DeleteAsync(string id, string userId)
    {
        var assignment = await _unitOfWork.WorkflowAssignments.GetByIdAsync(id);
        if (assignment != null)
        {
            var workflow = await _unitOfWork.Workflows.GetByIdAsync(assignment.WorkflowId);
            await _auditLogService.LogAsync(
                actorUserId: userId,
                tenantId: workflow?.TenantId ?? "",
                action: "Delete Assignment",
                entityType: "WorkflowAssignment",
                entityId: id,
                details: $"Deleted assignment for workflow '{workflow?.Name}' on {assignment.TargetType} ({assignment.TargetId})"
            );
        }
        await _unitOfWork.WorkflowAssignments.DeleteAsync(id);
        return new ResponseResult<StringModel>(new StringModel { Value = id }, ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkflowAssignmentDto>>> GetByTargetAsync(string targetId)
    {
        // Simple filter - in a real app, this might be more complex
        var all = await _unitOfWork.WorkflowAssignments.GetAllAsync();
        var filtered = all.Where(x => x.TargetId == targetId).Select(MapToDto);
        return new ResponseResult<IEnumerable<WorkflowAssignmentDto>>(filtered, ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkflowAssignmentDto>>> GetByWorkflowAsync(string workflowId)
    {
        var assignments = await _unitOfWork.WorkflowAssignments.FindAsync(x => x.WorkflowId == workflowId);
        var dtos = assignments.Select(MapToDto).ToList();

        // Use case-insensitive grouping
        var docIds = dtos
            .Where(x => string.Equals(x.TargetType, "Document", StringComparison.OrdinalIgnoreCase))
            .Select(x => x.TargetId)
            .Distinct()
            .ToList();
            
        var wsIds = dtos
            .Where(x => string.Equals(x.TargetType, "Workspace", StringComparison.OrdinalIgnoreCase) || 
                        string.Equals(x.TargetType, "Folder", StringComparison.OrdinalIgnoreCase))
            .Select(x => x.TargetId)
            .Distinct()
            .ToList();

        var docs = new Dictionary<string, string>();
        if (docIds.Any())
        {
            var nullableDocIds = docIds.Cast<string?>().ToList();
            var dList = await _unitOfWork.Documents.FindAsync(d => nullableDocIds.Contains(d.Id));
            // Use Title. Fallback to "Untitled" if Title is null/empty.
            docs = dList.Where(d => d.Id != null).ToDictionary(d => d.Id!, d => !string.IsNullOrEmpty(d.Title) ? d.Title : "Untitled Document");
        }

        var workspaces = new Dictionary<string, string>();
        if (wsIds.Any())
        {
            var nullableWsIds = wsIds.Cast<string?>().ToList();
            var wList = await _unitOfWork.Workspaces.FindAsync(w => nullableWsIds.Contains(w.Id));
            workspaces = wList.Where(w => w.Id != null).ToDictionary(w => w.Id!, w => w.Name ?? "Untitled Folder");
        }

        foreach (var dto in dtos)
        {
            if (string.Equals(dto.TargetType, "Document", StringComparison.OrdinalIgnoreCase))
            {
                if (docs.TryGetValue(dto.TargetId, out var docName))
                    dto.TargetName = docName;
                else
                    dto.TargetName = !string.IsNullOrEmpty(dto.TargetName) ? dto.TargetName : "Unknown Document";
            }
            else if (string.Equals(dto.TargetType, "Workspace", StringComparison.OrdinalIgnoreCase) || 
                     string.Equals(dto.TargetType, "Folder", StringComparison.OrdinalIgnoreCase))
            {
                if (workspaces.TryGetValue(dto.TargetId, out var wsName))
                    dto.TargetName = wsName;
                else
                    dto.TargetName = "Unknown Folder";
            }
            else
            {
                 // For types we don't handle explicitly or unknown types
                 dto.TargetName = "Unknown Target";
            }
        }

        return new ResponseResult<IEnumerable<WorkflowAssignmentDto>>(dtos, ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<WorkflowAssignmentDto>> GetByIdAsync(string id)
    {
        var assignment = await _unitOfWork.WorkflowAssignments.GetByIdAsync(id);
        if (assignment == null)
            return new ResponseResult<WorkflowAssignmentDto>(_localizationService.Get("Msg_WfAssignmentNotFound"), ConstAppConfiguration.ApiStatusCode.NotFound);
        return new ResponseResult<WorkflowAssignmentDto>(MapToDto(assignment), ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<int>> ProcessAssignmentsAsync(string targetId, string userId)
    {
        // 1. Fetch Document
        var document = await _unitOfWork.Documents.GetByIdAsync(targetId);
        if (document == null) return new ResponseResult<int>(_localizationService.Get("Msg_DocumentNotFound"), ConstAppConfiguration.ApiStatusCode.NotFound);

        // 2. Determine potential assignment targets
        var targetIds = new List<string> { document.Id! };
        // Assuming FolderId and WorkspaceId are populated on document
        // Note: Check if FolderId is nullable/empty string handling
        if (!string.IsNullOrEmpty(document.ParentId)) targetIds.Add(document.ParentId);
        if (!string.IsNullOrEmpty(document.WorkspaceId)) targetIds.Add(document.WorkspaceId);

        // 3. Fetch Assignments for these targets
        var assignments = (await _unitOfWork.WorkflowAssignments.FindAsync(a => targetIds.Contains(a.TargetId))).ToList();
        
        if (!assignments.Any()) return new ResponseResult<int>(0, ConstAppConfiguration.ApiStatusCode.OK);

        // 4. Get User Roles for matching
        var userRoles = (await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == userId && ur.TenantId == document.TenantId)).Select(ur => ur.RoleId).ToList();

        int startedCount = 0;

        foreach (var assignment in assignments)
        {
            if (!assignment.IsActive) continue;

            // A. Check Document Type Match
            // If DocumentTypeIds is null or empty, it applies to ALL types.
            if (assignment.DocumentTypeIds != null && assignment.DocumentTypeIds.Any())
            {
                if (!assignment.DocumentTypeIds.Contains(document.DocumentType)) continue;
            }

            // B. Check Role Match
            // If RoleIds is null or empty, it applies to ALL roles (or ANY user).
            if (assignment.RoleIds != null && assignment.RoleIds.Any())
            {
                // User must have at least one of the required roles
                if (!assignment.RoleIds.Any(r => userRoles.Contains(r))) continue;

            }

            // C. Check Exception Match
            // User must NOT be in the exception list
            if (assignment.ExceptionUserIds != null && assignment.ExceptionUserIds.Contains(userId)) continue;

            // D. Check User Match (Wait, assignment doesn't have assigned users field for applicability?)
            // It only has RoleIds and ExceptionUserIds. So applies to anyone with role, unless exception.

            // Start Workflow
            var context = new MongoDB.Bson.BsonDocument
            {
                { "trigger_type", "Assignment" },
                { "target_id", document.Id },
                { "target_type", "Document" },
                { "assignment_id", assignment.Id }
            };

            await _workflowInstanceService.StartWorkflowAsync(assignment.WorkflowId, document.WorkspaceId ?? string.Empty, userId, context);
            startedCount++;
        }

        return new ResponseResult<int>(startedCount, ConstAppConfiguration.ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Workflow>> GetApplicableWorkflowAsync(string targetId, string actionCode, string userId, string? documentTypeId = null)
    {
        Console.WriteLine($"[Workflow Check] START checking for TargetId: {targetId}, Action: {actionCode}, UserId: {userId}");
        
        string? tenantId = null;
        string? docTypeId = documentTypeId; 
        
        // 1. Identify Context (Document vs Workspace)
        var document = await _unitOfWork.Documents.GetByIdAsync(targetId);
        if (document != null)
        {
            tenantId = document.TenantId;
            if (string.IsNullOrEmpty(tenantId) && !string.IsNullOrEmpty(document.WorkspaceId))
            {
                var ws = await _unitOfWork.Workspaces.GetByIdAsync(document.WorkspaceId);
                if (ws != null) tenantId = ws.TenantId;
            }
            docTypeId = document.DocumentType;
            // As per user feedback, DocumentType is expected to be the ID directly.
            Console.WriteLine($"[Workflow Check] Document found. Type: '{docTypeId}', Tenant: '{tenantId}'");
        }
        else
        {
             var workspace = await _unitOfWork.Workspaces.GetByIdAsync(targetId);
             if (workspace != null)
             {
                 tenantId = workspace.TenantId;
             }
             else
             {
                 Console.WriteLine($"[Workflow Check] ERROR: Target not found in DB.");
                 return new ResponseResult<Workflow>("Target not found", ConstAppConfiguration.ApiStatusCode.NotFound);
             }
        }

        // 2. Fetch User Roles
        var userRoles = new List<string>();
        if (!string.IsNullOrEmpty(userId))
        {
            IEnumerable<Core.Entities.UserRole> uRoles;
            if (!string.IsNullOrEmpty(tenantId))
            {
                // Preferred: filter by userId AND tenantId
                uRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == userId && ur.TenantId == tenantId);
            }
            else
            {
                // Fallback: tenantId unknown, search by userId only
                uRoles = await _unitOfWork.UserRoles.FindAsync(ur => ur.UserId == userId);
            }
            userRoles = uRoles.Select(ur => ur.RoleId).ToList();
            Console.WriteLine($"[Workflow Check] User '{userId}' has roles: [{string.Join(", ", userRoles)}] (tenantId={tenantId ?? "null"})");
        }

        // 3. Check Sequence
        // A. Check Document Itself (if it is a document)
        if (document != null)
        {
            var wf = await EvaluateAssignmentsForTargetAsync(document.Id!, document, docTypeId, actionCode, userId, userRoles);
            if (wf != null) 
            {
                Console.WriteLine($"[Workflow Check] SUCCESS! Found workflow on Document: {wf.Name}");
                return new ResponseResult<Workflow>(wf, ConstAppConfiguration.ApiStatusCode.OK);
            }

            // B. Check Workspace Hierarchy
            string? currentWorkspaceId = document.WorkspaceId;
            while (!string.IsNullOrEmpty(currentWorkspaceId))
            {
                var wfWs = await EvaluateAssignmentsForTargetAsync(currentWorkspaceId, document, docTypeId, actionCode, userId, userRoles);
                if (wfWs != null) 
                {
                    Console.WriteLine($"[Workflow Check] SUCCESS! Found workflow on Workspace {currentWorkspaceId}: {wfWs.Name}");
                    return new ResponseResult<Workflow>(wfWs, ConstAppConfiguration.ApiStatusCode.OK);
                }
                
                var workspace = await _unitOfWork.Workspaces.GetByIdAsync(currentWorkspaceId);
                if (workspace == null) break;
                currentWorkspaceId = workspace.ParentId;
            }
        }
        else
        {
            // Target Matches a Workspace directly, traverse up
            string? currentWorkspaceId = targetId;
            while (!string.IsNullOrEmpty(currentWorkspaceId))
            {
                // Document is null here, but docTypeId is passed from parameter (e.g., during upload)
                var wfWs = await EvaluateAssignmentsForTargetAsync(currentWorkspaceId, null, docTypeId, actionCode, userId, userRoles);
                if (wfWs != null) 
                {
                    Console.WriteLine($"[Workflow Check] SUCCESS! Found workflow on Workspace {currentWorkspaceId}: {wfWs.Name}");
                    return new ResponseResult<Workflow>(wfWs, ConstAppConfiguration.ApiStatusCode.OK);
                }
                
                var workspace = await _unitOfWork.Workspaces.GetByIdAsync(currentWorkspaceId);
                if (workspace == null) break;
                currentWorkspaceId = workspace.ParentId;
            }
        }

        Console.WriteLine($"[Workflow Check] COMPLETE. No applicable workflow found.");
        return new ResponseResult<Workflow>(default(Workflow)!, ConstAppConfiguration.ApiStatusCode.OK);
    }

    private async Task<Workflow?> EvaluateAssignmentsForTargetAsync(
        string targetId, 
        Document? document, 
        string? docTypeId, 
        string actionCode, 
        string userId, 
        List<string> userRoles)
    {
        var assignments = await _unitOfWork.WorkflowAssignments.FindAsync(a => a.TargetId == targetId);
        Console.WriteLine($"[Workflow Check] Found {assignments.Count()} assignments for target {targetId}");
        foreach (var assignment in assignments)
        {
             if (!assignment.IsActive) continue;

             // 1. Document Type Check
             // - If a document is involved (upload, share, etc.): enforce docType matching.
             // - If the action is on the workspace/folder itself (document=null AND docTypeId=null):
             //   skip docType filtering — the assignment covers the workspace as a whole.
             bool hasDocumentContext = document != null || !string.IsNullOrEmpty(docTypeId);
             if (hasDocumentContext && assignment.DocumentTypeIds != null && assignment.DocumentTypeIds.Any())
             {
                Console.WriteLine($"[Workflow Check] Document type check for assignment {assignment.Id}");
                 bool matched = false;
                 if (!string.IsNullOrEmpty(docTypeId) && assignment.DocumentTypeIds.Contains(docTypeId)) matched = true;
                 if (!matched) continue;
             }  
             
             // 2. Role Check
             // RoleIds = the roles that are SUBJECT to this workflow rule.
             // If RoleIds is empty → workflow applies to EVERYONE (any user action triggers it).
             // If RoleIds is set → workflow ONLY triggers when the acting user has one of these roles.
             if (assignment.RoleIds != null && assignment.RoleIds.Any())
             {
                 Console.WriteLine($"[Workflow Check] Assignment.RoleIds: [{string.Join(", ", assignment.RoleIds)}]");
                 Console.WriteLine($"[Workflow Check] User roles: [{string.Join(", ", userRoles)}]");
                 
                 // Normalize both sides to lowercase for comparison (handles ObjectId vs string mismatch)
                 var normalizedAssignmentRoles = assignment.RoleIds.Select(r => r.ToLowerInvariant()).ToList();
                 var normalizedUserRoles = userRoles.Select(r => r.ToLowerInvariant()).ToList();
                 
                 bool userHasRequiredRole = normalizedAssignmentRoles.Any(r => normalizedUserRoles.Contains(r));
                 Console.WriteLine($"[Workflow Check] Role match result: {userHasRequiredRole}");
                 if (!userHasRequiredRole) continue;
             }
             
             // 3. Exception Check
             var exceptionUsers = assignment.ExceptionUserIds ?? new List<string>();
             Console.WriteLine($"ExceptionUserIds: {string.Join(",", exceptionUsers)}");
             Console.WriteLine($"UserId: {userId}"); 
             if (exceptionUsers.Contains(userId)) continue;
             Console.WriteLine("passed exception check");

             // 4. Workflow Check
             var workflow = await _unitOfWork.Workflows.GetByIdAsync(assignment.WorkflowId);
             Console.WriteLine(workflow?.Name);
             if (workflow == null || !workflow.IsActive) continue;
             Console.WriteLine("passed workflow check");

             var match = workflow.Triggers?.Any(t => 
             {
                  // Check explicit code match first
                  if (!string.IsNullOrEmpty(t.TriggerCode))
                  {
                      return string.Equals(t.TriggerCode, actionCode, StringComparison.OrdinalIgnoreCase);
                  }

                  return false;
             }) ?? false;
             if (match) return workflow;
        }

        return null;
    }

    private WorkflowAssignmentDto MapToDto(WorkflowAssignment entity)
    {
        return new WorkflowAssignmentDto
        {
            Id = entity.Id!,
            WorkflowId = entity.WorkflowId,
            TargetId = entity.TargetId,
            TargetType = entity.TargetType,
            DocumentTypeIds = entity.DocumentTypeIds,
            RoleIds = entity.RoleIds,
            ExceptionUserIds = entity.ExceptionUserIds,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };
    }
    private static bool AreListsDeepEqual(IEnumerable<string>? list1, IEnumerable<string>? list2)
    {
        var l1 = list1?.Where(x => !string.IsNullOrEmpty(x)).OrderBy(x => x).ToList() ?? new List<string>();
        var l2 = list2?.Where(x => !string.IsNullOrEmpty(x)).OrderBy(x => x).ToList() ?? new List<string>();
        return l1.SequenceEqual(l2);
    }

    private List<string> GetTriggerKeys(Workflow workflow)
    {
        // Generates a unique key for each trigger:
        // If TriggerCode is present, use it (e.g., "Create", "Approve").
        // If TriggerCode is missing, fallback to TriggerType (e.g., "FolderEvent", "Manual").
        // This prevents duplicate assignments even for triggers without explicit codes.
        if (workflow.Triggers == null) return new List<string>();

        return workflow.Triggers.Select(t => 
            !string.IsNullOrEmpty(t.TriggerCode) ? t.TriggerCode : t.Type.ToString()
        ).Distinct().ToList();
    }
}
