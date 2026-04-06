# GTM Agents Repo: Synthesis for Musahm

> Source: [github.com/gtmagents/gtm-agents](https://github.com/gtmagents/gtm-agents)
> 67 plugins, 244 skills, ~200 agents, ~200 commands
> Extracted: 2026-04-02
> Raw extraction: `gtm-agents-ref/_MUSAHM-GTM-REPO-FINDINGS.md` (7,230 lines)
> Detailed Batch 1 report: `gtm-agents-ref/_scour-batch1-brand-competitive-pmm.md`

---

## What This Repo Is

A Claude Code plugin marketplace for GTM teams. Each plugin contains:
- **Agents** (AI personas with specific roles, model assignments, 5-step workflows)
- **Commands** (slash commands that wire agents + skills together)
- **Skills** (reusable methodology frameworks with templates and assets)

Every skill follows a consistent 5-step framework pattern. Every agent gets a model assignment (sonnet for strategic work, haiku for operational). Every command chains agents and skills into executable workflows.

---

## The 15 Most Relevant Plugins for Musahm

Ranked by direct applicability to Musahm Vault's beta GTM in KSA.

### Tier 1: Directly Applicable (use these frameworks NOW)

| # | Plugin | Why It Matters | Key Frameworks |
|---|--------|---------------|----------------|
| 1 | **product-marketing** | Positioning, messaging, launch plays | Positioning Canvas (Audience/Need/Approach/Differentiation/Proof), Message House diagram, Launch Play tiering |
| 2 | **brand-strategy** | Voice governance, narrative consistency | Voice Matrix (4 attributes with We Are/We Are NOT), Brand Governance Checklist (14 items), Narrative Arc (Context/Tension/Resolution/Proof/CTA) |
| 3 | **competitive-intelligence** | Battlecards, win/loss, market signals | Battlecard Structure (7 sections), Win/Loss Data Model (6 qualitative tags), Market Signal Tracker (severity/confidence/SLA) |
| 4 | **b2b-saas** | Land-adopt-expand, board readiness | Land-Adopt-Expand Blueprint (stakeholder matrix + milestone ladder), Usage-to-Value Map, Vertical Solution Templates, Board Readiness Kit (ARR/NRR/CAC/pipeline) |
| 5 | **pricing-strategy** | Packaging tiers, value messaging | Packaging Framework (segmentation/value pillars/metric+fences/add-ons/narrative), Value Messaging Matrix (tier overview/pillars/proof/objections/upgrade path), Pricing Governance (council/decision log/approval matrix) |
| 6 | **enterprise-sales** | CXO briefings, value stories, MEDDIC | Value Story Framework (headline impact/driver pillars/proof/execution plan/decision ask), CXO Briefing Kit, Procurement Playbook, Risk Register, Pursuit Governance |
| 7 | **copywriting** | Cold email sequences, voice guidelines, offer testing | Cold Email Personalization (10 asset files: structure, scoring rubric, QA checklist, follow-up strategy, ICP-objection mapping), Message Architecture, Voice Guidelines |

### Tier 2: Build Into GTM Process

| # | Plugin | Why It Matters | Key Frameworks |
|---|--------|---------------|----------------|
| 8 | **campaign-orchestration** | Launch campaign coordination | Campaign Planning (6 steps with workback), Channel Integration (messaging matrix + cadence alignment), Performance Tracking (metric hierarchy + alerting) |
| 9 | **sales-enablement** | Battlecard system, messaging, reinforcement | Battlecard System (competitive intel/messaging pillars/delivery format/distribution/feedback loop), Messaging Framework (audience+pain/value pillars/proof/objections/CTA), Reinforcement Loop |
| 10 | **content-marketing** | Case studies, thought leadership, SEO writing | CHIC Story Framework (Challenge/Hypothesis/Implementation/Change), SCAR Storytelling Arc, Editorial Ops (production swimlanes + distribution tree), SEO Writing (6-step on-page) |
| 11 | **customer-success** | Risk scoring, adoption playbook | Risk Scoring Framework, Adoption Playbook, Executive EBR Kit, Sentiment Feedback Loop |
| 12 | **email-marketing** | Drip campaigns, deliverability, A/B testing | Drip Campaigns, Segmentation, Deliverability Ops, A/B Testing |

### Tier 3: Use Selectively

| # | Plugin | Why It Matters | Key Frameworks |
|---|--------|---------------|----------------|
| 13 | **abm-orchestration** | Account tiering for Wave 1/2/3 | Tiering Matrix (T1/T2/T3 with scoring: Firmographic 40% + Technographic 20% + Intent 30% + Engagement 10%), Personalization Tokens (JSON schema with Jinja logic), Signal Intelligence |
| 14 | **customer-journey-orchestration** | Journey mapping, governance | Journey Mapping, Voice of Customer integration, Governance framework |
| 15 | **pr-communications** | Press release governance, crisis prep | Crisis Playbooks (P1-P4 severity + escalation tree), Messaging Frameworks (headline/pillars/evidence/CTA/guardrails), Media Database Ops |

---

## Extracted Frameworks: What to Apply to Musahm

### 1. Positioning Canvas (from product-marketing/positioning)

Musahm should fill this for every piece of content:

```
FOR:        [Audience - e.g., Board Secretaries in KSA listed companies]
WHO:        [Need - e.g., need to manage governance documents with full audit trails]
OUR:        [Approach - e.g., Vault combines DMS + workflow + shareholder registry in one Arabic-first platform]
UNLIKE:     [Differentiation - e.g., Unlike SharePoint/Majles, Vault is governance-purpose-built with blocking workflows]
WE PROVE IT BY: [Evidence - e.g., 3 KSA companies already onboarded, 6 pre-built governance workspaces]
```

**Status**: Musahm has fragments of this across message-house.md and voice-guide.md but NO single canonical positioning statement (flagged in MEGA-AUDIT.md).

### 2. Battlecard Structure (from competitive-intelligence/battlecard-library)

Each competitor card should have exactly 7 sections:

1. **Overview** - what they are, target market, pricing model
2. **Positioning** - their claim vs. our claim
3. **Landmines** - questions to ask that expose their weakness
4. **Differentiation** - our unique advantages (with proof)
5. **Trap-Setting** - questions to plant in buyer's mind
6. **Proof Points** - customer quotes, metrics, demos
7. **Offer Packaging** - how to position our pricing against theirs

**Status**: Musahm's battle-cards.md exists but incorrectly concedes task assignment to Majles (Vault HAS full TaskEntity system) and claims mobile app (doesn't exist).

