# Product Truth Audit: GTM Claims vs. Codebase

> **Auditor**: Automated fact-check against `llm.txt`, `ConstRoles.cs`, `ConstDefaultWorkspaces.cs`, `ConstPermissions.cs`, and targeted codebase searches.
> **Date**: 2026-04-02
> **Scope**: 6 customer-facing GTM files (faq.md, landing-page.md, sales-deck.md, message-house.md, battle-cards.md, voice-guide.md)
> **Method**: Every product claim traced to source code or flagged.

---

## Verdict Summary

| Verdict | Count |
|---------|-------|
| TRUE | 15 |
| FALSE | 4 |
| PARTIALLY TRUE | 5 |
| UNVERIFIABLE | 4 |

**Critical risk items**: 4 FALSE claims appear in customer-facing materials. 2 of them (semantic search, Ask Vault) describe features that are explicitly stub/placeholder code. 1 (OTP sent to phone) misrepresents the delivery channel. 1 (IP address in audit trail) claims a data field that does not exist in the entity.

---

## Section 1: Role Names and Hierarchy

### Claim
> "Five hierarchical levels: Viewer, Commenter, Editor, Organizer, and Admin. Each level inherits the permissions of the level below it."
>
> Appears in: faq.md (3.2), landing-page.md (Feature Block 2), sales-deck.md (Slide 7), message-house.md (Proof Point 2), voice-guide.md (Tier 1)

### Codebase Evidence
`Backend/Vault/Core/Constants/ConstRoles.cs` lines 9-27:
- Viewer = "viewer", Level 1
- Commenter = "commenter", Level 2
- Editor = "editor", Level 3
- Organizer = "organizer", Level 4
- Admin = "admin", Level 5

Arabic names match: (Viewer), (Commenter), (Editor), (Organizer), (Admin).

Descriptions confirm inheritance: "All Viewer permissions + add comments" (Commenter), etc.

### Verdict: TRUE

Names, levels, hierarchy, and Arabic translations all match exactly.

---

## Section 2: Default Workspace Names (All 6)

### Claim
> "Six pre-configured governance workspaces: Board Meetings, Association Meetings, Committee Meetings, Decisions, Contract Documentation, and Policies & Regulations."
>
> Appears in: faq.md (2.3, 3.1), landing-page.md (Feature Block 1), sales-deck.md (Slide 6), message-house.md (Proof Point 1)

### Codebase Evidence
`Backend/Vault/Core/Constants/ConstDefaultWorkspaces.cs` lines 6-29:

| Code Constant | Arabic Name | Type |
|--------------|-------------|------|
| BoardMeetings | اجتماعات مجلس الإدارة | Board |
| AssociationMeetings | اجتماعات الجمعيات | Association |
| CommitteeMeetings | اجتماعات اللجان | Committee |
| Decisions | القرارات | Decision |
| ContractDocumentation | توثيق العقود | Contract |
| PoliciesAndRegulations | السياسات واللوائح | Regulations |

### Verdict: TRUE

Exactly 6 workspaces. Names and types match all GTM materials. The `Defaults` dictionary confirms these are seeded automatically.

---

## Section 3: Search Types

### 3a. Keyword Search

#### Claim
> Keyword search exists as a search mode.
>
> Referenced in: llm.txt (API index), landing-page.md (implied)

#### Codebase Evidence
`Backend/Vault/Service/Services/SearchService.cs` line 15: `KeywordSearchAsync` method with actual query logic.
API endpoint: `POST /api/Search/keyword`

#### Verdict: TRUE

---

### 3b. Semantic Search

#### Claim
> "Semantic search that understands meaning, not just keyword matching. Search for 'dividend distribution resolutions' and it will find relevant documents even if they do not use that exact phrase."
>
> Appears in: faq.md (3.6), landing-page.md (Feature Block 6), sales-deck.md (Slide 9), voice-guide.md (Tier 2)

