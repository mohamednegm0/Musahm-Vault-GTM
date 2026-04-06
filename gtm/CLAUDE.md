# Musahm GTM

B2B SaaS go-to-market for Musahm (corporate governance) + Musahm Vault (companion DMS). Saudi Arabia, Arabic-first.

## Product Truth (verified against codebase)

- Vault: .NET 10, React 18, MongoDB. Deployed IIS + Vercel/Cloudflare
- Search: keyword WORKS, semantic search STUB, Ask Vault RAG STUB
- No mobile apps. React SPA only (mobile-responsive)
- OTP sent via EMAIL not phone
- No IP address logging in audit trail
- Roles: Viewer/Commenter/Editor/Organizer/Admin (AR: عارض/معلّق/محرر/منظّم/مدير)
- 6 default governance workspaces
- 14 permission modules, hierarchical roles 1-5
- External sharing: OTP email + watermarks
- Task system EXISTS (TaskEntity.cs with full CRUD)
- Beta seats: 30 (canonical)
- Known clients: Al-Ufuq Educational, Miral Medical, Amwaj

## File Map

```
gtm/
  CLAUDE.md                          <- this file
  GTM-AUDIT-AND-EXECUTION-PLAN.md    <- master plan (7 milestones, 38+ files)
  execution-plan.md                  <- per-task skill/agent/input/output mapping
  MEGA-AUDIT.md                      <- 6-agent audit (74/100), showstoppers + fixes
  AUDIT-REPORT.md                    <- first PMM audit (62/100, 10 CRITICAL)
  CEO-AUDIT.md                       <- executive readiness audit
  GTM-AGENTS-REPO-SYNTHESIS.md       <- frameworks from gtm-agents repo (67 plugins)
  TOOL-STACK.md                      <- ranked tools, pipelines, MCP servers
  voice-guide.md                     <- brand voice (4-tier confidence + Brand Voice Matrix)
  positioning-statement.md           <- canonical positioning (Positioning Canvas framework)
  humanizer-report.md                <- AI detection scores per file

  phase1-discovery/
    icp.md                           <- 4 personas: Board Secretary, CEO, CFO, Legal
    competitive-analysis.md          <- Diligent, Majles.tech, Ebana, SharePoint
    battle-cards.md                  <- FIA framework per competitor
    brand-audit.md

  phase2-brand/
    concept-1-trust-heritage.md
    concept-2-modern-digital.md
    concept-3-ksa-native-tech.md     <- SELECTED concept
    recommendation.md                <- 5 modifications, voice table, brand palette

  phase3-segmentation/
    message-house.md                 <- hero statements, proof points, objections
    sector-priority-matrix.md        <- 6 sectors ranked (Real Estate P0, Healthcare P0)
    beta-rollout-plan.md             <- Wave 1/2/3, scoring matrix

  phase4-content/                    <- all customer-facing content (18 files)
    landing-page.md, launch-email.md, social-posts.md, sms-blast.md,
    video-script.md, poster-copy.md, cold-outreach.md, linkedin-strategy.md,
    blog-posts.md, nurture-sequence.md, onboarding-sequence.md, faq.md,
    google-ads.md, social-calendar.md, sales-deck.md, quick-start-guide.md,
    case-study-template.md, partner-kit.md, seo-keywords.md,
    whatsapp-library.md, press-release.md

  phase5-launch/
    launch-checklist.md              <- 12 channels, T-14 calendar
    beta-kpi-plan.md                 <- 10 KPIs, PostHog instrumentation
    vault-user-docs.md               <- 12 sections from codebase
    win-loss-template.md

  audit-artifacts/                   <- 6 detailed audit reports
    product-truth.md, consistency.md, customer-journey.md,
    arabic-audit.md, quality.md, positioning.md
```

## Reference Repo

`gtm-agents-ref/` contains the cloned gtm-agents repo (67 plugins, 244 skills).
- `_MUSAHM-GTM-REPO-FINDINGS.md` -- raw extraction (7,230 lines)
- `_scour-batch1-brand-competitive-pmm.md` -- deep analysis of 3 plugins
- Synthesis lives at `gtm/GTM-AGENTS-REPO-SYNTHESIS.md`

