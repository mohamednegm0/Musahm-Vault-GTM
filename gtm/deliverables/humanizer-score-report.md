# Musahm GTM: Humanizer Score Report

**Date:** 2026-04-02
**Milestone:** M3 (AI Cleanup / Humanizer Pass)
**Auditor:** Automated pattern scan + manual review

---

## Methodology

Each file scored on 5 dimensions (2 points each, 10 total):

| Dimension             | What It Measures                                                                  |
| --------------------- | --------------------------------------------------------------------------------- |
| Em Dash Budget        | Zero em dashes in Arabic/English prose                                            |
| AI Vocabulary         | Zero banned words (leverage, streamline, holistic, robust, seamless, delve, etc.) |
| Contrast Pattern      | "Not X, but Y" max 1 per 500 words                                                |
| Structural Repetition | Rule of Three / anaphoric triads max 1 per file                                   |
| Meta Exposure         | No audit logs, AI-pattern notes, or editorial metadata visible in deliverable     |

---

## Global Results (Post-M3)

| Metric                   | Before M3    | After M3                            | Target |
| ------------------------ | ------------ | ----------------------------------- | ------ |
| Em dashes in content     | 0            | 0                                   | 0      |
| AI vocabulary words      | 0            | 0                                   | 0      |
| "Not X, but Y" instances | 11 (5 files) | 1 (seo-keywords.md, editorial note) | <3     |
| Rule of Three / triads   | 6 (3 files)  | 0                                   | <2     |
| Meta AI-cleaning notes   | 2 files      | 0                                   | 0      |
| Banned hashtag #رؤية2030 | 1 file       | 0                                   | 0      |

---

## Per-File Scores

| #   | File                   | Before | After | Notes                                                                         |
| --- | ---------------------- | ------ | ----- | ----------------------------------------------------------------------------- |
| 1   | landing-page.md        | 8      | 9     | Fixed triple adjective in AR+EN subheadline                                   |
| 2   | sales-deck.md          | 7      | 9     | Fixed "No X. No Y. No Z." triad, removed 2x contrast pattern                  |
| 3   | blog-posts.md          | 7      | 9     | Removed all 3x "Not X, but Y" across 4 posts                                  |
| 4   | linkedin-strategy.md   | 7      | 9     | Removed 3x contrast, 2x Rule of Three, banned hashtag                         |
| 5   | press-release.md       | 7      | 9     | Rephrased single contrast pattern as direct statement                         |
| 6   | nurture-sequence.md    | 8      | 9     | Rephrased mild contrast at line 77                                            |
| 7   | video-script.md        | 8      | 9     | Removed AI-pattern meta note from audit traceability                          |
| 8   | social-posts.md        | 8      | 10    | Removed entire Audit Fix Log section (13 lines of meta)                       |
| 9   | cold-outreach.md       | 9      | 9     | Already clean from M2 pass                                                    |
| 10  | launch-email.md        | 9      | 9     | Already clean from M2 pass                                                    |
| 11  | social-calendar.md     | 8      | 8     | No flagged patterns; minor formulaic structure acceptable for calendar format |
| 12  | google-ads.md          | 8      | 8     | Ad copy is inherently formulaic; within genre norms                           |
| 13  | sms-blast.md           | 9      | 9     | Short-form, naturally human                                                   |
| 14  | poster-copy.md         | 9      | 9     | Minimal prose, design-focused                                                 |
| 15  | whatsapp-library.md    | 9      | 9     | Conversational tone, no AI signals                                            |
| 16  | faq.md                 | 9      | 9     | Q&A format naturally avoids AI patterns                                       |
| 17  | partner-kit.md         | 8      | 8     | Fixed in M0/M2; no remaining AI signals                                       |
| 18  | seo-keywords.md        | 9      | 9     | 1x natural "not X but Y" in editorial note (acceptable)                       |
| 19  | quick-start-guide.md   | 8      | 8     | Instructional format; inherently structured                                   |
| 20  | onboarding-sequence.md | 9      | 9     | Clean                                                                         |
| 21  | case-study-template.md | 9      | 9     | Template format, no AI signals                                                |

**Average Score: 8.9/10** (target was 8+)
**Files at or above target: 21/21**

---

## Fixes Applied in M3

### blog-posts.md (3 fixes)

- Line 168: "Not at the folder level only, but per individual document" changed to direct statement about per-document granularity
- Line 550: "Not because the company distrusts its employees, but because..." changed to direct causal statement
- Line 802: "Not because a penalty is coming tomorrow, but because..." changed to direct benefit statement

### linkedin-strategy.md (6 fixes)

- Line 218: "Not for marketing reasons, but because..." changed to direct "because" statement
- Line 228: "Not just because it is Arabic, but because..." changed to compound statement
- Line 611: "One that... One that... And one that..." anaphoric triad collapsed to single compound sentence
- Lines 298-300: Triple storage-vs-governance parallel reduced from 3 bullets to 2
- Line 613: "not a foreign platform with..." changed to "designed here from day one instead of..."
- Line 615: Removed banned hashtag #رؤية2030

### sales-deck.md (3 fixes)

- Lines 45-46: "No X. No Y. No Z." changed to "No X. No Y. The result: no Z." (breaks triad pattern)
- Line 50: "Not because the document does not exist, but because..." changed to "The document exists somewhere, but..."
- Line 332: "across sectors, not just in one niche" changed to "across sectors and company types"

### press-release.md (1 fix)

- Line 141: "It is not a storage system with permissions added on. It is governed from the ground up." changed to single direct statement with specific capabilities listed

### nurture-sequence.md (1 fix)

- Line 77: "You are not the first, but you should not be the last" changed to peer-based urgency line

### landing-page.md (2 fixes)

- Line 18 (AR): Triple adjective "محمي، محوكم، ومتكامل" changed to paired "محمي ومحوكم بالكامل، ومتكامل"
- Line 21 (EN): "Protected, governed, and connected" changed to "Fully protected and governed, connected"

### video-script.md (1 fix)

- Removed "AI pattern" row from Audit Traceability table

### social-posts.md (1 fix)

- Removed entire Audit Fix Log section (lines 212-224) exposing AI-cleaning editorial process

---

## Remaining Acceptable Patterns

| File                | Pattern                                          | Rationale for Keeping                                                        |
| ------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------- |
| seo-keywords.md:300 | "not in volume but in the near-zero competition" | Natural editorial voice in an internal strategy note, reads completely human |

---

## Conclusion

All 21 content files score 8/10 or above. The corpus is clean of em dashes, AI vocabulary, banned hashtags, anaphoric triads, and excessive contrast constructions. The remaining single "not X but Y" instance is in an internal editorial note and reads naturally.

The GTM content corpus is ready for CEO review.
