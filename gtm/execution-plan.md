# GTM Execution Plan: Skills & Agent Mapping

> Auto-generated orchestration map linking every GTM execution category to the installed skills, agents, input files, and expected deliverables.

---

## Priority Legend

| Code | Meaning | Timing |
|------|---------|--------|
| **P0** | Must complete before launch | W-4 to W-1 |
| **P1** | Launch week deliverables | L to L+2 |
| **P2** | Post-launch / ongoing | L+4 onward |

---

## Master Mapping Table

### 1. Content Rewriting (all existing GTM copy)

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Agent** | `gtm-copywriter`: general GTM copywriting, bilingual AR/EN |
| **Supporting Agent** | `gtm-brand-voice-guardian`: enforces Concept 3 voice consistency |
| **Primary Skill** | `copywriting` (marketingskills): structured copy frameworks |
| **Supporting Skill** | `copy-editing` (marketingskills): line-level editing pass |
| **Input** | All Phase 4 content files: `launch-email.md`, `social-posts.md`, `sms-blast.md`, `video-script.md`, `poster-copy.md`. Brand voice reference: `phase2-brand/concept-3-ksa-native-tech.md` + `phase2-brand/recommendation.md` (voice guidelines table in Modification 4). Message house: `phase3-segmentation/message-house.md`. |
| **Expected Output** | Rewritten bilingual copy for every Phase 4 deliverable, aligned to Concept 3 "KSA-Native-Tech" voice: professional with progressive national pride, Arabic-first, no startup buzzwords, no generic "Middle East" framing. |
| **Dependencies** | Depends on Task 3 (Brand Voice Alignment) being completed first. |

---

### 2. AI Fingerprint Removal

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Skill** | `humanizer` (v2.5.1): 29-category AI pattern detection based on Wikipedia's "Signs of AI writing" guide. Produces draft rewrite, AI audit, then final rewrite. |
| **Secondary Skill** | `de-ai-ify` (v2.0.0): 47-pattern detection with 0-10 human-ness scoring. Outputs `-HUMAN.md` variant with change log. Target score: 8+/10. |
| **Agent** | `gtm-brand-voice-guardian`: post-humanization voice consistency check |
| **Input** | Every text file in `gtm/phase4-content/` and `gtm/phase5-launch/vault-user-docs.md`. For `humanizer`: provide 2-3 authentic Musahm writing samples (founder emails, internal docs) for voice calibration. For `de-ai-ify`: run with `--mode standard` for public content, `--preserve-formal` for user docs. |
| **Expected Output** | Each content file scoring 8+/10 on the de-ai-ify human-ness scale. Change log per file showing patterns removed. No hedging language, no "in today's fast-paced world," no rhetorical-question-then-answer patterns. |
| **Dependencies** | Run AFTER Task 1 (Content Rewriting). These skills are the final quality gate before publish. |
| **Execution Sequence** | `humanizer` first (deeper rewrite) then `de-ai-ify` second (scoring + residual cleanup). |

---

### 3. Brand Voice Alignment to Concept 3

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Agent** | `gtm-brand-voice-guardian`: enforces voice consistency across all content |
| **Primary Skill** | `voice-extractor`: extracts communication DNA from writing samples, produces Voice Guide |
| **Supporting Skill** | `brand-building` (agentkits-marketing): brand positioning frameworks |
| **Input** | `phase2-brand/concept-3-ksa-native-tech.md` (full concept), `phase2-brand/recommendation.md` (5 modifications, especially Modification 4: voice guidelines table). 3+ writing samples from Musahm team (founder emails, internal comms, existing Arabic marketing). `phase3-segmentation/message-house.md` (hero statements, proof points). |
| **Expected Output** | **Musahm Voice Guide** document containing: Core energy profile, signature phrases (Arabic + English), confidence zone mapping (governance = full authority, AI features = active exploration), anti-patterns list (no "disruptive," no generic "Middle East," no Western tech mimicry, no startup buzzwords), validation test sentences. Voice dimensions: Arabic-first, professional register, progressive national pride, confident but warm. |
| **Dependencies** | None. This is a foundational task. All other content tasks depend on this. |