### 3. Account Tiering Matrix (from abm-orchestration/account-tiering)

For Musahm's Wave 1/2/3 rollout:

| Criteria | Tier 1 (Wave 1) | Tier 2 (Wave 2) | Tier 3 (Wave 3) |
|----------|-----------------|-----------------|-----------------|
| Definition | Existing Musahm GRC clients | Referred/warm leads | Cold KSA market |
| Coverage | 1:1 (dedicated onboarding) | 1:Few (segment owner) | 1:Many (automated) |
| Marketing | Bespoke emails, WhatsApp, demos | Industry campaigns | General nurture |
| SLA | Weekly touchpoints | Bi-weekly | Monthly/trigger-based |

Scoring: Firmographic (40%) + Technographic (20%) + Intent (30%) + Engagement (10%)
- T1 threshold: Score > 90
- T2 threshold: Score 70-89
- T3 threshold: Score 50-69

### 4. Value Story Framework (from enterprise-sales/value-story-framework)

For CXO conversations at KSA companies:

1. **Headline Impact** - "Reduce governance document risk by 80% with full audit trails, version control, and blocking workflows"
2. **Driver Pillars** (3-4):
   - Time: Eliminate manual document routing (workflow automation)
   - Risk: Every action logged, watermarked external sharing
   - Compliance: 6 pre-built governance workspaces, role-based access
3. **Proof Layer** - Al-Ufuq, Miral Medical, Amwaj case references
4. **Execution Plan** - Phase 1: Workspace setup (Day 1), Phase 2: User onboarding (Week 1), Phase 3: Workflow activation (Week 2)
5. **Decision Ask** - "Let's activate your 30-seat beta today"

### 5. MEDDIC Checklist (from sales-calls/meddic-checklist)

For every Musahm opportunity:

| Element | Status | Evidence |
|---------|--------|----------|
| **Metrics** | What KPIs will improve? (document processing time, audit trail coverage) | |
| **Economic Buyer** | Who owns the budget? (Board Secretary? IT Director? CEO?) | |
| **Decision Criteria** | Technical: Arabic RTL, SSO, workflows. Commercial: pricing, seats | |
| **Decision Process** | Procurement steps, legal review, pilot approval | |
| **Implications** | What happens if they do nothing? (regulatory risk, manual errors) | |
| **Champion** | Internal advocate pushing for Vault. Strength rating: Strong/Weak | |

### 6. Cold Email Personalization (from copywriting/cold-email-personalization)

The repo has 10 asset files for cold email. Key structure:

**Email Structure Template:**
```
Subject: [Pain-driven, under 50 chars]
Line 1: Personalized observation about their company
Line 2: Bridge to relevant pain point
Line 3: How you solve it (1 sentence, no feature dump)
Line 4: Social proof (named reference or metric)
Line 5: Low-friction CTA (question, not demand)
```

