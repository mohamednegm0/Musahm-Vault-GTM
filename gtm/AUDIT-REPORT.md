# GTM Audit Report: Product Marketing Team Lead Review

> **Date:** 2026-04-02
> **Scope:** 34 GTM deliverables across 5 phases + supporting documents
> **Method:** 3 parallel audit agents reading every file against source code ground truth (llm.txt, ConstRoles.cs, ConstDefaultWorkspaces.cs, ConstPermissions.cs)
> **Auditor stance:** Find-what's-wrong, not validate-what's-right

---

## Executive Summary

**Overall Score: 62/100**

The GTM is a competent content production effort with strong individual deliverables (SEO keywords, beta KPIs, FAQ, blog posts) but has a **fabrication problem** and a **consistency problem** that would get a PMM fired on Day 1.

**The 3 things that would get you fired:**

1. **partner-kit.md** describes Al-Ufuq (an educational company) as "a real estate company" in the pitch script. A partner presenting this gets instantly discredited.
2. **cold-outreach.md** cites fabricated statistics ("67% of Saudi real estate firms lack a document audit trail") with no source. One recipient asking "where'd you get this number?" and you're done.
3. **google-ads.md** references "iOS and Android Apps" in multiple RSAs. If these don't exist for Vault, this is false advertising in a paid channel Google can audit.

---

## Part 1: CRITICAL Issues (Must Fix Before Any Content Ships)

### C1. Role Names Wrong in 4 Files

The product defines roles as: **Viewer(1), Commenter(2), Editor(3), Organizer(4), Admin(5)**.

| File | Role 2 (should be "Commenter") | Role 4 (should be "Organizer") |
|------|-------------------------------|-------------------------------|
| `onboarding-sequence.md` | "Contributor" / "مساهم" | "Supervisor" / "مشرف" |
| `quick-start-guide.md` | "Contributor" / "مساهم" | "Supervisor" / "مشرف" |
| `sales-deck.md` | (correct) | "Workspace Manager" / "مدير مساحة" |
| `faq.md` | CORRECT | CORRECT |

Users who read the FAQ see one set of names, the onboarding emails teach different names, and the product UI shows yet another thing. **FIX: propagate FAQ's correct names to all files.**

### C2. Fabricated Statistics in cold-outreach.md

- Email 2 (Real Estate): "67% of Saudi real estate firms lack a document audit trail", no source
- Email 2 (Education): "Board secretaries spend 40% of their time searching for documents", no source

**FIX: Remove specific percentages. Replace with qualitative claims or flag as "[STAT: source needed]".**

### C3. Al-Ufuq Sector Mislabeled in partner-kit.md

Partner pitch script describes Al-Ufuq as "شركة عقارية" (a real estate company). Al-Ufuq is **Al-Ufuq Educational**, education sector.

**FIX: Correct to educational company in both AR and EN.**

### C4. Mobile App Claims in google-ads.md

Multiple RSA headlines and descriptions reference "تطبيقات جوال iOS و Android" / "iOS and Android Apps." If Vault has no mobile apps, this is false advertising.

**FIX: Verify. If no mobile app exists for Vault specifically, remove all mobile app references.**

### C5. "Documents Connected to Board Decisions": Fabricated Linkage

Battle cards, message house, and brand concept all claim documents in Vault are "linked to specific board resolutions." The codebase shows:
- Documents have `WorkspaceId`, `ParentId`, `Tags`; NO `ResolutionId` or `MeetingId` field
- Connection is organizational (folder placement), not relational (entity linkage)

This claim appears in: `battle-cards.md`, `message-house.md`, `social-posts.md` (Variant B)

**FIX: Rewrite as "documents live in governance-themed workspaces", not "documents are linked to decisions."**

### C6. Existing Features Presented as "Coming Soon" in onboarding-sequence.md

Email 5 lists under "What's coming to Vault":
1. Semantic search: **ALREADY EXISTS**
2. AI field extraction: **ALREADY EXISTS**
3. OTP external sharing with watermarks: **ALREADY EXISTS**

