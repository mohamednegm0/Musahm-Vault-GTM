# Quality & AI-Detection Audit: Musahm Vault GTM Content

> **Audit date:** 2026-04-02
> **Auditor role:** Expert editor specializing in AI-generated content detection
> **Scope:** All 20 customer-facing files across phase4-content and phase5-launch
> **Reference:** `gtm/voice-guide.md` (brand voice, signature constructions, banned vocabulary)
> **Method:** Automated pattern search (grep for em dashes, en dashes, AI vocabulary, banned Arabic phrases, "Not X but Y" constructions) + manual line-by-line review of all 20 files

---

## Audit Criteria

### 12 AI-Writing Signal Categories

| # | Signal | Threshold |
|---|--------|-----------|
| 1 | Em dashes (U+2014: —) | Must be ZERO |
| 2 | En dashes (U+2013: –) used as em dashes | Must be ZERO (range usage is acceptable) |
| 3 | "Not X, but Y" constructions | Flag if >2 per file or >10 total |
| 4 | Rule of Three (rhetorical triads) | Flag if used as a default pattern |
| 5 | Inflated symbolism | Flag any instances |
| 6 | AI vocabulary (29-word watchlist) | Must be ZERO in customer-facing text |
| 7 | Passive voice overuse | Flag if >20% of sentences |
| 8 | Filler phrases | Flag any instances |
| 9 | Promotional language | Flag if excessive for the content type |
| 10 | Vague attributions | Flag any instances |
| 11 | Over-hedging | Flag if excessive |
| 12 | Repetitive sentence structures | Flag if >3 consecutive parallel openings |

### AI Vocabulary Watchlist (29 words)

leverage, delve, robust, seamless, cutting-edge, innovative, holistic, comprehensive, streamline, empower, foster, pivotal, landscape, paradigm, synergy, utilize, facilitate, harness, elevate, curate, navigate, realm, unleash, tapestry, beacon, cornerstone, embark, spearhead, multifaceted

### 5 Banned Arabic Phrases

| Phrase | Translation |
|--------|-------------|
| هل تعبت من | "Are you tired of" |
| في عالم يتغير | "In a changing world" |
| الحل الأمثل | "The optimal solution" |
| بكل فخر | "With all pride" |
| #رؤية2030 (standalone hashtag) | "#Vision2030" without substantive context |

---

## Global Findings (All 20 Files)

### Em Dashes (U+2014: —): ZERO across all 20 files

Grep search for the em dash character (—) returned **zero matches** across every file in `phase4-content/` and `phase5-launch/`. This is a perfect score on the single most detectable AI-writing signal. The content consistently uses commas, double hyphens (--), or sentence restructuring instead.

### En Dashes (U+2013: –): Correct Range Usage Only

En dashes appear in exactly 2 of 20 files, used exclusively for numeric/time ranges (correct typographic usage):

- **video-script.md**: 20+ instances for timecodes (0:00–0:18, 0:42–0:46) and numeric ranges (3–6 seconds, 120–130 WPM). All correct.
- **vault-user-docs.md**: 2 instances for numeric ranges (levels 1–5 at line 43, Sections 4–12 at line 275). Both correct.

No en dashes are used as em dash substitutes anywhere. **No violations.**

### AI Vocabulary: ZERO Violations in Customer-Facing Text

Grep for all 29 watchlist words across phase4-content and phase5-launch returned:

| File | Word | Line | Context | Verdict |
|------|------|------|---------|---------|
| poster-copy.md | landscape | 41 | "LinkedIn/Twitter landscape" (image format name) | Not a violation -- literal format term |
| sales-deck.md | landscape | 276 | "competitive landscape" (speaker notes, internal) | Not a violation -- standard business term in internal notes |
| linkedin-strategy.md | landscape | 81 | "compliance landscape" (editorial direction, internal) | Not a violation -- internal description |
| partner-kit.md | leverage | 414 | Listed in BANNED terms (meta-reference) | Not a violation -- banning the word, not using it |
| blog-posts.md | leverage, streamline, holistic, robust, seamless | 827 | Self-audit note confirming absence | Not a violation -- audit metadata |
| vault-user-docs.md | navigate | 15, 84, 168, 211 | "Navigate to the workspace" (UI instruction) | Not a violation -- standard UI instruction verb |

**Effective violations: ZERO.** Every hit is either a literal/technical term, an internal editorial note, or a meta-reference to the banned word itself.

### Banned Arabic Phrases: 1 Violation

