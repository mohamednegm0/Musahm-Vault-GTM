# Beta KPI Dashboard Plan: Musahm Vault

> **Methodology note:** Targets below use range-based estimates calibrated to wave size and industry benchmarks for B2B SaaS beta programs. Where no primary data exists, this is noted. All targets should be treated as hypotheses to be validated in Wave 1, then recalibrated for Wave 2+.

---

## 10 Key Performance Indicators

| # | KPI | Wave 1 Target (5 clients, hand-held) | Wave 2 Target (15 clients, mixed) | Wave 3 / GA Target | Measurement Method | Frequency |
|---|---|---|---|---|---|---|
| 1 | **Activation Rate** (uploaded ≥10 documents within 7 days) | 60–80% (3–4 of 5 clients) | 40–60% (6–9 of 15 clients) | 30–50% (self-serve) | Track `documents_uploaded` per tenant via MongoDB query on `documents` collection | Daily in W1, weekly in W2+ |
| 2 | **Time to First Document** (first login → first upload) | <30 minutes (with onboarding call) | <60 minutes (mixed support) | <60 minutes (self-serve) | Timestamp delta: first JWT login event → first `POST /api/Documents/upload` per tenant | Per client, reported weekly |
| 3 | **Weekly Active Users (WAU)** (≥1 Vault action per 7-day window) | 40–60% of invited users | 30–50% | 25–40% | Count unique `UserId` values in `activities` collection per 7-day window. Note: B2B DMS usage is inherently episodic; users upload in batches, not daily. | Weekly |
| 4 | **Document Volume** (total docs uploaded) | 100–250 total (20–50 per client) | 500–1,500 total | 3,000+ total | `db.documents.countDocuments({IsDeleted: false})` | Weekly cumulative |
| 5 | **Feature Adoption Breadth** (of 5 core features: Upload, Workspace creation, Sharing/ACLs, Search, Audit log view) | ≥3 of 5 features used per client within 14 days | ≥2 of 5 within 14 days | ≥2 of 5 within 30 days | Track distinct API endpoint families hit per tenant. Note: lower targets for self-serve waves because users adopt incrementally. | Bi-weekly |
| 6 | **Self-Serve Onboarding Completion** (first login → first upload → first share, without support ticket) | N/A (all hand-held) | 40–55% of clients | 50–65% of clients | Track clients completing all 3 milestone events without a Vault-tagged support ticket | Per wave |
| 7 | **Support Ticket Volume** | Uncapped (expected high, learning phase) | <5 tickets per client per week (avg) | <3 tickets per client per week (avg) | Count Vault-tagged support tickets in support system, divide by active clients | Weekly |
| 8 | **User Satisfaction** (1–10 scale, in-app or email survey) | Average ≥6.5 | Average ≥7.0 | Average ≥7.5 | Structured survey at end of each wave: 5 questions covering ease-of-use, feature completeness, reliability, Arabic UX quality, recommendation likelihood. Note: using 1–10 scale instead of NPS for small cohorts; NPS requires n≥30 to be statistically meaningful. | End of each wave |
| 9 | **System Reliability** | ≥99% uptime, 0 unresolved P0 bugs | ≥99.5% uptime, 0 unresolved P0 bugs | ≥99.5% uptime | Monitor `/api/Documents` and `/api/Workspaces` endpoint availability. P0 = data loss, auth bypass, or complete feature failure. Track via health check endpoint + PostHog error events. | Continuous (alert on downtime) |
| 10 | **Retention (continued usage after 2+ weeks)** | 4 of 5 clients still active at wave end | 10 of 15 clients still active at wave end | ≥70% of all beta clients | "Active" = at least 1 document action in the trailing 14 days. Proactively reach out to declining clients (WAU drop >50% week-over-week). | Weekly |

### Why these targets, not higher

B2B SaaS beta benchmarks (sourced from general industry patterns; no Musahm-specific historical data exists):
- **Activation:** Hand-held onboarding typically achieves 60–80%. Self-serve drops to 25–40%. Claiming 80%+ for any wave is unrealistic.
- **WAU:** Enterprise DMS products see 30–50% WAU because usage is episodic (batch uploads around meetings, not daily activity). Governance documents are created in bursts, not streams.
- **Satisfaction:** Using a 1–10 scale instead of NPS because NPS requires minimum 30 respondents for statistical validity. Wave 1 has 5 clients; NPS would be noise.
- **Zero churn target removed.** Beta products have churn. Targeting 80% retention is ambitious but honest. Targeting 0 is planning to be surprised.

---

## Secondary Metrics (Track but Don't Gate On)

| Metric | Why Track | Target Range |
|---|---|---|
| **Average documents per client** | Understand usage depth | 20–50 docs/client by Wave 2 end |
| **Most-used document types** | Inform product defaults | Identify top 3 (expect: contracts, meeting minutes, policies based on default workspaces) |
| **Sharing frequency** | Indicates collaboration value | >3 share/ACL actions per client/week |
| **Audit log views per admin** | Indicates compliance value perception | >1 admin audit log view per client/week |
| **Search usage & success rate** | Validate findability | Track `POST /api/Search/keyword` and `/semantic` calls; >50% of searches result in document open |
| **Workflow creation** | Indicates advanced adoption | At least 1 workflow created per client by end of Wave 2 |
| **Mobile vs. desktop usage** | Inform platform investment | Track via PostHog device metadata (already integrated) |
| **Recycle bin recovery rate** | Indicates accidental deletions | If >10% of deletes are recovered, investigate UX issues |