## Brand

- Tagline: "حوكمة سعودية. منصة عالمية." (Saudi governance. World-class platform.)
- Concept: KSA-Native-Tech (Concept 3)
- Palette: #1B4332 dark green, #c3924d gold, #2563EB oasis blue
- Voice: confident, Saudi-native, professional, forward-looking
- Arabic-first, MSA, Western numerals (0-9 not ٠-٩)
- Zero em dashes. Zero AI vocabulary.

## Audit Status (74/100 at audit time, M0 fixes applied)

### Showstoppers -- ALL FIXED (2026-04-02)
- S1. Semantic search + Ask Vault: reclassified as "Coming Soon" across 9 files
- S2. IP address: removed from all content files
- S3. OTP: fixed to "email" across all files
- S4. "أول": removed from all headlines
- S5. Mobile apps: changed to "mobile-responsive browser interface" in 4 files
- S6. Seat count: standardized to 30 across all files
- S7. "95%": replaced with "the vast majority" / "الغالبية العظمى" in 4 files

### Top Consistency Issues
- "من الصفر" (from scratch) x30 -- reduce to 3
- 5 different CTA verbs -- standardize to "فعّل Vault"
- Workspace names vary across files
- Eastern Arabic numerals in 7 files
- Role names wrong in 2 files

### Infrastructure Gaps
- Pricing: ZERO information at any touchpoint
- 6 missing web pages (Google Ads sitelinks point nowhere)
- No demo script
- No confirmation page after signup
- Support contact placeholders unfilled

### 8 Blocking Client Decisions
D1 Pricing, D2 Data hosting, D3 Logo permissions, D4 Launch date,
D5 WhatsApp number, D6 Landing page URL, D7 E-sig legal review, D8 Encryption verification

## Execution State

Master plan: 6 milestones, 19 tasks
- Milestone 1 (Foundation): voice guide + battle cards + agent rebuild
- Milestone 2 (Content Rebuild): rewrite 6 content files
- Milestone 3 (AI Cleanup): humanizer + de-ai-ify pass
- Milestone 4 (Decision Stage): 8 new deliverables
- Milestone 5 (Distribution): cold outreach, LinkedIn, blog, social, SEO
- Milestone 6 (Launch Enablement): Google Ads, partner materials

Start order: Tasks 3+4+5 parallel (foundational) -> 1,7,9,10,11 -> 2 -> rest

## Key Frameworks (from gtm-agents repo)

1. **Positioning Canvas**: Audience/Need/Approach/Differentiation/Proof
2. **Battlecard 7-Section**: Overview/Positioning/Landmines/Differentiation/Trap-Setting/Proof/Offer
3. **Account Tiering**: Firmographic 40% + Technographic 20% + Intent 30% + Engagement 10%
4. **Value Story**: Headline Impact/Driver Pillars/Proof/Execution Plan/Decision Ask
5. **MEDDIC**: Metrics/Economic Buyer/Decision Criteria/Process/Implications/Champion
6. **Cold Email Scoring**: Personalization 0-25, Value Clarity 0-25, CTA Strength 0-25, Technical Quality 0-25
7. **Campaign 6-Step**: Objectives/Audience/Messaging/Channels/Workback/Risk
8. **Crisis P1-P4**: severity matrix with response SLAs
9. **Brand Voice Matrix**: 4 attributes with We Are/We Are NOT
10. **Pricing Packaging**: Segmentation/Value Pillars/Metric+Fences/Add-ons/Narrative

## Rules

- Never claim features that are stubs (semantic search, Ask Vault, mobile apps)
- Never use em dashes (U+2014)
- Never use AI vocabulary (revolutionary, game-changing, best-in-class, etc.)
- Always use Western Arabic numerals (0-9)
- Always use canonical role names (عارض/معلّق/محرر/منظّم/مدير)
- Always use canonical workspace names (from faq.md glossary)
- Beta seats = 30, no other number
- "Built FOR Saudi governance" not "Built IN Saudi" (competitors are also Saudi)
- Lead with shareholder registry (genuinely exclusive differentiator)