| Phrase | Occurrences | Files |
|--------|-------------|-------|
| هل تعبت من | 0 | -- |
| في عالم يتغير | 0 | -- |
| الحل الأمثل | 0 | -- |
| بكل فخر | 0 | -- |
| #رؤية2030 (standalone) | **1** | linkedin-strategy.md line 615 |

The single violation is in `linkedin-strategy.md` line 615, where `#رؤية2030` appears as a standalone hashtag in a post's hashtag block. The post body (lines 605-613) does use Vision 2030 with substantive regulatory context, but the hashtag line itself violates the voice guide's Anti-Pattern #6 ("Hollow Vision 2030 Drop"). The social-posts.md file (line 221) explicitly documents removing this exact pattern, confirming the standard was known.

### "Not X, but Y" Constructions: 11 Instances Across 5 Files

**Important context:** The voice guide prescribes "Contrast Declaration" as one of five signature constructions, defining it as the "Not X, but Y" pattern. Its presence is partially intentional. However, concentration and repetition still trigger AI detection.

| File | Line | Text |
|------|------|------|
| blog-posts.md | 168 | "Not at the folder level only, but per individual document." |
| blog-posts.md | 550 | "Not because the company distrusts its employees, but because chain of custody is a regulatory requirement." |
| blog-posts.md | 802 | "Not because a penalty is coming tomorrow, but because a company with a governed registry..." |
| sales-deck.md | 50 | "Not because the document does not exist, but because no one knows where it is" |
| sales-deck.md | 332 | "the platform works across sectors, not just in one niche" |
| linkedin-strategy.md | 218 | "Not for marketing reasons, but because the primary Musahm user is a board secretary" |
| linkedin-strategy.md | 228 | "Not just because it is Arabic, but because it understands the context" |
| linkedin-strategy.md | 611 | "does not just store, but governs" |
| nurture-sequence.md | 77 | "You are not the first, but you should not be the last" |
| press-release.md | 141 | "It is not a storage system with permissions added on." |
| landing-page.md | 84-87 | "We did not wait for a foreign solution. We built Vault from scratch" |

11 total instances across 5 files. blog-posts.md has 3 instances across ~800 lines (moderate density). linkedin-strategy.md has 3 instances across ~800 lines (moderate density). The pattern is well-executed in each case but its prevalence is a detectable AI signal.

### Rule of Three (Triple Beat): 6 Notable Instances

The voice guide prescribes "Triple Beat" as a signature construction. Instances found:

| File | Line(s) | Text |
|------|---------|------|
| sales-deck.md | 45-46 | "لا إصدار محدد. لا سلسلة حفظ. لا مرجع موثوق." / "No version control. No chain of custody. No single source of truth." |
| blog-posts.md | 100-106 | Three cost types: Time cost, Reputation cost, Risk cost |
| linkedin-strategy.md | 298-300 | Triple storage-vs-governance parallel: "Storage keeps... Governance knows / Storage puts... Governance links / Storage allows... Governance protects" |
| linkedin-strategy.md | 611 | "One that knows... One that prevents... And one that proves..." (anaphora triad) |
| press-release.md | 119 | Subheadline groups three items: "six governed workspaces, a complete audit trail, and direct Shareholder Registry integration" |
| landing-page.md | 202-205 | "Three steps. No complicated setup." (literal 3-step process) |

The landing-page instance describes an actual 3-step process and is not a rhetorical flourish. The linkedin-strategy.md line 611 instance is the most AI-detectable due to the "One that..." anaphora pattern.

---

## Per-File Audit

### File 1: launch-email.md

**Path:** `gtm/phase4-content/launch-email.md` (125 lines)
**Type:** Beta launch email for existing Musahm clients

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% -- active, direct writing |
| Filler phrases | 0 |
| Promotional language | Appropriate for launch email (beta urgency is calibrated) |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | 0 |
| Banned Arabic | 0 |

**AI Detection Score: 9/10** -- Reads as human-authored. No detectable AI signals. Natural conversational tone appropriate for client communication.

**Writing Quality Score: 8/10** -- Concise, bilingual, purpose-driven. Clear CTA. Tone matches existing client relationship.

**Issues:** None.

---

### File 2: sms-blast.md

**Path:** `gtm/phase4-content/sms-blast.md` (110 lines)
**Type:** 4 SMS variants with encoding-aware constraints

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <5% -- SMS format demands active voice |
| Filler phrases | 0 |
| Promotional language | Minimal, appropriate for SMS |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | 0 |
| Banned Arabic | 0 |

