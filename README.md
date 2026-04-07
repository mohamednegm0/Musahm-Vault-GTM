# Musahm Vault GTM

Go-to-market strategy, content, and launch materials for **Musahm Vault** -- a document management system built for Saudi corporate governance.

Vault connects directly to the [Musahm](https://musahm.com) corporate governance platform, giving companies one place to store, govern, and audit every board minute, shareholder document, contract, and policy.

---

## What's in This Repo

```
Backend/          .NET 10 Clean Architecture (MongoDB, JWT, multi-tenant)
Frontend/         React 18 SPA (Vite, TypeScript, plain CSS, RTL/LTR)
gtm/              Go-to-market strategy and content (see below)
gtm-agents-ref/   Reference: 67 GTM agent plugins, 244 skill prompts
llm.txt           Codebase knowledge graph (file index, API map, entity map)
```

---

## GTM Structure

All go-to-market work lives under `gtm/`. Six milestones, all complete.

### Phase 1: Discovery

| File | What It Covers |
|------|----------------|
| `phase1-discovery/icp.md` | 4 buyer personas: Board Secretary, CEO, CFO, Legal Counsel |
| `phase1-discovery/competitive-analysis.md` | Diligent, Majles.tech, Ebana, SharePoint |
| `phase1-discovery/battle-cards.md` | FIA framework per competitor with trap-setting questions |
| `phase1-discovery/brand-audit.md` | Current brand state assessment |

### Phase 2: Brand

| File | What It Covers |
|------|----------------|
| `phase2-brand/concept-1-trust-heritage.md` | Concept option 1 |
| `phase2-brand/concept-2-modern-digital.md` | Concept option 2 |
| `phase2-brand/concept-3-ksa-native-tech.md` | **Selected concept**: "Built FOR Saudi governance" |
| `phase2-brand/recommendation.md` | 5 modifications, voice table, brand palette |

### Phase 3: Segmentation

| File | What It Covers |
|------|----------------|
| `phase3-segmentation/message-house.md` | Hero statements, proof points, objection handling |
| `phase3-segmentation/sector-priority-matrix.md` | 6 sectors ranked (Real Estate P0, Healthcare P0) |
| `phase3-segmentation/beta-rollout-plan.md` | Wave 1/2/3 rollout, scoring matrix |

### Phase 4: Content (Customer-Facing)

33 files covering every launch channel. Key deliverables:

| File | Description |
|------|-------------|
| `final-social-posts.md` | 48-post social calendar (8 weeks, LinkedIn + Twitter) |
| `final-launch-email.md` | Bilingual beta invite (AR + EN), 8 feature bullets |
| `final-sms-blast.md` | 4 SMS variants (AR/EN, single/extended) |
| `video-script.md` | Brand video script (~78s, 6 scenes) |
| `final-video-demo-script.md` | Product demo script (~2:40, 8 scenes) |
| `generate-visuals.js` | LinkedIn + square visual generator (PptxGenJS) |
| `final-boss-review.html` | Self-contained executive review dashboard |
| `final-launch-dashboard-en.html` | Launch review dashboard with approval controls |
| `landing-page.md` | Landing page copy |
| `google-ads.md` | Google Ads campaign structure |
| `cold-outreach.md` | Cold email sequences with scoring rubric |
| `linkedin-strategy.md` | 5-phase LinkedIn credibility ladder |
| `blog-posts.md` | Blog content with SCAR arc framework |
| `nurture-sequence.md` | Email nurture with scoring rubric |
| `onboarding-sequence.md` | Behavioral onboarding, 5 activation milestones |
| `faq.md` | 28-item FAQ with Schema.org markup |
| `sales-deck.md` | Sales presentation content |
| `seo-keywords.md` | 15 primary keywords, Arabic morphology map |
| `whatsapp-library.md` | WhatsApp message templates |
| `press-release.md` | Launch press release |

### Phase 5: Launch

| File | What It Covers |
|------|----------------|
| `phase5-launch/launch-checklist.md` | 12 channels, T-14 calendar |
| `phase5-launch/beta-kpi-plan.md` | 10 KPIs, PostHog instrumentation plan |
| `phase5-launch/vault-user-docs.md` | 12-section user documentation from codebase |
| `phase5-launch/win-loss-template.md` | 9-field post-deal analysis template |

### Polished Deliverables

`gtm/deliverables/` contains final, standalone versions of key documents:

| File | What It Is |
|------|------------|
| `positioning-statement.md` | Canonical positioning (FOR/WHO/OUR/UNLIKE/PROOF) |
| `voice-guide.md` | Brand Voice Matrix, 4-tier confidence, anti-patterns |
| `battle-cards.md` | 4 competitive cards (Majles, Ebana, Diligent, WhatsApp) |
| `meddic-checklist.md` | MEDDIC qualification adapted for KSA governance |
| `cxo-value-story.md` | Executive value story (CEO, CFO, Board Secretary) |
| `demo-script.md` | 25-minute scripted demo, 6 scenes |
| `account-tiering-matrix.md` | T1/T2/T3 scoring model, wave assignments |
| `pricing-tiers.md` | 3 tiers (Starter/Professional/Enterprise) |
| `crisis-playbook.md` | P1-P4 severity matrix, bilingual templates |
| `brand-governance-checklist.md` | 14-item pre-publish gate |

### Audit Reports

| File | What It Covers |
|------|----------------|
| `MEGA-AUDIT.md` | 6-agent audit, scored 74/100, showstoppers + fixes |
| `AUDIT-REPORT.md` | First PMM audit (62/100, 10 critical findings) |
| `CEO-AUDIT.md` | Executive readiness audit |
| `GTM-AUDIT-AND-EXECUTION-PLAN.md` | Master plan: 6 milestones, findings, task mapping |
| `audit-artifacts/*.md` | 6 detailed reports (product truth, consistency, Arabic, etc.) |
| `humanizer-report.md` | AI detection scores per file |

---

## Brand Identity

| Element | Value |
|---------|-------|
| Tagline | **Saudi governance. World-class platform.** |
| Arabic | **...** |
| Concept | KSA-Native-Tech ("Built FOR Saudi governance") |
| Palette | `#1B4332` dark green, `#c3924d` gold, `#2563EB` oasis blue |
| Voice | Confident, Saudi-native, professional, forward-looking |
| Language | Arabic-first, MSA, Western numerals (0-9) |

---

## Product Summary

| Capability | Detail |
|-----------|--------|
| Platform | .NET 10 + React 18 + MongoDB |
| Deployment | IIS backend, Vercel/Cloudflare frontend |
| Multi-tenancy | Per-query tenant isolation via `TenantId` |
| Workspaces | 6 default governance workspaces |
| Roles | Viewer / Commenter / Editor / Organizer / Admin |
| Permissions | 14 modules, hierarchical (level 1-5) |
| Audit trail | Every action logged with user + timestamp |
| External sharing | OTP via email + watermarked copies |
| Workflows | Approval chains enforced before document publication |
| Version control | Every edit saved, rollback to any version |
| Signatures | Electronic signatures in document workflows |
| Search | Keyword search (semantic search coming soon) |
| Data hosting | Saudi Arabia |

---

## Boss Review Dashboard

`gtm/phase4-content/final-boss-review.html` is a self-contained HTML file designed for executive review. Open it in any browser -- no server, no dependencies, no repo access needed.

**What it includes:**
- Deliverables overview table (all 7 final content files)
- 25 reviewable content cards with approve/revise/reject controls
- Full 48-post social media calendar (9 written + 39 planned)
- 3 pending blocker cards requiring decisions
- Personas, rollout waves, and timeline
- Comment fields saved to browser localStorage
- CSV export of all decisions and notes

---

## Quick Start (Development)

```bash
# Backend
cd Backend/Vault && dotnet build && dotnet run --project API  # localhost:5042

# Frontend
cd Frontend && npm install && npm run dev

# Tests
cd Frontend/apps/web && npx playwright test  # 13 smoke tests
```

**Environment:**
- API: `VITE_API_URL=https://api-s2.vault.musahm.com`
- Prod: `https://www-s2.vault.musahm.com`
- Analytics: PostHog at `posthog.musahm.com`

---

## Content Rules

These rules apply to all customer-facing content in this repo:

1. Never claim features that are stubs (semantic search, Ask Vault, mobile apps)
2. Never use em dashes
3. Never use AI vocabulary (revolutionary, game-changing, best-in-class)
4. Always use Western Arabic numerals (0-9)
5. Always use canonical role names
6. Beta seats = 30, no other number
7. "Built FOR Saudi governance" not "Built IN Saudi"
8. Lead with shareholder registry as the primary differentiator

---

## Milestone Status

| Milestone | Description | Status |
|-----------|-------------|--------|
| M0 | Showstopper Fixes (7 items across 20+ files) | Complete |
| M1 | Foundation (positioning, voice guide, battle cards) | Complete |
| M2 | Sales Enablement (MEDDIC, demo script, account tiering) | Complete |
| M3 | AI Cleanup (humanizer pass, 8.9/10 avg score) | Complete |
| M4 | New Content (thank-you page, win/loss template) | Complete |
| M5 | Distribution (social calendar, cold outreach, SEO) | Complete |
| M6 | Sales & Partner Enablement (pricing, crisis, governance) | Complete |

---

## Pending Client Decisions

These items are blocked on client input before launch:

| ID | Decision |
|----|----------|
| D1 | Pricing (SAR amounts for 3 tiers) |
| D2 | Data hosting confirmation |
| D3 | Logo permissions for case studies |
| D4 | Launch date |
| D5 | WhatsApp support number |
| D6 | Landing page URL |
| D7 | E-signature legal review |
| D8 | Encryption verification |

---

## License

Proprietary. Internal use only.
