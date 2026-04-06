# Musahm Vault: User Documentation

> **Source of truth:** This documentation is derived from the Musahm Vault codebase (`ConstRoles.cs`, `ConstPermissions.cs`, `ConstDefaultWorkspaces.cs`, entity definitions, and API endpoints) as of April 2026.

---

## Section 1: Getting Started

### 1.1 Accessing Your Vault Account

Musahm Vault uses single sign-on through the Musahm GRC platform. You do not create a separate Vault account.

**To access Vault:**

1. Navigate to the Vault web application at the URL provided by your organization
2. Log in using one of two methods:
   - **Email + password**: enter your credentials on the login page
   - **Token-based SSO**: if redirected from the Musahm GRC platform, you are authenticated automatically via a token in the URL. Language preference is preserved from your GRC session.
3. After login, you land on the **Dashboard** showing your workspaces, recent documents, tasks, and obligations

**System requirements:**

- Supported browsers: Chrome 90+, Safari 15+, Edge 90+, Firefox 95+
- The interface is fully bilingual; toggle between Arabic (RTL) and English (LTR) using the language switch in the top header bar
- Arabic is the default language; the interface uses the Cairo font for Arabic and Inter for English

**Key localStorage values set at login:**

- `authToken`: JWT bearer token
- `currentCompanyId`: your active tenant/company (sent as `X-Company-Id` header)
- `language`: `ar` or `en`

### 1.2 Understanding Your Role

Vault uses a hierarchical role system. Each role inherits all permissions from the roles below it. Your role is assigned per workspace when you are added as a member.

| Role                 | Arabic Name | Level | What You Can Do                                                          |
| -------------------- | ----------- | ----- | ------------------------------------------------------------------------ |
| **Viewer** (عارض)    | عارض        | 1     | View files and folders, copy, and download                               |
| **Commenter** (معلق) | معلق        | 2     | Everything a Viewer can do + add comments                                |
| **Editor** (محرر)    | محرر        | 3     | Everything a Commenter can do + create and edit files + basic management |
| **Organizer** (منظم) | منظم        | 4     | Everything an Editor can do + manage folders and members                 |
| **Admin** (مدير)     | مدير        | 5     | Full access to all system features                                       |

> **Source:** `ConstRoles.cs`, role codes `viewer`, `commenter`, `editor`, `organizer`, `admin` with hierarchical levels 1–5.

**Important:** Viewers CAN download files. If you need to restrict downloads, use Document ACLs (per-document access control) rather than relying on role levels alone.

### 1.3 Your Default Workspaces

When your organization is set up in Vault, the following workspaces are created automatically:

| Workspace              | Arabic Name           | Type        |
| ---------------------- | --------------------- | ----------- |
| Board Meetings         | اجتماعات مجلس الإدارة | Board       |
| Association Meetings   | اجتماعات الجمعيات     | Association |
| Committee Meetings     | اجتماعات اللجان       | Committee   |
| Decisions              | القرارات              | Decision    |
| Contract Documentation | توثيق العقود          | Contract    |
| Policies & Regulations | السياسات واللوائح     | Regulations |

> **Source:** `ConstDefaultWorkspaces.cs`

These workspaces can be renamed or reorganized by Admins and Organizers. Additional workspaces can be created at any time.

### 1.4 Navigating the Interface

**Sidebar (left):** Logo, workspace list, "Add Workspace" button, navigation links (Dashboard, Search, Tasks, Workflows, Obligations, Audit Logs, Users, etc.)

**Header (top):** Search bar, language toggle (AR/EN), user dropdown (Profile, Change Password, Logout), company switcher (if you belong to multiple organizations)

**Main area:** Content changes based on your current page: workspace explorer, document details, task list, etc.

### 1.5 Multi-Company Access

If you are a member of multiple organizations in the Musahm ecosystem, you can switch between them using the company switcher in the header. Your active company determines which workspaces and documents you see. The `X-Company-Id` header is sent with every API request to enforce tenant isolation.