**Scoring Rubric (adapt for cold-outreach.md):**
- Personalization depth (0-25): Company research, role relevance, industry context
- Value clarity (0-25): Pain articulation, benefit specificity, proof quality
- CTA strength (0-25): Low friction, clear next step, urgency without pressure
- Technical quality (0-25): Length, formatting, deliverability signals

**ICP-Objection Mapping:**
Map each ICP persona to their top 3 objections with pre-built responses:
- Board Secretary: "We already use SharePoint" / "Our IT team won't approve another tool" / "Budget is locked"
- IT Director: "Security concerns" / "Integration with existing systems" / "User adoption risk"
- CEO: "Not a priority right now" / "What's the ROI?" / "Show me who else uses it"

### 7. Campaign Planning 6-Step (from campaign-orchestration/campaign-planning)

For Musahm's launch campaign:

1. **Objectives** - 30 beta seats filled, 10 existing GRC clients converted
2. **Audience & Offers** - Existing clients (migration offer), LinkedIn (thought leadership + demo CTA), Google Ads (keyword: "document management governance Saudi")
3. **Messaging Architecture** - "حوكمة سعودية. منصة عالمية." as hero, 3 proof pillars
4. **Channel Mix** - Email (Brevo), WhatsApp (Chatwoot), LinkedIn (Postiz), Google Ads, Direct sales calls
5. **Workback Plan** - T-4 weeks: content ready, T-2: ads live, T-1: email sequences, T-0: launch
6. **Risk Assessment** - Pricing not defined (CRITICAL blocker), Landing page not built, Demo script missing

### 8. Crisis Playbook (from pr-communications/crisis-playbooks)

Musahm needs this for beta:

| Severity | Example | Response SLA | Approver |
|----------|---------|-------------|----------|
| P1 | Data breach, document leak | 1 hour | CEO + Legal |
| P2 | Service outage, workflow failure | 4 hours | CTO + PM |
| P3 | Feature bug, UI issue | 24 hours | Product Lead |
| P4 | Feature request, minor UX | 1 week | PM |

### 9. Brand Voice Matrix (from brand-strategy/brand-voice-glossary)

Adapt for Musahm:

| Attribute | We Are | We Are NOT |
|-----------|--------|-----------|
| Confident | Direct, evidence-backed claims | Arrogant, unsubstantiated superlatives |
| Saudi-native | Culturally authentic, Arabic-first | Performatively Saudi, hollow nationalism |
| Professional | Enterprise-grade, compliance-aware | Bureaucratic, cold, jargon-heavy |
| Forward-looking | Innovation-driven, Vision 2030 aligned | Hype-driven, vaporware promises |

**Banned vocabulary**: "revolutionary", "game-changing", "best-in-class", standalone #رؤية2030
**Preferred vocabulary**: "governance-grade", "purpose-built", "audit-ready", "Arabic-first"

### 10. Pricing Packaging Framework (from pricing-strategy/packaging-framework)

Musahm MUST define this before launch (currently a "pricing black hole"):

1. **Segmentation** - SME (<50 employees), Mid-market (50-500), Enterprise (500+)
2. **Value Pillars per Tier:**
   - Starter: 6 workspaces, basic workflows, 5 users
   - Professional: + custom workspaces, advanced workflows, external sharing, 25 users
   - Enterprise: + SSO, API access, custom roles, unlimited users, SLA
3. **Pricing Metric** - Per seat/month (the most common B2B SaaS metric)
4. **Add-ons** - Extra storage, GRC integration, dedicated onboarding
5. **Narrative** - Value messaging per tier with ROI proof

---

## Full Asset Templates Extracted (Verbatim)

### Account Tiering Matrix
See: `gtm-agents-ref/_MUSAHM-GTM-REPO-FINDINGS.md` > "All Assets & Templates" section

### Brand Governance Checklist (14 items)
1. Logo usage (correct version, clear space, minimum size)
2. Color palette compliance (primary, secondary, accent)
3. Typography consistency (fonts, weights, sizes)
4. Imagery standards (photography, illustrations, icons)
5. Voice & tone match (per voice guide attributes)
6. Key message alignment (positioning, tagline, claims)
7. Legal disclaimers present (where required)
8. Accessibility baseline (contrast, alt text, readability)
9. Approval routing followed (stakeholder sign-offs)
10. Campaign brief cross-referenced
11. Channel specs validated (dimensions, safe zones, file formats)
12. Localization checked (translation, cultural sensitivity)
13. Expiration date set (for time-sensitive assets)
14. Archive location documented

### Brand Voice Matrix (4-Attribute System)
| Attribute | Description | Do | Don't |
|-----------|-------------|----|----|
| Confident | Assured, credible | Lead with evidence, make clear claims | Overstate, use superlatives without proof |
| Empathetic | Understanding, human | Acknowledge pain, mirror customer language | Patronize, over-simplify |
| Visionary | Forward-looking | Point to outcomes, paint the future state | Hype without substance, mock competitors |
| Precise | Specific, actionable | Use exact numbers, cite sources | Be vague, pad with filler |