Every other file (landing page, FAQ, sales deck, video) describes these as current features.

**FIX: Replace with genuinely unreleased features or remove the "coming soon" section.**

### C7. Client + Vault Proof Point Contradiction

- Battle cards claim existing clients "operate with full governance + Vault"
- Brand audit says "Vault: Not mentioned anywhere on current site"
- Beta rollout plan treats Vault as pre-launch

These three statements cannot all be true.

**FIX: Align all files to the truth: either clients are beta-testing Vault, or they aren't. Don't claim "operating" if they're not.**

### C8. Encryption-at-Rest Claim Unverified in message-house.md

Data storage objection handler states: "all data is encrypted in transit and at rest." No evidence of encryption-at-rest in the application codebase. MongoDB stores BSON directly. This may be true at the infrastructure level (MongoDB Atlas), but it's not flagged with ⚠️ NEEDS CLIENT INPUT like the data residency claim is.

**FIX: Add ⚠️ NEEDS CLIENT INPUT flag, or verify at infrastructure level and document the evidence.**

### C9. Beta Seat Count Inconsistent Across 6 Files

| File | Seat Count |
|------|-----------|
| launch-email.md | [10] (placeholder) |
| sms-blast.md | 30 |
| social-posts.md | 30 |
| video-script.md | 50 |
| poster-copy.md | 50 |
| landing-page.md | [X] (placeholder) |

**FIX: Resolve to ONE number and propagate.**

### C10. social-calendar.md Week 5 Pre-Writes Fabricated Outcomes

"One of our clients uploaded over 200 documents in the first week" is written as publishable fact for a post-launch phase. If the actual number is 15 documents, publishing this destroys trust.

**FIX: Mark as [PLACEHOLDER, UPDATE WITH REAL DATA] or rewrite as template.**

---

## Part 2: MODERATE Issues (Fix Before Launch)

### M1. 6th Workspace Inconsistently Named or Omitted

| Issue | Files Affected |
|-------|---------------|
| "Association Meetings" completely omitted (only 5 listed) | launch-email.md, message-house.md |
| Called "General" (عام) instead of "Association Meetings" | sales-deck.md |
| "Policies & Regulations" Arabic varies: السياسات واللوائح vs السياسات والأنظمة | onboarding-sequence.md, quick-start-guide.md vs FAQ, landing-page |

### M2. CTA Verb Inconsistent

Standard should be "Activate Vault" per audit fix. Actual usage:

| CTA | Files |
|-----|-------|
| "Activate Vault" | launch-email.md only |
| "Request your access" | social-posts.md |
| "Reserve your spot" | poster-copy.md |
| "Register your company" | landing-page.md |
| Various login verbs | onboarding, nurture sequences |

### M3. Tagline Modified Without Justification

Canonical: "حوكمة سعودية. منصة عالمية." / "Saudi governance. World-class platform."

poster-copy.md uses: "حوكمة سعودية. معايير رؤية ٢٠٣٠." (adds Vision 2030, drops "World-class platform")

### M4. No IT Director / CTO Persona

The ICP defines 4 personas but excludes IT Director. The Ebana battle card explicitly describes IT-led buying scenarios. No GTM file addresses the IT buyer.

### M5. WhatsApp Strategy Underdeveloped

WhatsApp is the #1 B2B communication channel in Saudi Arabia. Currently treated as a Day 10 afterthought in cold outreach and a launch-day broadcast in the checklist. No WhatsApp message templates, drip sequences, or WhatsApp-first outreach strategy exists.

### M6. Task Assignment Feature Incorrectly Denied

The competitive analysis marks task assignment as "Not confirmed." The voice guide lists it as "Do Not Claim." But Vault has a complete task system: `TaskEntity.cs` with `AssignedTo`, `CandidateUsers`, `DueDate`, `Status`, full CRUD API, and a dedicated Tasks page. The gap is specifically "post-meeting action item tracking" (a GRC workflow), not task assignment in general.