#### Codebase Evidence
`Backend/Vault/Service/Services/SearchService.cs` lines 24-28:
```csharp
public async Task<ResponseResult<IEnumerable<Document>>> SemanticSearchAsync(string query)
{
    // Placeholder for real Vector/Semantic search
    // Using keyword search as fallback
```

The method is explicitly commented as a placeholder and falls back to keyword search.

#### Verdict: FALSE

Semantic search is claimed as a working feature across 4+ GTM files. The implementation is a stub that performs keyword search. No vector embeddings, no semantic matching, no external AI API call.

**Risk**: HIGH. This is a headline AI feature in the sales deck (Slide 9) and landing page.

---

### 3c. Ask Vault (RAG Q&A)

#### Claim
> "Ask Vault a question in Arabic or English and receive an answer extracted from your own documents."
>
> Appears in: faq.md (3.4), landing-page.md (Feature Block 6), sales-deck.md (Slide 9)

#### Codebase Evidence
`Backend/Vault/Service/Services/SearchService.cs` lines 34-37:
```csharp
public async Task<ResponseResult<string>> AskVaultAsync(string question)
{
    return new ResponseResult<string>("I am Musahm AI. You asked: '" + question +
        "'. Based on your vault, I found that we are still working on the RAG integration.",
        ApiStatusCode.OK);
}
```

The method returns a hardcoded string stating RAG integration is still in progress.

#### Verdict: FALSE

Ask Vault is claimed as a working feature in 3 GTM files including the sales deck. The codebase explicitly states it is not yet integrated. No RAG pipeline, no document retrieval, no answer generation.

**Risk**: HIGH. The sales deck speaker notes describe a live demo scenario ("You ask: 'What was the board's position on the Q3 expansion?' Vault finds the relevant meeting minutes and gives you the answer"). This demo would fail.

---

## Section 4: Workflows

### Claim
> "Visual workflow designer. Define who reviews and who approves before any document goes live. Blocking workflows: Documents cannot be published until all approvals are complete."
>
> Appears in: faq.md (3.3), landing-page.md (Feature Block 5), sales-deck.md (Slide 8), message-house.md (Proof Point 3)

### Codebase Evidence
- Entities: `Workflow.cs`, `WorkflowInstance.cs`, `WorkflowAssignment.cs`, `WorkflowDefinitions.cs`
- Services: `WorkflowService.cs`, `WorkflowInstanceService.cs`
- Frontend: `WorkflowEditor.tsx` (React Flow canvas), `WorkflowFlowDesigner.tsx`, `CustomNodes.tsx` (Start, Step, End, Condition nodes)
- Blocking pattern: HTTP 460 = WorkflowRequired (confirmed in llm.txt)
- Step execution, triggers, approval chains all present

### Verdict: TRUE

Visual workflow designer, blocking enforcement, and approval chains are fully implemented.

---

## Section 5: OTP External Sharing

### 5a. OTP Mechanism Exists

#### Claim
> "External sharing protected with OTP verification."
>
> Appears in: faq.md (4.1, 4.4), landing-page.md (Feature Block 2, Q3), sales-deck.md (Slide 7), message-house.md (Proof Point 2)

#### Codebase Evidence
- `InvitationService.cs` line 318: `GenerateOtpAsync` generates 6-digit OTP with 10-minute expiry
- `InvitationService.cs` line 340: `VerifyOtpAsync` validates OTP and returns watermarked file stream
- `InvitationsController.cs`: `[AllowAnonymous]` endpoints for generate-otp and verify-otp
- `Invitation.cs` entity has `Otp` and `OtpExpiresAt` fields

#### Verdict: TRUE

OTP-verified external sharing is fully implemented.

---

### 5b. OTP Delivery Channel

#### Claim (faq.md, 4.4)
> "They receive an OTP verification code on their phone."
>
> Also AR: "يتلقى رمز تحقق OTP على هاتفه"

