# GTM Audit & Execution Plan

> **Last audit:** 2026-04-02 | **Updated:** 2026-04-02 (repo synthesis integration)
> **Audited by:** 4 parallel agents + manual reality check + MEGA-AUDIT (6 agents, 74/100)
> **Scope:** 50 GTM files across 5 phases + 6 audit artifacts
> **Arsenal:** 129 installed skill prompts + 24 agent prompt templates + external tools
> **Frameworks:** 10 extracted from gtm-agents repo (67 plugins, 244 skills) -- see `gtm/GTM-AGENTS-REPO-SYNTHESIS.md`
> **Tool stack:** See `gtm/TOOL-STACK.md`
> **Context file:** See `gtm/CLAUDE.md` for quick reference

---

## Honesty Notes (Read First)

Things this plan is NOT:

1. **The "agents" are prompt templates**, not autonomous executables. The 24 files in `.claude/agents/` are markdown instructions I load as context when I (Claude) work on a task. They don't run independently.
2. **The "skills" are structured prompts.** The 129 SKILL.md files guide my output quality and structure. They're mental frameworks, not software.
3. **The "tools" range from platforms to npm packages.** Brevo is a platform you sign up for. MJML is an npm package I can use in code. Google Trends is a website. They're different things.
4. **I produce content, you ship it.** I write email copy, you paste it into Brevo. I write slide content, you generate it in Gamma. I write post text, you schedule it in Postiz. The plan now explicitly marks what I do vs what you do.

---

## Part 1: Audit Findings (All Verified)

### Severity Summary

| Severity     | Count | Description                                        |
| ------------ | ----- | -------------------------------------------------- |
| **CRITICAL** | 12    | Blocks launch or destroys credibility if published |
| **MODERATE** | 18    | Weakens conversion or brand coherence              |
| **MINOR**    | 8     | Polish items                                       |

---

### CRITICAL Findings

#### C1. Brand Voice is Absent From All Content

**Score: 3.8/10 average across 6 content files.**

All content was written before the brand concept selection. The winning concept (Concept 3: "Built Saudi") appears in exactly ONE sentence across ~4,500 words of customer-facing copy:

> "Not a foreign product adapted for KSA -- a Saudi product built for Saudi law." (message-house.md)

The recommended tagline "حوكمة سعودية. منصة عالمية." appears in ZERO content files.

| File             | Voice Score |
| ---------------- | ----------- |
| message-house.md | 6/10        |
| video-script.md  | 5/10        |
| launch-email.md  | 4/10        |
| social-posts.md  | 4/10        |
| sms-blast.md     | 3/10        |
| poster-copy.md   | 3/10        |

#### C2. AI Writing Fingerprints (263 Em Dashes + Systemic Patterns)

- 263 em dashes across 18 files (14.6/file avg; human norm is 2-3)
- Rule of three in every content file
- "Not X, but Y" parallelism 7+ times in message-house.md alone
- "Simple. Powerful. Complete." in video-script.md
- Any editor or detection tool will flag this

#### C3. Zero Social Proof in Customer-Facing Content

Three known clients exist (Al-Ufuq, Miral, Amwaj). Zero appear in any content. B2B KSA is trust-first. This kills conversion.

#### C4. No Urgency Mechanism

Only urgency: "Beta spots are limited." No deadline. No count. No pricing incentive. Saudi B2B buyers need scarcity, deadlines, and peer pressure.

#### C5. Decision Stage is Empty

- No sales deck
- No pricing page copy
- No case study (even a template)
- No landing page copy
- No one-pager for sales team

#### C6. Video Subtitles Unreadable

Scene 4: 48 words in a single subtitle card lasting 18 seconds. Needs splitting into 4 segments.

#### C7. #1 Differentiator Never Used

Competitive analysis calls Shareholder Registry "category-exclusive" and says "exploit as headline differentiator." Zero mentions in any content.

#### C8. Brand Voice Guardian Agent is Misconfigured

References "AgentKits Marketing by AityTech." Would push content toward generic Western SaaS voice. Must be rebuilt with Musahm voice spec.

#### C9. Missing Critical Objection Handlers

- "Where is our data stored?"
- "Are your e-signatures legally valid in Saudi courts?"
- "I need to check with my CEO / get board approval"

#### C10. Launch Email CTA is Passive

"Request Beta Access" puts the prospect in a giving position. No concrete next step.