---

### 4. ICP Validation & Refinement

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Agent** | `gtm-persona-builder`: builds and refines buyer personas |
| **Supporting Agent** | `gtm-researcher`: market research and competitive intelligence |
| **Skill** | `customer-research` (marketingskills): systematic customer research methodology |
| **Input** | `phase1-discovery/icp.md` (4 personas: Board Secretary, CEO, CFO, Legal Counsel). `phase3-segmentation/sector-priority-matrix.md` (6 sectors ranked). `phase3-segmentation/beta-rollout-plan.md` (Wave 1 scoring matrix). Current Musahm client data (if available). |
| **Expected Output** | Validated persona cards with: pain points ranked by urgency, buying triggers by sector, decision-making authority mapping, Saudi-specific cultural buying signals (trust-first, relationship-driven), objection likelihood by persona. Refined Wave 1 scoring matrix weights based on actual client conversations. |
| **Dependencies** | None. Foundational research task. Feeds into Tasks 7, 10, 11, 15. |

---

### 5. Competitive Analysis Deepening

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Agent** | `gtm-researcher`: competitive intelligence gathering |
| **Primary Skill** | `competitor-alternatives` (marketingskills): competitor comparison pages, battle cards, teardowns |
| **Input** | `phase1-discovery/competitive-analysis.md` (existing analysis: Diligent, Majles.tech, etc.). Web research on competitor pricing, features, KSA presence. |
| **Expected Output** | Updated competitive matrix with: feature-by-feature comparison table (Musahm vs each competitor), pricing intelligence, KSA market presence assessment, "Built Saudi" differentiation scoring per competitor (none can claim this), battle cards for sales team (one per top competitor). Feeds directly into Task 11 (Sales Deck) and Task 18 (Partner Enablement). |
| **Dependencies** | None. Can run in parallel with Task 4. |

---

### 6. SEO Optimization (Arabic + English)

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Agent** | `gtm-seo-specialist`: bilingual SEO strategy |
| **Supporting Agents** | `blog-blog-seo`: blog-specific SEO, `blog-blog-researcher`: keyword research |
| **Primary Skill** | `seo-mastery` (agentkits-marketing): comprehensive SEO framework |
| **Supporting Skills** | `ai-seo` (marketingskills): AI-era SEO, `schema-markup` (marketingskills): structured data, `programmatic-seo` (marketingskills): scalable SEO pages, `site-architecture` (marketingskills): URL structure |
| **Input** | Target Arabic keywords from `launch-checklist.md` Channel 11: إدارة وثائق, حوكمة الشركات, نظام أرشفة, DMS سعودي. Competitor keyword profiles from Task 5. Musahm site architecture. |
| **Expected Output** | Bilingual keyword map (Arabic primary, English secondary) covering: governance keywords, DMS keywords, sector-specific terms (real estate governance, healthcare compliance). On-page SEO specifications for landing page, blog posts, and product pages. Schema markup recommendations (Organization, SoftwareApplication, FAQ). Technical SEO audit of musahm.com. |
| **Dependencies** | Depends on Task 5 (Competitive Analysis) for competitor keyword intelligence. |

---

### 7. Cold Email / Outreach Sequences

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Agent** | `gtm-email-wizard`: email sequence creation and optimization |
| **Primary Skill** | `cold-outreach-sequence` (ai-marketing): 4-touch personalized sequences with research-based personalization tiers |
| **Secondary Skill** | `cold-email` (marketingskills): B2B cold email frameworks with 5-input context model |
| **Input** | `phase1-discovery/icp.md` (persona details for targeting). `phase3-segmentation/sector-priority-matrix.md` (sector priorities: Real Estate P0, Healthcare P0). `phase3-segmentation/message-house.md` (proof points, objection handlers). `phase3-segmentation/beta-rollout-plan.md` (Wave 1 target profile). Sender positioning: "Musahm, Saudi governance platform, built for Saudi regulations." |
| **Expected Output** | Per sector (Real Estate, Healthcare): connection request (LinkedIn, 300 chars max), first message (after accept, 24-48h), follow-up #1 (Day 7, new value), follow-up #2 (Day 14, email channel shift), break-up message (Day 21). All bilingual (Arabic primary). Personalization tiers assigned per prospect batch. Pipeline tracking table template. |
| **Dependencies** | Depends on Task 4 (ICP Validation) and Task 3 (Brand Voice). |