#### Codebase Evidence
`InvitationService.cs` line 335:
```csharp
await _emailService.SendOtpEmailAsync(email, otp, invitation.FileName);
```

The OTP is sent via **email** (Microsoft Graph), not phone/SMS. There is no SMS service in the Vault codebase.

#### Verdict: FALSE

The FAQ explicitly states OTP is sent to "their phone." The code sends it to email. This is a factual misrepresentation of the delivery mechanism.

**Fix required**: Change "on their phone" / "على هاتفه" to "to their email" / "على بريدهم الإلكتروني" in faq.md section 4.4.

---

## Section 6: Watermarks

### Claim
> "Watermarked copies for external sharing."
>
> Appears in: faq.md (4.1, 4.4), landing-page.md (Q3), sales-deck.md (Slide 7), message-house.md (Proof Point 2)

### Codebase Evidence
`Backend/Vault/Service/Helpers/WatermarkHelper.cs`:
- `ApplyWatermark()` dispatches by file type
- Supports: PDF (iText), images (ImageSharp), Word documents (OpenXml)
- `InvitationService.cs` calls watermark on OTP-verified download

### Verdict: TRUE

Watermarking is implemented for PDF, image, and Word files.

---

## Section 7: AI Field Extraction

### Claim
> "When you upload a document, Vault automatically extracts key fields (dates, names, amounts, references) and indexes them for search and classification."
>
> Appears in: faq.md (2.4, 3.7), landing-page.md (Feature Block 6), sales-deck.md (Slide 9)

### Codebase Evidence
- Entity: `DocumentExtraction.cs` exists with `Fields` (BsonDocument), `Confidence` (double), `Status` ("Pending")
- Service: `DocumentExtractionService.cs` provides CRUD + pending queue + approve/reject workflow
- Frontend: `ExtractionReview.tsx` page, `DocumentClassificationModal.tsx` component
- **Missing**: No actual AI extraction logic anywhere in the codebase. No external AI API calls. No OCR. No NLP. The `DocumentService.cs` upload flow does not trigger any extraction.

The infrastructure (entity, service, UI) exists to store, review, and approve extractions, but nothing in the codebase actually performs the extraction.

### Verdict: PARTIALLY TRUE

The extraction review workflow is built. The "automatic" extraction claim is misleading -- there is no automated AI extraction in the code. Extractions appear to be created externally or manually. The claim "Vault automatically extracts key fields" cannot be verified from the codebase.

**Risk**: MEDIUM. The sales deck describes this as an automatic on-upload feature. The code has no auto-trigger.

---

## Section 8: Audit Trails

### 8a. Audit Trail Exists

#### Claim
> "Complete audit trail logging every action."
>
> Appears in: faq.md (4.1, 4.2), landing-page.md (Feature Block 3), sales-deck.md (Slide 7), message-house.md (Proof Point 2)

#### Codebase Evidence
- `AuditLog.cs` entity with ActorUserId, Action, EntityType, EntityId, Details, CreatedAt
- `Activity.cs` entity with Action, EntityType, EntityId, UserId, Details
- Both have dedicated services and controllers
- `ConstPermissions.AuditLogs` has View and Export permissions

#### Verdict: TRUE

Audit logging infrastructure exists with two complementary systems (AuditLog + Activity).

---

### 8b. IP Address in Audit Trail

#### Claim
> "Every action logged with user identity, IP address, and timestamp."
>
> Appears in: faq.md (4.1, 4.2), landing-page.md (Feature Block 3), sales-deck.md (Slide 7), message-house.md (Proof Point 2), voice-guide.md (Tier 1)

#### Codebase Evidence
`AuditLog.cs` entity fields:
```
Id, TenantId, ActorUserId, Action, EntityType, EntityId, Details, CreatedAt
```

**No IpAddress field exists.** Grep for `IpAddress`, `ip_address`, `ipAddress`, `RemoteIp` across the entire backend returned zero matches.

#### Verdict: FALSE

