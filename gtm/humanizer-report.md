# Humanizer Report: Musahm Vault Marketing Files

**Date:** 2026-04-02
**Files processed:** 7
**Methodology:** Wikipedia "Signs of AI writing" detection framework applied across 10 pattern categories

---

## Per-File Scoring

### 1. launch-email.md

| Pattern | Before | After | Notes |
|---------|--------|-------|-------|
| Em dashes (prose) | 0 | 0 | All 7 em dashes were in headers or NEEDS CLIENT INPUT markers. No prose em dashes existed. |
| Rule of three | 3 | 0 | Subject line 2 triple, Arabic body triple, English body triple all converted to flowing comma-separated sentences. |
| Negative parallelism | 2 | 2 | Kept both (AR/EN versions of "We did not wait... We built"). Intentional brand Contrast Declaration pattern. |
| Bold-header bullets | 10/10 identical | Varied | Alternated between bold-header, plain, and integrated styles in both AR and EN bullet lists. |
| Hyphenated compounds | 3 | 1 | Removed "Saudi-built" and "Audit-ready" from body. Kept "Saudi-grade" in subject line only. |

**Specific fixes:** Merged "Saudi-built. Fully governed. Audit-ready." into "Built by a Saudi team, fully governed, and ready for your next audit." Converted uniform "**Bold header.** Description" bullet pattern to mixed styles.

**Human-ness score: 8/10**

---

### 2. social-posts.md

| Pattern | Before | After | Notes |
|---------|--------|-------|-------|
| Em dashes (total) | 28 | 1 | Reduced from 18 content + 10 header em dashes to 1 file title. All content em dashes converted to commas, periods, colons, or restructured sentences. |
| Rule of three | 2 | 0 | Twitter Triple Beat variants converted from "X. Y. Z." to "X, Y, and Z" (comma-separated). |
| Negative parallelism | 4 | 2 | Kept LinkedIn primary AR/EN ("Vault is not file storage. Vault governs..."). Twitter Contrast Declaration variants rephrased from "We didn't X. We built Y" to "Instead of X, we built Y." |
| Hyphenated compounds | 1 | 0 | Removed "Saudi-built" from Twitter Vision 2030 variant, replaced with "Saudi" standalone. |
| Section headers | All used em dashes | All use colons | Converted "Variant B -- Arabic" pattern to "Variant B: Arabic" throughout. |

**Specific fixes:** 27 em dashes removed. Twitter Triple Beat posts converted from staccato fragments to natural comma lists. Contrast Declaration variants restructured to avoid the "didn't X / did Y" template while preserving contrast meaning.

**Human-ness score: 9/10**

---

### 3. sms-blast.md

| Pattern | Before | After | Notes |
|---------|--------|-------|-------|
| Em dashes (prose) | 4 | 2 | Translation text em dashes (2) converted to commas. Arabic SMS body em dashes (2) retained -- UCS-2 encoding technically justifies them, and character counts are pre-calculated around them. |
| Rule of three | 0 | 0 | SMS format inherently prevents this pattern. |
| Negative parallelism | 0 | 0 | Clean. |
| AI vocabulary | 0 | 0 | Clean. |

**Specific fixes:** Light touch. Converted 2 translation-text em dashes to commas. Preserved SMS body text em dashes because changing them would invalidate the character count analysis (62/125 chars) documented in the file. Voice notes sections are internal/analytical and were left as-is.

**Human-ness score: 9/10** (SMS format naturally reads human due to extreme brevity constraints)

---

### 4. video-script.md

| Pattern | Before | After | Notes |
|---------|--------|-------|-------|
| Em dashes (total) | 29+ | 3 | Kept: file title (1), Scene 3 VO product reveal pause (1), Scene 6 VO CTA urgency pause (1). All other em dashes in VO text, subtitles, visual direction notes, production notes, and metadata converted to commas, periods, or colons. |
| Rule of three | 0 | 0 | "Simple. Powerful. Complete." was already removed in a prior audit pass. |
| Negative parallelism | 2 | 2 | Scene 3 Contrast Declaration ("We didn't bring a foreign system. We built Musahm Vault from scratch.") kept as brand voice. |
| Audit table codes | All used "CODE -- description" | All use "CODE: description" | Converted 6 audit traceability entries from em dash to colon separators. |

**Specific fixes:** 26+ em dashes removed. Visual direction notes cleaned ("confident motion -- not flashy" became "confident motion, not flashy"). Production notes cleaned ("coordinate with product team" separated by period instead of em dash). YouTube metadata title em dash converted to colon. Kept 2 VO em dashes where the dramatic pause genuinely serves the script pacing.

**Human-ness score: 8/10**

---

### 5. poster-copy.md