### M7. Recommendation Scoring Math Wrong

All three concept scores are inflated by exactly 2.5 points. The formula and weights documented in the file do not produce the stated totals. Relative ranking is preserved (Concept 3 still wins), but wrong math undermines analytical credibility.

### M8. Em Dash Overuse in landing-page.md

~10 em dashes across ~1,650 words. Budget is 2 per 500 words = max 6. Over by ~4. Combined with 4 "not X but Y" constructions, the page reads as AI-generated.

### M9. LinkedIn Strategy Banner Color Inconsistency

linkedin-strategy.md specifies "#1a1a2e" (dark blue) for banner background. Brand palette uses "#1B4332" (dark green). partner-kit.md only references gold (#c3924d).

### M10. Social Calendar Workspace Names Don't Match Product

Week 3 announcement names workspaces as "General Assemblies" instead of "Association Meetings," and "Contracts" instead of "Contract Documentation."

### M11. No Social Proof in Customer-Facing Content

3 named clients exist (Al-Ufuq, Miral, Amwaj). They appear in:
- landing-page.md ✅ (with permission flags)
- sales-deck.md ✅
- partner-kit.md ✅ (but Al-Ufuq sector is wrong)
- battle-cards.md ✅

They do NOT appear in: social-posts, social-calendar, blog-posts, Google Ads, email, SMS, poster, cold outreach. For a trust-first Saudi B2B market, this matters.

### M12. LinkedIn Hashtag Overuse

LinkedIn strategy uses 7 hashtags per post. LinkedIn's algorithm now penalizes posts with more than 3-5.

### M13. Blog Posts All Sell, No Pure Education

All 4 blog posts are thought leadership with a product CTA. For SEO credibility, at least 1 of 4 should be genuinely educational without pitching Vault.

### M14. Tool Stack Deploys Too Many Tools Simultaneously

Tier S contains 11 tools for immediate deployment. A team running a beta with 3 clients likely has 2-4 marketing people. Recommend prioritizing 3-4 tools for pre-launch.

### M15. Google Ads Navigational Keyword Issue

Campaign 1 includes "مساهم تسجيل دخول" (Musahm login), a navigational keyword. This catches existing users trying to log in, not new prospects. Should route to login page, not beta signup.

### M16. Partner Kit 70% Blocked

7 of 10 items on the Partner Program Readiness Checklist are marked "NEEDS CLIENT INPUT." The file is a template, not a deployable deliverable.

---

## Part 3: What's Missing (Files That Should Exist But Don't)

| # | Missing Deliverable | Why It Matters | Priority |
|---|---------------------|---------------|----------|
| 1 | **WhatsApp message library** | #1 B2B channel in KSA. No templates, no drip sequences. | P0 |
| 2 | **Press release draft** | Launch checklist says "distribute on launch day" but no draft exists. Can't write a press release on launch day. | P0 |
| 3 | **Pricing page copy** | Every CTA leads to "register for beta" but no prospect knows what they're committing to. Every file flags this as blocked. | P1 (blocked) |
| 4 | **Internal sales playbook** | Partner kit teaches externals to sell. Nothing exists for the internal team: demo script, discovery questions, qualification criteria. | P1 |
| 5 | **Data residency / security FAQ** | For a governance product targeting legal counsel, data sovereignty and PDPL compliance are table-stakes. No standalone security page. | P1 |
| 6 | **Webinar invitation + follow-up** | Launch checklist references 2 webinars but no invitation copy, registration page, or follow-up sequence exists. | P2 |
| 7 | **Customer onboarding call script** | Wave 1 is "hand-held" but no call script, agenda, or success criteria for CS team. | P2 |
| 8 | **SharePoint/Google Workspace battle card** | Message house references these as objection sources but no standalone battle card exists. | P2 |

---

## Part 4: Scoring by File

### Ship-Ready (8+/10)
| File | Score | Notes |
|------|-------|-------|
| seo-keywords.md | 9 | Honest about data limitations, technically actionable |
| beta-kpi-plan.md | 9 | Range-based targets, grounded in PostHog, most intellectually honest file |
| faq.md | 9 | Only file that gets ALL role names right |
| case-study-template.md | 9 | Clean, well-structured, hypotheticals clearly labeled |
| win-loss-template.md | 9 | Practical, bilingual, properly marked |
| launch-email.md | 8 | One workspace omission, otherwise strong |
| sms-blast.md | 8 | Well-engineered for UCS-2 constraints |
| video-script.md | 8 | Production-ready, good self-corrections |
| nurture-sequence.md | 8 | Clean writing, no fabrications |
| blog-posts.md | 8 | Full bilingual articles, schema markup |
| launch-checklist.md | 8 | 108 tasks with dependencies and contingency |
| google-ads.md | 8* | *If mobile app claims verified; 5/10 if not |

### Needs Fixes (5-7/10)
| File | Score | Blocking Issues |
|------|-------|-----------------|
| landing-page.md | 7 | Em dash overuse, 4x "not X but Y", CTA inconsistency |
| sales-deck.md | 7 | Wrong workspace name, wrong role name, mobile app claim |
| poster-copy.md | 7 | Modified tagline, CTA inconsistency |
| quick-start-guide.md | 7 | Wrong role names (Contributor, Supervisor) |
| linkedin-strategy.md | 7 | Fabricated deployment story, banner color, hashtag count |
| cold-outreach.md | 7 | Fabricated statistics, no urgency, WhatsApp as afterthought |
| social-calendar.md | 7 | Pre-written fake outcomes, workspace name mismatches |
| social-posts.md | 6 | Fabricated feature (doc-to-meeting linking), wrong CTA |
| partner-kit.md | 6 | Al-Ufuq sector wrong, 70% blocked by client input |
| onboarding-sequence.md | 5 | Wrong role names, existing features as "coming soon" |

---

## Part 5: Strategic Gaps

1. **Email-first in a WhatsApp market.** The entire outreach strategy is email-primary with WhatsApp as fallback. In Saudi B2B, WhatsApp is the primary business communication channel. This is a Western GTM pattern forced onto a Saudi market.

2. **No pricing exists anywhere.** 34 deliverables and the single most important conversion element, pricing, is absent. Every CTA leads to "register for beta" with no cost signal.

3. **No event strategy.** Saudi B2B deals close at conferences, roundtables, and Chamber of Commerce events. No event calendar, booth playbook, or speaker pitch exists.

4. **The GTM assumes a marketing team of 13 roles.** The launch checklist assigns tasks to 13 distinct roles. With 3 known clients, the team likely has 2-4 people total. Operational burden is dramatically underestimated.

5. **Arabic copy awaits native review.** 25+ deliverables flagged for Arabic review with a budget of SAR 3,000-8,000 for one pass. Saudi native speakers reviewing this volume will likely require 2-3 revision cycles.

---

## Part 6: Fix Priority

### Immediate (before any content ships)
1. Fix role names in 4 files (C1)
2. Remove fabricated statistics from cold-outreach.md (C2)
3. Correct Al-Ufuq sector in partner-kit.md (C3)
4. Verify/remove mobile app claims in google-ads.md (C4)
5. Rewrite "documents linked to decisions" claim (C5)
6. Fix onboarding Email 5 "coming soon" features (C6)
7. Resolve beta seat count to ONE number (C9)
8. Mark social-calendar Week 5 outcomes as placeholders (C10)

### Before launch
9. Fix workspace naming across all files (M1)
10. Standardize CTAs (M2)
11. Write press release draft (Missing #2)
12. Create WhatsApp message library (Missing #1)
13. Fix landing page em dashes and "not X but Y" overuse (M8)

### During pre-launch prep
14. Add ⚠️ to encryption-at-rest claim (C8)
15. Align client + Vault proof point across files (C7)
16. Reduce LinkedIn hashtags to 3-4 (M12)
17. Fix banner color inconsistency (M9)
18. Create internal sales playbook (Missing #4)