IP address logging is claimed in 5+ GTM files as a core security feature. The AuditLog entity does not have an IP address field. No code anywhere in the backend captures or stores IP addresses.

**Risk**: HIGH. This is stated as fact in the FAQ, landing page, sales deck, and message house. The voice guide classifies it as "Tier 1: Full Confidence (assert without qualification)."

**Fix required**: Either implement IP address logging in the AuditLog entity, or remove the IP address claim from all GTM materials.

---

## Section 9: Task System

### Claim
> Task management with assignment and completion.
>
> Referenced in: llm.txt, battle-cards.md (as Majles advantage for post-meeting tasks)

### Codebase Evidence
- `TaskEntity.cs` with Title, WorkspaceId, AssignedTo, CandidateUsers, DueDate, Status, RelatedEntity
- `TasksController.cs` with CRUD + my-tasks + complete endpoints
- `ConstPermissions.Tasks`: View, Create, Edit, Delete, Assign, Complete

### Verdict: TRUE

Task system is fully implemented. Note: battle-cards.md position 1 lists "Task Assignment & Tracking" as something Majles has that Musahm does not, which contradicts the codebase. Vault does have task management.

---

## Section 10: Shareholder Registry Integration

### Claim
> "Direct integration with the Shareholder Registry. Shareholder documents linked directly to their governance records in Musahm."
>
> Appears in: landing-page.md (Feature Block 4), sales-deck.md (Slide 5, 10), message-house.md, battle-cards.md

### Codebase Evidence
- No "shareholder" entity or mention in Vault backend C# code (grep returned 0 results)
- GRC integration exists: `GRCService.cs`, `CompanyMap.cs`, `UserMap.cs` (maps to external GRC users/companies)
- The integration is authentication-level (SSO, user sync) and company-level (tenant mapping), not document-level shareholder linking

### Verdict: PARTIALLY TRUE

Vault integrates with the Musahm GRC platform for authentication and company/user mapping. The shareholder registry itself is a GRC feature, not a Vault feature. The claim that "shareholder documents [are] linked directly to their governance records" overstates what Vault's code actually does -- it shares user accounts, not document-to-shareholder linkage.

**Nuance**: The "only platform" claims about shareholder registry refer to the Musahm ecosystem (GRC + Vault), not Vault alone. GTM materials should be careful to distinguish ecosystem capabilities from Vault-specific capabilities.

---

## Section 11: E-Signatures

### Claim
> "E-voting and e-signatures compliant with the E-Transactions Law."
>
> Appears in: sales-deck.md (Slide 5), message-house.md (Objection 4), battle-cards.md (competitive matrix)

### Codebase Evidence
No e-signature implementation found in the Vault codebase. Grep for `e-sign`, `esign`, `ESign`, `eSignature`, `electronic.?sign` across all `.cs` files returned no application code matches.

### Verdict: UNVERIFIABLE (for Vault)

E-signatures appear to be a Musahm GRC feature, not a Vault feature. The GTM files that claim e-signatures are discussing the Musahm platform (sales-deck Slide 5, battle-cards), not Vault specifically. This is acceptable as long as the claim is attributed to the Musahm ecosystem, not to Vault alone.

---

## Section 12: Encryption / Security Claims

### Claim (message-house.md, Objection Handler 4)
> "All data is encrypted in transit and at rest."

### Codebase Evidence
The message-house.md itself contains this inline warning:
> "NEEDS CLIENT INPUT: Encryption-at-rest is not verifiable from the application code. Confirm encryption-at-rest implementation details (e.g., MongoDB encryption, disk-level encryption, provider-managed keys) with the infrastructure team before using this claim in prospect conversations."

No encryption-at-rest code found in the application codebase. HTTPS (transit encryption) is implied by the API URL scheme.

### Verdict: UNVERIFIABLE

The GTM file correctly flags this. The claim should not be used in customer conversations until the infrastructure team confirms.

---

## Section 13: Mobile Apps