| Pattern | Before | After | Notes |
|---------|--------|-------|-------|
| Em dashes (content) | 5 | 2 | Kept: brand tagline separators in both AR ("Musahm -- Saudi governance") and EN versions. Removed from subheadline (comma) and CTA buttons (pipe separator). File title and audit log em dashes also converted. |
| Rule of three | 2 | 0 | Arabic body "X. Y. Z." and English body "X. Y. Z." both converted to comma-separated lists. |
| Negative parallelism | 0 | 0 | Clean. |
| Hyphenated compounds | 2 | 0 | "Saudi-proud" became "proudly Saudi." "Saudi-institutional" became "institutional and Saudi." |

**Specific fixes:** Poster body text "Role-based permissions. Full audit trail. Automated workflows." became "Role-based permissions, complete audit trail, automated workflows." Arabic version also converted from period-separated fragments to comma-separated. Brand tagline em dashes kept as intentional visual design elements in ad copy. Audit traceability codes switched from em dash to colon separators.

**Human-ness score: 9/10**

---

### 6. message-house.md

| Pattern | Before | After | Notes |
|---------|--------|-------|-------|
| Em dashes | 4 | 0 | 1 content em dash (Vault hero Arabic) and 3 header em dashes all converted to commas or colons. |
| Rule of three | 2 | 0 | Vault hero statement "Protected. Organized. Audit-ready." became "Protected, organized, and ready for your next audit." Arabic version similarly merged with conjunctions. |
| Negative parallelism | 7+ | 2 | Kept: SharePoint contrast ("stores files / governs documents") and e-signature declaration. Fixed: SharePoint triple "does not" collapsed into one compound sentence. "Not in a generic file dump. Not in someone's inbox." merged with "instead of." |
| Transition filler | 2 | 0 | "Here is what we can confirm" became "We can confirm the following." "Here is what we can do" became "We can prepare." |
| Inflated language | 1 | 0 | "Vault goes beyond file storage" became "Vault does more than store files." |

**Specific fixes:** Heaviest editing in this file. Triple "It does not know... It does not connect... It does not understand" (3 identical sentence starts) collapsed into "It doesn't know what a board resolution is, can't connect documents to meeting minutes, and has no understanding of..." Arabic SharePoint triple "la" pattern also merged with conjunctions. Both "Here is what" transition fillers removed. Double "Not in a..." pattern merged into flowing sentence.

**Human-ness score: 8/10**

---

### 7. battle-cards.md

| Pattern | Before | After | Notes |
|---------|--------|-------|-------|
| Em dashes | 0 | 0 | File uses `--` (double hyphens) throughout, not em dashes. No change needed. |
| Rule of three | 0 | 0 | Clean. |
| Negative parallelism | 7+ | 5 | Reduced across 4 battle cards. Removed: "The cost of the system is not the risk. The cost of not having the system is the risk" (rephrased) and "The informal stays informal. The formal becomes formal" (cut). Kept 1 per card: Majles ("manage meetings / manage the company"), Ebana ("file cabinet / governance record"), Diligent ("built for / localized for"), WhatsApp ("works until it doesn't" + "Use WhatsApp to discuss. Use Musahm to decide."). |
| Hyphenated compounds | 4 | 0 | "governance-native" (x2) became "built for governance" / "built for governance." "purpose-built" became "built specifically for." "Arabic-institutional" became "institutional Arabic." |

**Specific fixes:** Primary work was reducing negative parallelism across the 4 battle cards and removing hyphenated AI compounds. Cost contrast reframed from symmetric "not X / but Y" to asymmetric "The real cost isn't the subscription. It's what happens without one." Kept the strongest contrast declarations per card since they serve as memorable sales tools. Document length (381 lines, 4 separate cards) justified slightly higher count than the strict 2-per-file target.

**Human-ness score: 8/10**

---

## Aggregate Summary

| Metric | Total Before | Total After | Reduction |
|--------|-------------|-------------|-----------|
| Em dashes (prose/content) | 62+ | 9 | 85%+ |
| Rule of three instances | 9 | 0 | 100% |
| Negative parallelism | 30+ | 15 | 50% |
| Transition filler | 2 | 0 | 100% |
| Hyphenated AI compounds | 11+ | 1 | 91% |
| Bold-header bullet uniformity | 1 file | 0 files | 100% |
| Inflated language | 1 | 0 | 100% |

**Notes on retained patterns:**
- Negative parallelism intentionally kept at moderate levels because it is a documented brand pattern (Contrast Declaration) in the Musahm voice guide. The remaining instances are the strongest, most natural-sounding ones -- not the repetitive template versions.
- 2 em dashes retained in brand taglines (poster-copy.md) as visual design elements in ad copy.
- 2 em dashes retained in video-script.md VO lines as legitimate dramatic pause markers (standard scriptwriting convention).
- Arabic SMS body em dashes retained because UCS-2 encoding analysis and character counts are pre-calculated around them.
- NEEDS CLIENT INPUT markers not modified.

**Overall human-ness assessment: 8.4/10** (up from estimated 5-6/10 pre-humanization)