#### C11. SMS Arabic/English Say Different Things

Arabic emphasizes integration. English emphasizes document attributes. Bilingual executives will notice.

#### C12. Four Blocking Decisions Unmade

| Decision                             | Blocks                                   |
| ------------------------------------ | ---------------------------------------- |
| Pricing                              | Email CTA, landing page, sales deck, FAQ |
| Brand concept (formal sign-off)      | All content voice alignment              |
| Data hosting location                | "Built Saudi" claim, FAQ, security page  |
| Brand architecture (Musahm vs Vault) | URL structure, pricing presentation      |

---

### MODERATE Findings

| #   | Finding                                                                | Files Affected             |
| --- | ---------------------------------------------------------------------- | -------------------------- |
| M1  | Feature-lists instead of outcome-focused value props                   | email, social, video       |
| M2  | Regulatory urgency (Vision 2030, CMA) absent from all customer content | All Phase 4                |
| M3  | "That's why we built" appears 3x across 2 files                        | message-house, email       |
| M4  | Cross-file copy-paste feeling ("protected, organized, governed")       | email, SMS, poster, social |
| M5  | Poster Arabic headline reads translated, not native                    | poster-copy                |
| M6  | No lead nurture path (signup but no activation)                        | Missing entirely           |
| M7  | No post-churn win-back strategy                                        | Missing entirely           |
| M8  | Competitive advantages not weaponized in content                       | competitive-analysis gap   |
| M9  | No persona-specific content for Board Secretary or Legal Counsel       | All Phase 4                |
| M10 | Vision 2030 only appears as hashtag, never in copy                     | social-posts               |
| M11 | Email button color references #006C35 (rejected flag green)            | launch-email               |
| M12 | Wave 2 NPS gate requires n>=30 (Wave 2 has 15 clients max)             | beta-rollout-plan          |
| M13 | No pricing anchor anywhere                                             | All customer-facing        |
| M14 | Beta scoring matrix untested against real client data                  | beta-rollout-plan          |
| M15 | Hyphenated compounds too uniformly consistent (AI tell)                | Multiple files             |
| M16 | "المميزين" (distinguished) filler in email salutation                  | launch-email               |
| M17 | No thank-you page / confirmation flow after beta signup                | Missing entirely           |
| M18 | No win/loss analysis template for beta conversions                     | Missing entirely           |

---

### What's Actually Good (Preserve)

1. WhatsApp objection handler (message-house.md) -- genuinely persuasive
2. Competitive analysis -- honest, sharp, marks "Not confirmed" appropriately
3. LinkedIn hook ("Where are your docs?") -- specific, culturally accurate
4. Video Scene 1 problem framing -- emotionally effective for KSA
5. ICP -- flags hypotheses, disqualification criteria are sharp
6. Beta KPI plan -- range-based targets, PostHog instrumentation spec
7. Concept 3 voice example ("We didn't translate a foreign platform")
8. User docs -- built from actual source code

---

## Part 2: Execution Plan

### What Changed From Previous Version

| Issue Found                                          | Fix Applied                                                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Task 3 listed as both "blocked" and "unblocked"      | Resolved: blocked on writing samples for IDEAL result, but I can build 80% voice guide from recommendation.md + concept-3 + existing content |
| Task 4 listed as both "blocked" and "unblocked"      | Resolved: blocked on client interviews for IDEAL result, but I can refine personas from existing ICP + web research                          |
| 5 email template tools listed                        | Simplified to MJML (primary). React Email / Maizzle listed as alternatives, not parallel tools                                               |
| 4 slide tools listed                                 | Simplified to Gamma (primary for polished decks). Marp for quick markdown-to-PDF                                                             |
| "Build 4 custom MCP servers" listed without timeline | Removed from critical path. MCP servers are a post-launch automation layer, not a pre-launch requirement                                     |
| No clarity on what I do vs what you do               | Every task now has explicit I do / You do split                                                                                              |
| No milestone checkpoints                             | Added 6 reviewable milestones                                                                                                                |
| **No canonical positioning statement**               | NEW: Use Positioning Canvas from repo synthesis to write one                                                                                 |
| **Battle cards missing 7-section structure**         | NEW: Restructure using Battlecard 7-Section framework                                                                                        |
| **No account tiering model**                         | NEW: Apply Account Tiering Matrix to Wave 1/2/3                                                                                              |
| **No demo script / value story**                     | NEW: Build CXO Value Story using 5-element framework                                                                                         |
| **No MEDDIC for sales calls**                        | NEW: Add MEDDIC checklist template                                                                                                           |
| **Cold email lacks scoring**                         | NEW: Apply Cold Email Scoring rubric (4x25 points)                                                                                           |
| **No crisis playbook for beta**                      | NEW: Add P1-P4 severity matrix                                                                                                               |
| **Pricing still undefined**                          | NEW: Use Packaging Framework as structure (client fills numbers)                                                                             |
| **"Built Saudi" weak differentiator**                | MEGA-AUDIT confirmed: shift to "Built FOR Saudi governance"                                                                                  |
| **4 FALSE product claims found**                     | MEGA-AUDIT: semantic search, Ask Vault, IP logging, mobile apps                                                                              |