---

## Section 2: Uploading & Organizing Documents

### 2.1 Uploading Documents

**To upload a document:**

1. Navigate to the workspace where you want to upload
2. Click the **"Upload"** button or use the **Upload Document Modal** (drag-and-drop supported)
3. Select your file(s) from your device
4. Fill in metadata fields: title, document type (selected from predefined categories), tags
5. Click upload; the file is stored and a version record is created automatically

**Storage limits:** Each workspace can have a storage limit (`StorageLimitMb`) configured by an Admin. If the upload would exceed the workspace storage limit, it will be rejected with an error.

**File storage:** Documents are stored as binary data. Small files are stored inline in MongoDB, larger files use GridFS (`fs.files` + `fs.chunks` collections).

**Workflow blocking:** If a workflow is configured for document uploads in the workspace, your upload may be set to "Pending" status until the workflow completes. You will see HTTP status 460 (WorkflowRequired) if a workflow intercepts your action. The document becomes "Active" once the workflow instance is completed.

> **Source:** `DocumentService.cs` (upload with multipart), `Workspace.Settings.StorageLimitMb` (storage enforcement per MUS-730)

### 2.2 Document Types

Vault uses predefined document types (seeded at setup) to categorize documents. Each document type has:

- **Name** (English and Arabic)
- **Code** (internal identifier)
- **Field definitions**: custom metadata fields specific to that document type

Document types are managed at **Document Types** in the sidebar (requires `Permissions.DocumentTypes.View` or higher). Admins can create, edit, and delete document types.

> **Source:** `DocumentType.cs` entity, `DocumentTypesController.cs`

### 2.3 Workspace Structure

Workspaces are the primary organizational unit. Think of them as folders with access control, settings, and membership.

**Workspace properties:**

- **Name** and **Slug** (URL-friendly identifier)
- **Type**: Board, Association, Committee, Decision, Contract, Regulations, or custom
- **Parent workspace**: workspaces can be nested to create hierarchy
- **Privacy settings**: configurable per workspace
- **Allow Invites**: whether members can invite others
- **Storage Limit (MB)**: maximum storage for this workspace
- **Quick Access**: toggle to pin workspace to your sidebar

**Creating a workspace:** Click "Add Workspace" in the sidebar or use the Create Workspace Modal. Provide name, slug, description, type, privacy setting, storage limit, and invite policy.

**Deleting a workspace:** Workspaces use soft delete (`IsDeleted`, `DeletedAt`, `DeletedBy`). Deleted workspaces and their contents move to the Recycle Bin. Cascade soft delete walks the full descendant tree; sub-workspaces and their documents are all soft-deleted together.

> **Source:** `Workspace.cs` entity, `WorkspaceService.cs` (MUS-737 cascade delete), `CreateWorkspaceModal.tsx`

### 2.4 Naming Conventions

Vault does not enforce naming conventions, but we recommend the following pattern for governance documents:

**Pattern:** `[Document Type] - [Subject] - [Date YYYY-MM-DD]`

**Examples (Arabic):**

- `محضر اجتماع - مجلس الإدارة - 2026-01-15`
- `قرار - الموافقة على الميزانية - 2026-03-01`
- `عقد - اتفاقية شراكة مع شركة النور - 2026-02-20`
- `سياسة - سياسة حوكمة المعلومات - 2026-04-01`

---

## Section 3: Sharing & Permissions

### 3.1 Document ACLs (Access Control Lists)

Beyond workspace-level roles, Vault supports per-document access control through Document ACLs. This allows fine-grained sharing of individual documents with specific users.

**To share a document:**

1. Open the document details page
2. Click **"Share"** to open the Share Modal
3. Search for users by email to add them
4. Each ACL entry records: the document, the user, the permission level, and who granted the access

**ACL management endpoints:**

- View ACLs for a document: `GET /api/DocumentAcls/by-document/{docId}`
- Grant access: `POST /api/DocumentAcls`
- Revoke access: `DELETE /api/DocumentAcls/{id}`