**AI Detection Score: 9/10** -- Extremely clean. The GSM-7 encoding awareness and character-count precision demonstrate human authorial knowledge. No AI signals.

**Writing Quality Score: 9/10** -- Technically precise (encoding notes, character counting, A/B variant strategy). Concise. Production-ready.

**Issues:** None.

---

### File 3: video-script.md

**Path:** `gtm/phase4-content/video-script.md` (143 lines)
**Type:** ~78-second product video script with scene-by-scene breakdown

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 (all ~20 instances are proper timecode/range notation) |
| "Not X, but Y" | 0 |
| Rule of Three | 0 (Scene 4 has four features, not three) |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% |
| Filler phrases | 0 |
| Promotional language | Moderate -- expected for product video |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | 0 |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- Clean script. The self-aware production notes (line 124: "Em dash budget: Max 2 per scene"; line 142: "AI pattern: 'Simple. Powerful. Complete.' removed from Scene 5") are transparent about AI pattern mitigation, which a sophisticated reader could interpret as evidence the content was AI-generated and then cleaned.

**Writing Quality Score: 9/10** -- Excellent production document with precise WPM calculations, scene timing, word counts, and subtitle card rules.

**Issues:**
- Line 124: Meta-note about em dash budget exposes the AI-mitigation process. **Recommendation:** Remove or move to a separate editorial notes file if the script will be shared with production vendors.

---

### File 4: social-posts.md