---

### 8. LinkedIn Content Strategy

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Skill** | `linkedin-authority-builder` (ai-marketing): full content system: pillars, formats, posting rhythm, 4-week calendar with real dates |
| **Supporting Skill** | `social-content` (marketingskills): platform-specific social content creation |
| **Primary Agent** | `gtm-attraction-specialist`: paid and organic acquisition strategy |
| **Supporting Agent** | `gtm-copywriter`: post writing |
| **Input** | Positioning one-liner: "Saudi governance. World-class platform." ICP: Board Secretaries, CEOs, CFOs at Saudi SMBs. Content goals: beta signups, thought leadership in Saudi governance space. Available time: estimate 3-5 hours/week. `phase4-content/social-posts.md` (existing posts as starting point). |
| **Expected Output** | 3-5 content pillars passing the 4-test framework (expertise, audience cares, sustainable 6+ months, connects to product). Weekly rhythm (3-5 posts/week). Format mix: 2-3 frameworks (authority), 1-2 stories (connection), 1 proof point. 4-week content calendar with real dates and Arabic/English hooks. 5 starter post hooks ready to publish. Engagement plan (who to engage, time commitment). |
| **Dependencies** | Depends on Task 3 (Brand Voice) for consistent positioning. |

---

### 9. Beta Onboarding Copy

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Agent** | `gtm-copywriter`: bilingual onboarding copy |
| **Supporting Agent** | `gtm-conversion-optimizer`: activation funnel optimization |
| **Primary Skill** | `onboarding-cro` (marketingskills): post-signup activation optimization, time-to-value reduction |
| **Input** | `phase5-launch/vault-user-docs.md` (12 sections covering all Vault features: roles, workspaces, permissions, ACLs, OTP sharing, workflows, search, AI). `phase3-segmentation/beta-rollout-plan.md` (Wave 1 onboarding requirements: 15-minute onboarding target, weekly touchpoints). `phase5-launch/beta-kpi-plan.md` (activation KPIs: "Active Use" = 3+ document actions/week). |
| **Expected Output** | Welcome email sequence (Day 0, Day 1, Day 3, Day 7). In-app first-run guidance copy (empty states, tooltips, checklist items). Quick-start guide (bilingual PDF/web): workspace setup, first document upload, inviting team members, setting permissions. "Aha moment" path: signup -> create workspace -> upload first document -> share with colleague -> see audit trail. All copy Arabic-first with English parallel. |
| **Dependencies** | Depends on Task 3 (Brand Voice) and Task 2 (AI Fingerprint Removal for final polish). |

---

### 10. Landing Page Copy

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Agent** | `gtm-conversion-optimizer`: conversion funnel optimization, CTA design |
| **Supporting Agent** | `gtm-copywriter`: bilingual persuasive copy |
| **Primary Skill** | `page-cro` (marketingskills): landing page CRO with value proposition clarity, social proof, urgency |
| **Supporting Skill** | `copywriting` (marketingskills): structured persuasive copy frameworks |
| **Input** | `phase3-segmentation/message-house.md` (hero statements, proof points for both Musahm and Vault). `phase2-brand/recommendation.md` (tagline: "حوكمة سعودية. منصة عالمية."). `phase1-discovery/icp.md` (persona pain points). `phase5-launch/launch-checklist.md` Pre-Launch Item 1-2 (product page + beta signup form). Target conversion: beta signup. |
| **Expected Output** | Vault product page copy (bilingual): hero section (tagline + sub-headline + CTA), 3 proof point sections (from message house), objection-handling section, social proof section placeholder, beta signup CTA with urgency. Beta landing page copy: single-purpose page, form fields spec, above-fold value prop, below-fold trust signals. Both pages Arabic-first with English toggle. |
| **Dependencies** | Depends on Task 3 (Brand Voice), Task 4 (ICP Validation). |