---

## Weekly Beta Check-In Template

### Meeting Details
- **Frequency:** Every Sunday, 10:00–10:30 AM AST
- **Attendees:** Product Manager, Engineering Lead, Customer Success Lead, Marketing Representative
- **Format:** 30-minute standup, structured agenda, documented decisions

### Agenda

#### 1. Dashboard Review (10 minutes)
Screen-share the KPI dashboard. For each of the 10 KPIs, state: **current value vs. target range** and **trend (up/down/flat)**.

| KPI | Target Range | Current | Trend | Status |
|---|---|---|---|---|
| Activation Rate | [wave-specific] | __% | up/down/flat | green/yellow/red |
| Time to First Doc | <30/60 min | __ min | up/down/flat | green/yellow/red |
| WAU | [wave-specific] | __% | up/down/flat | green/yellow/red |
| Document Volume | [wave-specific] | __ | up/down/flat | green/yellow/red |
| Feature Breadth | ≥3/5 or ≥2/5 | __/5 avg | up/down/flat | green/yellow/red |
| Self-Serve Onboarding | [wave-specific] | __% | up/down/flat | green/yellow/red |
| Support Tickets | <5 or <3/client/wk | __ | up/down/flat | green/yellow/red |
| User Satisfaction | ≥6.5/7.0/7.5 | __ | up/down/flat | green/yellow/red |
| Uptime | 99/99.5% | __% | up/down/flat | green/yellow/red |
| Retention | [wave-specific] | __% | up/down/flat | green/yellow/red |

**Status definitions:**
- **Green:** Within or above target range
- **Yellow:** Below target range but within 20%; monitor closely
- **Red:** More than 20% below target range; requires action this week

#### 2. Red Flag Discussion (10 minutes)
For each red KPI:

| Red KPI | Root Cause Hypothesis | Proposed Action | Owner | Fix By |
|---|---|---|---|---|
| | | | | |

#### 3. User Feedback Highlights (5 minutes)
- Top 3 positive feedback themes this week
- Top 3 negative feedback themes / feature requests this week
- Any "dealbreaker" issues raised by beta clients (escalate immediately)

| Type | Feedback | # Clients Mentioned | Action Required? |
|---|---|---|---|
| Positive | | | |
| Negative | | | |

#### 4. Decisions & Next Steps (5 minutes)

| Decision | Owner | Deadline |
|---|---|---|
| | | |

**Wave Gate Status:**
- Current wave: __
- Gates met: __ / __ (reference `beta-rollout-plan.md` success gates)
- Projected wave advancement date: __
- Blockers to advancement: __
- **Rollback decision:** If 2+ success gates are missed by wave end, convene a 1-hour decision meeting: fix and extend wave, or rollback.

---

## Dashboard Implementation

| Aspect | Recommendation |
|---|---|
| **Tool** | PostHog (already integrated: `posthog.musahm.com`, see `main.tsx` PostHogProvider) |
| **Primary data sources** | MongoDB `activities` collection (user actions), `documents` collection (upload counts), `audit_logs` collection (audit trail), support ticket system (ticket volume) |
| **Supplementary** | In-app survey tool for satisfaction scoring (or structured Google Form sent via email at wave end) |
| **Access** | Product Manager, Engineering Lead, Customer Success Lead, CEO |
| **Refresh rate** | Daily for usage metrics (PostHog auto-captures), weekly manual review for survey data |
| **Alerting** | Configure PostHog alerts for: API error rate spike >5%, any P0 bug pattern (repeated 500 errors on critical endpoints), any tenant with zero activity for 7+ consecutive days |

### Instrumentation Requirements (Engineering Work Needed)

The following PostHog events should be explicitly tracked before beta launch. They are NOT automatically captured:

| Event | Source | Implementation |
|---|---|---|
| `vault.document.uploaded` | `DocumentsController.cs` or `DocumentUpload.tsx` | Fire on successful upload with document type and workspace ID |
| `vault.document.shared` | `DocumentAclsController.cs` or `ShareModal.tsx` | Fire on ACL grant with permission level |
| `vault.search.performed` | `SearchVault.tsx` | Fire on search submit with query type (keyword/semantic/ask) |
| `vault.audit_log.viewed` | `AuditLogs.tsx` | Fire on page visit |
| `vault.workflow.created` | `WorkflowEditorPage.tsx` | Fire on workflow save |
| `vault.workspace.created` | `CreateWorkspaceModal.tsx` | Fire on workspace creation |

⚠️ NEEDS CLIENT INPUT: Confirm PostHog project access for the beta KPI dashboard, assign engineering owner for instrumentation work, and set the fixed weekly check-in time slot.
