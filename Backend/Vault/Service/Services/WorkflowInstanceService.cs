using Core.Entities;
using Core.Enums;
using Core.Interfaces.Service;
using Core.Repository;
using MongoDB.Bson;
using Core.DTOs;
using Core.DTOs.WorkflowInstance;
using Core.Constants;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration; // Added

namespace Service;

public class WorkflowInstanceService : IWorkflowInstanceService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IEmailService _emailService;
    private readonly IAuditLogService _auditLogService;
    private readonly string _frontendUrl;

    public WorkflowInstanceService(IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor, IEmailService emailService, IAuditLogService auditLogService, IConfiguration config)
    { 
        _unitOfWork = unitOfWork; 
        _httpContextAccessor = httpContextAccessor;
        _emailService = emailService;
        _auditLogService = auditLogService;
        _frontendUrl = config["EmailSettings:FrontendUrl"] ?? "https://www-s2.vault.musahm.com";
    }

    public async Task<ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>> GetAllAsync()
    {
        var result = await _unitOfWork.WorkflowInstances.GetAllAsync();
        var dtos = await EnrichWithUserNames(result);
        return new ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<WorkflowInstanceDetailsDto>> GetByIdAsync(string id)
    {
        var entity = await _unitOfWork.WorkflowInstances.GetByIdAsync(id);
        if (entity == null) return new ResponseResult<WorkflowInstanceDetailsDto>("Instance not found", ApiStatusCode.NotFound);
        var dtos = await EnrichWithUserNames(new[] { entity });
        return new ResponseResult<WorkflowInstanceDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }
    
    public async Task<ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>> GetByWorkflowAsync(string workflowId)
    {
        var entities = await _unitOfWork.WorkflowInstances.FindAsync(x => x.WorkflowId == workflowId);
        var dtos = await EnrichWithUserNames(entities);
        return new ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>> GetByTargetAsync(string targetId)
    {
        // Search in Context for target_id = targetId
        // Implicit conversion from string to BsonValue should work for equality check in driver
        // MongoDB LINQ doesn't support BsonDocument.Contains() in expressions
        // Fetch all instances then filter in-memory
        var allInstances = await _unitOfWork.WorkflowInstances.GetAllAsync();
        var entities = allInstances.Where(
            x => x.Context != null && x.Context.Contains("target_id") && x.Context["target_id"].AsString == targetId);
        var dtos = await EnrichWithUserNames(entities);
        return new ResponseResult<IEnumerable<WorkflowInstanceDetailsDto>>(dtos, ApiStatusCode.OK);
    }
    
    public async Task<ResponseResult<WorkflowInstance>> CreateAsync(WorkflowInstance entity) 
    {
        await _unitOfWork.WorkflowInstances.AddAsync(entity);
        return new ResponseResult<WorkflowInstance>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<WorkflowInstance>> UpdateAsync(string id, WorkflowInstance entity) 
    {
        await _unitOfWork.WorkflowInstances.UpdateAsync(id, entity);
        return new ResponseResult<WorkflowInstance>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id) 
    {
        await _unitOfWork.WorkflowInstances.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, "Deleted Successfully");
    }

    public async Task<ResponseResult<WorkflowInstance>> StartWorkflowAsync(string workflowId, string workspaceId, string userId, BsonDocument? context = null)
    {
        var workflow = await _unitOfWork.Workflows.GetByIdAsync(workflowId);
        if (workflow == null) return new ResponseResult<WorkflowInstance>("Workflow not found", ApiStatusCode.NotFound);
        
        var claims = _httpContextAccessor.HttpContext?.User?.Claims;
        var currentTenantId = claims?.FirstOrDefault(c => c.Type == "tenant_id")?.Value;
        var resolvedTenantId = workflow.TenantId;
        if (!string.IsNullOrEmpty(currentTenantId))
        {
             resolvedTenantId = currentTenantId;
        }

        string? safeWorkspaceId = string.IsNullOrEmpty(workspaceId) ? null : workspaceId;
        string? safeUserId = string.IsNullOrEmpty(userId) ? null : userId;

        var instance = new WorkflowInstance
        {
            WorkspaceId = safeWorkspaceId,
            TenantId = resolvedTenantId,
            WorkflowId = workflowId,
            WorkflowName = workflow.Name,
            Status = WorkflowStatus.Active,
            Context = context ?? new BsonDocument(),
            CreatedBy = safeUserId,
            CreatedAt = DateTime.UtcNow,
            Steps = workflow.Steps.Select(s => new RuntimeWorkflowStep
            {
                StepId = s.StepId,
                Title = s.Title,
                Type = s.Type,
                DependsOn = s.DependsOn,
                ActionConfig = s.ActionConfig,
                UiMetadata = s.UiMetadata,
                Status = StepStatus.Pending
            }).ToList()
        };
        
        await _unitOfWork.WorkflowInstances.AddAsync(instance);
        
        // Log Activity
        string? docId = null;
        if (context != null && context.Contains("target_type") && context["target_type"] == "Document" && context.Contains("target_id"))
        {
            docId = context["target_id"].AsString;
        }

        await LogActivity(instance.TenantId, instance.WorkspaceId, userId, 
            "Workflow Started", 
            $"Workflow '{workflow.Name}' has been started.", docId);

        // && context.Contains("trigger_type")
        if (context != null)
        {
             instance.History.Add(new WorkflowHistoryItem { 
                 StepId = "START", 
                 Action = "Triggered"
                //  Comment = $"Triggered by {context["trigger_type"]}" 
             });
        }
        Console.WriteLine("Evaluating workflow state");
        await EvaluateWorkflowState(instance);

        return new ResponseResult<WorkflowInstance>(instance, ApiStatusCode.OK);
    }

    private async System.Threading.Tasks.Task LogActivity(string? tenantId, string? workspaceId, string? userId, string action, string details, string? documentId = null)
    {
        try
        {
            var activity = new Activity
            {
                TenantId = tenantId,
                WorkspaceId = workspaceId,
                UserId = userId,
                DocumentId = documentId,
                Action = action,
                Details = details,
                CreatedAt = DateTime.UtcNow
            };
            Console.WriteLine($"[WorkflowInstanceService] LogActivity: {action} | Tenant: {tenantId}");
            await _unitOfWork.Activities.AddAsync(activity);
            Console.WriteLine($"[WorkflowInstanceService] LogActivity: SUCCESS");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[WorkflowInstanceService] LogActivity: FAILED - {ex.Message}");
        }
    }

    public async Task<ResponseResult<object>> ProcessActionAsync(string instanceId, string stepId, string actorId, string action, BsonDocument? data = null)
    {
        var instance = await _unitOfWork.WorkflowInstances.GetByIdAsync(instanceId);
        if (instance == null) return new ResponseResult<object>("Instance not found", ApiStatusCode.NotFound);

        var step = instance.Steps.FirstOrDefault(s => s.StepId == stepId);
        if (step == null) return new ResponseResult<object>("Step not found", ApiStatusCode.NotFound);

        if (step.Status == StepStatus.Completed || step.Status == StepStatus.Rejected)
            return new ResponseResult<object>("Step already processed", ApiStatusCode.BadRequest);

        if (step.ActionConfig != null && step.ActionConfig.RequiredFields != null && step.ActionConfig.RequiredFields.Any())
        {
            if (data == null) return new ResponseResult<object>($"Missing required data. Fields needed: {string.Join(", ", step.ActionConfig.RequiredFields)}", ApiStatusCode.BadRequest);
            
            var missingFields = step.ActionConfig.RequiredFields.Where(f => !data.Contains(f)).ToList();
            if (missingFields.Any())
            {
                return new ResponseResult<object>($"Missing required fields: {string.Join(", ", missingFields)}", ApiStatusCode.BadRequest);
            }
        }

        step.CompletedBy = actorId;
        step.CompletedAt = DateTime.UtcNow;
        step.OutputData = data;
        
        if (action.Equals("Reject", StringComparison.OrdinalIgnoreCase) || action.Equals("Rejected", StringComparison.OrdinalIgnoreCase)) {
             step.Status = StepStatus.Rejected;
             instance.Status = WorkflowStatus.Terminated; // Stop flow

             // Handle "Upload" workflow rejection (Delete the pending document)
             if (instance.Context != null && 
                 instance.Context.Contains("trigger_code") && 
                 instance.Context["trigger_code"].AsString.Equals(ConstWorkflowTriggers.Upload, StringComparison.OrdinalIgnoreCase) &&
                 instance.Context.Contains("target_id") && 
                 (instance.Context.Contains("target_type") && instance.Context["target_type"].AsString == "Document" || !instance.Context.Contains("target_type")))
             {
                 var docIdToReject = instance.Context["target_id"].AsString;
                 var docToReject = (await _unitOfWork.Documents.FindAsync(d => d.Id == docIdToReject)).FirstOrDefault();
                 if (docToReject != null && docToReject.Status == "Pending")
                 {
                     await _unitOfWork.Documents.DeleteAsync(docToReject.Id!);
                 }
             }
        }
        else
        {
             step.Status = StepStatus.Completed;
        }

        instance.History.Add(new WorkflowHistoryItem
        {
            StepId = stepId,
            Action = action,
            ActorId = actorId,
            Timestamp = DateTime.UtcNow,
            Comment = data != null && data.Contains("comment") ? data["comment"].AsString : null
        });

        // Log Activity
        string cleanAction = (action ?? "").Trim();
        string actionPast;
        
        if (cleanAction.Equals("Approve", StringComparison.OrdinalIgnoreCase) || cleanAction.Equals("Approved", StringComparison.OrdinalIgnoreCase)) {
            actionPast = "approved";
        }
        else if (cleanAction.Equals("Reject", StringComparison.OrdinalIgnoreCase) || cleanAction.Equals("Rejected", StringComparison.OrdinalIgnoreCase)) {
            actionPast = "rejected";
        }
        else if (cleanAction.Equals("Complete", StringComparison.OrdinalIgnoreCase) || cleanAction.Equals("Completed", StringComparison.OrdinalIgnoreCase)) {
            actionPast = "completed";
        }
        else if (cleanAction.Equals("Review", StringComparison.OrdinalIgnoreCase) || cleanAction.Equals("Reviewed", StringComparison.OrdinalIgnoreCase)) {
            actionPast = "reviewed";
        }
        else {
            actionPast = cleanAction.EndsWith("e", StringComparison.OrdinalIgnoreCase) ? cleanAction + "d" : cleanAction + "ed";
        }

        var logTenantId = !string.IsNullOrEmpty(instance.TenantId) ? instance.TenantId : (await _unitOfWork.Workflows.GetByIdAsync(instance.WorkflowId!))?.TenantId;

        string? docId = null;
        string? docTitle = null;
        if (instance.Context != null)
        {
            if (instance.Context.Contains("document_id")) docId = instance.Context["document_id"].AsString;
            else if (instance.Context.Contains("target_id") && instance.Context.Contains("target_type") && instance.Context["target_type"] == "Document")
                docId = instance.Context["target_id"].AsString;
            else if (instance.Context.Contains("target_id") && !instance.Context.Contains("target_type")) // Fallback
                docId = instance.Context["target_id"].AsString;
        }

        if (!string.IsNullOrEmpty(docId))
        {
            try {
                var doc = await _unitOfWork.Documents.GetByIdAsync(docId);
                if (doc != null) docTitle = doc.Title;
            } catch {}
        }

        var detailsText = $"User has {actionPast.ToLower()} the step '{step.Title}' in workflow '{instance.WorkflowName}'.";
        if (!string.IsNullOrEmpty(docTitle))
        {
            detailsText = $"User has {actionPast.ToLower()} the step '{step.Title}' for document '{docTitle}' in workflow '{instance.WorkflowName}'.";
        }

        await LogActivity(logTenantId, instance.WorkspaceId, actorId, 
            $"Step {cleanAction}", detailsText, docId);


        if (!string.IsNullOrEmpty(step.AssignedTaskId))
        {
            var task = await _unitOfWork.Tasks.GetByIdAsync(step.AssignedTaskId);
            if (task != null)
            {
                // Update task status based on action
                 if (cleanAction.Equals("Reject", StringComparison.OrdinalIgnoreCase) || cleanAction.Equals("Rejected", StringComparison.OrdinalIgnoreCase)) {
                    task.Status = "Rejected";
                 } 
                 else if (cleanAction.Equals("Approve", StringComparison.OrdinalIgnoreCase) || cleanAction.Equals("Approved", StringComparison.OrdinalIgnoreCase)) {
                    task.Status = "Approved";
                 }
                 else {
                    task.Status = "Completed"; 
                 }
                
                // If the user provided a specific outcome that isn't just "Completed", we might want to respect it if it matches known statuses,
                // BUT for workflow steps, usually the step outcome drives the task status.
                // The current logic above forces "Rejected", "Approved", or "Completed".
                // If "outcome" passed from ProcessTaskCompletionAsync is "Rejected", it matches the first case.

                await _unitOfWork.Tasks.UpdateAsync(task.Id!, task);
            }
        }

        await _unitOfWork.WorkflowInstances.UpdateAsync(instance.Id!, instance);

        if (instance.Status == WorkflowStatus.Active)
            await EvaluateWorkflowState(instance);
            
        if (instance.Status != WorkflowStatus.Completed)
        {
            await _auditLogService.CreateAsync(new AuditLog
            {
                ActorUserId = actorId,
                Action = $"Workflow {cleanAction}",
                EntityType = "WorkflowInstance",
                EntityId = instanceId,
                Details = detailsText,
                CreatedAt = DateTime.UtcNow,
                TenantId = logTenantId
            });
        }
            
        return new ResponseResult<object>(null, ApiStatusCode.OK, "Action Processed");
    }
    
    public async Task<ResponseResult<object>> ProcessTaskCompletionAsync(string taskId, string actorId, string action, BsonDocument? data = null)
    {
         var task = await _unitOfWork.Tasks.GetByIdAsync(taskId);
         if (task == null) return new ResponseResult<object>("Task not found", ApiStatusCode.NotFound);
         
         if (task.RelatedEntity?.Type == "WorkflowInstance" && !string.IsNullOrEmpty(task.RelatedEntity.Id))
         {
             var instanceId = task.RelatedEntity.Id;
             var instance = await _unitOfWork.WorkflowInstances.GetByIdAsync(instanceId);
             if (instance != null)
             {
                 var step = instance.Steps.FirstOrDefault(s => s.AssignedTaskId == taskId);
                 if (step != null)
                 {
                     return await ProcessActionAsync(instanceId, step.StepId, actorId, action, data);
                 }
             }
         }
         return new ResponseResult<object>(null, ApiStatusCode.OK, "Task completion ignored (no workflow link)");
    }

    public async Task<ResponseResult<object>> EvaluateConfidenceAsync(string instanceId, double confidenceScore)
    {
        var instance = await _unitOfWork.WorkflowInstances.GetByIdAsync(instanceId);
        if (instance == null) return new ResponseResult<object>(false, ApiStatusCode.NotFound);
        
        var workflow = await _unitOfWork.Workflows.GetByIdAsync(instance.WorkflowId!);
        if (workflow == null) return new ResponseResult<object>(false, ApiStatusCode.NotFound);

        if (confidenceScore < workflow.MinConfidenceScore)
        {
             // Low confidence -> Insert Safety Check
             var reviewStep = new RuntimeWorkflowStep
             {
                 StepId = Guid.NewGuid().ToString(),
                 Title = "Safety Check: Low Confidence Review",
                 Type = WorkflowStepType.Action,
                 Status = StepStatus.Pending,
                 ActionConfig = new WorkflowActionConfig 
                 {
                     ActionType = WorkflowActionType.Review,
                     Instructions = $"AI Confidence was {confidenceScore:P1}. Please review document.",
                     AssigneeRole = "Admin"
                 },
                 DependsOn = new List<string>() 
             };
             
             instance.Steps.Insert(0, reviewStep);
             
             // Make other roots depend on this
             var otherRoots = instance.Steps.Where(s => s != reviewStep && (s.DependsOn == null || !s.DependsOn.Any())).ToList();
             foreach(var root in otherRoots)
             {
                 if (root.DependsOn == null) root.DependsOn = new List<string>();
                 root.DependsOn.Add(reviewStep.StepId);
             }
             
             instance.History.Add(new WorkflowHistoryItem
             {
                 StepId = "SYSTEM",
                 Action = "LowConfidenceWarning",
                 Comment = $"Confidence {confidenceScore} caused manual review trigger."
             });
             
             await _unitOfWork.WorkflowInstances.UpdateAsync(instance.Id!, instance);
             await EvaluateWorkflowState(instance);

             // MUS-751: Log low confidence review activity
             await LogActivity(instance.TenantId, instance.WorkspaceId, "SYSTEM",
                 "Low Confidence Review Inserted",
                 $"Confidence {confidenceScore:P1} below threshold for workflow instance '{instance.Id}'. Manual review step added.");

             return new ResponseResult<object>(false, ApiStatusCode.OK);
        }
        return new ResponseResult<object>(true, ApiStatusCode.OK); 
    }

    private async Task EvaluateWorkflowState(WorkflowInstance instance)
    {
        bool stepsChanged = false;
        bool keepEvaluating = true;
        int maxLoops = 10;
        int loops = 0;
        Console.WriteLine("Evaluating workflow state");
        while(keepEvaluating && loops < maxLoops)
        {
            keepEvaluating = false;
            loops++;
            Console.WriteLine("Evaluating workflow state loop");
            if (instance.Steps.All(s => s.Status == StepStatus.Completed || s.Status == StepStatus.Skipped || s.Status == StepStatus.Rejected))
            {
                Console.WriteLine("Evaluating workflow state all completed");
                 if (instance.Status != WorkflowStatus.Completed && instance.Status != WorkflowStatus.Terminated)
                 {
                     instance.Status = WorkflowStatus.Completed;
                     stepsChanged = true;
                     await OnWorkflowCompleted(instance);
                 }
                 break;
            }

            var pendingSteps = instance.Steps.Where(s => s.Status == StepStatus.Pending).ToList();
            foreach (var step in pendingSteps)
            {
                Console.WriteLine($"Evaluating pending step: {step.Title} ({step.StepId})");
                if (CanStart(step, instance))
                {
                    Console.WriteLine($"Starting step: {step.Title}");
                    await StartStepAsync(instance, step);
                    stepsChanged = true;
                    if (step.Status == StepStatus.Completed) keepEvaluating = true;
                }
            }
        }
        Console.WriteLine("Evaluating workflow state end");
        if (stepsChanged)
        {
            Console.WriteLine("Evaluating workflow state steps changed");
            instance.CurrentStepIds = instance.Steps.Where(s => s.Status == StepStatus.InProgress).Select(s => s.StepId).ToList();
            await _unitOfWork.WorkflowInstances.UpdateAsync(instance.Id!, instance);
        }
    }

    private async Task OnWorkflowCompleted(WorkflowInstance instance)
    {
        string finalActorId = instance.Steps
            .Where(s => s.Status == StepStatus.Completed && !string.IsNullOrEmpty(s.CompletedBy))
            .OrderByDescending(s => s.CompletedAt)
            .Select(s => s.CompletedBy)
            .FirstOrDefault() ?? instance.CreatedBy ?? "000000000000000000000000";

        // Log Activity
        string? docId = null;
        if (instance.Context != null && instance.Context.Contains("target_type") && instance.Context["target_type"] == "Document" && instance.Context.Contains("target_id"))
        {
            docId = instance.Context["target_id"].AsString;
        }

        await LogActivity(instance.TenantId, instance.WorkspaceId, "000000000000000000000000", 
            "Workflow Completed", 
            $"Workflow '{instance.WorkflowName}' has been successfully completed.", docId);

        // Handle "Share" workflow completion
        if (instance.Context != null && 
            instance.Context.Contains("trigger_code") && 
            instance.Context["trigger_code"].AsString.Equals(ConstWorkflowTriggers.Share, StringComparison.OrdinalIgnoreCase) &&
            instance.Context.Contains("invitation_ids") && 
            instance.Context["invitation_ids"].IsBsonArray)
        {
            var invitationIds = instance.Context["invitation_ids"].AsBsonArray.Select(x => x.AsString).ToList();
            if (invitationIds.Any())
            {
                var invitations = await _unitOfWork.Invitations.FindAsync(i => i.Id != null && invitationIds.Contains(i.Id));
                
                foreach(var inv in invitations)
                {
                    // Activate Invitation
                    inv.Status = "accepted";
                    await _unitOfWork.Invitations.UpdateAsync(inv.Id!, inv);
                    
                    // Send Email - Allow exception to bubble up so we know if it fails
                    await _emailService.SendInvitationEmailAsync(inv.Email, inv.Id!, inv.FileName);
                    
                    await _auditLogService.LogAsync(
                        actorUserId: finalActorId,
                        tenantId: instance.TenantId ?? "",
                        action: "Share Document (Approved)",
                        entityType: "document",
                        entityId: inv.DocumentId,
                        details: $"Document '{inv.FileName}' shared with {inv.Email} automatically after workflow '{instance.WorkflowName}' approval."
                    );
                }
            }
        }

        // Handle "Upload" workflow completion
        if (instance.Context != null && 
            instance.Context.Contains("trigger_code") && 
            instance.Context["trigger_code"].AsString.Equals(ConstWorkflowTriggers.Upload, StringComparison.OrdinalIgnoreCase) &&
            instance.Context.Contains("target_id") && 
            (instance.Context.Contains("target_type") && instance.Context["target_type"].AsString == "Document" || !instance.Context.Contains("target_type")))
        {
            var targetDocId = instance.Context["target_id"].AsString;
            var docToActivate = (await _unitOfWork.Documents.FindAsync(d => d.Id == targetDocId)).FirstOrDefault();
            if (docToActivate != null && docToActivate.Status == "Pending")
            {
                docToActivate.Status = "Active"; // Activate the document
                await _unitOfWork.Documents.UpdateAsync(docToActivate.Id!, docToActivate);
                
                await _auditLogService.LogAsync(
                    actorUserId: finalActorId,
                    tenantId: instance.TenantId ?? "",
                    action: "Upload Document (Approved)",
                    entityType: "document",
                    entityId: docToActivate.Id,
                    details: $"Document '{docToActivate.Title}' uploaded automatically after workflow '{instance.WorkflowName}' approval."
                );
            }
        }

        // Handle "Update" Document workflow completion
        if (instance.Context != null && 
            (
                (instance.Context.Contains("trigger_code") && instance.Context["trigger_code"].AsString.Equals("Update", StringComparison.OrdinalIgnoreCase)) ||
                (instance.Context.Contains("trigger_type") && instance.Context["trigger_type"].AsString.Equals("Update", StringComparison.OrdinalIgnoreCase))
            ) &&
            instance.Context.Contains("target_id") && 
            instance.Context.Contains("target_type") && instance.Context["target_type"].AsString.Equals("Document", StringComparison.OrdinalIgnoreCase) &&
            instance.Context.Contains("data"))
        {
            var targetDocId = instance.Context["target_id"].AsString;
            var docToUpdate = (await _unitOfWork.Documents.FindAsync(d => d.Id == targetDocId)).FirstOrDefault();
            
            if (docToUpdate != null)
            {
                var data = instance.Context["data"].AsBsonDocument;
                
                if (data.Contains("title") && !string.IsNullOrEmpty(data["title"].AsString)) 
                    docToUpdate.Title = data["title"].AsString;
                
                await _unitOfWork.Documents.UpdateAsync(docToUpdate.Id!, docToUpdate);
                
                await _auditLogService.LogAsync(
                    actorUserId: finalActorId,
                    tenantId: instance.TenantId ?? "",
                    action: "Update Document (Approved)",
                    entityType: "document",
                    entityId: docToUpdate.Id,
                    details: $"Document '{docToUpdate.Title}' updated automatically after workflow '{instance.WorkflowName}' approval."
                );
            }
        }

        // Handle "Delete" Document workflow completion
        if (instance.Context != null && 
            (
                (instance.Context.Contains("trigger_code") && instance.Context["trigger_code"].AsString.Equals("Delete", StringComparison.OrdinalIgnoreCase)) ||
                (instance.Context.Contains("trigger_type") && instance.Context["trigger_type"].AsString.Equals("Delete", StringComparison.OrdinalIgnoreCase))
            ) &&
            instance.Context.Contains("target_id") && 
            instance.Context.Contains("target_type") && instance.Context["target_type"].AsString.Equals("Document", StringComparison.OrdinalIgnoreCase))
        {
            var targetDocId = instance.Context["target_id"].AsString;
            var docToDelete = (await _unitOfWork.Documents.FindAsync(d => d.Id == targetDocId)).FirstOrDefault();
            
            if (docToDelete != null && !docToDelete.IsDeleted)
            {
                docToDelete.IsDeleted = true;
                docToDelete.DeletedAt = DateTime.UtcNow;
                docToDelete.DeletedBy = instance.CreatedBy;
                
                await _unitOfWork.Documents.UpdateAsync(docToDelete.Id!, docToDelete);
                
                await _auditLogService.LogAsync(
                    actorUserId: finalActorId,
                    tenantId: instance.TenantId ?? "",
                    action: "Delete Document (Approved)",
                    entityType: "document",
                    entityId: docToDelete.Id,
                    details: $"Document '{docToDelete.Title}' deleted automatically after workflow '{instance.WorkflowName}' approval."
                );
            }
        }

        // Handle "Update" Workspace workflow completion
        if (instance.Context != null && 
            (
                (instance.Context.Contains("trigger_code") && instance.Context["trigger_code"].AsString.Equals(ConstWorkflowTriggers.Update, StringComparison.OrdinalIgnoreCase)) ||
                (instance.Context.Contains("trigger_type") && instance.Context["trigger_type"].AsString.Equals(ConstWorkflowTriggers.Update, StringComparison.OrdinalIgnoreCase))
            ) &&
            instance.Context.Contains("target_id") && 
            instance.Context.Contains("target_type") && instance.Context["target_type"].AsString.Equals("Workspace", StringComparison.OrdinalIgnoreCase) &&
            instance.Context.Contains("pending_changes"))
        {
            var targetWorkspaceId = instance.Context["target_id"].AsString;
            var workspaceToUpdate = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == targetWorkspaceId)).FirstOrDefault();
            
            if (workspaceToUpdate != null)
            {
                var pendingChanges = instance.Context["pending_changes"].AsBsonDocument;
                
                if (pendingChanges.Contains("name")) workspaceToUpdate.Name = pendingChanges["name"].AsString;
                if (pendingChanges.Contains("slug")) workspaceToUpdate.Slug = pendingChanges["slug"].AsString;
                if (pendingChanges.Contains("description")) workspaceToUpdate.Description = pendingChanges["description"].AsString;
                if (pendingChanges.Contains("type")) workspaceToUpdate.Type = pendingChanges["type"].AsString;
                if (pendingChanges.Contains("is_active")) workspaceToUpdate.IsActive = pendingChanges["is_active"].AsBoolean;
                
                if (workspaceToUpdate.Settings == null) workspaceToUpdate.Settings = new Core.Entities.WorkspaceSettings();
                if (pendingChanges.Contains("privacy")) workspaceToUpdate.Settings.Privacy = pendingChanges["privacy"].AsString;
                if (pendingChanges.Contains("allow_invites")) workspaceToUpdate.Settings.AllowInvites = pendingChanges["allow_invites"].AsBoolean;
                if (pendingChanges.Contains("storage_limit_mb")) workspaceToUpdate.Settings.StorageLimitMb = pendingChanges["storage_limit_mb"].AsInt32;
                
                workspaceToUpdate.UpdatedAt = DateTime.UtcNow;
                if (instance.Context.Contains("updated_by"))
                {
                    workspaceToUpdate.UpdatedBy = instance.Context["updated_by"].AsString;
                }

                await _unitOfWork.Workspaces.UpdateAsync(workspaceToUpdate.Id!, workspaceToUpdate);
                
                await _auditLogService.LogAsync(
                    actorUserId: finalActorId,
                    tenantId: instance.TenantId ?? "",
                    action: "Update Workspace (Approved)",
                    entityType: "workspace",
                    entityId: workspaceToUpdate.Id,
                    details: $"Workspace '{workspaceToUpdate.Name}' updated automatically after workflow '{instance.WorkflowName}' approval."
                );
            }
        }

        // Handle "Delete" Workspace workflow completion
        if (instance.Context != null && 
            (
                (instance.Context.Contains("trigger_code") && instance.Context["trigger_code"].AsString.Equals(ConstWorkflowTriggers.Delete, StringComparison.OrdinalIgnoreCase)) ||
                (instance.Context.Contains("trigger_type") && instance.Context["trigger_type"].AsString.Equals(ConstWorkflowTriggers.Delete, StringComparison.OrdinalIgnoreCase))
            ) &&
            instance.Context.Contains("target_id") && 
            instance.Context.Contains("target_type") && instance.Context["target_type"].AsString.Equals("Workspace", StringComparison.OrdinalIgnoreCase))
        {
            var targetWorkspaceId = instance.Context["target_id"].AsString;
            var workspaceToDelete = (await _unitOfWork.Workspaces.FindAsync(w => w.Id == targetWorkspaceId)).FirstOrDefault();
            
            if (workspaceToDelete != null && !workspaceToDelete.IsDeleted)
            {
                workspaceToDelete.IsDeleted = true;
                workspaceToDelete.DeletedAt = DateTime.UtcNow;
                if (instance.Context.Contains("deleted_by"))
                {
                    workspaceToDelete.DeletedBy = instance.Context["deleted_by"].AsString;
                }
                
                await _unitOfWork.Workspaces.UpdateAsync(workspaceToDelete.Id!, workspaceToDelete);
                
                await _auditLogService.LogAsync(
                    actorUserId: finalActorId,
                    tenantId: instance.TenantId ?? "",
                    action: "Delete Workspace (Approved)",
                    entityType: "workspace",
                    entityId: workspaceToDelete.Id,
                    details: $"Workspace '{workspaceToDelete.Name}' deleted automatically after workflow '{instance.WorkflowName}' approval."
                );
            }
        }
    }

    private bool CanStart(RuntimeWorkflowStep step, WorkflowInstance instance)
    {
        if (step.DependsOn == null || !step.DependsOn.Any()) return true;
        
        foreach (var depId in step.DependsOn)
        {
            var dep = instance.Steps.FirstOrDefault(s => s.StepId == depId);
            if (dep == null) 
            {
                Console.WriteLine($"Step {step.Title} blocked: Dependency {depId} not found");
                return false;
            }
            if (dep.Status != StepStatus.Completed) 
            {
                Console.WriteLine($"Step {step.Title} blocked: Dependency {dep.Title} ({depId}) status is {dep.Status}");
                return false;
            }
        }
        Console.WriteLine($"Step {step.Title} CanStart: True");
        return true;
    }

    private async Task StartStepAsync(WorkflowInstance instance, RuntimeWorkflowStep step)
    {
        step.StartedAt = DateTime.UtcNow;
        step.Status = StepStatus.InProgress;

        if (step.Type == WorkflowStepType.Action)
        {
            string? docId = null;
            // Build a better description from Context
            var description = step.ActionConfig?.Instructions ?? step.Title;
            var taskTitle = step.Title;

            // Enrich description if we have Share context
            if (instance.Context != null && 
                instance.Context.Contains("trigger_code") && 
                instance.Context["trigger_code"].AsString.Equals(ConstWorkflowTriggers.Share, StringComparison.OrdinalIgnoreCase))
            {
                var targetId = instance.Context.Contains("target_id") ? instance.Context["target_id"].AsString : "Unknown Document";
                docId = targetId;
                
                // Try to get document name if possible
                var docName = targetId; 
                try {
                     var doc = await _unitOfWork.Documents.GetByIdAsync(targetId);
                     if (doc != null) docName = doc.Title;
                } catch {}

                // Get Creator Name
                var createdByName = "Someone";
                if (!string.IsNullOrEmpty(instance.CreatedBy))
                {
                    try {
                        var creator = await _unitOfWork.UserMaps.GetByIdAsync(instance.CreatedBy);
                        if (creator != null) createdByName = creator.GrcNameEn ?? creator.GrcNameAr ?? "Unknown User";
                    } catch {}
                }

                var emails = "";
                if (instance.Context.Contains("data") && instance.Context["data"].AsBsonDocument.Contains("emails"))
                {
                    var emailArray = instance.Context["data"]["emails"].AsBsonArray;
                    emails = string.Join(", ", emailArray.Select(e => e.AsString));
                }

                // Append Link
                var docLink = $"{_frontendUrl}/document/view?id={targetId}";

                // "Ahmed has requested to share the document 'Budget.pdf' with: client@gmail.com. Please review and approve."
                description = $"{createdByName} has requested to share the document '{docName}' with:\n{emails}\n\nOriginal Instructions: {description}\n\nLink: {docLink}";
                taskTitle = $"Approval Request: Share {docName}";
            }

            // Resolving Dynamic Assignment
            var rawAssigneeId = step.ActionConfig?.AssigneeId;
            var assignedTo = IsValidObjectId(rawAssigneeId) ? rawAssigneeId : null;

            var candidateUsers = step.ActionConfig?.AssigneeIds
                ?.Where(id => IsValidObjectId(id))
                .ToList() ?? new List<string>();

            var candidateRoles = new List<string>();

            // 1. Use AssigneeRoleId (new field — direct ObjectId, preferred)
            if (IsValidObjectId(step.ActionConfig?.AssigneeRoleId))
            {
                candidateRoles.Add(step.ActionConfig!.AssigneeRoleId!);
                Console.WriteLine($"[Workflow] Using AssigneeRoleId directly: {step.ActionConfig.AssigneeRoleId}");
            }
            // 2. Fallback: AssigneeRole is a name ("Admin") — resolve to ID
            else if (!string.IsNullOrEmpty(step.ActionConfig?.AssigneeRole) &&
                     !step.ActionConfig.AssigneeRole.Equals("Creator", StringComparison.OrdinalIgnoreCase))
            {
                var roleName = step.ActionConfig.AssigneeRole;
                if (IsValidObjectId(roleName))
                {
                    candidateRoles.Add(roleName);
                }
                else
                {
                    Console.WriteLine($"[Workflow] Resolving role name '{roleName}' to ID (legacy workflow)...");
                    var matchedRole = (await _unitOfWork.Roles.FindAsync(r =>
                        (r.NameEn != null && r.NameEn.ToLower() == roleName.ToLower()) ||
                        (r.Code != null && r.Code.ToLower() == roleName.ToLower()) ||
                        r.NameAr == roleName)).FirstOrDefault();
                    if (matchedRole?.Id != null)
                    {
                        Console.WriteLine($"[Workflow] Resolved '{roleName}' → {matchedRole.Id}");
                        candidateRoles.Add(matchedRole.Id);
                    }
                    else
                    {
                        Console.WriteLine($"[Workflow] WARNING: Could not resolve role name '{roleName}' to an ID.");
                    }
                }
            }

            // 3. AssigneeRoles list (ObjectIds already)
            if (step.ActionConfig?.AssigneeRoles != null)
                candidateRoles.AddRange(step.ActionConfig.AssigneeRoles.Where(r => IsValidObjectId(r) && !candidateRoles.Contains(r)));

            // Special Case: Creator
            if (string.IsNullOrEmpty(assignedTo) &&
                (step.ActionConfig?.AssigneeRole?.Equals("Creator", StringComparison.OrdinalIgnoreCase) == true ||
                 step.ActionConfig?.AssigneeRoles?.Any(r => r.Equals("Creator", StringComparison.OrdinalIgnoreCase)) == true))
            {
                assignedTo = instance.CreatedBy;
            }


            // --- Extract Document Info for ANY workflow ---
            // docId declared above
            string? docTitle = null;
            if (instance.Context != null && 
                instance.Context.Contains("target_type") && 
                instance.Context["target_type"] == "Document" && 
                instance.Context.Contains("target_id"))
            {
                docId = instance.Context["target_id"].AsString;
                try 
                {
                    var doc = await _unitOfWork.Documents.GetByIdAsync(docId);
                    if (doc != null) docTitle = doc.Title;
                }
                catch {}
            }

            // --- Build Description if NOT already customized (like Share) ---
            if (instance.Context == null || !instance.Context.Contains("trigger_code") || !instance.Context["trigger_code"].AsString.Equals(ConstWorkflowTriggers.Share, StringComparison.OrdinalIgnoreCase))
            {
                if (!string.IsNullOrEmpty(docTitle))
                {
                     var docLink = $"{_frontendUrl}/document/view?id={docId}";
                     // Append doc link cleanly
                     if (!description.Contains(docLink))
                     {
                        description += $"\n\nRelated Document: {docTitle}\nLink: {docLink}";
                     }
                }
            }
            // ----------------------------------------------

            // Sanitize: ensure only valid ObjectIds are saved in ObjectId fields
            var safeTenantId = IsValidObjectId(instance.TenantId) ? instance.TenantId : null;
            var safeWorkspaceId = IsValidObjectId(instance.WorkspaceId) ? instance.WorkspaceId : null;
            var safeAssignedTo = IsValidObjectId(assignedTo) ? assignedTo : null;
            var safeCreatedBy = IsValidObjectId(instance.CreatedBy) ? instance.CreatedBy : "000000000000000000000000";
            var safeCandidateUsers = candidateUsers.Where(id => IsValidObjectId(id)).ToList();
            var safeDocId = IsValidObjectId(docId) ? docId : null;

            var task = new TaskEntity
            {
                TenantId = safeTenantId,
                WorkspaceId = safeWorkspaceId,
                Title = taskTitle,
                Description = description,
                Status = "Pending",
                CreatedBy = safeCreatedBy,
                CreatedAt = DateTime.UtcNow,
                AssignedTo = safeAssignedTo,
                CandidateUsers = safeCandidateUsers,
                CandidateRoles = candidateRoles,          // ObjectIds from role lookup
                ActionConfig = step.ActionConfig,
                RelatedEntity = new RelatedEntity { Type = "WorkflowInstance", Id = instance.Id },
                TargetDocumentId = safeDocId
            };

            // FALLBACK: If no assignee at all, assign to Creator
            if (string.IsNullOrEmpty(safeAssignedTo) && !safeCandidateUsers.Any() && !candidateRoles.Any())
            {
                if (IsValidObjectId(instance.CreatedBy))
                {
                    task.AssignedTo = instance.CreatedBy;
                    task.CandidateUsers = [instance.CreatedBy!];
                    description += "\n\n[SYSTEM NOTE: Assigned to you as fallback because no assignee was determined.]";
                }
            }

            if (!string.IsNullOrEmpty(task.AssignedTo) && !task.CandidateUsers.Contains(task.AssignedTo))
                task.CandidateUsers.Add(task.AssignedTo);

            Console.WriteLine($"[Task Create] Title='{task.Title}', TenantId='{safeTenantId}', AssignedTo='{task.AssignedTo}', CandidateRoles=[{string.Join(",", candidateRoles)}], CandidateUsers=[{string.Join(",", task.CandidateUsers)}]");
            try
            {
                await _unitOfWork.Tasks.AddAsync(task);
                Console.WriteLine($"[Task Create] SUCCESS — Task ID: {task.Id}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Task Create] FAILED — Error: {ex.Message}");
                throw;
            }
            step.AssignedTaskId = task.Id;


            // Send Emails
            // 1. Direct Assignee
            if (!string.IsNullOrEmpty(task.AssignedTo) && IsValidObjectId(task.AssignedTo))
            {
                 var user = await _unitOfWork.UserMaps.GetByIdAsync(task.AssignedTo);
                 if (user != null && !string.IsNullOrEmpty(user.Email))
                 {
                     try 
                     {
                         await _emailService.SendTaskAssignedEmailAsync(user.Email, task.Title, task.Id!, docTitle, docId);
                     }
                     catch(Exception ex) 
                     { 
                         Console.WriteLine($"CRITICAL ERROR: Failed to send task email to {user.Email}. Error: {ex.ToString()}"); 
                     }
                 }
            }
            // 2. Candidate Users 
            if (task.CandidateUsers != null && task.CandidateUsers.Any())
            {
                foreach(var userId in task.CandidateUsers)
                {
                    if (userId == task.AssignedTo) continue;
                    if (!IsValidObjectId(userId)) continue; // Skip role names
                    
                    var user = await _unitOfWork.UserMaps.GetByIdAsync(userId);
                    if (user != null && !string.IsNullOrEmpty(user.Email))
                    {
                         try 
                         {
                             await _emailService.SendTaskAssignedEmailAsync(user.Email, task.Title, task.Id!, docTitle, docId);
                         }
                         catch(Exception ex) 
                         { 
                             Console.WriteLine($"CRITICAL ERROR: Failed to send candidate email to {user.Email}. Error: {ex.ToString()}"); 
                         }
                    }
                }
            }

            // 3. Candidate Roles
            if (task.CandidateRoles != null && task.CandidateRoles.Any())
            {
                 // Fetch all users with these roles in this tenant
                 // We need to fetch UserRoles where RoleId is in CandidateRoles (Actually CandidateRoles stores Role NAMES or IDs? 
                 // WorkflowActionConfig says "AssigneeRoles" (List<string>). Usually IDs if coming from UI picker, but let's check.
                 // ResourcePicker usually returns IDs. But Task entity says "CandidateRoles". 
                 // If they are Names (e.g. "Manager"), we need to lookup Role IDs first? Or assume IDs.
                 // Given the context of "CandidateRoles" in TaskEntity, let's assume valid Role IDs.
                 
                 // However, StartStepAsync: 387: if (!candidateRoles.Contains(step.ActionConfig.AssigneeRole)) ...
                 // steps usually store IDs if selected from picker.
                 
                 foreach(var roleId in task.CandidateRoles)
                 {
                      var roleUsers = await _unitOfWork.UserRoles.FindAsync(ur => ur.RoleId == roleId && ur.TenantId == instance.TenantId);
                      foreach(var ur in roleUsers)
                      {
                           // avoid duplicates if already sent
                           if (ur.UserId == task.AssignedTo || (task.CandidateUsers != null && task.CandidateUsers.Contains(ur.UserId))) continue;

                           var user = await _unitOfWork.UserMaps.GetByIdAsync(ur.UserId);
                           if (user != null && !string.IsNullOrEmpty(user.Email))
                           {
                                try 
                                {
                                    // Should we check if we already sent to this email? (in case user has multiple roles)
                                    // A simple hashset for this step would be good, but for now simple loop.
                                    await _emailService.SendTaskAssignedEmailAsync(user.Email, task.Title, task.Id!, docTitle, docId);
                                }
                                catch(Exception ex)
                                {
                                     Console.WriteLine($"CRITICAL ERROR: Failed to send role email to {user.Email}. Error: {ex}");
                                }
                           }
                      }
                 }
            }
        }
        else if (step.Type == WorkflowStepType.Logic || step.Type == WorkflowStepType.Start || step.Type == WorkflowStepType.End)
        {
             step.Status = StepStatus.Completed;
             step.CompletedBy = !string.IsNullOrEmpty(instance.CreatedBy) ? instance.CreatedBy : "000000000000000000000000";
             step.CompletedAt = DateTime.UtcNow;
        }

        // MUS-751: Log step start activity
        await LogActivity(instance.TenantId, instance.WorkspaceId, instance.CreatedBy,
            "Workflow Step Started",
            $"Step '{step.Title}' (type: {step.Type}) started in workflow instance '{instance.Id}'.");
    }

    private async Task<List<WorkflowInstanceDetailsDto>> EnrichWithUserNames(IEnumerable<WorkflowInstance> instances)
    {
        var dtos = instances.Select(i => new WorkflowInstanceDetailsDto
        {
            Id = i.Id,
            TenantId = i.TenantId,
            WorkflowId = i.WorkflowId,
            WorkflowName = i.WorkflowName,
            WorkspaceId = i.WorkspaceId,
            Status = i.Status,
            Context = i.Context,
            CurrentStepIds = i.CurrentStepIds,
            Steps = i.Steps,
            History = i.History,
            CreatedBy = i.CreatedBy,
            CreatedAt = i.CreatedAt
        }).ToList();

        var userIds = new HashSet<string>();
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
            if (dto.Steps != null)
            {
                foreach (var step in dto.Steps)
                {
                     if (step == null) continue;
                     if (!string.IsNullOrEmpty(step.CompletedBy)) userIds.Add(step.CompletedBy);
                     if (step.ActionConfig != null)
                     {
                         if (!string.IsNullOrEmpty(step.ActionConfig.AssigneeId)) userIds.Add(step.ActionConfig.AssigneeId);
                         if (step.ActionConfig.AssigneeIds != null) 
                         {
                             foreach(var id in step.ActionConfig.AssigneeIds) userIds.Add(id);
                         }
                     }
                }
            }
        }

        if (userIds == null || !userIds.Any()) return dtos;

        var userMaps = await _unitOfWork.UserMaps.FindAsync(u => u.Id != null && userIds.Contains(u.Id));
        var userMapDict = userMaps.Where(u => u.Id != null).ToDictionary(u => u.Id!, u => u);

        // Fetch Roles if needed for Assignee Names (if role based)
        // Fetch Documents for Target Titles
        var docIds = dtos.Where(d => d.Context != null && d.Context.Contains("target_id") && !d.Context["target_id"].IsBsonNull &&
            ((d.Context.Contains("target_type") && d.Context["target_type"] == "Document") || 
             (d.Context.Contains("trigger_code") && d.Context["trigger_code"] == ConstWorkflowTriggers.Share)))
            .Select(d => d.Context!["target_id"].IsString ? d.Context["target_id"].AsString : d.Context["target_id"].ToString()).Distinct().ToList();
        
        var documents = new Dictionary<string, string>();
        if (docIds.Any())
        {
             var docs = await _unitOfWork.Documents.FindAsync(d => d.Id != null && docIds.Contains(d.Id));
             if (docs != null)
             {
                 documents = docs.Where(d => d.Id != null).ToDictionary(d => d.Id!, d => d.Title ?? "Untitled");
             }
        }

        var langHeader = _httpContextAccessor.HttpContext?.Request.Headers["lang"].ToString();
        var acceptLang = _httpContextAccessor.HttpContext?.Request.Headers["Accept-Language"].ToString();
        var lang = !string.IsNullOrWhiteSpace(langHeader) ? langHeader
                  : !string.IsNullOrWhiteSpace(acceptLang) ? acceptLang
                  : "ar";
        bool isEnglish = lang.StartsWith("en", StringComparison.OrdinalIgnoreCase);

        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy) && userMapDict.TryGetValue(dto.CreatedBy, out var createdByMap))
            {
                dto.CreatedByName = isEnglish ? createdByMap.GrcNameEn : createdByMap.GrcNameAr;
            }

            // Populate Target Title and Type
            if (dto.Context != null)
            {
                 if (dto.Context.Contains("target_id"))
                 {
                     var targetId = dto.Context["target_id"].AsString;
                     if (dto.Context.Contains("trigger_code") && dto.Context["trigger_code"].AsString == ConstWorkflowTriggers.Share)
                     {
                         dto.DocumentId = targetId;
                         dto.TargetTitle = documents.ContainsKey(targetId) ? documents[targetId] : targetId;
                     }
                 }
            }

            if (dto.Context != null && dto.Context.Contains("target_type"))
            {
                 dto.TargetType = dto.Context["target_type"].AsString;
                 
                 if (dto.Context.Contains("target_id"))
                 {
                     var targetId = dto.Context["target_id"].AsString;
                     if (dto.TargetType == "Document") dto.DocumentId = targetId;
                     if (dto.TargetType == "Document")
                     {
                         dto.DocumentCount = 1;
                         if (documents.ContainsKey(targetId)) dto.TargetTitle = documents[targetId];
                         else dto.TargetTitle = targetId;
                     }
                     else if (dto.TargetType == "Workspace") // Assuming Workspace means Folder in this context
                     {
                         dto.FolderCount = 1;
                         // Fetch Workspace Title? Not optimizing for that right now as Document holds most volume.
                         // If needed, fetch workspaces too.
                         dto.TargetTitle = targetId; 
                     }
                     else
                     {
                         dto.TargetTitle = targetId; 
                     }
                 }
            }

            // Populate Current Step Names & Assignees
            if (dto.Steps != null)
            {
                dto.CurrentStepNames = new List<string>();
                dto.CurrentAssignees = new List<string>();
                dto.ApproverNames = new List<string>();

                foreach (var step in dto.Steps)
                {
                    if (step.Status == StepStatus.InProgress)
                    {
                        dto.CurrentStepNames.Add(step.Title);
                        // Determine Assignee Name
                        if (step.ActionConfig != null)
                        {
                             if (!string.IsNullOrEmpty(step.ActionConfig.AssigneeId) && userMapDict.TryGetValue(step.ActionConfig.AssigneeId, out var assigneeMap) && assigneeMap != null)
                             {
                                 dto.CurrentAssignees.Add(isEnglish ? (assigneeMap.GrcNameEn ?? "") : (assigneeMap.GrcNameAr ?? ""));
                             }
                             else if (!string.IsNullOrEmpty(step.ActionConfig.AssigneeRole))
                             {
                                 dto.CurrentAssignees.Add($"{step.ActionConfig.AssigneeRole} (Role)");
                             }
                             
                             if (step.ActionConfig.AssigneeIds != null)
                             {
                                 foreach(var id in step.ActionConfig.AssigneeIds)
                                 {
                                     if (userMapDict.TryGetValue(id, out var multiAssigneeMap))
                                     {
                                         dto.CurrentAssignees.Add(isEnglish ? (multiAssigneeMap.GrcNameEn ?? "") : (multiAssigneeMap.GrcNameAr ?? ""));
                                     }
                                 }
                             }
                        }
                    }

                    if (!string.IsNullOrEmpty(step.CompletedBy) && userMapDict.TryGetValue(step.CompletedBy, out var completedByMap))
                    {
                        if (completedByMap != null)
                        {
                            step.CompletedByName = isEnglish ? (completedByMap.GrcNameEn ?? "") : (completedByMap.GrcNameAr ?? "");
                            dto.ApproverNames.Add(step.CompletedByName);
                        }
                    }

                    if (step.ActionConfig != null)
                    {
                        if (!string.IsNullOrEmpty(step.ActionConfig.AssigneeId) && userMapDict.TryGetValue(step.ActionConfig.AssigneeId, out var assigneeMap))
                        {
                            if (assigneeMap != null)
                            {
                                step.ActionConfig.AssigneeName = isEnglish ? (assigneeMap.GrcNameEn ?? "") : (assigneeMap.GrcNameAr ?? "");
                            }
                        }
                        
                        if (step.ActionConfig.AssigneeIds != null && step.ActionConfig.AssigneeIds.Any())
                        {
                            step.ActionConfig.AssigneeNames = new List<string>();
                            foreach(var id in step.ActionConfig.AssigneeIds)
                            {
                                if (userMapDict.TryGetValue(id, out var multiAssigneeMap))
                                {
                                    step.ActionConfig.AssigneeNames.Add(isEnglish ? (multiAssigneeMap.GrcNameEn ?? "") : (multiAssigneeMap.GrcNameAr ?? ""));
                                }
                            }
                        }
                    }
                }
            }
        }

        return dtos;
    }

    /// <summary>
    /// Returns true only if the string is a 24-character hex string (valid MongoDB ObjectId).
    /// Role names like 'Admin', 'Creator', etc. will return false.
    /// </summary>
    private static bool IsValidObjectId(string? id)
    {
        if (string.IsNullOrEmpty(id)) return false;
        return id.Length == 24 && id.All(c => (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'));
    }
}