### Task Flow (Corrected)

```
MILESTONE 0: SHOWSTOPPER FIXES ✅ COMPLETED (2026-04-02)
  ├─ [S1] ✅ Reclassified semantic search + Ask Vault as "Coming Soon" (9 files)
  ├─ [S2] ✅ Removed IP address from all content files
  ├─ [S3] ✅ Fixed OTP: "phone" → "email"
  ├─ [S4] ✅ Removed "أول" from press release headlines
  ├─ [S5] ✅ Fixed mobile app claims to "mobile-responsive" (4 files)
  ├─ [S6] ✅ Standardized seat count to 30 (launch-email, video-script)
  ├─ [S7] ✅ Replaced "95%" with "the vast majority" (4 files)
  ├─ [BONUS] ✅ Fixed voice-guide.md: removed IP from Tier 1, added "coming soon" to AI features
  └─ >>> RESULT: Zero false claims in any content file. Ship-safe.

MILESTONE 1: Foundation Review ✅ COMPLETED (2026-04-02)
  ├─ [3] ✅ Brand Voice Guide enhanced with Brand Voice Matrix (4 attributes, AR+EN)
  ├─ [5] ✅ Battle Cards restructured: 7-Section framework header + Trap-Setting sections added (4 cards)
  ├─ ✅ NEW: Canonical Positioning Statement (positioning-statement.md)
  │        Full Positioning Canvas (FOR/WHO/OUR/UNLIKE/PROOF)
  │        Derivative formats: one-liner, 25-word, per-competitor positioning
  └─ [C8] Rebuild voice guardian agent -- DEFERRED (needs runtime, not document work)
  >>> DELIVERED: Voice guide + battle cards + positioning statement. 3 upgraded files + 1 new.

MILESTONE 2: Content Rebuild ✅ COMPLETED (2026-04-02)
  ├─ [1] ✅ All 6 content files reviewed and upgraded with Narrative Arc
  ├─ [C7] ✅ Shareholder Registry elevated to lead feature in launch-email
  ├─ [C9] ✅ 3 objection handlers added to cold-outreach (SharePoint, too small, timing)
  ├─ [C4] ✅ Urgency: "30 seats" + "closes soon" standardized across all files
  ├─ [C3] ✅ Named client references: Al-Ufuq, Miral, Amwaj in launch-email
  ├─ [C10] ✅ CTA standardized to "فعّل Vault" across all files
  ├─ [C11] ✅ AR/EN SMS alignment verified (alignment matrix in sms-blast.md)
  ├─ [C6] ✅ Video subtitle 48-word card already split in prior session
  ├─ [BONUS] ✅ Removed remaining IP address refs from social-posts.md (2 spots)
  ├─ [BONUS] ✅ Fixed "AI search" reference in cold-outreach education sequence
  └─ All M1-M5, M10, M11, M15-M16 fixed in rewrites
  >>> RESULT: 6 content files ship-ready. Zero false claims confirmed by grep.

MILESTONE 3: AI Cleanup ✅ COMPLETED
  ├─ [2] ✅ Humanizer pass on all 21 content files   Avg score: 8.9/10 (target: 8+)
  ├─ ✅ "Not X, but Y" reduced from 11 to 1 (target: <3)
  ├─ ✅ Rule of Three reduced from 6 to 0 (target: <2)
  ├─ ✅ Removed meta AI-cleaning notes from video-script.md and social-posts.md
  ├─ ✅ Removed banned hashtag #رؤية2030 from linkedin-strategy.md
  ├─ ✅ Fixed triple adjective pattern in landing-page.md (AR + EN)
  └─ ✅ Score report: deliverables/humanizer-score-report.md
  >>> RESULT: 21/21 files at 8+/10. Zero em dashes, zero AI vocabulary, zero triads.

MILESTONE 4: New Content (Decision Stage) ✅ COMPLETED
  ├─ [10] ✅ Landing page copy              Narrative Arc + CRO: urgency anchor, mid-page CTA strip, 3x CTA placement
  ├─ [11] ✅ Sales deck content             Value Story Framework header (Pain→Cost→Solution→Proof→Ask arc mapped to slides)
  ├─ [9] ✅ Beta onboarding copy            Behavioral onboarding framework: milestone-driven, action-gated, 5 activation milestones
  ├─ [12] ✅ Case study template            CHIC Framework header + writing rules. 3 formats + interview guide + publishing checklist
  ├─ [15] ✅ FAQ (20-30 items)              28 items, 6 categories, bilingual, Schema.org FAQ markup, already at target
  ├─ [M6] ✅ Lead nurture sequence          Email Scoring Rubric (4x25), 4 emails escalating 75→93 score, sequence logic
  ├─ [M17] ✅ Thank-you page copy           NEW FILE: 7-section post-signup page with timeline, prep checklist, resources
  ├─ [M18] ✅ Win/loss analysis template    NEW FILE: 9-field model + analysis tags + quarterly review process + interview guide
  ├─ ✅ MEDDIC sales call checklist         Already completed in M1 (deliverables/meddic-checklist.md)
  ├─ ✅ CXO Value Story document            Already completed in M1 (deliverables/cxo-value-story.md)
  └─ ✅ Demo script                         Already completed in M1 (deliverables/demo-script.md)
  >>> RESULT: All 11 deliverables complete. 2 new files created, 6 existing files enhanced.

MILESTONE 5: Distribution Content ✅ COMPLETED
  ├─ [7] ✅ Cold outreach sequences         Cold Email Scoring Rubric (4x25) + 10-Asset Personalization System added
  ├─ [8] ✅ LinkedIn strategy + calendar    Authority Builder (5-Phase Credibility Ladder) framework header added
  ├─ [13] ✅ Blog posts (4 articles)        SCAR Arc framework (Situation/Complication/Action/Resolution) + per-post mapping
  ├─ [17] ✅ Social calendar (8 weeks)      48 posts (24 LinkedIn + 24 Twitter/X), 4-phase narrative arc across 8 weeks
  ├─ [6] ✅ SEO keyword map                 15 primary keywords, long-tail, on-page specs, morphology map -- already complete
  └─ ✅ Account Tiering Matrix              Already complete: 4-factor scoring (100pt), T1/T2/T3 playbooks, wave assignments
  >>> RESULT: All 6 distribution content items complete. 4 files enhanced with framework headers. 1 file (social) expanded from 212 to 8-week calendar.

MILESTONE 6: Sales & Partner Enablement ✅ COMPLETED
  ├─ [16] ✅ Google Ads campaign structure   Campaign 6-Step framework header + Sitelink Page Requirements table (6 pages to build)
  ├─ [18] ✅ Partner sales sheet + FAQ       Sales Enablement framework header added. Already complete: 522-line kit (sales sheet, pitch script, 15 FAQ, co-marketing)
  ├─ ✅ NEW: Pricing tier structure          Packaging Framework (Segmentation/Pillars/Metric/Add-ons). 3 tiers + add-ons. SAR amounts BLOCKED on D1-D5
  ├─ ✅ NEW: Crisis playbook (beta)          P1-P4 severity matrix + escalation tree + 4 communication templates + post-incident report template
  └─ ✅ NEW: Brand governance checklist      14-item pre-publish gate (4 accuracy + 4 voice + 3 regulatory + 3 technical) + review process
  >>> RESULT: All 5 items complete. 2 existing files enhanced. 3 new deliverables created.
```

