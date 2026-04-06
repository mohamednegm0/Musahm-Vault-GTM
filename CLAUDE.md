# Musahm Vault

DMS + AI extraction + workflows + multi-tenancy. .NET 10 + MongoDB | React 18 + Vite. Saudi Arabia.

> **Knowledge graph** (file index, API endpoints, entity maps, search patterns) → `llm.txt`

## Stack

```
Backend/Vault/  .NET 10 Clean Arch (Vault.slnx)
  API/          Controllers, DI, Swagger, JWT
  Core/         Entities, DTOs, interfaces, constants, enums
  Service/      Business logic, seeders, helpers, i18n
  Repository/   MongoDB driver, BaseRepository<T>, UnitOfWork
  MCP-Bots/     Node.js MCP servers

Frontend/       npm monorepo
  apps/web/     React 18 SPA (Vite 7, TS, plain CSS, react-router v6)
  packages/     core/ hooks/ types/ utils/
```

## Mechanical Overrides

### Pre-Work
- **STEP 0**: Before any structural refactor on a file >300 LOC, first remove dead props, unused exports/imports, debug logs. Commit cleanup separately.
- **PHASED EXEC**: Never refactor >5 files in one response. Complete phase → verify → proceed.

### Code Quality
- **SENIOR DEV OVERRIDE**: If architecture is flawed, state duplicated, or patterns inconsistent — fix it. Ask: "What would a senior perfectionist reject in review?" Fix all of it.
- **FORCED VERIFICATION**: Task is NOT complete until:
  - Backend: `dotnet build` passes (zero warnings preferred)
  - Frontend: `npx tsc --noEmit` passes + `npm run build` succeeds
  - If no checker available, state it — never claim "done" falsely.

### Context Management
- **SUB-AGENTS**: >5 independent files → split into 3-5 parallel sub-agents with clean context each.
- **CONTEXT DECAY**: After ~8-10 messages or focus change, re-read files before editing. Don't trust stale memory.
- **FILE READ BUDGET**: Files capped at ~2000 lines/read. Files >500 LOC → chunk with offset/limit. Never assume single read = full file.
- **TOOL TRUNCATION**: Large tool outputs (>50k chars) silently truncate. If grep returns suspiciously few results, narrow scope + note truncation risk.

### Edit Safety
- **EDIT INTEGRITY**: Re-read target file before every edit. Re-read after to confirm. Max 3 edits per file before re-verification.
- **NO AST SEARCH**: grep ≠ AST. When renaming anything, search separately for: direct calls, type refs, string literals, dynamic imports, re-exports/barrels, test mocks.

## Critical Patterns

- **Multi-tenancy**: Every entity has `TenantId`. Per-query isolation.
- **No transactions**: `UnitOfWork.Complete()` is no-op. Writes are immediate.
- **File storage**: Inline `byte[]` + GridFS fallback.
- **Blocking workflows**: mutation → workflow check → "Pending" → instance → "Active". HTTP 460 = WorkflowRequired.
- **Identity**: `BaseApiController` (IAsyncActionFilter) → JWT → `CurrentUser` → loads permissions.
- **Auth**: JWT Bearer, symmetric key. `ConstPermissions` → `PermissionAuthorizationHandler`.
- **Roles**: Hierarchical 1-5 (Viewer→Admin). Higher inherits lower.
- **Soft delete**: `IsDeleted` + `DeletedAt` + `DeletedBy` on Documents/Workspaces.
- **i18n**: `useLanguage()`, Arabic RTL default. ~104KB inline dict in `LanguageContext.tsx`.
- **CSS**: Plain CSS + vars. No Tailwind. `--brand-gold: #c3924d`. RTL via `[dir="rtl"]`.
- **API client**: axios interceptors — JWT, `X-Company-Id`, 401→redirect, loader counter, mutation dedup.

## Dev Commands

```bash
cd Backend/Vault && dotnet build && dotnet run --project API  # :5042
cd Frontend && npm install && npm run dev
cd Frontend/apps/web && npx playwright test  # 13 smoke tests
```

## Conventions

| Aspect | Rule |
|--------|------|
| Backend | PascalCase C#, snake_case MongoDB via `[BsonElement]` |
| Frontend | PascalCase components, camelCase functions |
| Routes | `/api/{PascalCaseController}` |
| IDs | MongoDB ObjectId strings |
| Audit | Mutations → Activity + AuditLog |
| i18n | Backend: `Accept-Language`. Frontend: `useLanguage()` |
| Entity base | `IEntity` → `string? Id` + `[BsonId]` |

## Context Providers (App.tsx order)

PostHog → Language → Confirm → Auth → Loading → Toast → Workspace → BrowserRouter

## Env

`VITE_API_URL` = `https://api-s2.vault.musahm.com` | Prod = `https://www-s2.vault.musahm.com` | PostHog = `posthog.musahm.com`

## localStorage

`authToken` `userEmail` `currentCompanyId`(→X-Company-Id) `language`(ar/en) `sessionStorage.userId`

## Large Files (chunk reads required)

`contexts/LanguageContext.tsx` ~104KB | `components/ExplorerLayout.tsx` ~76KB | `components/WorkflowAssignmentModal.tsx` ~55KB

## Integrations

GRC → `GRCUrl` appsettings, RestSharp, token forwarding | Email → MS Graph OAuth `EmailService.cs` | MCP → Node.js in MCP-Bots/

## Bug Log

**Shipped**: MUS-730 -736 -707 -732 -724 -729 -753 -754 -755 -737 -751 -748 -718
**Open (PM)**: MUS-710 -752 -749 -728