### Claim (message-house.md, Proof Point 3)
> "Full-featured iOS and Android apps. Board members review agendas, vote electronically, sign documents, and access meeting materials from their phones."
>
> Also battle-cards.md: "Native mobile apps, not a responsive website."

### Codebase Evidence
Vault is a React 18 SPA (Vite, web-only). No iOS or Android code in the repository. The landing-page.md correctly states: "Vault is mobile-responsive through your phone's browser."

### Verdict: PARTIALLY TRUE

The mobile app claims refer to the Musahm GRC platform, not Vault. Battle-cards.md lists "Mobile Apps (iOS + Android)" as a competitive advantage without clarifying this is GRC-only. The FAQ (6.2) and landing page correctly note Vault is browser-based and flag the need to verify native app Vault integration.

**Risk**: MEDIUM. Battle-cards could lead sales reps to claim Vault has native mobile apps. The FAQ handles this correctly.

---

## Section 14: "Only" Claims (Competitive Exclusivity)

### Claim
> "Musahm is the only Saudi platform combining governance, document management, and shareholder registry in a single product."
>
> Appears in: sales-deck.md (Slide 10), message-house.md (Proof Point 1), voice-guide.md (Tier 1), battle-cards.md

### Codebase Evidence
The Vault codebase confirms DMS capabilities. GRC integration confirms governance platform linkage. Shareholder registry is a GRC feature.

### Verdict: UNVERIFIABLE

"Only" claims are competitive assertions based on public competitor website analysis (acknowledged in voice-guide.md, Limitation 4). They cannot be verified from the Vault codebase. The voice-guide correctly notes: "Claims like 'the only Saudi platform with shareholder registry' are verified against competitors' public websites but not against their actual product capabilities."

**Recommendation**: Continue using with the caveat already stated in voice-guide.md. Annual competitor product demos recommended.

---

## Section 15: Version Control + Check-in/Check-out

### Claim
> "Every edit is saved as a separate version. The check-in/check-out system prevents simultaneous edits."
>
> Appears in: faq.md (3.5), sales-deck.md (Slide 8)

### Codebase Evidence
- `DocumentVersion.cs` entity with VersionNumber, UploadedBy, timestamps
- `DocumentVersionsController.cs` with full CRUD
- `DocumentsController.cs` endpoints: `POST /{id}/check-in`, `POST /{id}/check-out`

### Verdict: TRUE

Version control and check-in/check-out are both implemented.

---

## Section 16: Soft Delete

### Claim (faq.md 4.3)
> "Deletion in Vault is soft deletion. The document is marked as deleted [...] but it remains in the system."

### Codebase Evidence
- `Document.cs` has `IsDeleted`, `DeletedAt`, `DeletedBy` fields
- `RecycleBinService.cs` with restore and permanent delete
- `ConstPermissions.Documents.PermanentDelete` permission exists

### Verdict: PARTIALLY TRUE

Default deletion is soft delete (correct). However, the FAQ implies documents always remain in the system ("This ensures a complete chain of custody"), while the codebase includes a `PermanentDelete` permission and a `DELETE /api/RecycleBin/permanent/{id}` endpoint. Permanent deletion is possible for users with that permission.

**Recommendation**: Add nuance: "Default deletion is soft deletion. Permanent deletion requires explicit admin permission."

---

## Section 17: Per-Document ACLs

### Claim
> "Per-document permissions. Every document has independent access control."
>
> Appears in: faq.md (3.2), sales-deck.md (Slide 7), message-house.md (Proof Point 2)

### Codebase Evidence
- `DocumentAcl.cs` entity with DocumentId, UserId, Permission, GrantedBy
- `DocumentAclsController.cs` with CRUD endpoints
- `ConstPermissions.Documents.ManageACL` permission

### Verdict: TRUE

---

## Section 18: Arabic-First RTL

