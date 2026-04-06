# How This GTM Was Built: Process and Methodology

> **Author:** Claude (AI co-builder), working with Ahmed Taha
> **Duration:** Multiple sessions, early April 2026
> **Scope:** 68 markdown files, 15 polished deliverables, 7 milestones, 11 audit fixes
> **Process:** 6 phases -- from codebase reading and competitor analysis through content generation, multi-layer auditing, and CEO-ready certification
> **Product:** Musahm (corporate governance SaaS) + Musahm Vault (document management system)
> **Market:** Saudi Arabia B2B, beta launch with 30 seats

---

## Phase 0: Genesis -- How the 50 Files Were Created

The GTM package did not exist at the start. It was built from scratch across multiple sessions, starting from nothing but the Musahm Vault codebase and the musahm.com website. Here is how.

### Step 1: Reading the Codebase

The first thing that happened was reading the actual source code of Musahm Vault. The .NET 10 backend (`Backend/Vault/`), the React 18 frontend (`Frontend/apps/web/`), the entity models, the controllers, the services -- all of it. This was not a surface skim. Individual files like `ConstRoles.cs`, `ConstPermissions.cs`, `ConstDefaultWorkspaces.cs`, `SearchService.cs`, `AuditLog.cs`, `InvitationService.cs`, and dozens more were read to understand what the product actually does versus what marketing might claim it does.

This is where the product truth was established: what features exist, what is stub code, what the role hierarchy looks like, how authentication works, how file storage works, how workflows operate. Every line of marketing written later traces back to this codebase reading.

### Step 2: Visiting Competitor Websites

To build the competitive analysis, the actual competitor websites were fetched and analyzed:

- **musahm.com** -- Musahm's own live website was read to understand current public positioning, the tagline ("حلول ذكية وآمنة لتطوير وحوكمة الشركات"), existing app store presence, and what was missing (no Vault mention, no pricing page, no Vision 2030 alignment).
- **majles.tech** -- The primary governance competitor. Their feature set, positioning ("injects energy and engagement into governance"), bilingual approach, and target market were analyzed from their public pages. This revealed they had real-time collaboration and task tracking that Musahm lacked -- but no shareholder registry, no DMS, and no LLC support.
- **Ebana DMS** -- The document management competitor. Their enterprise positioning, English-dominant UX, and IT consultancy business model were documented. This revealed they were a broad IT firm that happened to offer DMS, not a governance-specialized platform.
- **Diligent** -- The international enterprise competitor was researched for positioning context. Their high-end pricing and Fortune 500 focus established the upper bound of the market.

Each competitor's feature set was documented into a Feature Comparison Matrix (40+ features), with honest "Not confirmed" markings where a feature was not visibly advertised rather than assumed to not exist. A text-based positioning map was created plotting all competitors on two axes: Arabic-Heritage/Western-Tech and SMB/Enterprise.

From this analysis, Musahm's 5 exploitable advantages were identified:
1. Shareholder Registry (category-exclusive, nobody else has it)
2. Full governance stack (Musahm + Vault together)
3. Listed + Unlisted + LLC coverage
4. SMS shareholder communications
5. Arabic-native UX with institutional trust positioning

### Step 3: Market and ICP Research

An Ideal Customer Profile was constructed from multiple inputs: the Musahm website's client references (Al-Ufuq Educational, Miral Medical, Amwaj), Saudi market context research (Vision 2030 governance mandates, CMA regulations, new Companies Law), and product capability analysis.

The ICP was explicit about its own limitations: "This ICP is constructed from product analysis and market context. It has NOT been validated against primary data (customer interviews, sales pipeline analysis, win/loss records)." Every dimension was marked with its data source -- "Inferred," "Estimate," or "Public policy knowledge."

Five priority sectors were ranked: Real Estate (Vision 2030 construction boom), Medical/Healthcare (privatization), Education (known client exists), Family Holdings (generational wealth transfer), and Financial Services. Each sector mapping included: why now, governance pain, document pain, and Musahm product fit.