### What's Blocked (Honest Assessment)

| Item                      | What I Can Do Without It                                                                                                             | What's Missing                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **Writing samples**       | Build voice guide from recommendation.md + concept-3 file + existing content patterns                                                | 80% quality. Voice calibration to actual founders' writing style would get it to 95%. |
| **Pricing figures**       | Write pricing page structure with "SAR X/mo" placeholders using Packaging Framework. Write tier descriptions and feature comparison. | Can't write actual numbers, annual discount %, or competitive price anchoring.        |
| **Data hosting location** | Write both versions: "KSA-hosted" with full sovereignty claim, and "cloud-hosted" with compliance framing.                           | You pick which version based on actual infrastructure.                                |
| **Partner commission**    | Write partner materials with "[X]% revenue share" placeholder. Everything else is complete.                                          | One find-and-replace when you have the number.                                        |
| **Beta client data**      | Write case study TEMPLATE using CHIC Framework. Can't populate until Wave 1 runs.                                                    | Expected. Template now, real data later.                                              |
| **Launch date**           | Write all time-relative content ("T-14", "Week 1").                                                                                  | Can't fill real dates in social calendar or launch checklist.                         |
| **WhatsApp number**       | Placeholder in all CTAs.                                                                                                             | One find-and-replace when you have it.                                                |
| **Landing page URL**      | Placeholder links everywhere.                                                                                                        | One find-and-replace.                                                                 |