### Claim
> "Arabic-first interface with full right-to-left support. Not a translation layer."
>
> Appears in: faq.md (6.5), landing-page.md, sales-deck.md (Slide 6), voice-guide.md (Tier 1)

### Codebase Evidence
- `LanguageContext.tsx`: ~104KB inline dictionary, `ar` default language
- CSS: `[dir="rtl"]` selectors throughout
- Fonts: Cairo (Arabic), Inter + Cairo (LTR)
- `document.documentElement.dir` toggled by LanguageContext

### Verdict: TRUE

---

## Section 19: SSO with Musahm

### Claim
> "Single sign-on: your Musahm account opens Vault automatically."
>
> Appears in: faq.md (2.1, 6.1), landing-page.md (Step 1), sales-deck.md (Slide 6, 11)

### Codebase Evidence
- `AuthController.cs`: `login-by-token` and `admin-partner-login` endpoints
- `GRCService.cs`: Token forwarding to external GRC API
- `TokenAuth.tsx` frontend page for SSO token handling

### Verdict: TRUE

---

## Section 20: "15 Minutes" Setup Claim

### Claim
> "Setup takes 15 minutes" / "التهيئة تستغرق 15 دقيقة"
>
> Appears in: sales-deck.md (Slide 11), message-house.md (Objection 3), voice-guide.md (Appendix A)

### Codebase Evidence
No setup timing can be verified from code.

### Verdict: UNVERIFIABLE

Multiple GTM files already flag this with "NEEDS CLIENT INPUT: Verify with product team." The voice-guide lists it as Tier 2 (needs context). The sales deck marks it as needing verification.

---

## Section 21: "Connected to Meeting Minutes" / Document-to-Decision Linking

### Claim (sales-deck.md, Slide 6 speaker notes)
> "SharePoint does not connect documents to meeting minutes. [...] Vault connects governance documents to decisions."
>
> Also battle-cards.md (Ebana killer question): "Can you trace [a document] back to the specific board resolution that authorized it -- automatically?"

### Codebase Evidence
Documents in Vault are organized in workspaces (e.g., "Board Meetings") but there is no explicit entity linking a document to a specific meeting or board resolution. The `Document` entity has `WorkspaceId` and `ParentId` (folder hierarchy) but no `MeetingId`, `ResolutionId`, or similar field.

### Verdict: PARTIALLY TRUE

Documents are organized in governance-themed workspaces, which provides context. But the claim of automatic document-to-decision tracing is an overstatement. There is no code that automatically links an uploaded document to the specific board resolution that created it. The organization is manual (user places document in the right workspace).

---

## Section 22: Battle-Cards Task Assignment Contradiction

### Claim (battle-cards.md, Majles Card Section 5)
> Lists "Task Assignment & Tracking" as something Majles has that Musahm does NOT.

### Codebase Evidence
`TaskEntity.cs`, `TasksController.cs`, `ConstPermissions.Tasks` (View, Create, Edit, Delete, Assign, Complete) all exist and are fully implemented.

### Verdict: The battle card is OUTDATED

Vault has task assignment and tracking. The battle card incorrectly concedes this feature to Majles as a differentiator. This should be corrected.

---

## Critical Fixes Required (Priority Order)

### P0 -- FALSE claims that could fail in a live demo

| # | Claim | File(s) | Issue | Fix |
|---|-------|---------|-------|-----|
| 1 | Semantic search works | faq.md, landing-page.md, sales-deck.md, voice-guide.md | Stub code: `// Placeholder for real Vector/Semantic search` | Remove from GTM or clearly label as "coming soon" |
| 2 | Ask Vault answers questions from documents | faq.md, landing-page.md, sales-deck.md | Stub code: `"we are still working on the RAG integration"` | Remove from GTM or clearly label as "coming soon" |
| 3 | IP address in audit trail | faq.md, landing-page.md, sales-deck.md, message-house.md, voice-guide.md | AuditLog entity has no IpAddress field | Remove "IP address" from all audit trail descriptions, or implement the field |
| 4 | OTP sent to phone | faq.md (4.4) | Code sends OTP via email (`SendOtpEmailAsync`), not SMS/phone | Change "phone" to "email" in FAQ |

