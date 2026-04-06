# Task: User Map Integration for Created/Updated By Fields

**Status: ✅ Completed**
**Last Updated: 2026-02-03**

## Objective
Integrate `user_map` data into various services to display user names (Arabic and English) in DTOs for `created_by`, `updated_by`, and other user-related fields.

## Completed Work

### Service Layer Updates
All 11 planned services have been updated to return enriched DTOs with user names fetched directly from `UserMap`.

1.  **WorkflowService** ✅
    *   Returns `WorkflowDetailsDto`.
    *   Helper `EnrichWithUserNames` implemented.
2.  **TaskEntityService** ✅
    *   Returns `TaskDetailsDto`.
    *   Updated `CreateAsync` and `UpdateAsync` to accept and return DTOs.
    *   Helper `EnrichWithUserNames` implemented.
3.  **WorkspaceService** ✅
    *   Returns `WorkspaceDetailsDto`.
    *   Helper `EnrichWithUserNames` implemented.
4.  **ObligationService** ✅
    *   Returns `ObligationDetailsDto`.
    *   Helper `EnrichWithUserNames` implemented.
5.  **DocumentService** ✅
    *   Returns `DocumentDetailsDto`.
    *   Helper `EnrichWithUserNames` implemented.
6.  **DocumentVersionService** ✅
    *   Returns `DocumentVersionDetailsDto`.
    *   Helper `EnrichWithUserNames` implemented.
7.  **WorkflowInstanceService** ✅
    *   Returns `WorkflowInstanceDetailsDto`.
    *   Helper `EnrichWithUserNames` implemented.
8.  **InvitationService** ✅
    *   Returns `InvitationDetailsDto`.
    *   Helper `EnrichWithUserNames` implemented.
9.  **DocumentAclService** ✅
    *   Returns `DocumentAclDetailsDto`.
    *   Optimized to avoid `ProfileService` calls.
10. **DocumentExtractionService** ✅
    *   Returns `DocumentExtractionDto`.
    *   Helper `EnrichWithUserNames` implemented.
11. **AgentActionLogService** ✅
    *   Returns `AgentActionLogDetailsDto`.
    *   Fixed property mapping.

### Controller Layer Updates
Controllers have been updated to match the new Service signatures and return types.

*   `TasksController`: Updated to use `TaskDetailsDto` and new `UpdateAsync` flow.
*   `DocumentExtractionsController`: Updated to remove redundant mapping and return DTOs directly.
*   `DocumentsController`: Updated to explicitly return `DocumentDetailsDto`.
*   (Other controllers generally work via DTO inheritance, but explicit updates improve API documentation).

## Build Status
*   **Build**: ✅ Succeeded (checked with `dotnet build API`).

## Next Steps
*   Deploy and test in the frontend environment.