**Path:** `gtm/phase4-content/social-posts.md` (228 lines)
**Type:** LinkedIn and Twitter/X post variants

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% |
| Filler phrases | 0 |
| Promotional language | Appropriate for social media |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Parallel structure across variants (by design) |
| Banned Arabic | 0 (self-audit at lines 212-223 confirms #رؤية2030 removed) |

**AI Detection Score: 8/10** -- Clean social copy. The self-audit log (lines 212-223) is thorough but, like the video-script notes, exposes the AI-cleaning process.

**Writing Quality Score: 8/10** -- Good variant diversity. Bilingual. Clear hashtag strategy.

**Issues:**
- Lines 212-223: Audit Fix Log exposes AI pattern mitigation. **Recommendation:** Move audit trail to a separate editorial metadata file.

---

### File 5: poster-copy.md

**Path:** `gtm/phase4-content/poster-copy.md` (56 lines)
**Type:** Visual ad copy with strict word-count constraints

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 ("landscape" at line 41 is image format term) |
| Passive voice | N/A -- too minimal for percentage analysis |
| Filler phrases | 0 |
| Promotional language | Minimal -- visual ad format constrains copy |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | 0 |
| Banned Arabic | 0 |

**AI Detection Score: 9/10** -- Extremely concise copy leaves minimal surface area for AI detection. Natural.

**Writing Quality Score: 8/10** -- Effective within word-count constraints. Clear format specifications.

**Issues:** None.

---

### File 6: landing-page.md

**Path:** `gtm/phase4-content/landing-page.md` (405 lines)
**Type:** Full landing page copy with 8 sections + design specifications

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 1 (lines 84-87: "We did not wait for a foreign solution. We built Vault from scratch") |
| Rule of Three | 1 mild (line 18: "Protected, governed, and connected"); 1 structural (lines 202-205: three literal steps) |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <15% |
| Filler phrases | 0 |
| Promotional language | Moderate -- appropriate for landing page. "Saudi-grade protection" is brand-aligned. Beta urgency is calibrated. |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Feature blocks follow consistent format (icon + bold headline + description), but this is by UI design |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- Well-crafted landing page. The "three steps" section is a literal process description, not a rhetorical flourish. The "protected, governed, and connected" triple adjective is a minor AI signal.

**Writing Quality Score: 9/10** -- Excellent. Includes detailed design specs (colors, layout, RTL behavior, typography, responsiveness, accessibility). Production-ready for frontend team.

**Issues:**
- Line 18: "Protected, governed, and connected" -- triple adjective list. Minor AI signal. **Recommendation:** Consider restructuring to break the triad, e.g., "Governed and connected to the Musahm platform you already use. Protected by Saudi-grade permissions."

---

### File 7: quick-start-guide.md

**Path:** `gtm/phase4-content/quick-start-guide.md` (182 lines)
**Type:** 7-step bilingual onboarding guide

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 (steps go to 7, permission table has 5 rows, workspaces table has 6 rows) |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% -- imperative/instructional mood dominates |
| Filler phrases | 0 |
| Promotional language | Very low |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Step format is parallel but appropriate for instructional content |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- Clean instructional writing. The consistent bilingual AR/EN structure could flag as systematic but is appropriate for the audience.

**Writing Quality Score: 8/10** -- Effective for the target audience (first-time Vault users). Clear tables, numbered steps, bilingual callouts.

**Issues:** None.

---

### File 8: press-release.md

**Path:** `gtm/phase4-content/press-release.md` (255 lines)
**Type:** Bilingual press release with distribution strategy

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 1 (line 141: "It is not a storage system with permissions added on. It is governed from the ground up.") |
| Rule of Three | 1 mild (line 119: subheadline groups three items) |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | ~15% -- moderate, expected for PR format |
| Filler phrases | 0 |
| Promotional language | Moderate -- expected and appropriate for press release format |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Feature list sections use parallel structure, appropriate for PR |
| Banned Arabic | 0 |

**AI Detection Score: 7/10** -- The "Not X, but Y" construction at line 141 and the triadic subheadline are mild AI signals. The PR format itself is somewhat formulaic, which is a genre expectation rather than an AI tell.

**Writing Quality Score: 8/10** -- Well-structured bilingual PR with thorough distribution strategy, embargo terms, and timing plan.

**Issues:**
- Line 141: "Not a storage system with permissions added on" -- Contrast Declaration. The voice guide prescribes this pattern, but it reads as AI-typical in a press release context. **Recommendation:** Rephrase: "Vault is governed from the ground up. Permissions, audit trails, and workflows are structural, not afterthoughts."
- Line 119: Subheadline contains a triadic structure. Minor. No action needed.

---

### File 9: sales-deck.md

**Path:** `gtm/phase4-content/sales-deck.md` (474 lines)
**Type:** 15-slide bilingual sales deck with speaker notes

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 2 (line 50: "Not because the document does not exist, but because..."; line 332: "across sectors, not just in one niche") |
| Rule of Three | 1 (lines 45-46: "No version control. No chain of custody. No single source of truth." -- anaphoric triad) |
| Inflated symbolism | 0 |
| AI vocabulary | 1 borderline: "competitive landscape" at line 276, but in internal speaker notes using standard business terminology |
| Passive voice | <15% |
| Filler phrases | 0 |
| Promotional language | Moderate -- appropriate for sales deck |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Slide format creates inherent parallelism |
| Banned Arabic | 0 |

**AI Detection Score: 7/10** -- The "Not X, but Y" pattern appears twice, and the "No X. No Y. No Z." anaphoric triad at line 45-46 is a recognizable AI construction. The double hyphens at lines 162 and 241 are human-like (AI prefers em dashes). Speaker notes read naturally.

**Writing Quality Score: 8/10** -- Comprehensive 15-slide structure with detailed speaker notes, visual direction, and persona mapping per slide.

**Issues:**
- Lines 45-46: "لا إصدار محدد. لا سلسلة حفظ. لا مرجع موثوق." -- Triple anaphoric "No X" is a strong AI signal. **Recommendation:** Restructure as a pair + elaboration: "No version control and no chain of custody. When someone asks which version is current, the honest answer is: we do not know."
- Line 50: "Not because the document does not exist, but because no one knows where it is" -- Contrast Declaration. Acceptable per voice guide, but appears in a dense cluster with the Rule of Three above.
- Line 276: "competitive landscape" -- standard business term in speaker notes. No action needed, but flag for awareness.

---

### File 10: faq.md

**Path:** `gtm/phase4-content/faq.md` (379 lines)
**Type:** 28 bilingual FAQ items in 6 categories

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% -- direct Q&A format |
| Filler phrases | 0 |
| Promotional language | Very low -- factual answers |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Q&A format is inherently parallel; appropriate for genre |
| Banned Arabic | 0 |

**AI Detection Score: 9/10** -- Excellent. Q&A format naturally avoids AI patterns. Answers are specific and factual.

**Writing Quality Score: 8/10** -- Comprehensive coverage of 28 questions. Schema.org markup recommendation included. Categories are well-organized.

**Issues:** None.

---

### File 11: onboarding-sequence.md

**Path:** `gtm/phase4-content/onboarding-sequence.md` (419 lines)
**Type:** 5-email onboarding sequence over 14 days

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% |
| Filler phrases | 0 |
| Promotional language | Low -- instructional |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Email sequence uses consistent format (subject + preheader + body + CTA) |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- Clean instructional email copy. No AI signals detected.

**Writing Quality Score: 8/10** -- Well-structured 14-day progression. Clear goals per email. Bilingual.

**Issues:**
- Line 173: Viewer role described as "لا تعديل ولا تحميل" (no editing or downloading). Per the codebase (`ConstRoles.cs`), Viewers CAN download. This is a factual accuracy issue, not an AI-detection issue. **Recommendation:** Correct to: "لا تعديل" (no editing) and remove the download restriction claim.

---

### File 12: nurture-sequence.md

**Path:** `gtm/phase4-content/nurture-sequence.md` (302 lines)
**Type:** 4-email nurture sequence over 21 days for inactive sign-ups

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 1 (line 77: "You are not the first, but you should not be the last") |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% |
| Filler phrases | 0 |
| Promotional language | Low -- measured urgency escalation |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | 0 |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- The single "Not X, but Y" instance at line 77 is a minor signal. Otherwise clean.

**Writing Quality Score: 8/10** -- Well-calibrated urgency progression. Line 283's editorial note ("The sequence never begs. It never uses exclamation marks.") shows deliberate voice discipline.

**Issues:**
- Line 77: "You are not the first, but you should not be the last" -- Contrast Declaration. Acceptable per voice guide. No action required.

---

### File 13: cold-outreach.md

**Path:** `gtm/phase4-content/cold-outreach.md` (638 lines)
**Type:** 4 sector-specific outreach sequences, 4 touchpoints each

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% |
| Filler phrases | 0 |
| Promotional language | Moderate -- outreach is inherently promotional, but tone is calibrated |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | 4 sector sequences follow identical 4-touchpoint cadence (by design) |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- Clean outreach copy. Sector-specific customization (real estate, healthcare, education, family holdings) adds human specificity.

**Writing Quality Score: 8/10** -- Thorough sector coverage with tailored pain points per vertical. WhatsApp message variants included.

**Issues:** None.

---

### File 14: blog-posts.md

**Path:** `gtm/phase4-content/blog-posts.md` (831 lines)
**Type:** 4 bilingual blog posts (educational + thought leadership)

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 3 (line 168, 550, 802) |
| Rule of Three | 1 (lines 100-106 / 182-186: Three cost types -- Time, Reputation, Risk) |
| Inflated symbolism | 0 |
| AI vocabulary | 0 (self-audit at line 827 confirms zero prohibited vocabulary) |
| Passive voice | ~15% -- educational writing style permits slightly more passive |
| Filler phrases | 0 |
| Promotional language | Low -- product mention only in final paragraph of each post |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Each post follows problem-education-solution-CTA arc |
| Banned Arabic | 0 |

**AI Detection Score: 7/10** -- Three "Not X, but Y" constructions across 831 lines is the highest concentration in the corpus. Combined with the Rule of Three cost-type pattern, this file has the most AI-detectable writing among the 20 files. However, each instance is well-executed and serves the argument.

**Writing Quality Score: 9/10** -- Excellent educational content. Strong SEO structure with meta descriptions, schema.org markup, internal links, and header images. Four distinct blog posts covering different angles of the same product category.

**Issues:**
- Line 168: "Not at the folder level only, but per individual document." **Recommendation:** Rephrase: "Access control operates at the individual document level, not just at the folder level."
- Line 550: "Not because the company distrusts its employees, but because chain of custody is a regulatory requirement." **Recommendation:** Rephrase: "Chain of custody is a regulatory requirement. The audit trail exists to satisfy that requirement."
- Line 802: "Not because a penalty is coming tomorrow, but because..." **Recommendation:** Rephrase: "The reason is not regulatory pressure. The reason is competitive positioning."
- Lines 100-106: Three cost types (Time, Reputation, Risk) form a Rule of Three. This is a prescribed "Triple Beat" per the voice guide. Acceptable, but consider adding a fourth cost type (e.g., "Legal cost") to break the pattern.

---

### File 15: social-calendar.md

**Path:** `gtm/phase4-content/social-calendar.md` (1226 lines)
**Type:** 8-week social media calendar with 48 posts (24 LinkedIn + 24 Twitter/X)

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <10% -- social writing is direct |
| Filler phrases | 0 |
| Promotional language | Moderate -- launch-phase posts have appropriate promotional content |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Week-to-week template is parallel (by design for calendar format) |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- Clean social content across 48 posts. The phase progression (pre-launch, launch, post-launch, nurture) is well-calibrated.

**Writing Quality Score: 8/10** -- Thorough 8-week calendar with clear posting schedule, platform-specific variants, and phase-appropriate energy levels.

**Issues:**
- Lines 624, 1046: PLACEHOLDER markers requiring real beta data. Not an AI issue, but a completeness issue. **Recommendation:** Flag for client input before publishing.

---

### File 16: google-ads.md

**Path:** `gtm/phase4-content/google-ads.md` (774 lines)
**Type:** 4 Google Ads campaigns with RSAs, keywords, negative keywords, and extensions

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 (headlines constrained by character limits) |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <5% -- ad copy demands active voice |
| Filler phrases | 0 |
| Promotional language | Expected -- ads are inherently promotional |
| Vague attributions | 1 (line 334: "95% of Saudi companies" claim needs verification) |
| Over-hedging | 0 |
| Repetitive structures | RSA format requires 15 headline + 4 description variants per ad, creating inherent repetition |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- Clean ad copy. Character-limit constraints naturally prevent AI patterns.

**Writing Quality Score: 8/10** -- Comprehensive campaign structure. Strong negative keyword lists. Bid strategy rationale. The unverified "95%" claim at line 334 is already flagged with a warning.

**Issues:**
- Line 334: "مساهم تخدم 95% من الشركات السعودية" -- statistical claim flagged as NEEDS VERIFICATION. Google Ads policy requires substantiation for statistical claims. **Recommendation:** Either verify with a credible source or replace with a non-quantitative statement: "مساهم تخدم الشركات السعودية بأنواعها: مدرجة وغير مدرجة ومحدودة."

---

### File 17: linkedin-strategy.md

**Path:** `gtm/phase4-content/linkedin-strategy.md` (794 lines)
**Type:** LinkedIn page optimization + 4 content pillars + 4-week content calendar

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 3 (lines 218, 228, 611) |
| Rule of Three | 2 (lines 298-300: triple storage-vs-governance parallel; line 611: "One that... One that... And one that...") |
| Inflated symbolism | 0 |
| AI vocabulary | 1 borderline: "compliance landscape" at line 81 (internal editorial direction) |
| Passive voice | <15% |
| Filler phrases | 0 |
| Promotional language | Moderate -- strategic document includes some promotional posts |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Post format creates some parallelism |
| Banned Arabic | **1 VIOLATION** (line 615: #رؤية2030 as standalone hashtag) |

**AI Detection Score: 7/10** -- The highest concentration of AI-detectable patterns among all files. Three "Not X, but Y" constructions, two Rule of Three instances, and one banned hashtag violation. The anaphoric "One that... One that... And one that..." at line 611 is particularly AI-detectable.

**Writing Quality Score: 8/10** -- Comprehensive LinkedIn strategy with thorough page optimization, content pillars, and posting schedule. The content itself is strong despite the pattern issues.

**Issues:**
- **Line 615: #رؤية2030 as standalone hashtag -- VIOLATION.** The post body (lines 605-613) provides substantive Vision 2030 context, but the hashtag line uses #رؤية2030 as a standalone tag, violating Anti-Pattern #6. **Recommendation:** Remove #رؤية2030 from the hashtag line. The substantive discussion in the body is sufficient. Replace with #حوكمة_الوثائق or #امتثال.
- Lines 298-300: Triple parallel comparison (Storage keeps/Governance knows). Strong AI signal. **Recommendation:** Convert to two pairs instead of three: "Storage keeps a file. Governance knows who accessed it, when, and why. Storage allows anyone to delete. Governance protects the document with permissions and a full audit trail."
- Line 611: "One that knows... One that prevents... And one that proves..." -- Strong anaphoric triad. **Recommendation:** Restructure: "One that knows who accessed which document, prevents unauthorized sharing, and proves chain of custody on demand."

---

### File 18: partner-kit.md

**Path:** `gtm/phase4-content/partner-kit.md` (522 lines)
**Type:** Partner enablement kit: sales sheet, pitch script, 15 FAQs, co-marketing guidelines

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 (five selling points, 15 FAQs, 5-section pitch) |
| Inflated symbolism | 0 |
| AI vocabulary | 0 ("leverage" at line 414 is in BANNED list, meta-reference) |
| Passive voice | <10% |
| Filler phrases | 0 |
| Promotional language | Moderate -- appropriate for partner enablement |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | FAQ and selling point formats create parallelism (appropriate for genre) |
| Banned Arabic | 0 |

**AI Detection Score: 8/10** -- Clean. The five selling points avoid the Rule of Three. The pitch script reads naturally.

**Writing Quality Score: 8/10** -- Comprehensive partner kit. The co-marketing guidelines (line 414+) explicitly ban AI vocabulary, showing brand voice awareness.

**Issues:** None.

---

### File 19: whatsapp-library.md

**Path:** `gtm/phase4-content/whatsapp-library.md` (498 lines)
**Type:** WhatsApp message library (beta invitations, follow-ups, sector openers, objection handlers)

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 |
| Passive voice | <5% -- WhatsApp conversational tone is inherently active |
| Filler phrases | 0 |
| Promotional language | Low -- direct, personal |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Message variants follow templates (appropriate for library format) |
| Banned Arabic | 0 |

**AI Detection Score: 9/10** -- Excellent. WhatsApp messages have the most natural, human-sounding tone in the corpus. Conversational brevity naturally avoids AI patterns.

**Writing Quality Score: 8/10** -- Well-organized with clear usage guidance per variant. Character-limit awareness for WhatsApp Business API.

**Issues:** None.

---

### File 20: vault-user-docs.md

**Path:** `gtm/phase5-launch/vault-user-docs.md` (276 lines)
**Type:** Technical user documentation derived from Vault codebase

| Category | Finding |
|----------|---------|
| Em dashes | 0 |
| En dashes as em dashes | 0 (2 instances are proper numeric ranges) |
| "Not X, but Y" | 0 |
| Rule of Three | 0 |
| Inflated symbolism | 0 |
| AI vocabulary | 0 ("Navigate" at lines 15, 84, 168, 211 is UI instruction verb, not filler) |
| Passive voice | ~20% -- technical documentation genre permits more passive |
| Filler phrases | 0 |
| Promotional language | Very low -- technical documentation |
| Vague attributions | 0 |
| Over-hedging | 0 |
| Repetitive structures | Technical documentation structure (numbered steps, tables) |
| Banned Arabic | 0 |

**AI Detection Score: 7/10** -- Technical documentation inherently reads more "structured" which can flag as AI-generated. The consistent source attribution format ("> **Source:** `ClassName.cs`") is methodical in a way that could be perceived as AI-authored, but this is appropriate for code-derived documentation.

**Writing Quality Score: 7/10** -- Sections 1-3 are thorough and well-sourced from the codebase. Sections 4-12 are single-paragraph stubs. The document is incomplete and explicitly flagged at line 275 as requiring product team review.

**Issues:**
- Sections 4-12 (lines 242-274): Outline stubs only, not full documentation. **Recommendation:** Expand before publishing. Do not ship sections 4-12 in their current state.
- Line 275: Already flagged as NEEDS CLIENT INPUT. Acknowledged.

---

## Score Summary

| # | File | AI Detection (1-10) | Writing Quality (1-10) | Critical Issues |
|---|------|---------------------|------------------------|-----------------|
| 1 | launch-email.md | 9 | 8 | None |
| 2 | sms-blast.md | 9 | 9 | None |
| 3 | video-script.md | 8 | 9 | Meta-notes expose AI mitigation |
| 4 | social-posts.md | 8 | 8 | Audit log exposes AI mitigation |
| 5 | poster-copy.md | 9 | 8 | None |
| 6 | landing-page.md | 8 | 9 | Minor triple adjective |
| 7 | quick-start-guide.md | 8 | 8 | None |
| 8 | press-release.md | 7 | 8 | 1x "Not X, but Y" |
| 9 | sales-deck.md | 7 | 8 | Anaphoric triad + 2x "Not X, but Y" |
| 10 | faq.md | 9 | 8 | None |
| 11 | onboarding-sequence.md | 8 | 8 | Factual error (Viewer download claim) |
| 12 | nurture-sequence.md | 8 | 8 | 1x mild "Not X, but Y" |
| 13 | cold-outreach.md | 8 | 8 | None |
| 14 | blog-posts.md | 7 | 9 | 3x "Not X, but Y" + Rule of Three |
| 15 | social-calendar.md | 8 | 8 | Placeholder data needed |
| 16 | google-ads.md | 8 | 8 | Unverified 95% claim |
| 17 | linkedin-strategy.md | 7 | 8 | **#رؤية2030 violation** + 3x "Not X, but Y" + 2x Rule of Three |
| 18 | partner-kit.md | 8 | 8 | None |
| 19 | whatsapp-library.md | 9 | 8 | None |
| 20 | vault-user-docs.md | 7 | 7 | Sections 4-12 are stubs |

### Aggregate Scores

| Metric | Value |
|--------|-------|
| **Average AI Detection Score** | 8.0 / 10 |
| **Average Writing Quality Score** | 8.1 / 10 |
| **Files scoring 9+ (AI Detection)** | 5 of 20 (launch-email, sms-blast, poster-copy, faq, whatsapp-library) |
| **Files scoring 7 (AI Detection)** | 5 of 20 (press-release, sales-deck, blog-posts, linkedin-strategy, vault-user-docs) |
| **Total em dash violations** | 0 |
| **Total AI vocabulary violations** | 0 |
| **Total banned Arabic phrase violations** | 1 (#رؤية2030 in linkedin-strategy.md) |
| **Total "Not X, but Y" instances** | 11 across 5 files |
| **Total Rule of Three instances** | 6 across 4 files |

---

## Priority Fix List

### P0: Must Fix Before Publishing

| File | Line | Issue | Fix |
|------|------|-------|-----|
| linkedin-strategy.md | 615 | #رؤية2030 as standalone hashtag (voice guide violation) | Remove from hashtag line. Replace with #حوكمة_الوثائق or #امتثال |
| onboarding-sequence.md | 173 | Factual error: Viewer role described as "لا تعديل ولا تحميل" but Viewers CAN download per `ConstRoles.cs` | Change to "لا تعديل" (no editing). Remove download restriction claim |
| google-ads.md | 334 | "95% of Saudi companies" -- unverified statistical claim. Google Ads requires substantiation | Verify with data source or replace with non-quantitative alternative |

### P1: Should Fix (Reduces AI Detectability)

| File | Line(s) | Issue | Fix |
|------|---------|-------|-----|
| sales-deck.md | 45-46 | "No X. No Y. No Z." anaphoric triad | Restructure as pair + elaboration |
| linkedin-strategy.md | 611 | "One that... One that... And one that..." anaphoric triad | Collapse into single sentence with serial verb phrase |
| linkedin-strategy.md | 298-300 | Triple storage-vs-governance parallel | Reduce to two pairs |
| blog-posts.md | 168, 550, 802 | Three "Not X, but Y" across four posts | Rephrase at least 2 of 3 to break pattern |

### P2: Optional Polish

| File | Line(s) | Issue | Fix |
|------|---------|-------|-----|
| video-script.md | 124, 142 | Meta-notes about AI pattern mitigation | Move to separate editorial notes file |
| social-posts.md | 212-223 | Audit Fix Log exposes AI-cleaning process | Move to separate editorial metadata file |
| landing-page.md | 18 | "Protected, governed, and connected" triple adjective | Restructure to break triad |
| press-release.md | 141 | Single "Not X, but Y" construction | Rephrase as direct statement |
| vault-user-docs.md | 242-274 | Sections 4-12 are stubs | Expand before publishing |

---

## Voice Guide Compliance Note

The voice guide (`gtm/voice-guide.md`) explicitly prescribes two patterns that overlap with AI-detection signals:

1. **Contrast Declaration** ("Not X, but Y") -- a named signature construction
2. **Triple Beat** (Rule of Three) -- a named signature construction

This creates an inherent tension: following the brand voice guide produces text that AI detectors will flag. The 11 "Not X, but Y" instances and 6 Rule of Three instances are largely voice-guide-compliant. However, their concentration in certain files (blog-posts.md: 3x Contrast Declaration; linkedin-strategy.md: 3x Contrast Declaration + 2x Triple Beat) exceeds what a human writer would naturally produce, suggesting these patterns were applied systematically rather than organically.

**Recommendation:** Keep the voice guide constructions but limit each to a maximum of 1 Contrast Declaration and 1 Triple Beat per 500 words. Vary the signature constructions used so that no single pattern dominates.

---

## Overall Assessment

The 20-file corpus is remarkably clean. Zero em dashes, zero AI vocabulary violations, and only one banned Arabic phrase violation (a hashtag that can be removed in seconds) demonstrate rigorous adherence to the voice guide's anti-AI detection standards.

The primary AI-detection risk comes from the systematic application of the voice guide's own signature constructions -- "Contrast Declaration" and "Triple Beat" -- which, when used repeatedly across files, create a detectable pattern. The five files scoring 7/10 on AI detection (press-release, sales-deck, blog-posts, linkedin-strategy, vault-user-docs) share this common issue.

The writing quality is consistently high (average 8.1/10), with strong bilingual execution, detailed production specifications, and appropriate tone calibration per content type.