### Narrative Arc Template
```
1. CONTEXT    - Set the scene (market/customer status quo)
2. TENSION    - Introduce the problem or risk
3. RESOLUTION - Present the solution (your product)
4. PROOF      - Evidence it works (metrics, quotes, case studies)
5. CTA        - Clear next action
```

Audience adaptation:
- Executive: Lead with business impact, keep to 1 page
- Practitioner: Include workflow details, show time saved
- Developer/IT: Technical specs, integration points, API docs

### Personalization Tokens (JSON Schema)
```json
{
  "firmographic": {
    "company_name": "{{company.name}}",
    "industry": "{{company.industry}}",
    "employee_count": "{{company.employees}}"
  },
  "persona": {
    "first_name": "{{contact.first_name}}",
    "title": "{{contact.title}}",
    "pain_point": "{{contact.pain_point}}"
  },
  "logic_examples": {
    "industry_intro": "{% if company.industry == 'Finance' %}Secure your transactions{% else %}Scale your operations{% endif %}",
    "competitor_takeout": "{% if company.competitor == 'SharePoint' %}Switch from SharePoint and get governance-grade workflows{% endif %}"
  }
}
```

### Win/Loss Data Model
| Field | Type | Purpose |
|-------|------|---------|
| Deal ID | String | CRM reference |
| Segment | Enum | SME / Mid-market / Enterprise |
| Region | String | KSA city/region |
| Product | String | Vault / GRC / Bundle |
| Outcome | Enum | Win / Loss / No Decision |
| Competitor | String | SharePoint / Majles / Ebana / Other |
| Primary Driver | Enum | Pricing / Product / Implementation / Support / Brand / Relationship |
| Key Quote | Text | Verbatim buyer feedback |
| Confidence | 1-5 | How reliable is this data |

---

## Plugins NOT Relevant to Musahm (Skip These)

| Plugin | Why Skip |
|--------|----------|
| e-commerce | Musahm is B2B SaaS, not retail |
| edtech-growth | Wrong vertical |
| healthcare-marketing | Wrong vertical (unless targeting healthcare governance) |
| manufacturing-sales | Wrong vertical |
| financial-services | Wrong vertical (unless targeting financial governance) |
| loyalty-lifecycle-orchestration | No loyalty program planned |
| referral-program-orchestration | Too early for referral programs |
| webinar-automation | Not in launch scope |
| video-marketing | Not in launch scope (but video-script.md exists) |
| social-scheduler-orchestration | Postiz handles this already |

---

## Recommended Actions

### Immediate (Before Launch)

1. **Write canonical positioning statement** using the Positioning Canvas - one statement, used everywhere
2. **Fix battle-cards.md** using the 7-section Battlecard Structure - correct the Majles task concession, remove mobile app claims
3. **Define pricing tiers** using the Packaging Framework - this is the #1 blocker identified in every audit
4. **Build MEDDIC template** for sales calls - adapt the checklist for KSA governance buyers
5. **Standardize cold email** using the Cold Email Personalization scoring rubric - fix the 99 em-dash-free cold-outreach.md

### Before Wave 2

6. **Implement Account Tiering** - score and tier all prospects using the 4-factor model
7. **Create Value Story** for CXO meetings using the Value Story Framework
8. **Build crisis playbook** using the P1-P4 severity matrix - beta needs incident response
9. **Set up Win/Loss tracking** using the Win/Loss Data Model - capture every beta outcome

### Ongoing

10. **Run Brand Governance Checklist** on every piece of content before publish
11. **Apply Narrative Arc** (Context/Tension/Resolution/Proof/CTA) to all marketing content
12. **Use CHIC framework** (Challenge/Hypothesis/Implementation/Change) for case studies from beta clients

---

## How to Use the Raw Repo

The full cloned repo is at `e:/Negm-Musahem-main/gtm-agents-ref/`. Key files:

| File | Content |
|------|---------|
| `_MUSAHM-GTM-REPO-FINDINGS.md` | Full extraction (7,230 lines): all 244 skills, all agents, all commands, all assets |
| `_scour-batch1-brand-competitive-pmm.md` | Deep analysis of brand-strategy + competitive-intelligence + product-marketing |
| `plugins/[name]/skills/[skill]/SKILL.md` | Individual skill framework |
| `plugins/[name]/agents/[agent].md` | Agent definition with workflow |
| `plugins/[name]/commands/[cmd].md` | Command definition with wiring |
| `plugins/[name]/skills/[skill]/assets/*` | Templates, matrices, checklists |
| `docs/use-cases/*.md` | Worked examples (cold email, content calendar, pipeline health) |