### Step 4: Brand Concept Exploration

Three distinct brand concepts were developed, each with a full exploration document:

1. **Concept 1: Trust-Heritage** -- Arabic-first, institutional, serif typography, formal tone. Strongest cultural fit but weakest differentiation (any competitor can adopt a formal Arabic tone).
2. **Concept 2: Modern-Digital** -- Clean SaaS, English-forward, startup energy. Weakest overall because Majles.tech already owns this lane and it conflicts with conservative KSA B2B norms.
3. **Concept 3: KSA-Native-Tech** -- "Saudi-built, for Saudi regulations, by a Saudi team." Strongest differentiation because no foreign competitor can credibly make this claim.

A weighted scoring framework evaluated all three across 6 criteria (Competitive Differentiation x3, ICP Resonance x2, Defensibility x2, Cultural Fit x1.5, Vault Extendability x1.5, Execution Simplicity x1). Concept 3 won at 50.5 points versus 40.5 and 26.5.

The recommendation included required modifications: drop the literal Saudi flag colors (#006C35), keep existing brand palette (#1B4332 dark green + #c3924d gold), add a modern accent blue (#2563EB), and avoid "government portal" aesthetics.

### Step 5: Cloning and Mining the GTM Agents Repository

A critical tactical decision was cloning the [gtm-agents](https://github.com/gtmagents/gtm-agents) repository -- a marketplace of 67 plugins, 244 skills, ~200 agents, and ~200 commands, all structured as Claude Code plugin templates for GTM teams.

The entire repository was read -- not skimmed. A 7,230-line extraction document (`_MUSAHM-GTM-REPO-FINDINGS.md`) was produced. Multiple batch analysis passes were run:
- Batch 1: Brand strategy + competitive intelligence + product marketing plugins (deep analysis)
- Batch 2a: Copywriting frameworks (cold email personalization, voice guidelines)
- Batch 2b: Sales and enterprise plugins (MEDDIC, value stories, CXO briefings)

From this mining, 10 structured frameworks were extracted and adapted for Musahm (see "The 10 Frameworks Used" section below). The 15 most relevant plugins were ranked into 3 tiers of applicability. The remaining 52 plugins were evaluated and documented as either "build into GTM process later" or "skip -- wrong vertical."

This was the arsenal. Instead of inventing frameworks from scratch, battle-tested methodology templates were extracted from a repository built by GTM practitioners and adapted to a specific KSA B2B governance product.

### Step 6: Building the 5-Phase GTM Structure

With the codebase understood, competitors analyzed, ICP defined, brand concept selected, and frameworks extracted, the actual content generation began. The work was organized into 5 phase folders:

- **phase1-discovery/** (4 files) -- ICP, competitive analysis, battle cards, brand audit
- **phase2-brand/** (4 files) -- 3 brand concepts + recommendation
- **phase3-segmentation/** (3 files) -- Beta rollout plan, message house, sector priority matrix
- **phase4-content/** (21 files) -- All customer-facing content: email, social, SMS, video, ads, blog, cold outreach, LinkedIn, FAQ, landing page, sales deck, onboarding, partner kit, WhatsApp library, press release, case study template, quick-start guide, nurture sequence, SEO keywords, social calendar, thank-you page
- **phase5-launch/** (4 files) -- Beta KPI plan, launch checklist, user docs (built from actual source code), win/loss template

Each file was written bilingual (Arabic primary, English secondary) and structured to be actionable -- copy-paste ready for the destination platform (Brevo for emails, Google Ads console for ads, Postiz for social, etc.).

### Step 7: Tool Stack Research

80+ open-source and free-tier tools were evaluated across 15 categories (email sending, forms, scheduling, link tracking, social scheduling, heatmaps, design, video, analytics, CRM, etc.). Each tool was scored and ranked into tiers:

- **Tier S** (11 tools): Deploy immediately -- Microsoft Clarity, Brevo, Tally, MJML, Dub.co, Cal.com, Gamma, Penpot, Satori, Listmonk, Chatwoot
- **Tier A** (20+ tools): Worth setup effort -- Remotion, React Email, changedetection.io, Postiz, GrowthBook, Formbricks, etc.
- **Tier B** (15 tools): Specific-need -- Buffer, Plausible, Upptime, Outline, etc.
- **Tier C+**: Skip or postpone

Total estimated cost: ~$45/month (most tools are free tier or self-hosted on a single 4GB VPS).

Three MCP servers were recommended for immediate installation: Playwright (browser automation for competitor screenshots), Brave Search (web research), and Fetch (HTTP requests with AI context).

---

## What Existed After Phase 0

By the end of the genesis phase, approximately 50 files existed across the 5 phase folders, plus the cloned agents repository, the tool stack assessment, and an initial execution plan. This was the raw material.

The challenge: these files were written before the brand concept was formally finalized, contained false product claims that had not yet been caught, had systemic AI writing patterns (263 em dashes, "Not X, but Y" in every file, rule-of-three everywhere), and lacked the sales enablement materials needed for an actual launch. The decision stage of the buyer's funnel was completely empty -- no sales deck, no pricing, no case study, no landing page copy.

What followed was the audit, fix, and enhancement pipeline described in the rest of this document.

---

## Phase 1: Product Truth Extraction (Source Code as Ground Truth)

The product truth established in Phase 0's codebase reading became the single most important artifact in the entire process. Every piece of content was checked against it. Every fix traced back to a violation of it.

Key product truths distilled:

- **Keyword search works.** The backend has full-text search across document fields, metadata, and content.
- **Semantic search is a stub.** The endpoint exists but returns placeholder results. Not shipped.
- **Ask Vault (RAG) is a stub.** Same situation -- the UI component exists, the AI pipeline behind it does not.
- **No native mobile apps.** The frontend is a responsive React SPA. No iOS or Android apps.
- **OTP is via email, not SMS.** The authentication flow sends one-time passwords through email.
- **No IP address logging.** The audit trail records user, action, timestamp, and entity -- but not IP addresses.
- **5 role levels:** Viewer (1), Commenter (2), Editor (3), Organizer (4), Admin (5). Arabic names: عارض, معلّق, محرر, منظّم, مدير.
- **Beta capacity:** 30 seats.

---

## Phase 2: Multi-Layer Auditing

The GTM corpus went through 4 distinct audits, each catching things the previous one missed.

### Audit 1: PMM Audit (Score: 62/100)

The first pass. Found 10 CRITICAL and 16 MODERATE issues. Identified the big structural problems: brand voice was absent from all content (score 3.8/10 across 6 files), 263 em dashes flagged AI writing, zero social proof despite 3 known clients, no urgency mechanisms, and the entire decision stage of the funnel was empty (no sales deck, no pricing, no case study, no landing page).

### Audit 2: CEO Audit

An executive-level readiness check. Evaluated whether a CEO could hand this corpus to investors, partners, or a board. Found additional gaps in strategic consistency and professional presentation.

### Audit 3: MEGA-AUDIT (Score: 74/100)

Six parallel audit agents, each with a different lens:

1. **Product Truth Agent** -- compared every feature claim against the codebase
2. **Consistency Agent** -- cross-referenced numbers, names, and terminology across all files
3. **Customer Journey Agent** -- mapped the buyer's path and found gaps at each stage
4. **Arabic Quality Agent** -- checked MSA grammar, RTL rendering, bilingual alignment
5. **Content Quality Agent** -- scored writing quality, persuasion, and readability
6. **Positioning Agent** -- evaluated differentiation strength against competitors

This audit identified 7 showstoppers that would have destroyed credibility if published:

- S1: Semantic search described as working (it is a stub)
- S2: IP address logging claimed in audit trails (does not exist)
- S3: OTP described as "via phone" (it is via email)
- S4: "First platform" claims that cannot be proven
- S5: Mobile app claims (no native apps exist)
- S6: Conflicting seat counts (some files said 50, others 30)
- S7: "95% of Saudi companies" statistic used without a source

### Audit 4: Final Two-Pass Audit

After all milestones were complete, a final sweep across all 66 files. Pass 1 focused on phase4-content/ and deliverables/. Pass 2 stress-tested every Pass 1 claim against ALL 66 files -- and found 4 additional issues that Pass 1 missed because it did not check phase5-launch/ or root-level files.

**Key lesson:** A single-pass audit will always miss things. The second pass exists specifically to catch what the first one assumed was clean.

---

## Phase 3: Establishing Ground Rules

Before any content work began, strict rules were locked in. These rules never changed across the entire engagement.

### Writing Rules

- **Zero em dashes.** Not "fewer em dashes" -- zero. The corpus started with 263.
- **Zero AI vocabulary.** Words like "revolutionary," "seamlessly," "leverage," "tapestry," "landscape" were banned.
- **Western numerals only.** 0-9, not Arabic-Indic numerals.
- **Arabic-first MSA.** All bilingual content is Arabic primary, English secondary. Modern Standard Arabic, not Egyptian or Gulf dialect.
- **"Built FOR Saudi governance"** -- never "Built IN Saudi Arabia." The positioning is about purpose, not geography.

### Product Claim Rules

- Never claim a feature works unless the backend code proves it does.
- Semantic search and Ask Vault are always qualified with "coming soon" / "قيد التطوير".
- Never use "first" or "only" in customer-facing content unless it can be legally defended.
- Vision 2030 referenced through specific governance mandates, never as a hashtag or vague alignment claim.

### Brand Rules

- Tagline "حوكمة سعودية. منصة عالمية." appears in every major content piece.
- Concept 3 (KSA-Native-Tech) voice applied throughout.
- Brand palette: #1B4332 (green), #c3924d (gold), #2563EB (blue).
- Three known clients (Al-Ufuq Educational, Miral Medical, Amwaj) used as social proof where appropriate.

---

## Phase 4: The 7-Milestone Execution

### Milestone 0: Showstopper Fixes

All 7 showstoppers fixed across 20+ files. This was pure find-and-replace work: "semantic search" got "coming soon" qualifiers, IP address references were removed, OTP channel was corrected, "first/only" claims were softened, mobile app claims became "mobile-responsive web app," seat counts were standardized to 30, and the unsourced 95% statistic was replaced with hedged language.

### Milestone 1: Foundation

Three core documents built from scratch:

- **Positioning Statement** using the FOR/WHO/OUR/UNLIKE/PROOF canvas. This became the single source of truth that every other piece of content traces back to.
- **Brand Voice Guide** with a Voice Matrix (4 attributes, each with "We Are" and "We Are NOT"), 4-tier confidence calibration, 5 signature constructions, and 7 anti-patterns.
- **Battle Cards** restructured into a 7-section framework with Trap-Setting Questions for each competitor (Majles, Ebana, Diligent, WhatsApp/Excel).

### Milestone 2: Content Rebuild

All 6 original content files rewritten with the new brand voice applied. Shareholder Registry elevated to lead differentiator. Urgency mechanisms added (30 seats, closing soon). Named clients added as social proof. CTA standardized to "فعّل Vault" across all files. Arabic/English SMS alignment fixed. Plus new sales enablement documents: MEDDIC checklist, CXO Value Story, Demo Script, Account Tiering Matrix.

### Milestone 3: AI Pattern Cleanup

A humanizer pass across all 21 content files. Scored each file on a 10-point scale. Targets: em dashes at 0, "Not X, but Y" under 3, Rule of Three under 2, all files at 8+/10. Results: average score 8.9/10, zero em dashes, "Not X but Y" reduced from 11 to 1, Rule of Three from 6 to 0.

One important nuance: Arabic "ليس...بل" (the equivalent of "Not X, but Y") was intentionally retained. In English, this pattern screams AI writing. In Arabic, it is a standard MSA rhetorical structure used in newspapers, academic writing, and everyday formal speech. Treating them the same would damage the Arabic quality.

### Milestone 4: New Content (Decision Stage)

Filled the empty funnel stages the first PMM audit identified. Landing page copy with narrative arc and CRO elements. Sales deck mapped to Value Story Framework. Beta onboarding sequence with 5 activation milestones. Case study template with CHIC framework. 28-item FAQ with Schema.org markup. Lead nurture sequence scored against 4x25 rubric. Thank-you page. Win/loss analysis template.

### Milestone 5: Distribution Content

Enhanced existing distribution files with framework headers:

- Cold outreach got a Cold Email Scoring Rubric (4 dimensions x 25 points each) and a 10-Asset Personalization System.
- LinkedIn strategy got an Authority Builder framework (5-Phase Credibility Ladder).
- Blog posts got SCAR Arc mapping (Situation/Complication/Action/Resolution per article).
- Social posts expanded from launch-day content to a full 8-week calendar: 48 posts (24 LinkedIn, 24 Twitter/X), organized into a 4-phase narrative arc.

### Milestone 6: Sales and Partner Enablement

Three new deliverables created from scratch:

- **Pricing Tier Structure** using a Packaging Framework (3 tiers with Segmentation/Value Pillars/Metric/Fences/Add-ons). SAR amounts left as placeholders pending client decisions.
- **Crisis Communication Playbook** with P1-P4 severity matrix, escalation trees, 4 bilingual communication templates, and post-incident reporting.
- **Brand Governance Checklist** with a 14-item pre-publish gate organized into 4 sections (Accuracy, Voice, Regulatory, Technical). Built from the patterns that failed during the M0-M4 audits.

---

## Phase 5: The Final Audit (Two-Pass Method)

### Pass 1: Surface Scan (phase4-content/ and deliverables/)

Checked 8 categories: product truth, exclusivity claims, banned hashtags, unsourced statistics, AI writing patterns, leftover audit artifacts, cross-file consistency, and Google Ads technical compliance.

Found 7 issues:

1. Banned hashtags (#رؤية_2030, #Vision2030) in social calendar -- removed
2. "الوحيدة" / "the only" exclusivity claims in social calendar -- 4 removed
3. Vision 2030 in Google Ads copy -- 2 instances removed
4. "الوحيدة" in Google Ads -- 6 instances removed
5. "The Only Platform" in blog post headers -- changed to "A Saudi Platform"
6. "(الوحيد في السوق السعودي)" in sales deck -- removed

### Pass 2: Deep Verification (all 66 files)

Re-ran every check from Pass 1 across the complete corpus. Found 4 issues Pass 1 missed:

1. **vault-user-docs.md** (in phase5-launch/, not phase4-content/) claimed "IP address of the request" in its audit trail description. This was the exact false claim from Showstopper S2 -- it had been fixed in marketing content but survived in the user documentation. Changed to "Timestamp of the action."

2. **google-ads.md** had a description at 97 characters (Google limit is 90) that also used "الغالبية العظمى" (vast majority) -- an unsubstantiated claim. Rewritten shorter and factual.

3. **"بحث ذكي" / "AI-powered search"** found in 4 files (7 instances total). Pass 1 searched for "semantic search" but missed the Arabic colloquial equivalent ("smart search") and the vaguer "AI-powered search" / "AI search." All replaced with "keyword search" or "بحث بالكلمات المفتاحية."

4. **"AI-Powered Document Search"** headline in Google Ads. Since keyword search works but AI search does not, changed to "AI Field Extraction Built In" (field extraction actually works).

### Why Two Passes Matter

Pass 1 only checked the folders where customer-facing content lives. Pass 2 proved that violations hide in unexpected places -- user documentation, structured snippets, character-counted ad descriptions. The methodology is: assume your first pass missed something, then prove yourself wrong.

---

## The 10 Frameworks Used

Each milestone applied specific structured frameworks, most extracted from a GTM agents repository (67 plugins, 244 skills) that was analyzed and synthesized into the project:

| #   | Framework                                                | Applied In                |
| --- | -------------------------------------------------------- | ------------------------- |
| 1   | Positioning Canvas (FOR/WHO/OUR/UNLIKE/PROOF)            | positioning-statement.md  |
| 2   | Brand Voice Matrix (4 attributes x We Are/We Are NOT)    | voice-guide.md            |
| 3   | Battlecard 7-Section + Trap-Setting Questions            | battle-cards.md           |
| 4   | Account Tiering Matrix (4-factor, 100-point scoring)     | account-tiering-matrix.md |
| 5   | CXO Value Story (5-element arc)                          | cxo-value-story.md        |
| 6   | MEDDIC Qualification (adapted for KSA governance)        | meddic-checklist.md       |
| 7   | Cold Email Scoring Rubric (4 x 25 points)                | cold-outreach.md          |
| 8   | Campaign 6-Step (Google Ads structure)                   | google-ads.md             |
| 9   | Crisis P1-P4 Severity Matrix                             | crisis-playbook.md        |
| 10  | Packaging Framework (segmentation/pillars/metric/fences) | pricing-tiers.md          |

---

## Quality Controls That Caught Real Problems

### 1. Source Code as the Single Source of Truth

Every feature claim was traceable to backend code. This caught:

- Semantic search stub being described as working
- IP address logging that does not exist in the audit trail
- SMS OTP that is actually email OTP
- Mobile apps that are actually a responsive web app

### 2. Cross-File Grep Sweeps

Every fix was verified by grepping the entire corpus, not just the file that was edited. This caught:

- "بحث ذكي" surviving in whatsapp-library.md after it was fixed in google-ads.md
- IP address surviving in vault-user-docs.md after being fixed everywhere else
- Inconsistent seat counts across files

### 3. Character-Level Technical Compliance

Google Ads has strict limits (30 chars for headlines, 90 for descriptions). One description was 97 characters. Without checking character counts programmatically, this would have been rejected by Google's system at paste time.

### 4. Cultural and Linguistic Precision

- Arabic "ليس...بل" retained as natural MSA despite being flagged as an AI pattern in English
- "Built FOR Saudi governance" (purpose-driven) versus "Built IN Saudi Arabia" (geography-driven)
- Vision 2030 referenced through specific CMA governance mandates, never as decorative hashtag
- Tagline kept in Arabic-first order: "حوكمة سعودية. منصة عالمية."

### 5. The Brand Governance Checklist

Built from real failure patterns observed during M0 through M4. Every item on the 14-point checklist corresponds to an actual mistake that was found and fixed during the process. It is a living artifact that prevents regression.

---

## What Was NOT Done (Honest Scope)

- No graphic design or visual assets produced. All output is structured markdown.
- No actual deployment of emails, ads, or landing pages.
- No pricing in SAR -- the structure exists but actual amounts require client decisions.
- No A/B test execution -- variants were written but need live traffic.
- No video production -- scripts with scene direction were written.
- No CRM setup, domain authentication, or WhatsApp Business API registration.
- No Arabic dialectal customization beyond MSA.
- No custom MCP server development (listed as future automation).

---

## Metrics

| Metric                            | Value                                |
| --------------------------------- | ------------------------------------ |
| Total files in corpus             | 68                                   |
| Files checked in final audit      | 66 (2 excluded: non-content configs) |
| Polished deliverables produced    | 14                                   |
| Milestones completed              | 7 (M0-M6)                            |
| Showstoppers resolved             | 7                                    |
| Audit fixes applied               | 11 (7 Pass 1 + 4 Pass 2)             |
| Em dashes remaining               | 0 (started at 263)                   |
| AI vocabulary instances remaining | 0                                    |
| False product claims remaining    | 0                                    |
| Humanizer score average           | 8.9/10                               |
| Content files at or above 8/10    | 21/21                                |
| Frameworks applied                | 10                                   |
| Client decisions still blocking   | 10 (D1-D10)                          |

---

## Key Decisions and Why

### Decision: Two-pass audit instead of one

**Why:** Pass 1 checked the obvious folders (customer-facing content + deliverables). Pass 2 proved that 4 violations hid in non-obvious places (user docs, ad structured snippets). One pass gives false confidence.

### Decision: Retain Arabic "ليس...بل" while removing English "Not X, but Y"

**Why:** The same linguistic structure carries different signals in different languages. In English, "Not X, but Y" is a documented AI writing pattern. In Arabic, it is standard MSA rhetoric -- removing it would make the Arabic read unnaturally.

### Decision: "Built FOR" instead of "Built IN"

**Why:** "Built IN Saudi Arabia" is a geography claim that could be challenged (the dev team, the hosting, various stack components are not exclusively Saudi). "Built FOR Saudi governance" is a purpose claim -- the product is designed around Saudi regulatory requirements. This is provable and defensible.

### Decision: Keep "the only" in strategic docs, remove from customer-facing content

**Why:** Strategic docs (positioning statement, battle cards, message house) are internal tools where controlled claims with sourcing are appropriate. Customer-facing content (ads, social, blog) reaches audiences who cannot verify the claim and where regulatory bodies could challenge it.

### Decision: Block pricing with placeholders instead of inventing numbers

**Why:** Pricing is a business decision with revenue, margin, and competitive implications. Making up SAR amounts would create a false anchor that the client would then have to argue against. Better to deliver the structure (tiers, features, comparisons, objection handling) and let the client fill the numbers.

---

## The Deliverables (Final Inventory)

| #   | File                          | Milestone | Purpose                                  |
| --- | ----------------------------- | --------- | ---------------------------------------- |
| 1   | positioning-statement.md      | M1        | Single source of truth for all messaging |
| 2   | voice-guide.md                | M1        | How Musahm sounds (and does not sound)   |
| 3   | battle-cards.md               | M1        | Competitive selling playbook             |
| 4   | meddic-checklist.md           | M2        | Deal qualification framework             |
| 5   | cxo-value-story.md            | M2        | Executive meeting narrative              |
| 6   | demo-script.md                | M2        | 25-minute product demonstration          |
| 7   | account-tiering-matrix.md     | M2        | Prospect prioritization scoring          |
| 8   | humanizer-score-report.md     | M3        | AI detection audit results               |
| 9   | thank-you-page.md             | M4        | Post-signup confirmation flow            |
| 10  | win-loss-template.md          | M4        | Deal outcome analysis model              |
| 11  | pricing-tiers.md              | M6        | Packaging and tier structure             |
| 12  | crisis-playbook.md            | M6        | Incident response protocol               |
| 13  | brand-governance-checklist.md | M6        | Pre-publish quality gate                 |
| 14  | final-audit-report.md         | Final     | Full corpus audit with fix log           |
| 15  | process-methodology.md        | Final     | This document                            |

Plus 20+ content files enhanced with framework headers across phase4-content/ and phase5-launch/.

---

## If You Need to Continue This Work

1. Read `deliverables/positioning-statement.md` first. Everything traces to it.
2. Read `deliverables/voice-guide.md` before writing anything customer-facing.
3. Run the 14-item gate in `deliverables/brand-governance-checklist.md` before publishing.
4. Check `deliverables/final-audit-report.md` for the "Known Acceptable Items" table -- those are not bugs.
5. Resolve the 10 blocked items (D1-D10) before launch. All are client decisions, not content decisions.
6. The `gtm/CLAUDE.md` file contains the quick-reference context (product truth, file map, rules) for any AI system continuing this work.