### P1 -- Misleading claims that need qualification

| # | Claim | File(s) | Issue | Fix |
|---|-------|---------|-------|-----|
| 5 | AI automatically extracts fields on upload | faq.md, landing-page.md, sales-deck.md | Extraction entity/UI exists but no auto-trigger in code | Qualify: "AI extraction capabilities" rather than "Vault automatically extracts" |
| 6 | Soft delete means documents always remain | faq.md (4.3) | PermanentDelete permission and endpoint exist | Add: "Permanent deletion requires admin permission" |
| 7 | Document-to-decision automatic linking | sales-deck.md, battle-cards.md | No meeting/resolution linkage in document entities | Reframe: "organized in governance workspaces" not "automatically traced to resolutions" |
| 8 | Task tracking conceded to Majles | battle-cards.md (Card 1, Section 5) | Vault has full task system | Remove from "what they have that we don't" or update the handling note |

### P2 -- Scoping issues (ecosystem vs. Vault)

| # | Claim | File(s) | Issue | Fix |
|---|-------|---------|-------|-----|
| 9 | Mobile apps as competitive advantage | battle-cards.md, message-house.md | Mobile apps are GRC, not Vault | Clarify which product has native apps |
| 10 | E-signatures | sales-deck.md, battle-cards.md | GRC feature, not Vault | Ensure attribution is to Musahm ecosystem, not Vault |

---

## Items Correctly Handled by GTM Authors

The following claims were accurately flagged as needing verification in the GTM files themselves:

- Data hosting location (faq.md 4.6, message-house.md Obj 4) -- correctly marked "NEEDS CLIENT INPUT"
- Encryption at rest (message-house.md Obj 4) -- correctly flagged as unverifiable from application code
- Pricing details (faq.md 5.x, sales-deck.md Slide 13) -- correctly marked as placeholders
- Client count (voice-guide.md Tier 4) -- correctly listed as "Do Not Claim" beyond 3 named
- "15 minutes" onboarding (sales-deck.md, message-house.md) -- correctly flagged for product team verification
- Native app Vault integration (faq.md 6.2) -- correctly flagged for verification
- Competitor capabilities (voice-guide.md Limitation 4) -- correctly noted as based on public data only

---

## Source Files Referenced

| File | Path | Role |
|------|------|------|
| ConstRoles.cs | `Backend/Vault/Core/Constants/ConstRoles.cs` | Role hierarchy ground truth |
| ConstDefaultWorkspaces.cs | `Backend/Vault/Core/Constants/ConstDefaultWorkspaces.cs` | Workspace names ground truth |
| ConstPermissions.cs | `Backend/Vault/Core/Constants/ConstPermissions.cs` | Permission modules ground truth |
| SearchService.cs | `Backend/Vault/Service/Services/SearchService.cs` | Search implementation (stubs found) |
| InvitationService.cs | `Backend/Vault/Service/Services/InvitationService.cs` | OTP + watermark flow |
| WatermarkHelper.cs | `Backend/Vault/Service/Helpers/WatermarkHelper.cs` | Watermark implementation |
| AuditLog.cs | `Backend/Vault/Core/Entities/AuditLog.cs` | Audit log entity (no IP field) |
| DocumentExtraction.cs | `Backend/Vault/Core/Entities/DocumentExtraction.cs` | AI extraction entity |
| DocumentExtractionService.cs | `Backend/Vault/Service/Services/DocumentExtractionService.cs` | Extraction CRUD (no AI logic) |
| Invitation.cs | `Backend/Vault/Core/Entities/Invitation.cs` | OTP entity fields |
| EmailService.cs | `Backend/Vault/Service/Services/EmailService.cs` | OTP delivery via email |
| llm.txt | `llm.txt` | Product knowledge graph |