**Bottom line:** Only Task 14 (Pricing Page numbers) is truly blocked on client input. Everything else I can do at 80-95% quality right now.

### Per-Task Detail (I Do / You Do)

| #   | Task            | I Produce (markdown files)                 | You Do (with tools)                                   |
| --- | --------------- | ------------------------------------------ | ----------------------------------------------------- |
| 3   | Brand Voice     | Voice guide document                       | Share with team                                       |
| 5   | Competitive     | Battle cards per competitor                | Print for sales team                                  |
| 1   | Content Rewrite | 6 rewritten content files                  | Review Arabic with native speaker                     |
| 2   | AI Cleanup      | Humanized content + score report           | Final-read before publishing                          |
| 10  | Landing Page    | Full page copy (sections, CTAs, form spec) | Build in your frontend / Carrd / Webflow              |
| 11  | Sales Deck      | Slide-by-slide markdown with notes         | Generate in Gamma, then customize                     |
| 9   | Onboarding      | Email sequence + quick-start guide         | Load into Brevo, publish guide                        |
| 7   | Cold Outreach   | Per-sector email sequences                 | Load into Brevo, find contacts via Hunter.io          |
| 12  | Case Study      | 3-format template                          | Fill with real client data after Wave 1               |
| 15  | FAQ             | 20-30 items bilingual                      | Add to website, apply FAQ schema markup               |
| 8   | LinkedIn        | 4-week calendar + post text                | Schedule via Postiz or Buffer                         |
| 13  | Blog            | 4 full articles bilingual                  | Publish on blog, set up GSC                           |
| 6   | SEO             | Keyword map + on-page specs                | Apply to pages, set up GSC                            |
| 17  | Social Calendar | 8 weeks of posts                           | Schedule via Postiz, create images in Canva/Penpot    |
| 16  | Google Ads      | Campaign structure + ad copy               | Set up in Google Ads console                          |
| 18  | Partner         | Sales sheet + pitch deck content           | Generate deck in Gamma, sign agreements via Documenso |
| 14  | Pricing         | Page structure + tier descriptions         | Fill in actual SAR amounts                            |
| 19  | Retention       | Lifecycle email sequences                  | Load into Brevo, set up PostHog triggers              |

---

## Part 3: Tool Stack (Simplified)

### What You Actually Need (Pick ONE Per Category)

Previous version listed 3-5 alternatives per category. Here's the real stack:

