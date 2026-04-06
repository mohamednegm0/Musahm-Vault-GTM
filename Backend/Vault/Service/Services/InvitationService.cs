using Core.DTOs;
using Core.DTOs.Invitation;
using static Core.Constants.ConstAppConfiguration;
using Microsoft.AspNetCore.Http; 
using Core.Interfaces.Service; 
using Core.Constants;

namespace Service;
public class InvitationService : IInvitationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly Core.Interfaces.Service.IEmailService _emailService;
    private readonly MongoDB.Driver.GridFS.IGridFSBucket _gridFS;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IWorkflowAssignmentService _workflowAssignmentService; 
    private readonly IWorkflowInstanceService _workflowInstanceService;
    private readonly IJsonLocalizationService _localizationService;
    private readonly IAuditLogService _auditLogService;

    public InvitationService(IUnitOfWork unitOfWork, IEmailService emailService, IHttpContextAccessor httpContextAccessor, IWorkflowAssignmentService workflowAssignmentService, IWorkflowInstanceService workflowInstanceService, IJsonLocalizationService localizationService, IAuditLogService auditLogService) 
    { 
        _unitOfWork = unitOfWork; 
        _emailService = emailService;
        _gridFS = new MongoDB.Driver.GridFS.GridFSBucket(_unitOfWork.Database);
        _httpContextAccessor = httpContextAccessor;
        _workflowAssignmentService = workflowAssignmentService;
        _workflowInstanceService = workflowInstanceService;
        _localizationService = localizationService;
        _auditLogService = auditLogService;
    }

    public async Task<ResponseResult<IEnumerable<InvitationDetailsDto>>> GetAllAsync()
    {
        var invitations = await _unitOfWork.Invitations.GetAllAsync();
        var dtos = await EnrichWithUserNames(invitations);
        return new ResponseResult<IEnumerable<InvitationDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<InvitationDetailsDto>> GetByIdAsync(string id)
    {
        var invitation = await _unitOfWork.Invitations.GetByIdAsync(id);
        if (invitation == null) return new ResponseResult<InvitationDetailsDto>(_localizationService.Get("Msg_InvitationNotFound"), ApiStatusCode.NotFound);
        var dtos = await EnrichWithUserNames(new[] { invitation });
        return new ResponseResult<InvitationDetailsDto>(dtos.First(), ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Invitation>> CreateAsync(Invitation entity) 
    {
        await _unitOfWork.Invitations.AddAsync(entity);
        
        await _auditLogService.LogAsync(
            actorUserId: entity.CreatedBy ?? "SYSTEM",
            tenantId: entity.TenantId ?? "",
            action: "Create Invitation",
            entityType: "invitation",
            entityId: entity.Id,
            details: $"Created invitation for {entity.Email} on document {entity.DocumentId}"
        );

        return new ResponseResult<Invitation>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<Invitation>> UpdateAsync(string id, Invitation entity) 
    {
        await _unitOfWork.Invitations.UpdateAsync(id, entity);

        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value ?? "SYSTEM";
        await _auditLogService.LogAsync(
            actorUserId: userId,
            tenantId: entity.TenantId ?? "",
            action: "Update Invitation",
            entityType: "invitation",
            entityId: id,
            details: $"Updated invitation for {entity.Email}. Status: {entity.Status}"
        );

        return new ResponseResult<Invitation>(entity, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> DeleteAsync(string id) 
    {
        var invitation = await _unitOfWork.Invitations.GetByIdAsync(id);
        if (invitation == null)
        {
             return new ResponseResult<object>(_localizationService.Get("Msg_InvitationNotFound"), ApiStatusCode.NotFound);
        }

        if (!string.IsNullOrEmpty(invitation.Email))
        {
            var userMaps = await _unitOfWork.UserMaps.FindAsync(u => u.Email == invitation.Email);
            var userMap = userMaps.FirstOrDefault();
            if (userMap != null && !string.IsNullOrEmpty(userMap.Id))
            {
                var acls = await _unitOfWork.DocumentAcls.FindAsync(a => a.DocumentId == invitation.DocumentId && a.UserId == userMap.Id);
                foreach (var acl in acls)
                {
                    if (acl.Id != null)
                        await _unitOfWork.DocumentAcls.DeleteAsync(acl.Id);
                }
            }
        }

        var userId = _httpContextAccessor.HttpContext?.User?.FindFirst("UserId")?.Value ?? "SYSTEM";
        await _auditLogService.LogAsync(
            actorUserId: userId,
            tenantId: invitation.TenantId ?? "",
            action: "Delete Invitation",
            entityType: "invitation",
            entityId: id,
            details: $"Deleted invitation for {invitation.Email}"
        );

        await _unitOfWork.Invitations.DeleteAsync(id);
        return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_DeletedSuccessfully"));
    }

    public async Task<ResponseResult<bool>> CreateInvitationsAsync(Core.DTOs.Invitation.CreateInvitationDto dto, string userId, string tenantId)
    {
        // 1. Get Document
        var document = await _unitOfWork.Documents.GetByIdAsync(dto.DocumentId!);
        if (document == null) return new ResponseResult<bool>(_localizationService.Get("Msg_InvitationDocumentNotFound"), ApiStatusCode.NotFound);

        // 2. CHECK WORKFLOW
        var workflowResult = await _workflowAssignmentService.GetApplicableWorkflowAsync(dto.DocumentId!, ConstWorkflowTriggers.Share, userId);
        bool hasWorkflow = workflowResult.IsSucceeded && workflowResult.ReturnData != null;
        string initialStatus = hasWorkflow ? "pending" : "accepted";

        // 3. Get Latest Version information
        var versions = await _unitOfWork.DocumentVersions.FindAsync(v => v.DocumentId == dto.DocumentId);
        var latestVersion = versions.OrderByDescending(v => v.Version).FirstOrDefault();
        if (latestVersion == null) return new ResponseResult<bool>(_localizationService.Get("Msg_InvitationNoVersions"), ApiStatusCode.BadRequest);

        byte[] fileBytes = latestVersion.FileContent ?? Array.Empty<byte>();
        
        // If content is null, try fetching from GridFS
        if ((fileBytes == null || fileBytes.Length == 0) && !string.IsNullOrEmpty(latestVersion.FileId))
        {
            try {
                fileBytes = await _gridFS.DownloadAsBytesAsync(new MongoDB.Bson.ObjectId(latestVersion.FileId));
            } catch { /* Handle error or leave empty */ }
        }



        var createdInvitationIds = new List<string>();

        // 4. Create Invitations
        foreach (var email in dto.Emails)
        {
            // Check if invitation already exists for this email and workspace
            var existingInvitations = await _unitOfWork.Invitations.FindAsync(i => i.DocumentId == dto.DocumentId && i.Email == email);
            if (existingInvitations.Any())
            {
                // If existing invitation is pending/active, skip or error? 
                // For simplicity, error as per original logic
                return new ResponseResult<bool>(_localizationService.Get("Msg_InvitationAlreadyExists", email), ApiStatusCode.Conflict);
            }

            var watermarkedContent = Helpers.WatermarkHelper.ApplyWatermark(
                fileBytes ?? Array.Empty<byte>(), 
                email, 
                latestVersion.ContentType ?? "application/octet-stream",
                latestVersion.FileName ?? document.Title);

            var invitation = new Invitation
            {
                TenantId = tenantId,
                WorkspaceId = document.WorkspaceId,
                DocumentId = dto.DocumentId,
                FileName = latestVersion.FileName ?? document.Title,
                FileSize = watermarkedContent?.Length ?? 0,
                ContentType = latestVersion.ContentType ?? "application/octet-stream",
                FileContent = watermarkedContent, 
                Email = email,
                Role = "Viewer",
                Status = initialStatus, // Use determined status
                Token = string.Empty,
                ExpiresAt = dto.ExpiryDate ?? DateTime.UtcNow.AddDays(7), 
                CreatedAt = DateTime.UtcNow,
                CreatedBy = userId
            };
            
            try
            {
                await _unitOfWork.Invitations.AddAsync(invitation);
                createdInvitationIds.Add(invitation.Id!);

                await _auditLogService.LogAsync(
                    actorUserId: userId,
                    tenantId: tenantId,
                    action: hasWorkflow ? "Share Document (Pending Workflow Approval)" : "Share Document",
                    entityType: "document",
                    entityId: dto.DocumentId,
                    details: hasWorkflow 
                        ? $"Share request for document '{document.Title}' with {email} is pending workflow '{workflowResult.ReturnData?.Name}' approval"
                        : $"Shared document '{document.Title}' with {email}"
                );
            }
            catch (MongoDB.Driver.MongoWriteException ex) when (ex.WriteError.Category == MongoDB.Driver.ServerErrorCategory.DuplicateKey)
            {
                  return new ResponseResult<bool>(_localizationService.Get("Msg_InvitationAlreadyExistsDuplicate", email), ApiStatusCode.Conflict);
            }


            // Send initial invitation email ONLY if no workflow
            if (!hasWorkflow)
            {
                await _emailService.SendInvitationEmailAsync(email, invitation.Id!, invitation.FileName);
            }
        }

        // 5. Start Workflow if applicable
        if (hasWorkflow)
        {
             var workflow = workflowResult.ReturnData!;
             var context = new MongoDB.Bson.BsonDocument
             {
                //  { "trigger_type", "Event" },
                 { "trigger_code", ConstWorkflowTriggers.Share },
                 { "target_id", document.Id },
                //  { "target_type", "Document" },
                 { "invitation_ids", new MongoDB.Bson.BsonArray(createdInvitationIds) }, // Pass IDs to Workflow
                 { "data", new MongoDB.Bson.BsonDocument { 
                     { "emails", new MongoDB.Bson.BsonArray(dto.Emails) },
                     { "expiry", dto.ExpiryDate?.ToString() } 
                 }}
             };

             try 
             {
                 await _workflowInstanceService.StartWorkflowAsync(workflow.Id!, document.WorkspaceId ?? "", userId, context);
                 
                 // Return Success with pending message
                 return new ResponseResult<bool>(true, ApiStatusCode.OK, _localizationService.Get("Msg_InvitationWorkflowInitiated"));
             }
             catch (Exception ex)
             {
                 return new ResponseResult<bool>(_localizationService.Get("Msg_InvitationWorkflowFailed", ex.Message), ApiStatusCode.BadRequest);
             }
        }

        return new ResponseResult<bool>(true, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<InvitationDetailsDto>>> GetByDocumentIdAsync(string documentId) 
    {
        var invitations = await _unitOfWork.Invitations.FindAsync(i => i.DocumentId == documentId);
        var dtos = await EnrichWithUserNames(invitations);
        return new ResponseResult<IEnumerable<InvitationDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<IEnumerable<InvitationDetailsDto>>> GetPendingAsync()
    {
        var invitations = await _unitOfWork.Invitations.FindAsync(i => i.Status == "pending");
        var dtos = await EnrichWithUserNames(invitations);
        return new ResponseResult<IEnumerable<InvitationDetailsDto>>(dtos, ApiStatusCode.OK);
    }

    public async Task<ResponseResult<object>> AcceptAsync(string id, string userId)
    {
        var invitation = await _unitOfWork.Invitations.GetByIdAsync(id);
        if (invitation != null)
        {
            invitation.Status = "accepted";
            await _unitOfWork.Invitations.UpdateAsync(id, invitation);
            
            // Grant Document Permission (ACL)
            var acl = new Core.Entities.DocumentAcl
            {
                DocumentId = invitation.DocumentId,
                TenantId = invitation.TenantId,
                UserId = userId,
                Permission = invitation.Role,
                CreatedBy = invitation.CreatedBy,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.DocumentAcls.AddAsync(acl);

            await _auditLogService.LogAsync(
                actorUserId: userId,
                tenantId: invitation.TenantId ?? "",
                action: "Accept Invitation",
                entityType: "invitation",
                entityId: id,
                details: $"User {userId} accepted invitation for document {invitation.DocumentId}"
            );

            // Send acceptance confirmation email
            await _emailService.SendInvitationAcceptedEmailAsync(invitation.Email, invitation.Id!, invitation.FileName);
            
            return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_InvitationAccepted"));
        }
        return new ResponseResult<object>(_localizationService.Get("Msg_InvitationNotFound"), ApiStatusCode.NotFound);
    }

    public async Task<ResponseResult<object>> DeclineAsync(string id)
    {
        var invitation = await _unitOfWork.Invitations.GetByIdAsync(id);
        if (invitation != null)
        {
            invitation.Status = "rejected";
            await _unitOfWork.Invitations.UpdateAsync(id, invitation);

            await _auditLogService.LogAsync(
                actorUserId: "EXTERNAL", 
                tenantId: invitation.TenantId ?? "",
                action: "Decline Invitation",
                entityType: "invitation",
                entityId: id,
                details: $"Invitation for {invitation.Email} was declined"
            );

            return new ResponseResult<object>(null, ApiStatusCode.OK, _localizationService.Get("Msg_InvitationDeclined"));
        }
        return new ResponseResult<object>(_localizationService.Get("Msg_InvitationNotFound"), ApiStatusCode.NotFound);
    }

    public async Task<ResponseResult<Invitation>> GenerateOtpAsync(string id, string email)
    {
        var invitation = await _unitOfWork.Invitations.GetByIdAsync(id);
        if (invitation == null) return new ResponseResult<Invitation>(_localizationService.Get("Msg_InvitationNotFound"), ApiStatusCode.NotFound);
        
        if (!string.Equals(invitation.Email, email, StringComparison.OrdinalIgnoreCase)) 
             return new ResponseResult<Invitation>(_localizationService.Get("Msg_InvitationEmailMismatch"), ApiStatusCode.BadRequest);
             
        if (invitation.ExpiresAt < DateTime.UtcNow) return new ResponseResult<Invitation>(_localizationService.Get("Msg_InvitationExpired"), ApiStatusCode.BadRequest);

        // Generate OTP
        var otp = new Random().Next(100000, 999999).ToString();
        invitation.Otp = otp;
        invitation.OtpExpiresAt = DateTime.UtcNow.AddMinutes(10);
        
        await _unitOfWork.Invitations.UpdateAsync(id, invitation);

        await _emailService.SendOtpEmailAsync(email, otp, invitation.FileName);

        return new ResponseResult<Invitation>(invitation, ApiStatusCode.OK);
    }

    public async Task<(Stream Stream, string FileName, string ContentType)> VerifyOtpAsync(string id, string email, string otp)
    {
        var invitation = await _unitOfWork.Invitations.GetByIdAsync(id);
        if (invitation == null) throw new FileNotFoundException("Invitation not found");
        
        if (!string.Equals(invitation.Email, email, StringComparison.OrdinalIgnoreCase)) 
             throw new Exception("Email does not match");
        
        if (invitation.ExpiresAt < DateTime.UtcNow) throw new Exception("Invitation has expired");

        if (string.IsNullOrEmpty(invitation.Otp) || invitation.Otp != otp) throw new Exception("Invalid OTP");
        
        if (invitation.OtpExpiresAt < DateTime.UtcNow) throw new Exception("OTP has expired");

        if (invitation.FileContent == null || invitation.FileContent.Length == 0)
        {
             throw new FileNotFoundException("Invitation content missing.");
        }

        var stream = new System.IO.MemoryStream(invitation.FileContent);
        return (stream, invitation.FileName, invitation.ContentType);
    }

    private async Task<List<InvitationDetailsDto>> EnrichWithUserNames(IEnumerable<Invitation> invitations)
    {
        var dtos = invitations.Select(i => new InvitationDetailsDto
        {
            Id = i.Id,
            TenantId = i.TenantId,
            WorkspaceId = i.WorkspaceId,
            DocumentId = i.DocumentId,
            Email = i.Email,
            Role = i.Role,
            Status = i.Status,
            Token = i.Token,
            ExpiresAt = i.ExpiresAt,
            CreatedBy = i.CreatedBy,
            CreatedAt = i.CreatedAt
        }).ToList();

        var userIds = new HashSet<string>();
        foreach (var dto in dtos)
        {
            if (!string.IsNullOrEmpty(dto.CreatedBy)) userIds.Add(dto.CreatedBy);
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
        }

        return dtos;
    }
}