---

### 11. Sales Deck Creation

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P0** |
| **Primary Agent** | `gtm-sales-enabler`: sales collateral and pitch materials |
| **Primary Skill** | `sales-enablement` (marketingskills): pitch decks, one-pagers, objection handling docs |
| **Supporting Skill** | `pptx` (agentkits-marketing/document-skills): PowerPoint generation |
| **Input** | `phase3-segmentation/message-house.md` (hero statements, 3 proof points, 3 objection handlers, for BOTH Musahm and Vault). `phase3-segmentation/sector-priority-matrix.md` (sector-specific value props). `phase1-discovery/competitive-analysis.md` + Task 5 output (battle cards). `phase1-discovery/icp.md` (persona-specific slides). `phase2-brand/recommendation.md` (color palette: Dark Green #1B4332, Gold #c3924d, Oasis Blue #2563EB). |
| **Expected Output** | 12-15 slide sales deck (bilingual): Problem slide (WhatsApp/email governance pain), Solution slide (Musahm platform), "Built Saudi" differentiator slide, Feature walkthrough (3-4 key screens), Vault add-on slide, Sector-specific ROI slide (Real Estate, Healthcare variants), Objection handling appendix, Pricing slide (placeholder, needs client input), CTA slide (beta/demo). One-pager PDF (Arabic + English). Objection handling cheat sheet for sales reps. |
| **Dependencies** | Depends on Task 5 (Competitive Analysis) for battle card data, Task 3 (Brand Voice). |

---

### 12. Case Study Template

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Skill** | `case-study-builder` (ai-marketing): 3 output formats: proposal blurb (100 words), social proof (250 words), sales story (800 words). 8 required context fields. |
| **Primary Agent** | `gtm-sales-enabler`: sales collateral packaging |
| **Supporting Agent** | `gtm-copywriter`: bilingual story writing |
| **Input** | Template requires 8 fields per case study: client name, industry, challenge, solution, results (quantified), timeline, quote, before/after. For beta: prepare template with placeholder structure for Wave 1 clients (sectors from `sector-priority-matrix.md`: Real Estate, Healthcare). `phase3-segmentation/message-house.md` (proof points as framing). |
| **Expected Output** | Case study template with 3 format variants: proposal blurb (100 words, for pitch decks), social proof card (250 words, for landing pages), full sales story (800 words, for website/PDF). Each format bilingual. Data collection form for account managers to fill during beta. Timeline: template ready P1, first populated case study by end of Wave 1 (L+4). |
| **Dependencies** | Template depends on Task 3 (Brand Voice). Population depends on beta client results (Wave 1). |

---

### 13. Blog Content for SEO

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Agents** | `blog-blog-researcher` (topic + keyword research) -> `blog-blog-writer` (content creation) -> `blog-blog-reviewer` (quality review) -> `blog-blog-seo` (SEO optimization) |
| **Primary Skill** | `content-strategy` (marketingskills): editorial calendar, content pillars |
| **Supporting Skills** | `ai-seo` (marketingskills): AI-era SEO optimization, `seo-mastery` (agentkits-marketing): comprehensive SEO |
| **Input** | Arabic keyword map from Task 6. `phase1-discovery/icp.md` (reader personas). `phase3-segmentation/sector-priority-matrix.md` (sector-specific content angles). Topic clusters: Saudi corporate governance, document management compliance, Vision 2030 digitization, board meeting best practices. |
| **Expected Output** | 90-day editorial calendar with 12-16 blog posts (3-4/month). Content pillars: (1) Saudi governance education, (2) DMS best practices, (3) sector spotlights (Real Estate, Healthcare), (4) Vision 2030 alignment stories. First 4 blog posts fully written (bilingual): "Why Saudi Companies Need Governance Software in 2026," "SharePoint vs Purpose-Built DMS," "Board Meeting Best Practices for Saudi SMBs," "Document Compliance Under Saudi Corporate Law." Each post: 1200-1800 words, SEO-optimized, internal linking strategy. |
| **Dependencies** | Depends on Task 6 (SEO keyword map), Task 3 (Brand Voice). |
| **Execution Chain** | `blog-blog-researcher` -> `blog-blog-writer` -> `humanizer`/`de-ai-ify` -> `blog-blog-reviewer` -> `blog-blog-seo` |

---

### 14. Pricing Page Copy

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Agent** | `gtm-conversion-optimizer`: pricing page conversion optimization |
| **Primary Skill** | `pricing-strategy` (marketingskills): SaaS pricing, packaging, value metrics, tier structure |
| **Supporting Skill** | `page-cro` (marketingskills): pricing page CRO (value framing, FAQ, objection handling) |
| **Input** | `phase3-segmentation/message-house.md` (Objection 2 for both Musahm and Vault: "too expensive"). `phase1-discovery/competitive-analysis.md` (competitor pricing intelligence). Product feature list from `phase5-launch/vault-user-docs.md`. Target market: Saudi SMBs (50-500 employees). NOTE: Actual pricing figures need client input (flagged in `message-house.md` and `launch-checklist.md`). |
| **Expected Output** | Pricing page wireframe copy: tier names + descriptions (Arabic + English), feature comparison table per tier, recommended tier highlight, FAQ section (5-8 questions, sourced from objection handlers), annual vs monthly framing, "starting from SAR X/month" anchoring (placeholder until client provides numbers), sector-specific value calculators (ROI framing). |
| **Dependencies** | Depends on Task 4 (ICP, willingness to pay by persona), Task 5 (Competitive pricing). Blocked on client input for actual pricing figures. |

---

### 15. FAQ Page Content

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Agent** | `gtm-copywriter`: bilingual FAQ writing |
| **Supporting Agent** | `gtm-conversion-optimizer`: FAQ as conversion tool |
| **Primary Skill** | `copywriting` (marketingskills): clear, objection-handling copy |
| **Supporting Skill** | `schema-markup` (marketingskills): FAQ schema for SEO |
| **Input** | `phase3-segmentation/message-house.md` (6 objection handlers: 3 for Musahm, 3 for Vault). `phase5-launch/vault-user-docs.md` Section 12 (existing Q&A from user docs). `phase1-discovery/icp.md` (persona-specific concerns). `phase1-discovery/competitive-analysis.md` (competitive objection: "why not Diligent/SharePoint"). |
| **Expected Output** | 20-30 FAQ items organized by category: General (what is Musahm/Vault), Security & Compliance, Pricing & Plans, Technical (integrations, data hosting), Getting Started, Vault-Specific. Each FAQ bilingual (Arabic primary). FAQ schema markup for Google rich snippets. Tone: confident, specific, no hedging; matches Concept 3 voice ("Here's the answer" not "It could be argued that"). |
| **Dependencies** | Depends on Task 3 (Brand Voice), Task 14 (Pricing, for pricing FAQs). |

---

### 16. Ad Copy (Google Ads Arabic)

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Agent** | `gtm-attraction-specialist`: paid acquisition strategy |
| **Primary Skill** | `paid-advertising` (agentkits-marketing): Google Ads campaign structure, bidding strategy, keyword targeting |
| **Secondary Skills** | `paid-ads` (marketingskills): ad creative optimization, `ad-creative` (marketingskills): ad copy and creative briefs |
| **Input** | `phase5-launch/launch-checklist.md` Channel 11 (Google Ads spec: Arabic keywords إدارة وثائق, حوكمة الشركات, نظام أرشفة, DMS سعودي; KSA geo-target; landing page = Vault product page). `phase3-segmentation/message-house.md` (value props for ad headlines). Budget estimate: SAR 5,000-15,000/month. |
| **Expected Output** | Google Ads campaign structure: Search campaign (BOFU, exact match on Arabic governance/DMS keywords), Display campaign (retargeting Musahm site visitors). Per campaign: 3-5 ad groups, 3 responsive search ads per group (Arabic), 15 headline variations (30 chars each, Arabic), 4 description variations (90 chars each, Arabic), sitelink extensions (Arabic), callout extensions. Bidding strategy recommendation (start with Manual CPC, transition to Target CPA after 50 conversions). Negative keyword list (Arabic + English irrelevant terms). Landing page recommendations for quality score. |
| **Dependencies** | Depends on Task 6 (SEO keyword map for keyword selection), Task 10 (Landing Page for destination URLs). |

---

### 17. Social Media Content Calendar

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Skill** | `social-content` (marketingskills): multi-platform social content creation and scheduling |
| **Supporting Skill** | `linkedin-authority-builder` (ai-marketing): LinkedIn-specific strategy (4-week calendar) |
| **Primary Agent** | `gtm-copywriter`: bilingual social copy |
| **Supporting Agent** | `gtm-attraction-specialist`: paid social amplification |
| **Input** | `phase4-content/social-posts.md` (existing LinkedIn + Twitter posts as base). `phase5-launch/launch-checklist.md` Channels 4-5 (LinkedIn and Twitter/X posting schedule: L, L+1, L+2). `phase3-segmentation/message-house.md` (proof points for content). Content from Task 8 (LinkedIn strategy pillars). |
| **Expected Output** | 8-week content calendar across LinkedIn + Twitter/X: Week -1 (teaser content), Week 0 (launch), Weeks 1-6 (ongoing). Per platform: 3-5 posts/week LinkedIn, 5-7 tweets/week Twitter. Content types per week: 2 frameworks, 1 story, 1 proof/case study, 1 engagement post. All posts bilingual (Arabic version + English version). Hashtag strategy (Arabic + English). Optimal posting times for KSA audience. Engagement playbook (comment strategy, DM response templates). |
| **Dependencies** | Depends on Task 3 (Brand Voice), Task 8 (LinkedIn Strategy for pillar alignment). |

---

### 18. Partner Enablement Materials

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P1** |
| **Primary Agent** | `gtm-sales-enabler`: partner sales collateral |
| **Primary Skill** | `sales-enablement` (marketingskills): partner-facing sales materials |
| **Supporting Skill** | `docx` (agentkits-marketing/document-skills): Word document generation |
| **Input** | `phase5-launch/launch-checklist.md` Channel 12 (Partner/Reseller Outreach: partner sales sheet, demo access, commission structure, partner webinar). `phase3-segmentation/message-house.md` (talking points). Task 5 output (competitive battle cards). Task 11 output (sales deck, partner-adapted version). |
| **Expected Output** | Partner sales sheet (1-page, bilingual): what is Vault, who it's for, key differentiators, partner commission structure (placeholder until client confirms). Partner pitch deck (adapted from Task 11 sales deck, with partner-specific slides). Partner FAQ document (how to demo, common objections, escalation path). Co-branded email template for partners to send to their clients. Partner webinar slide deck (30-min overview + Q&A structure). |
| **Dependencies** | Depends on Task 11 (Sales Deck as base), Task 5 (Battle Cards). |

---

### 19. Post-Beta Retention Nurture Sequence

| Dimension | Detail |
|-----------|--------|
| **Priority** | **P2** |
| **Primary Agent** | `gtm-upsell-maximizer`: expansion revenue and retention strategies |
| **Supporting Agent** | `gtm-email-wizard`: lifecycle email sequences |
| **Primary Skill** | `email-sequence` (marketingskills): lifecycle drip campaigns, nurture sequences |
| **Supporting Skills** | `churn-prevention` (marketingskills): cancel flows, save offers, dunning. `onboarding-cro` (marketingskills): ongoing activation optimization. |
| **Input** | `phase5-launch/beta-kpi-plan.md` (10 KPIs, especially: Active Use = 3+ doc actions/week, NPS target = 50+, Churn target < 10% monthly). `phase3-segmentation/beta-rollout-plan.md` (wave transition triggers, success gates). PostHog event data (instrumentation from `beta-kpi-plan.md`). Usage patterns from beta users (low engagement signals, feature adoption gaps). |
| **Expected Output** | **Retention email sequence** (triggered by usage signals): Low-engagement nudge (3 days inactive), Feature discovery emails (week 2, 4, 6; introduce workflows, AI search, external sharing), Success milestone emails (10th document, first shared doc, first workflow approval), NPS survey email (Day 14, Day 30). **Churn prevention flow**: At-risk user identification (< 1 action/week after Day 7), intervention sequence (personal email from CS, offer training session, escalate to account manager). **Upsell path**: Vault add-on pitch for Musahm-only users, plan upgrade triggers (storage limit, user count). **Win-back sequence**: For churned beta users (Day 7, Day 30, Day 90 post-churn). |
| **Dependencies** | Depends on Task 9 (Beta Onboarding) being live. Requires PostHog instrumentation from `beta-kpi-plan.md`. Fully realized only after Wave 1 data (L+4 minimum). |

---

## Execution Dependency Graph

```
FOUNDATIONAL (no dependencies, start immediately):
  Task 3: Brand Voice Alignment ────────────────────────────┐
  Task 4: ICP Validation ───────────────────────────────────┤
  Task 5: Competitive Analysis ─────────────────────────────┤
                                                            │
FIRST WAVE (depends on foundational):                       │
  Task 1: Content Rewriting ← Task 3                        │
  Task 7: Cold Email/Outreach ← Task 3, Task 4             │
  Task 10: Landing Page Copy ← Task 3, Task 4              │
  Task 11: Sales Deck ← Task 3, Task 5                     │
  Task 9: Beta Onboarding Copy ← Task 3                    │
                                                            │
SECOND WAVE (depends on first wave):                        │
  Task 2: AI Fingerprint Removal ← Task 1                  │
  Task 6: SEO Optimization ← Task 5                        │
  Task 12: Case Study Template ← Task 3                    │
  Task 14: Pricing Page ← Task 4, Task 5                   │
  Task 15: FAQ Content ← Task 3, Task 14                   │
                                                            │
THIRD WAVE (launch week):                                   │
  Task 8: LinkedIn Strategy ← Task 3                        │
  Task 13: Blog Content ← Task 3, Task 6                   │
  Task 16: Ad Copy (Google Ads) ← Task 6, Task 10          │
  Task 17: Social Calendar ← Task 3, Task 8                │
  Task 18: Partner Enablement ← Task 5, Task 11            │
                                                            │
POST-LAUNCH:                                                │
  Task 19: Retention Nurture ← Task 9, PostHog data        │
```

---

## Agent Registry (Quick Reference)

| Agent | Primary GTM Tasks |
|-------|-------------------|
| `gtm-brand-voice-guardian` | Task 2, 3: voice consistency enforcement |
| `gtm-copywriter` | Task 1, 9, 15, 17: bilingual copy production |
| `gtm-persona-builder` | Task 4: persona validation and refinement |
| `gtm-researcher` | Task 4, 5: market research and competitive intel |
| `gtm-email-wizard` | Task 7, 19: email sequences and outreach |
| `gtm-conversion-optimizer` | Task 9, 10, 14, 15: conversion optimization |
| `gtm-attraction-specialist` | Task 8, 16, 17: paid/organic acquisition |
| `gtm-sales-enabler` | Task 11, 12, 18: sales collateral |
| `gtm-seo-specialist` | Task 6, 13: SEO strategy |
| `gtm-upsell-maximizer` | Task 19: retention and expansion |
| `blog-blog-researcher` | Task 13: topic/keyword research |
| `blog-blog-writer` | Task 13: blog content writing |
| `blog-blog-reviewer` | Task 13: quality review |
| `blog-blog-seo` | Task 6, 13: blog SEO optimization |

---

## Skill Registry (Quick Reference)

| Skill | Library | Primary GTM Tasks |
|-------|---------|-------------------|
| `humanizer` | standalone | Task 2: AI pattern removal (29 categories) |
| `de-ai-ify` | ai-marketing | Task 2: AI scoring + 47-pattern cleanup |
| `voice-extractor` | ai-marketing | Task 3: voice DNA extraction |
| `cold-outreach-sequence` | ai-marketing | Task 7: personalized outreach sequences |
| `cold-email` | marketingskills | Task 7: B2B cold email frameworks |
| `linkedin-authority-builder` | ai-marketing | Task 8, 17: LinkedIn content system |
| `case-study-builder` | ai-marketing | Task 12: 3-format case studies |
| `paid-advertising` | agentkits-marketing | Task 16: Google/Meta/LinkedIn Ads |
| `copywriting` | marketingskills | Task 1, 10, 15: structured copy |
| `copy-editing` | marketingskills | Task 1: line-level editing |
| `page-cro` | marketingskills | Task 10, 14: landing/pricing page CRO |
| `pricing-strategy` | marketingskills | Task 14: SaaS pricing frameworks |
| `sales-enablement` | marketingskills | Task 11, 18: pitch decks, one-pagers |
| `email-sequence` | marketingskills | Task 19: lifecycle email flows |
| `onboarding-cro` | marketingskills | Task 9, 19: activation optimization |
| `churn-prevention` | marketingskills | Task 19: retention flows |
| `social-content` | marketingskills | Task 17: social media content |
| `content-strategy` | marketingskills | Task 13: editorial calendar |
| `customer-research` | marketingskills | Task 4: ICP research |
| `competitor-alternatives` | marketingskills | Task 5: battle cards, comparison pages |
| `seo-mastery` | agentkits-marketing | Task 6: comprehensive SEO |
| `ai-seo` | marketingskills | Task 6, 13: AI-era SEO |
| `schema-markup` | marketingskills | Task 6, 15: structured data |
| `brand-building` | agentkits-marketing | Task 3: brand positioning |
| `ad-creative` | marketingskills | Task 16: ad copy/creative briefs |
| `paid-ads` | marketingskills | Task 16: ad performance optimization |

---

## Blocked Items (Require Client Input)

| Item | Blocking Tasks | Details |
|------|----------------|---------|
| **Actual pricing figures** | Task 14 (Pricing Page), Task 15 (FAQ) | Flagged in `message-house.md` and `launch-checklist.md`. Need "starting from SAR X/month." |
| **Data hosting location** | Task 3 (Brand Voice, "Built Saudi" claim), Task 15 (FAQ) | Flagged in `recommendation.md` Modification 2. If KSA-hosted, this becomes a powerful marketing claim. |
| **Writing samples from Musahm team** | Task 3 (Voice Extraction) | Need 3+ authentic samples (founder emails, internal comms) for voice calibration. |
| **Partner commission structure** | Task 18 (Partner Enablement) | Referenced in `launch-checklist.md` Channel 12. |
| **Beta client data** | Task 4 (ICP Validation), Task 12 (Case Study) | Wave 1 results needed for populated case studies and refined personas. |

---

## Execution Priority Summary

| Priority | Tasks | Count |
|----------|-------|-------|
| **P0 (Before Launch)** | 3 (Brand Voice), 4 (ICP), 5 (Competitive), 1 (Content Rewrite), 2 (AI Removal), 7 (Cold Outreach), 9 (Beta Onboarding), 10 (Landing Page), 11 (Sales Deck) | 9 tasks |
| **P1 (Launch Week)** | 6 (SEO), 8 (LinkedIn), 12 (Case Study Template), 13 (Blog), 14 (Pricing Page), 15 (FAQ), 16 (Ad Copy), 17 (Social Calendar), 18 (Partner Enablement) | 9 tasks |
| **P2 (Post-Launch)** | 19 (Retention Nurture) | 1 task |

**Recommended start order for P0:** Task 3 + Task 4 + Task 5 in parallel (foundational, no dependencies) -> Task 1, 7, 9, 10, 11 (first wave) -> Task 2 (final polish).
