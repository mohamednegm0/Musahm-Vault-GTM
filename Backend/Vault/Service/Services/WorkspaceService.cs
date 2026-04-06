using Core.DTOs.Workspace;
using Core.DTOs.Identity;
using Core.DTOs;
using Core.Entities;
using Core.Interfaces.Service;
using Core.Constants;
using ApiStatusCode = Core.Constants.ConstAppConfiguration.ApiStatusCode;
using Microsoft.AspNetCore.Http;


namespace Service;

using MongoDB.Bson;

public class WorkspaceService : IWorkspaceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IJsonLocalizationService _localizationService;
    private readonly IAuditLogService _auditLogService;
    private readonly IWorkflowAssignmentService _workflowAssignmentService;
    private readonly IWorkflowInstanceService _workflowInstanceService;

    public WorkspaceService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, IJsonLocalizationService localizationService, IAuditLogService auditLogService, IWorkflowAssignmentService workflowAssignmentService, IWorkflowInstanceService workflowInstanceService)
    {
        _unitOfWork = unitOfWork;
        _httpContextAccessor = httpContextAccessor;
        _localizationService = localizationService;
        _auditLogService = auditLogService;
        _workflowAssignmentService = workflowAssignmentService;
        _workflowInstanceService = workflowInstanceService;
    }

    public async Task<ResponseResult<IEnumerable<WorkspaceDetailsDto>>> GetWorkspacesAsync(CurrentUser currentUser)
    {
        var result = await _unitOfWork.Workspaces.FindAsync(w => w.TenantId == currentUser.TenantId && !w.IsDeleted);
        result = await FilterAccessibleWorkspacesAsync(result, currentUser);
        var dtos = await EnrichWorkspaceDetailsAsync(result, currentUser);
        return new ResponseResult<IEnumerable<WorkspaceDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<WorkspaceDetailsDto>> GetWorkspaceByIdAsync(string id, CurrentUser currentUser)
    {
        var result = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == id && w.TenantId == currentUser.TenantId && !w.IsDeleted)).FirstOrDefault();
        if (result == null)
        {
            return new ResponseResult<WorkspaceDetailsDto>(_localizationService.Get("Msg_WorkspaceNotFound"), ApiStatusCode.NotFound);
        }
        var dtos = await EnrichWorkspaceDetailsAsync(new[] { result }, currentUser);
        return new ResponseResult<WorkspaceDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Workspace>> CreateWorkspaceAsync(CreateWorkspaceRequestDto request, CurrentUser currentUser)
    {
        if (currentUser == null || string.IsNullOrEmpty(currentUser.TenantId) || string.IsNullOrEmpty(currentUser.UserId))
        {
             return new ResponseResult<Workspace>((string)_localizationService.Get("Msg_WorkspaceRequiredUser"), ApiStatusCode.UnAuthorized);
        }

        // Enforce unique workspace name per tenant + parent
        var duplicate = (await _unitOfWork.Workspaces.FindAsync(w =>
            w.TenantId == currentUser.TenantId &&
            w.ParentId == request.ParentId &&
            w.Name == request.Name &&
            !w.IsDeleted)).FirstOrDefault();
        if (duplicate != null)
        {
            return new ResponseResult<Workspace>(_localizationService.Get("Msg_WorkspaceNameExists"), ApiStatusCode.BadRequest);
        }

        var workspace = new Workspace
        {
            Name = request.Name,
            Slug = GenerateSlug(request.Name),
            Description = request.Description,
            Type = request.Type,
            RetentionPolicyId = request.RetentionPolicyId,
            LegalHold = request.LegalHold,
            IsQuickAccess = request.IsQuickAccess,
            ParentId = request.ParentId,
            Settings = request.Settings == null ? new WorkspaceSettings() : new WorkspaceSettings
            {
                Privacy = request.Settings.Privacy,
                AllowInvites = request.Settings.AllowInvites,
                StorageLimitMb = request.Settings.StorageLimitMb
            },
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = currentUser.UserId,
            TenantId = currentUser.TenantId
        };

        await _unitOfWork.Workspaces.AddAsync(workspace);

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId,
            tenantId: currentUser.TenantId,
            action: "Create Workspace",
            entityType: "workspace",
            entityId: workspace.Id,
            details: $"Created workspace: {workspace.Name}"
        );

        return new ResponseResult<Workspace>(workspace, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Workspace>> UpdateWorkspaceAsync(string id, UpdateWorkspaceRequestDto request, CurrentUser currentUser)
    {
        var workspace = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == id && w.TenantId == currentUser.TenantId)).FirstOrDefault();
        if (workspace == null)
        {
            return new ResponseResult<Workspace>(_localizationService.Get("Msg_WorkspaceNotFound"), ApiStatusCode.NotFound);
        }

        if (workspace.LegalHold)
        {
            return new ResponseResult<Workspace>(_localizationService.Get("Msg_WorkspaceLegalHold"), ApiStatusCode.BadRequest);
        }

        // Enforce unique workspace name per tenant + parent (exclude self)
        if (workspace.Name != request.Name)
        {
            var duplicate = (await _unitOfWork.Workspaces.FindAsync(w =>
                w.TenantId == currentUser.TenantId &&
                w.ParentId == request.ParentId &&
                w.Name == request.Name &&
                w.Id != id &&
                !w.IsDeleted)).FirstOrDefault();
            if (duplicate != null)
            {
                return new ResponseResult<Workspace>(_localizationService.Get("Msg_WorkspaceNameExists"), ApiStatusCode.BadRequest);
            }
        }

        workspace.Name = request.Name;
        workspace.Slug = GenerateSlug(request.Name);
        workspace.Description = request.Description;
        workspace.Type = request.Type;
        workspace.RetentionPolicyId = request.RetentionPolicyId;
        workspace.LegalHold = request.LegalHold;
        
        if (request.Settings != null)
        {
            workspace.Settings = new WorkspaceSettings
            {
                Privacy = request.Settings.Privacy,
                AllowInvites = request.Settings.AllowInvites,
                StorageLimitMb = request.Settings.StorageLimitMb
            };
        }

        workspace.IsActive = request.IsActive;
        workspace.IsArchived = request.IsArchived;
        workspace.IsQuickAccess = request.IsQuickAccess;
        workspace.ParentId = request.ParentId;

        workspace.UpdatedAt = DateTime.UtcNow;
        if (currentUser != null)
        {
            workspace.UpdatedBy = currentUser.UserId;
        }

        // ── Workflow Check ──────────────────────────────────────────────────────
        Console.WriteLine($"[WorkspaceUpdate] Checking workflow: workspaceId={id}, userId={currentUser?.UserId}");
        var workflowResult = await _workflowAssignmentService.GetApplicableWorkflowAsync(
            id, ConstWorkflowTriggers.Update, currentUser?.UserId ?? string.Empty);
        Console.WriteLine($"[WorkspaceUpdate] Workflow result: IsSucceeded={workflowResult.IsSucceeded}, Found={(workflowResult.ReturnData != null ? workflowResult.ReturnData.Name : "NONE")}");

        if (workflowResult.IsSucceeded && workflowResult.ReturnData != null)
        {
            var applicableWorkflow = workflowResult.ReturnData;

            // Audit log — update is pending
            await _auditLogService.LogAsync(
                actorUserId: currentUser!.UserId!,
                tenantId: currentUser.TenantId!,
                action: "Update Workspace (Pending Workflow Approval)",
                entityType: "workspace",
                entityId: id,
                details: $"Update for workspace '{workspace.Name}' is pending workflow '{applicableWorkflow.Name}' approval"
            );

            // Start the workflow instance — this creates the Task and sends emails
            try
            {
                var pendingChanges = new BsonDocument
                {
                    { "name",             request.Name        ?? "" },
                    { "slug",             request.Slug        ?? "" },
                    { "description",      request.Description ?? "" },
                    { "type",             request.Type        ?? "" },
                    { "is_active",        request.IsActive },
                    { "privacy",          request.Settings?.Privacy    ?? "" },
                    { "allow_invites",    request.Settings?.AllowInvites ?? false },
                    { "storage_limit_mb", request.Settings?.StorageLimitMb ?? 0 }
                };

                var context = new BsonDocument
                {
                    { "trigger_type", ConstWorkflowTriggers.Update },
                    { "target_id",   id },
                    { "target_type", "Workspace" },
                    { "target_name", workspace.Name },
                    { "pending_changes", pendingChanges },
                    { "updated_by", currentUser.UserId! }
                };
                Console.WriteLine($"[WorkspaceUpdate] Starting workflow {applicableWorkflow.Id}...");
                var startResult = await _workflowInstanceService.StartWorkflowAsync(
                    applicableWorkflow.Id!,
                    id,
                    currentUser.UserId!,
                    context);
                Console.WriteLine($"[WorkspaceUpdate] Workflow started. Instance created.");
            }
            catch (Exception wfEx)
            {
                Console.WriteLine($"[WorkspaceUpdate] ❌ Workflow start FAILED: {wfEx.Message}\n{wfEx.StackTrace}");
            }

            return new ResponseResult<Workspace>(
                (string)_localizationService.Get("Msg_WorkspaceWorkflowUpdate"),
                ApiStatusCode.WorkflowRequired);
        }
        // ───────────────────────────────────────────────────────────────────────

        await _unitOfWork.Workspaces.UpdateAsync(id, workspace);

        if (currentUser != null)
        {
            await _auditLogService.LogAsync(
                actorUserId: currentUser.UserId!,
                tenantId: currentUser.TenantId!,
                action: "Update Workspace",
                entityType: "workspace",
                entityId: id,
                details: $"Updated workspace: {workspace.Name}"
            );
        }

        return new ResponseResult<Workspace>(workspace, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<StringModel>> DeleteWorkspaceAsync(string id, CurrentUser currentUser)
    {
        var workspace = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == id && w.TenantId == currentUser.TenantId && !w.IsDeleted)).FirstOrDefault();
        if (workspace == null)
        {
            return new ResponseResult<StringModel>(_localizationService.Get("Msg_WorkspaceNotFound"), ApiStatusCode.NotFound);
        }

        if (workspace.LegalHold)
        {
            return new ResponseResult<StringModel>(_localizationService.Get("Msg_WorkspaceLegalHold"), ApiStatusCode.BadRequest);
        }

        // ── Workflow Check ──────────────────────────────────────────────────────
        var workflowResult = await _workflowAssignmentService.GetApplicableWorkflowAsync(
            id, ConstWorkflowTriggers.Delete, currentUser?.UserId ?? string.Empty);

        if (workflowResult.IsSucceeded && workflowResult.ReturnData != null)
        {
            var applicableWorkflow = workflowResult.ReturnData;

            await _auditLogService.LogAsync(
                actorUserId: currentUser!.UserId!,
                tenantId: currentUser.TenantId!,
                action: "Delete Workspace (Pending Workflow Approval)",
                entityType: "workspace",
                entityId: id,
                details: $"Deletion for workspace '{workspace.Name}' is pending workflow '{applicableWorkflow.Name}' approval"
            );

            var context = new BsonDocument
            {
                { "trigger_type", ConstWorkflowTriggers.Delete },
                { "target_id",   id },
                { "target_type", "Workspace" },
                { "target_name", workspace.Name },
                { "deleted_by", currentUser.UserId! }
            };

            await _workflowInstanceService.StartWorkflowAsync(
                applicableWorkflow.Id!,
                id,
                currentUser.UserId!,
                context);

            return new ResponseResult<StringModel>(
                (string)_localizationService.Get("Msg_WorkspaceWorkflowDelete") ?? "Workflow Initiated. Delete pending approval.",
                ApiStatusCode.WorkflowRequired);
        }
        // ───────────────────────────────────────────────────────────────────────

        workspace.IsDeleted = true;
        workspace.DeletedAt = DateTime.UtcNow;
        workspace.DeletedBy = currentUser.UserId;
        await _unitOfWork.Workspaces.UpdateAsync(id, workspace);

        // MUS-737: Cascade soft-delete all documents in this workspace
        var workspaceDocs = await _unitOfWork.Documents.FindAsync(d =>
            d.WorkspaceId == id && d.TenantId == currentUser.TenantId && !d.IsDeleted);
        foreach (var doc in workspaceDocs)
        {
            doc.IsDeleted = true;
            doc.DeletedAt = DateTime.UtcNow;
            doc.DeletedBy = currentUser.UserId;
            if (doc.Id != null)
                await _unitOfWork.Documents.UpdateAsync(doc.Id, doc);
        }

        // MUS-737: Recursively cascade soft-delete all descendant workspaces and their documents
        var childWorkspaces = await _unitOfWork.Workspaces.FindAsync(w =>
            w.ParentId == id && w.TenantId == currentUser.TenantId && !w.IsDeleted);
        foreach (var child in childWorkspaces)
        {
            child.IsDeleted = true;
            child.DeletedAt = DateTime.UtcNow;
            child.DeletedBy = currentUser.UserId;
            if (child.Id != null)
            {
                await _unitOfWork.Workspaces.UpdateAsync(child.Id, child);
                // Recurse: soft-delete documents and grandchildren of this child
                await CascadeSoftDeleteDescendantsAsync(child.Id, currentUser);
            }
        }

        await _auditLogService.LogAsync(
            actorUserId: currentUser.UserId!,
            tenantId: currentUser.TenantId!,
            action: "Delete Workspace",
            entityType: "workspace",
            entityId: id,
            details: $"Deleted workspace: {workspace.Name}"
        );

        return new ResponseResult<StringModel>(new StringModel { Value = _localizationService.Get("Msg_WorkspaceDeletedSuccess") }, ApiStatusCode.OK);
    }

    /// <summary>
    /// MUS-737: Recursively soft-delete all documents and descendant workspaces under a given parent.
    /// </summary>
    private async System.Threading.Tasks.Task CascadeSoftDeleteDescendantsAsync(string parentId, CurrentUser currentUser)
    {
        // Soft-delete documents in this workspace
        var docs = await _unitOfWork.Documents.FindAsync(d =>
            d.WorkspaceId == parentId && d.TenantId == currentUser.TenantId && !d.IsDeleted);
        foreach (var doc in docs)
        {
            doc.IsDeleted = true;
            doc.DeletedAt = DateTime.UtcNow;
            doc.DeletedBy = currentUser.UserId;
            if (doc.Id != null)
                await _unitOfWork.Documents.UpdateAsync(doc.Id, doc);
        }

        // Find and soft-delete child workspaces, then recurse
        var children = await _unitOfWork.Workspaces.FindAsync(w =>
            w.ParentId == parentId && w.TenantId == currentUser.TenantId && !w.IsDeleted);
        foreach (var child in children)
        {
            child.IsDeleted = true;
            child.DeletedAt = DateTime.UtcNow;
            child.DeletedBy = currentUser.UserId;
            if (child.Id != null)
            {
                await _unitOfWork.Workspaces.UpdateAsync(child.Id, child);
                await CascadeSoftDeleteDescendantsAsync(child.Id, currentUser);
            }
        }
    }

    public async Task<ResponseResult<Workspace>> DeactivateWorkspaceAsync(string id, CurrentUser currentUser)
    {
        var workspace = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == id && w.TenantId == currentUser.TenantId)).FirstOrDefault();
        if (workspace == null)
        {
            return new ResponseResult<Workspace>(_localizationService.Get("Msg_WorkspaceNotFound"), ApiStatusCode.NotFound);
        }

        workspace.IsActive = false;
        workspace.UpdatedAt = DateTime.UtcNow;
        if (currentUser != null)
        {
            workspace.UpdatedBy = currentUser.UserId;
            
            await _auditLogService.LogAsync(
                actorUserId: currentUser.UserId!,
                tenantId: currentUser.TenantId!,
                action: "Deactivate Workspace",
                entityType: "workspace",
                entityId: id,
                details: $"Deactivated workspace: {workspace.Name}"
            );
        }

        await _unitOfWork.Workspaces.UpdateAsync(id, workspace);
        return new ResponseResult<Workspace>(workspace, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkspaceDetailsDto>>> GetQuickAccessWorkspacesAsync(CurrentUser currentUser)
    {
        var result = await _unitOfWork.Workspaces.FindAsync(x => x.IsQuickAccess && x.TenantId == currentUser.TenantId && !x.IsDeleted);
        result = await FilterAccessibleWorkspacesAsync(result, currentUser);
        var dtos = await EnrichWorkspaceDetailsAsync(result, currentUser);
        return new ResponseResult<IEnumerable<WorkspaceDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Workspace>> SetQuickAccessAsync(string id, bool isQuickAccess, CurrentUser currentUser)
    {
        var workspace = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == id && w.TenantId == currentUser.TenantId && !w.IsDeleted)).FirstOrDefault();
        if (workspace == null)
        {
            return new ResponseResult<Workspace>(_localizationService.Get("Msg_WorkspaceNotFound"), ApiStatusCode.NotFound);
        }

        workspace.IsQuickAccess = isQuickAccess;
        workspace.UpdatedAt = DateTime.UtcNow;
        if (currentUser != null)
        {
            workspace.UpdatedBy = currentUser.UserId;

            await _auditLogService.LogAsync(
                actorUserId: currentUser.UserId!,
                tenantId: currentUser.TenantId!,
                action: isQuickAccess ? "Add Quick Access" : "Remove Quick Access",
                entityType: "workspace",
                entityId: id,
                details: $"Set quick access to {isQuickAccess} for workspace: {workspace.Name}"
            );
        }

        await _unitOfWork.Workspaces.UpdateAsync(id, workspace);
        return new ResponseResult<Workspace>(workspace, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkspaceDetailsDto>>> GetWorkspacesByParentIdAsync(string parentId, CurrentUser currentUser)
    {
        var result = await _unitOfWork.Workspaces.FindAsync(x => x.ParentId == parentId && x.TenantId == currentUser.TenantId && !x.IsDeleted);
        result = await FilterAccessibleWorkspacesAsync(result, currentUser);
        var dtos = await EnrichWorkspaceDetailsAsync(result, currentUser);
        return new ResponseResult<IEnumerable<WorkspaceDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkspaceDetailsDto>>> GetRootWorkspacesAsync(CurrentUser currentUser)
    {
        var result = await _unitOfWork.Workspaces.FindAsync(x => x.ParentId == null && x.TenantId == currentUser.TenantId && !x.IsDeleted);
        result = await FilterAccessibleWorkspacesAsync(result, currentUser);
        var dtos = await EnrichWorkspaceDetailsAsync(result, currentUser);
        return new ResponseResult<IEnumerable<WorkspaceDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    private async Task<IEnumerable<Workspace>> FilterAccessibleWorkspacesAsync(IEnumerable<Workspace> workspaces, CurrentUser currentUser)
    {
        if (currentUser == null || string.IsNullOrEmpty(currentUser.UserId))
            return workspaces;

        // Check if user has the Vault Admin role in the database (NOT the GRC JWT IsAdmin claim)
        var isVaultAdmin = await IsVaultAdminAsync(currentUser);
        if (isVaultAdmin)
            return workspaces;

        var userMemberships = await _unitOfWork.WorkspaceMembers.FindAsync(m => m.UserId == currentUser.UserId && m.TenantId == currentUser.TenantId);
        var memberWorkspaceIds = userMemberships.Select(m => m.WorkspaceId).ToHashSet();

        return workspaces.Where(w => 
            w.CreatedBy == currentUser.UserId || 
            (w.Id != null && memberWorkspaceIds.Contains(w.Id)) || 
            (w.Settings != null && string.Equals(w.Settings.Privacy, "public", StringComparison.OrdinalIgnoreCase))
        ).ToList();
    }

    private async Task<bool> IsVaultAdminAsync(CurrentUser currentUser)
    {
        if (string.IsNullOrEmpty(currentUser.UserId) || string.IsNullOrEmpty(currentUser.TenantId))
            return false;

        // Get the admin role by code
        var adminRole = (await _unitOfWork.Roles.FindAsync(r => r.Code == ConstRoles.Admin)).FirstOrDefault();
        if (adminRole == null || string.IsNullOrEmpty(adminRole.Id))
            return false;

        // Check if this user has the admin role assigned
        var userAdminRole = (await _unitOfWork.UserRoles.FindAsync(
            ur => ur.UserId == currentUser.UserId && 
                  ur.RoleId == adminRole.Id && 
                  ur.TenantId == currentUser.TenantId
        )).FirstOrDefault();

        return userAdminRole != null;
    }



    private async Task<List<WorkspaceDetailsDto>> EnrichWorkspaceDetailsAsync(IEnumerable<Workspace> workspaces, CurrentUser currentUser)
    {
        var dtos = workspaces.Select(w => new WorkspaceDetailsDto
        {
            Id = w.Id,
            TenantId = w.TenantId,
            ParentId = w.ParentId,
            Name = w.Name,
            Slug = w.Slug,
            Description = w.Description,
            Type = w.Type,
            RetentionPolicyId = w.RetentionPolicyId,
            LegalHold = w.LegalHold,
            Settings = w.Settings,
            Stats = w.Stats,
            IsActive = w.IsActive,
            IsArchived = w.IsArchived,
            IsQuickAccess = w.IsQuickAccess,
            CreatedBy = w.CreatedBy,
            CreatedAt = w.CreatedAt,
            UpdatedBy = w.UpdatedBy,
            UpdatedAt = w.UpdatedAt
        }).ToList();

        await PopulateWorkspaceCountsAsync(dtos, currentUser);

        var userIds = new HashSet<string>();
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
            if (!string.IsNullOrEmpty(dto.UpdatedBy)) userIds.Add(dto.UpdatedBy);
        }

        if (!userIds.Any()) return dtos;

        var userMaps = await _unitOfWork.UserMaps.FindAsync(u => u.Id != null && userIds.Contains(u.Id));
        var userMapDict = userMaps.Where(u => u.Id != null).ToDictionary(u => u.Id!, u => u);

        var lang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString() ?? "ar";
        bool isEnglish = lang.Contains("en", StringComparison.OrdinalIgnoreCase);

        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy) && userMapDict.TryGetValue(dto.CreatedBy, out var createdByMap))
            {
                dto.CreatedByName = isEnglish ? createdByMap.GrcNameEn : createdByMap.GrcNameAr;
            }

            if (!string.IsNullOrEmpty(dto.UpdatedBy) && userMapDict.TryGetValue(dto.UpdatedBy, out var updatedByMap))
            {
                dto.UpdatedByName = isEnglish ? updatedByMap.GrcNameEn : updatedByMap.GrcNameAr;
            }
        }

        return dtos;
    }

    private async Task PopulateWorkspaceCountsAsync(List<WorkspaceDetailsDto> dtos, CurrentUser currentUser)
    {
        if (!dtos.Any() || string.IsNullOrEmpty(currentUser?.TenantId))
        {
            return;
        }

        var workspaceIds = dtos
            .Where(dto => !string.IsNullOrEmpty(dto.Id))
            .Select(dto => dto.Id!)
            .Distinct()
            .ToList();

        if (!workspaceIds.Any())
        {
            return;
        }

        var childWorkspaces = await _unitOfWork.Workspaces.FindAsync(w =>
            w.ParentId != null &&
            workspaceIds.Contains(w.ParentId) &&
            w.TenantId == currentUser.TenantId &&
            !w.IsDeleted);

        childWorkspaces = await FilterAccessibleWorkspacesAsync(childWorkspaces, currentUser);

        var childCounts = childWorkspaces
            .Where(w => !string.IsNullOrEmpty(w.ParentId))
            .GroupBy(w => w.ParentId!)
            .ToDictionary(group => group.Key, group => group.Count());

        var documents = await _unitOfWork.Documents.FindAsync(d =>
            d.WorkspaceId != null &&
            workspaceIds.Contains(d.WorkspaceId) &&
            d.TenantId == currentUser.TenantId &&
            !d.IsDeleted);

        var isVaultAdmin = await IsVaultAdminAsync(currentUser);
        documents = documents
            .Where(d => d.Status != "Pending" || isVaultAdmin || d.OwnerUserId == currentUser.UserId)
            .ToList();

        var documentCounts = documents
            .Where(d => !string.IsNullOrEmpty(d.WorkspaceId))
            .GroupBy(d => d.WorkspaceId!)
            .ToDictionary(group => group.Key, group => group.Count());

        foreach (var dto in dtos)
        {
            if (string.IsNullOrEmpty(dto.Id))
            {
                dto.ChildCount = 0;
                dto.DocumentCount = 0;
                continue;
            }

            dto.ChildCount = childCounts.GetValueOrDefault(dto.Id, 0);
            dto.DocumentCount = documentCounts.GetValueOrDefault(dto.Id, 0);
        }
    }

    private static string GenerateSlug(string name)
        => name.ToLowerInvariant().Replace(" ", "-").Replace("_", "-");
}