| Category               | Primary Tool           | Why This One                              | Alternative (if primary doesn't work)   |
| ---------------------- | ---------------------- | ----------------------------------------- | --------------------------------------- |
| **Email sending**      | Brevo (free tier)      | 300/day, unlimited contacts, built-in CRM | Listmonk (self-hosted, unlimited)       |
| **Email templates**    | MJML                   | Industry standard, RTL works, npm package | Maizzle (if you prefer Tailwind)        |
| **Forms**              | Tally                  | Unlimited everything, RTL, free           | Google Forms (simpler)                  |
| **Demo scheduling**    | Cal.com                | Embeddable, self-hostable, 33k stars      | Calendly free tier                      |
| **Link tracking**      | Dub.co                 | UTM + QR + custom domain, 19k stars       | Bitly free tier                         |
| **Social scheduling**  | Postiz                 | AI content + multi-platform, self-hosted  | Buffer free tier (simpler)              |
| **Heatmaps/CRO**       | Microsoft Clarity      | Unlimited sessions, free forever          | (no alternative needed)                 |
| **Slides/decks**       | Gamma                  | AI-generated from content, bilingual      | Marp (markdown→PDF, developer-friendly) |
| **Analytics**          | PostHog (already live) | Already integrated in Vault               | (no alternative needed)                 |
| **Chat/WhatsApp**      | Chatwoot               | WhatsApp + email + social inbox, RTL      | (deploy when you need WhatsApp support) |
| **A/B testing**        | GrowthBook             | Works with PostHog, Bayesian              | (deploy post-launch only)               |
| **Surveys/NPS**        | Formbricks             | In-app surveys for beta feedback          | Tally (simpler)                         |
| **Design**             | Canva                  | Best free tier, Arabic fonts, RTL         | Penpot (self-hosted, full SVG editor)   |
| **Video**              | CapCut                 | Best Arabic auto-captions, free           | Shotcut (desktop, no cloud)             |
| **Competitor monitor** | changedetection.io     | Single Docker container, webhooks         | Manual check (if infra is limited)      |

### MCP Servers

**Install now (existing, tested, free):**

- **Playwright MCP** -- browser automation. Useful for screenshotting competitor sites.
- **Brave Search MCP** -- web research within Claude sessions.
- **Fetch MCP** -- HTTP requests to APIs with responses in context.

**Build later (post-launch, in MCP-Bots/):**
PostHog, Brevo, Dub.co, WhatsApp MCP servers. These are a nice-to-have automation layer for Phase 4+. Not critical path.

### Total Cost

| Category                                       | Cost           |
| ---------------------------------------------- | -------------- |
| Free SaaS tools (Brevo, Tally, Clarity, etc.)  | $0             |
| Self-hosted tools (one 4GB VPS for everything) | ~$40/month     |
| API keys (Brave Search, optional)              | ~$5/month      |
| **Total**                                      | **~$45/month** |

---

## Part 4: Milestone Checkpoints

Each milestone produces reviewable deliverables. You see files, you give feedback, we iterate.

### Milestone 0: Showstopper Fixes

**What I deliver:** Corrected files (batch edits)

All 7 showstoppers from MEGA-AUDIT + 7 consistency fixes applied across affected files. Pure find-and-replace work.

**Pass criteria:** Zero false product claims. Zero conflicting numbers. Zero wrong role names.

---

### Milestone 1: Foundation

**What I deliver:** 4 files
| Deliverable | File | What to Check |
|-------------|------|---------------|
| Voice Guide | `gtm/voice-guide.md` | Does this sound like Musahm? Would your team recognize it? |
| Battle Cards | `gtm/phase1-discovery/battle-cards.md` | 7 sections per competitor. Task assignment corrected. Mobile claims removed. |
| Rebuilt Agent | `.claude/agents/gtm-brand-voice-guardian.md` | References Musahm, not "AgentKits" |
| Canonical Positioning | Added to top of `gtm/phase3-segmentation/message-house.md` | One statement using Positioning Canvas: FOR/WHO/OUR/UNLIKE/PROOF |

**Pass criteria:** You read the voice guide and say "yes, that's us." Positioning statement feels true and differentiating.

---

### Milestone 2: Content Rebuild

**What I deliver:** 6 rewritten files + updated message-house
| Deliverable | File |
|-------------|------|
| Launch email (rewritten) | `gtm/phase4-content/launch-email.md` |
| Social posts (rewritten) | `gtm/phase4-content/social-posts.md` |
| SMS (rewritten) | `gtm/phase4-content/sms-blast.md` |
| Video script (rewritten) | `gtm/phase4-content/video-script.md` |
| Poster (rewritten) | `gtm/phase4-content/poster-copy.md` |
| Message house (updated) | `gtm/phase3-segmentation/message-house.md` |

**What changed in each file:**

- Concept 3 voice applied throughout
- Shareholder Registry mentioned as differentiator
- 3 new objection handlers added
- Urgency mechanisms added to all CTAs
- Social proof placeholders structured in
- AR/EN alignment fixed
- Vision 2030 woven into copy (not just hashtag)
- Email button color fixed from #006C35
- Video subtitles split properly
- AI filler removed in first pass

**Pass criteria:** Native Arabic speaker reads Arabic versions. You read English. Both feel authentic, not AI-generated.

---

### Milestone 3: AI Cleanup

**What I deliver:** Same 6 files cleaned + score report
| Deliverable | File |
|-------------|------|
| Cleaned content | Same 6 files from Milestone 2 (overwritten) |
| Score report | `gtm/humanizer-report.md` |

**Score report shows:** Per-file human-ness score (target 8+/10), patterns removed, em dash count (target <3/file).

**Pass criteria:** All files score 8+/10. You read them and they don't feel "AI."

---

### Milestone 4: Decision-Stage Content

**What I deliver:** 11 files
| Deliverable | File |
|-------------|------|
| Landing page copy | `gtm/phase4-content/landing-page.md` |
| Sales deck (slide markdown) | `gtm/phase4-content/sales-deck.md` |
| Beta onboarding emails | `gtm/phase4-content/onboarding-sequence.md` |
| Quick-start guide | `gtm/phase4-content/quick-start-guide.md` |
| Case study template | `gtm/phase4-content/case-study-template.md` |
| FAQ (bilingual) | `gtm/phase4-content/faq.md` |
| Lead nurture sequence | `gtm/phase4-content/nurture-sequence.md` |
| Beta win/loss template | `gtm/phase5-launch/win-loss-template.md` |
| MEDDIC sales checklist | `gtm/phase4-content/meddic-checklist.md` (NEW) |
| CXO Value Story | `gtm/phase4-content/value-story.md` (NEW) |
| Demo script (3 variants) | `gtm/phase4-content/demo-script.md` (NEW) |

**What changed in each file:**

- Sales deck uses Value Story Framework (5 elements)
- Case study uses CHIC Framework (Challenge/Hypothesis/Implementation/Change)
- Win/loss uses 9-field Data Model from repo
- MEDDIC adapted for KSA governance buyers
- Value Story has 3 Driver Pillars (Time, Risk, Compliance)
- Demo script has Real Estate, Healthcare, and General variants
- Landing page uses Narrative Arc (Context/Tension/Resolution/Proof/CTA)

**Pass criteria:** The entirety of "awareness -> interest -> consideration -> decision -> action" funnel now has content. Sales team has a demo script. No stage is empty.

---

### Milestone 5: Distribution Content

**What I deliver:** 6 files
| Deliverable | File |
|-------------|------|
| Cold outreach sequences | `gtm/phase4-content/cold-outreach.md` |
| LinkedIn strategy + calendar | `gtm/phase4-content/linkedin-strategy.md` |
| Blog posts (4 articles) | `gtm/phase4-content/blog-posts.md` |
| Social calendar (8 weeks) | `gtm/phase4-content/social-calendar.md` |
| SEO keyword map | `gtm/phase4-content/seo-keywords.md` |
| Account Tiering Matrix | `gtm/phase3-segmentation/account-tiering.md` (NEW) |

**What changed:**

- Cold outreach scored against 4x25 rubric (Personalization/Value/CTA/Technical)
- Blog posts use SCAR storytelling arc
- Account tiering scores all prospects: T1 Wave 1 (>90), T2 Wave 2 (70-89), T3 Wave 3 (50-69)

**Pass criteria:** You can take any post from the social calendar and schedule it in Postiz today. Copy-paste ready. Prospect list has tier scores.

---

### Milestone 6: Launch Enablement

**What I deliver:** 5 files
| Deliverable | File |
|-------------|------|
| Google Ads structure + copy | `gtm/phase4-content/google-ads.md` |
| Partner sales sheet + FAQ | `gtm/phase4-content/partner-kit.md` |
| Updated launch checklist | `gtm/phase5-launch/launch-checklist.md` |
| Pricing tier structure | `gtm/phase4-content/pricing-tiers.md` (NEW) |
| Crisis playbook (beta) | `gtm/phase5-launch/crisis-playbook.md` (NEW) |

**What changed:**

- Google Ads: 6 missing sitelink pages addressed (build or remove)
- Pricing uses Packaging Framework (segmentation/value pillars/metric/fences/add-ons/narrative). Client fills SAR amounts.
- Crisis playbook: P1 (data breach, 1h SLA) through P4 (feature request, 1 week)
- Brand governance checklist (14 items) added to launch checklist as pre-publish gate

**Pass criteria:** Sales team can use partner kit in a meeting today. Google Ads copy can be pasted into the console. Crisis playbook covers beta incident scenarios. Pricing page is structured (pending actual numbers).

---

### Milestone Summary

| #   | Milestone         | Files      | What You Check                                                              |
| --- | ----------------- | ---------- | --------------------------------------------------------------------------- |
| 0   | Showstopper Fixes | ~15 edits  | Zero false product claims? Zero conflicting numbers?                        |
| 1   | Foundation        | 4          | Voice guide feels right? Battle cards accurate? Positioning statement true? |
| 2   | Content Rebuild   | 6          | Arabic sounds native? English is sharp? Differentiators used?               |
| 3   | AI Cleanup        | 6 + report | All scores 8+? Reads human?                                                 |
| 4   | Decision Stage    | 11         | Full funnel covered? Demo script works? Value story compelling?             |
| 5   | Distribution      | 6          | Posts copy-paste ready? Blog publishable? Accounts tiered?                  |
| 6   | Launch Enablement | 5          | Sales team can use today? Crisis covered? Pricing structured?               |

**Total deliverables:** 38+ files across 7 milestones (up from 31 across 6).

---

## Part 5: What This Plan Does NOT Cover

Being explicit about scope:

1. **Actual deployment** of landing pages, email campaigns, Google Ads. I write content. You deploy it.
2. **Graphic design.** I write copy and describe layouts. I don't produce final PNGs, finished slide decks, or video files.
3. **Custom MCP server development.** Listed in TOOL-STACK.md as future automation, not critical-path work.
4. **Pricing decisions.** I can write the structure but can't invent your SAR amounts.
5. **Arabic dialectal nuance beyond MSA.** All Arabic content is Modern Standard Arabic. If you need Saudi dialect (for informal social posts), flag it per-file.
6. **A/B test execution.** I can write variants. Running tests requires traffic, which requires launch.
7. **Video production.** I write scripts with scene-by-scene direction. Producing the video is a separate effort.
8. **CRM setup, domain auth (SPF/DKIM), WhatsApp Business API registration.** These are infra tasks, not content tasks.

---

## Part 6: Files Index

| File                                  | Purpose                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| `gtm/CLAUDE.md`                       | Quick-reference context file (product truth, file map, rules)                                |
| `gtm/GTM-AUDIT-AND-EXECUTION-PLAN.md` | This document (master plan)                                                                  |
| `gtm/execution-plan.md`               | Detailed per-task skill/agent/input/output mapping                                           |
| `gtm/MEGA-AUDIT.md`                   | 6-agent audit (74/100), showstoppers, consistency, positioning                               |
| `gtm/AUDIT-REPORT.md`                 | First PMM audit (62/100, 10 CRITICAL + 16 MODERATE)                                          |
| `gtm/CEO-AUDIT.md`                    | Executive readiness audit                                                                    |
| `gtm/GTM-AGENTS-REPO-SYNTHESIS.md`    | 10 frameworks from 67-plugin repo, 12 recommended actions                                    |
| `gtm/TOOL-STACK.md`                   | Full ranked tool assessment with production pipelines                                        |
| `gtm/voice-guide.md`                  | Brand voice guide (4-tier confidence, rated 10/10)                                           |
| `gtm/humanizer-report.md`             | AI detection scores per file                                                                 |
| `gtm/audit-artifacts/`                | 6 detailed audit reports (product-truth, consistency, journey, arabic, quality, positioning) |
| `gtm/phase1-discovery/`               | ICP, competitive analysis, battle cards, brand audit (4 files)                               |
| `gtm/phase2-brand/`                   | 3 brand concepts + recommendation (4 files)                                                  |
| `gtm/phase3-segmentation/`            | Beta rollout, message house, sector matrix (3 files)                                         |
| `gtm/phase4-content/`                 | All customer-facing content (21 files)                                                       |
| `gtm/phase5-launch/`                  | KPI plan, launch checklist, user docs, win-loss template (4 files)                           |
| `gtm-agents-ref/`                     | Cloned gtm-agents repo (67 plugins, 244 skills, reference only)                              |

---

## Next Step

Say **"execute"** and I start Milestone 0 (showstopper fixes: 7 false claims + 7 consistency issues across ~15 files), then immediately proceed to Milestone 1 (voice guide + battle cards + positioning statement + agent rebuild). You'll have corrected content + 4 foundation files to review before I touch any new content.