> **Source:** `DocumentAcl.cs` (DocumentId, UserId, Permission, GrantedBy), `ShareModal.tsx`, `DocumentAclsController.cs`

### 3.2 Workspace Membership

Users are added to workspaces as members with a specific role. Membership controls what they can see and do within that workspace.

**Adding members:**

- Navigate to the workspace → Members section
- Add users directly or send invitations via email
- Invitations go through a lifecycle: Created → Sent → Accepted/Declined

**Invitation system:**

- Invitations are sent via email using Microsoft Graph OAuth (`EmailService.cs`)
- Recipients can accept or decline
- Accepted invitations automatically create a `WorkspaceMember` record

> **Source:** `WorkspaceMember.cs` (WorkspaceId, UserId, Role, InvitedBy), `Invitation.cs` (WorkspaceId, Email, Status, InvitedBy, Role), `InvitationService.cs`

### 3.3 External Document Sharing (OTP-Based)

Vault supports sharing documents with external parties (people without Vault accounts) through a secure OTP flow:

1. An invitation is created for an external email address
2. The external recipient requests a 6-digit OTP at `POST /api/Invitations/generate-otp` (this endpoint is publicly accessible)
3. The OTP is sent to their email
4. They verify the OTP at `POST /api/Invitations/verify-otp` (10-minute expiry)
5. On successful verification, they receive a **watermarked** copy of the document; the recipient's email address is stamped on the document as a watermark

> **Source:** `InvitationService.cs` (OTP generation/verification), `WatermarkHelper.cs` (ImageSharp watermarking), `InvitationsController.cs` (`[AllowAnonymous]` endpoints)

**Important:** External recipients receive a watermarked copy only. They do not get access to the Vault interface or any other documents.

### 3.4 Check-In / Check-Out

Documents support a locking mechanism to prevent concurrent editing:

- **Check Out** (`POST /api/Documents/{id}/check-out`): Locks the document for your exclusive editing. Other users can still view but cannot edit.
- **Check In** (`POST /api/Documents/{id}/check-in`): Releases the lock when you're done editing.

> **Source:** `DocumentsController.cs`, `DocumentService.cs`

### 3.5 Audit Trail

Every significant action in Vault is recorded in the audit log. The audit log captures:

- **Action** performed
- **User** who performed it
- **Timestamp** of the action
- **Details** (JSON with context about the action)

**Viewing the audit log:** Navigate to **Audit Logs** in the sidebar (requires `Permissions.AuditLogs.View`).

**Exporting:** The `Permissions.AuditLogs.Export` permission exists for audit log export functionality.

> **Source:** `AuditLog.cs` (Action, UserId, IpAddress, Details), `AuditLogsController.cs`

### 3.6 Permission Reference

The complete permission system organized by module:

| Module                | Available Permissions                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Documents**         | View, Create, Edit, Delete, Download, Share, CheckInOut, Restore, PermanentDelete, Move, Rename, ViewStats, ManageVersions, ManageACL |
| **Workspaces**        | View, Create, Edit, Delete, ManageSettings, ManageMembers, MoveOutside, Export                                                        |
| **Workspace Members** | View, Add, Remove, ManagePermissions                                                                                                  |
| **Comments**          | View, Create, Edit, Delete                                                                                                            |
| **Tasks**             | View, Create, Edit, Delete, Assign, Complete                                                                                          |
| **Workflows**         | View, Create, Edit, Delete, Execute, ManageInstances                                                                                  |
| **Activities**        | View, Create, Delete                                                                                                                  |
| **Audit Logs**        | View, Export                                                                                                                          |
| **Document Types**    | View, Create, Edit, Delete                                                                                                            |
| **Invitations**       | View, Create, Edit, Delete, Accept                                                                                                    |
| **Obligations**       | View, Create, Edit, Delete                                                                                                            |
| **Users**             | View, Create, Edit, Delete, ManageRoles                                                                                               |
| **Roles**             | View, Create, Edit, Delete, ManagePermissions                                                                                         |
| **System**            | ViewSettings, ManageSettings, FullAccess                                                                                              |

> **Source:** `ConstPermissions.cs`, all permission strings follow the pattern `Permissions.{Module}.{Action}`

---

## Section 4: Version Control

> Document versioning with `DocumentVersion` entity tracking: version number, file path, file size, MIME type, and uploader. New versions can be uploaded via `POST /api/DocumentVersions/upload`. Full version history viewable at the DocumentVersions page. Each version is a separate file; previous versions are preserved, not overwritten.

## Section 5: Search & Filters

> **Keyword search** available via `/api/Search`: text matching across document names, tags, metadata, and extracted fields. Search can be scoped to a specific workspace or run across all accessible workspaces. Dedicated SearchVault page with filters.
> **Coming soon:** Semantic search (AI-powered ranked results) and Ask Vault (RAG-based Q&A with document citations) are under active development.

## Section 6: Workflows

> Visual workflow designer using React Flow canvas. Workflows define automated approval and routing processes for documents. Custom node types: Start, Step, End, Condition. Workflows can be triggered automatically on document actions (upload, update, delete, share). When triggered, documents enter "Pending" status until the workflow instance completes. Tasks are generated per workflow step and assigned to designated users. Managed at the Workflows, Workflow Editor, and Workflow Instances pages.

## Section 7: Tasks & Obligations

> **Tasks:** assignable work items tied to workspaces and optionally to documents. Support for candidate users, due dates, status tracking, and completion. "My Tasks" view for personal task queue. Tasks can be generated automatically by workflow steps.
> **Obligations:** compliance deadlines tied to specific documents. Track title, due date, status, and assignee. "Upcoming" view for approaching deadlines.

## Section 8: AI Features

> **Document Extraction:** AI-powered field extraction from uploaded documents. Extractions go through a review queue (pending → approve/reject) with confidence scores per field. Managed at the Extraction Review page.
> **AI Chat (Ask Vault):** _Coming soon._ A planned standalone chat interface for asking questions about your document vault using RAG. Will return natural language answers with citations to specific documents.
> **Agent Actions:** AI agent actions logged and requiring approval through a pending queue (approve/reject flow). Tracked via AgentActionLog.

## Section 9: Recycle Bin

> Soft-deleted documents and workspaces are recoverable from the Recycle Bin. Admins can restore items or permanently delete them. Permanent deletion requires `Permissions.Documents.PermanentDelete`. Cascade soft delete on workspaces includes all descendant workspaces and documents.

## Section 10: Security & Compliance

> Multi-tenant isolation: every entity carries a `TenantId`, enforced per-query. JWT Bearer authentication with symmetric key. Identity resolution per-request via `BaseApiController` action filter. GRC integration forwards Bearer tokens. Document watermarking for external sharing. Legal hold flag available on documents and workspaces to prevent deletion.

## Section 11: Administration

> **Users:** CRUD via UserMap entity mapping to GRC external users. Role assignment scoped by workspace.
> **Roles:** Custom roles can be created with specific permission bundles. System roles (viewer through admin) are seeded and immutable.
> **Tenant Settings:** Company-level configuration (planned).
> **Activity Log:** All mutations generate Activity records (Action, EntityType, EntityId, UserId, Details).

## Section 12: FAQs

> Common questions covering: supported file formats (per `AllowedExtensions` with `accept` attribute on all 6 file inputs, MUS-732), storage limits (per-workspace MB cap, MUS-730), company switching, language toggle, GRC SSO flow, workflow blocking behavior (HTTP 460), and recycle bin recovery.

⚠️ NEEDS CLIENT INPUT: Sections 4–12 are outlined from code. Product team should review for accuracy against latest deployed build, confirm any features still in development, and expand with screenshots and step-by-step instructions before publishing to users.
