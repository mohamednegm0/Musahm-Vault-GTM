# GTM Consistency Audit

**Date:** 2026-04-02
**Scope:** All `.md` files under `e:\Negm-Musahem-main\gtm\`
**Method:** Targeted grep/glob searches across 10 specific inconsistency categories

---

## 1. Beta Seat Count Inconsistency

**Canonical value:** 30 / ٣٠ (per majority of files)

| File | Line | Text | Count | Severity |
|------|------|------|-------|----------|
| `phase4-content/launch-email.md` | 12 | "٣٠ مقعدًا تجريبيًا فقط" | 30 | OK |
| `phase4-content/launch-email.md` | 47 | "**[١٠] مقاعد فقط في المرحلة التجريبية**" | **10** | **CRITICAL** |
| `phase4-content/launch-email.md` | 90 | "30 beta seats remain" | 30 | OK |
| `phase4-content/video-script.md` | 107 | "أول ٣٠ شركة فقط" | 30 | OK |
| `phase4-content/video-script.md` | 138 | "Seat-count urgency: أول **٥٠** شركة فقط" | **50** | **CRITICAL** |

**Summary:** Three different seat counts exist (10, 30, 50). The `launch-email.md` Arabic urgency footer says 10 seats while the subject line says 30. The `video-script.md` audit fix log at line 138 references 50 companies while the actual script body uses 30. All three numbers contradict each other.

**Fix:** Decide on one number (likely 30). Update `launch-email.md` line 47 from ١٠ to ٣٠. Update `video-script.md` line 138 from ٥٠ to ٣٠.

---

## 2. Wrong Role Names

**Canonical roles (from codebase):** Viewer / Editor / Uploader / Admin / Owner (عارض / محرر / رافع / مدير / مالك)
**Wrong names to watch for:** Contributor / مساهم (as role) / Supervisor / مشرف / Workspace Manager / مدير مساحة

| File | Line | Wrong Name | Severity |
|------|------|-----------|----------|
| `AUDIT-REPORT.md` | 32 | References that `onboarding-sequence.md` had "Contributor" / "Supervisor" | Historical |
| `AUDIT-REPORT.md` | 33 | References that `quick-start-guide.md` had "Contributor" / "Supervisor" | Historical |
| `AUDIT-REPORT.md` | 34 | References that `sales-deck.md` had "Workspace Manager" | Historical |

**Summary:** The wrong role names (Contributor, Supervisor, Workspace Manager) no longer appear in the actual content files (`onboarding-sequence.md`, `quick-start-guide.md`, `sales-deck.md`). These were fixed in a prior pass. The audit reports still reference the old errors but the source files are clean.

**Status:** RESOLVED. No action needed on content files. The audit reports accurately document what was wrong historically.

---

## 3. Wrong Workspace Names

**Canonical workspace names:**
1. Board Meetings / اجتماعات مجلس الإدارة
2. Association Meetings / اجتماعات الجمعية
3. Committee Meetings / اجتماعات اللجان
4. Decisions / القرارات
5. Contract Documentation / توثيق العقود
6. Policies & Regulations / السياسات واللوائح

| File | Line | Wrong Name | Correct Name | Severity |
|------|------|-----------|-------------|----------|
| `phase4-content/press-release.md` | 43 | "السياسات **والأنظمة**" | "السياسات **واللوائح**" | **MODERATE** |
| `phase3-segmentation/message-house.md` | 129 | "Contracts" (EN, without "Documentation") | "Contract Documentation" | **MODERATE** |
| `phase3-segmentation/message-house.md` | ~105 | "السياسات والأنظمة" (per arabic-audit.md finding) | "السياسات واللوائح" | **MODERATE** |
| `phase1-discovery/competitive-analysis.md` | 14 | "General Assemblies (AGMs)" | "Association Meetings" | **MODERATE** |
| `phase4-content/nurture-sequence.md` | 49 | Lists "Contracts" without "Documentation" suffix | "Contract Documentation" | LOW |

**Summary:** Two Arabic variants of workspace #6 persist ("والأنظمة" vs the canonical "واللوائح"). The English name for workspace #2 appears as "General Assemblies" in the competitive analysis (not customer-facing but still inconsistent). "Contracts" appears without the full "Contract Documentation" in a few places.

**Fix:** Find-and-replace "السياسات والأنظمة" with "السياسات واللوائح" in `press-release.md` and `message-house.md`. Standardize "General Assemblies" to "Association Meetings" in `competitive-analysis.md`. Add "Documentation" suffix to bare "Contracts" workspace references.

---

## 4. CTA Inconsistency

**Canonical CTA:** "Activate Vault" / "فعّل Vault"

| File | Line | CTA Verb (AR) | CTA Verb (EN) | Severity |
|------|------|--------------|--------------|----------|
| `phase4-content/sms-blast.md` | 16, 31, 75 | "سجلوا" | "Register" | **CRITICAL** |
| `phase4-content/video-script.md` | 107, 109 | "سجّل شركتك الآن" / "سجّل الآن" | "Register Now" | **CRITICAL** |
| `phase4-content/google-ads.md` | 68, 77, 104, 125+ | "سجّل" (throughout) | "Register" (throughout) | **MODERATE** |
| `phase4-content/social-calendar.md` | 325, 338 | "سجّلوا الآن" | "Register now" | **MODERATE** |
| `phase4-content/blog-posts.md` | 213, 330, 408+ | "سجّل شركتك الآن" | "Register your company now" | **MODERATE** |
| `phase4-content/landing-page.md` | 302, 305 | "سجّل الآن" | "Register now" | **MODERATE** |
| `phase4-content/linkedin-strategy.md` | 46, 793 | "احجز عرض تجريبي" | "Book a Demo" | LOW |
| `phase4-content/cold-outreach.md` | 139, 171, 287+ | "احجزوا" | "Book" | LOW |
| `phase4-content/social-calendar.md` | 1150, 1172 | "احجز موعدك" | "Book your slot" | LOW |
| `phase4-content/social-posts.md` | 116+ | "Register: [link]" | -- | **MODERATE** |

**Summary:** The `arabic-audit.md` and `customer-journey.md` already identify this: a prospect encounters at least 5 different CTA verbs across their journey:
- "فعّل" (Activate) -- canonical, used in landing-page hero, WhatsApp, launch-email
- "سجّل" (Register) -- used in SMS, Google Ads, video script, blog posts, social calendar
- "احجز" (Book/Reserve) -- used in cold outreach, LinkedIn strategy
- "ابدأ" (Start) -- used in some Google Ads
- "ادخل" (Enter) -- used in onboarding sequence

The `arabic-audit.md` recommends: Primary CTA = "فعّل Vault" for all high-visibility touchpoints. Reserve "سجّل" for form-adjacent contexts (SMS, Google Ads). Remove "ابدأ" and "ادخل" as CTAs entirely. "احجز" is acceptable for meeting-booking contexts only.

**Fix:** This is a large-scale normalization. Prioritize high-visibility touchpoints first: `video-script.md`, `sms-blast.md`, `social-posts.md`, `blog-posts.md` CTAs.

---

## 5. "من الصفر" (From Scratch) Overuse

**Every instance:**

| # | File | Line | Context |
|---|------|------|---------|
| 1 | `voice-guide.md` | 19 | "بنينا منصة سعودية من الصفر" (canonical voice example) |
| 2 | `voice-guide.md` | 83 | Glossary entry |
| 3 | `voice-guide.md` | 145 | Usage example |
| 4 | `voice-guide.md` | 280 | Brand statement repeat |
| 5 | `voice-guide.md` | 419 | Word bank |
| 6 | `voice-guide.md` | 463 | Full tagline repeat |
| 7 | `phase2-brand/concept-3-ksa-native-tech.md` | 40 | Brand concept definition |
| 8 | `phase3-segmentation/message-house.md` | 13 | Hero statement |
| 9 | `phase4-content/landing-page.md` | 18 | Meta description |
| 10 | `phase4-content/landing-page.md` | 84 | Hero section |
| 11 | `phase4-content/launch-email.md` | 31 | Email body |
| 12 | `phase4-content/faq.md` | 14 | FAQ answer #1 |
| 13 | `phase4-content/faq.md` | 44 | FAQ answer #2 |
| 14 | `phase4-content/faq.md` | 363 | Schema markup |
| 15 | `phase4-content/press-release.md` | 24 | Press release body (3x in file per CEO-AUDIT) |
| 16 | `phase4-content/partner-kit.md` | 18 | Partner elevator pitch |
| 17 | `phase4-content/partner-kit.md` | 130 | Sales talking point |
| 18 | `phase4-content/partner-kit.md` | 413 | Word bank |
| 19 | `phase4-content/blog-posts.md` | 324 | Blog post 2 |
| 20 | `phase4-content/blog-posts.md` | 512 | Blog post 3 |
| 21 | `phase4-content/google-ads.md` | 69, 83, 86, 94, 116, 158, 263, 272, 291, 324, 353, 640 | **12 separate ad copy instances** |
| 22 | `phase4-content/social-posts.md` | 15, 115 | LinkedIn and Twitter posts |
| 23 | `phase4-content/social-calendar.md` | 227, 245, 319, 482 | 4 social calendar entries |
| 24 | `phase4-content/video-script.md` | 55, 61 | Scene 3 VO + audit note |
| 25 | `phase4-content/whatsapp-library.md` | 23, 329 | WhatsApp messages |
| 26 | `phase1-discovery/battle-cards.md` | 143 | Ebana comparison (different context: competitor "starts from zero") |

**Total customer-facing occurrences:** 30+ across 15+ files.

**Severity: CRITICAL** -- The CEO audit (line 102) and arabic-audit (line 255) both flag this: "Saying 'we built from scratch' once is confident. Saying it ten times across the package sounds defensive."

**Fix:** Keep "من الصفر" in max 3 high-impact files (voice-guide canonical, landing-page hero, press-release headline). Replace in all others with varied phrasing: "بنيناه لحوكمتكم" / "صُمّم في الرياض" / "مبني لأنظمة الشركات السعودية" / "سعودي التصميم والبناء".

---

## 6. Contrast Declarations ("We didn't" / "لم ن" / "ليس")

### "لم ن" (We didn't) instances:

| File | Line | Text |
|------|------|------|
| `voice-guide.md` | 19, 280, 463 | "لم نستورد حلاً أجنبياً وترجمناه" (canonical) |
| `phase2-brand/concept-3-ksa-native-tech.md` | 40 | "لم نستورد حلاً أجنبياً وترجمناه" |
| `phase4-content/launch-email.md` | 31 | "لم ننتظر حلاً أجنبياً يفهم واقعكم" |
| `phase4-content/landing-page.md` | 84 | "لم ننتظر حلاً أجنبياً" |
| `phase4-content/google-ads.md` | 116 | "لم نستورد حلا أجنبيا" |
| `phase4-content/social-calendar.md` | 480 | "لم نستورد حلاً أجنبيًا وعرّبناه" |
| `phase4-content/nurture-sequence.md` | 220 | "لم نبنِ Vault ليبقى فارغًا" |
| `phase4-content/linkedin-strategy.md` | 462 | "لم نسأل كيف تعمل المشاركة في أنظمة أخرى" |

### "We didn't" (EN) instances:

| File | Line | Text |
|------|------|------|
| `voice-guide.md` | 21, 117, 411, 464 | "We didn't translate a foreign platform" (canonical) |
| `phase2-brand/concept-3-ksa-native-tech.md` | 43 | "We didn't translate a foreign platform" |
| `phase4-content/video-script.md` | 56 | "We didn't import a foreign system" |

### "ليس" (is not) in marketing context (selected high-impact):

| File | Line | Text |
|------|------|------|
| `phase4-content/social-posts.md` | 22 | "Vault ليس مخزن ملفات" |
| `phase4-content/press-release.md` | 40 | "ليس نظام تخزين أُضيفت له صلاحيات" |
| `phase4-content/sales-deck.md` | 89 | "الحوكمة ليست خياراً" |
| `phase4-content/sales-deck.md` | 145 | "Vault: ليس مخزن ملفات" |
| `phase4-content/social-calendar.md` | 90 | "ليس عندك سجل تدقيق. ليس عندك صلاحيات. ليس عندك إثبات" (triple) |
| `phase4-content/social-calendar.md` | 227 | "ليس تحديثًا. ليس ترقية." |
| `phase4-content/social-calendar.md` | 323, 404, 434, 578, 674, 740, 954, 958, 978 | Multiple "ليس" declarations |

**Total "ليس" in social-calendar.md alone:** 15+ instances.

**Severity: MODERATE** -- The contrast declaration is a defined brand voice pattern, so some usage is intentional. The problem is density. The `social-calendar.md` has a triple "ليس" (line 90) flagged by the arabic-audit as AI-generated pattern. A prospect following the social calendar would encounter "Vault is not X" in nearly every post.

**Fix:** The triple "ليس" at `social-calendar.md` line 90 should use conjunctions: "لا سجل تدقيق ولا صلاحيات ولا إثبات". Vary the contrast pattern across posts -- use at most 2-3 "ليس" declarations per week of social content.

---

## 7. Tagline Variants

**Canonical tagline:**
- AR: "حوكمة سعودية. منصة عالمية."
- EN: "Saudi governance. World-class platform."
- Source: `voice-guide.md` lines 4-5, `recommendation.md` lines 91-94

| File | Line | Variant | Matches Canonical? |
|------|------|---------|--------------------|
| `voice-guide.md` | 4-5, 397 | "حوكمة سعودية. منصة عالمية." / "Saudi governance. World-class platform." | YES |
| `phase4-content/poster-copy.md` | 14, 26 | "مساهم: حوكمة سعودية. منصة عالمية." / "Musahm: Saudi governance. World-class platform." | YES (with brand prefix) |
| `phase4-content/poster-copy.md` | 53 | "**معايير رؤية ٢٠٣٠**" (replaced "منصة عالمية" with "Vision 2030 standards") | **NO** |
| `phase4-content/landing-page.md` | 326, 329 | Canonical | YES |
| `phase4-content/launch-email.md` | 53, 96 | Canonical | YES |
| `phase4-content/press-release.md` | 94, 195 | Canonical | YES |
| `phase4-content/google-ads.md` | 64, 95, 126, 251, 282, 313, 634, 772-773 | Canonical | YES |
| `phase4-content/linkedin-strategy.md` | 17, 22-23 | Canonical | YES |
| `phase4-content/sales-deck.md` | 11, 16-17, 403, 408-409 | Canonical | YES |

**Summary:** The tagline is well-deployed across most files. The one deviation is in `poster-copy.md` line 53 where the audit fix for M2 (missing regulatory reference) replaced "منصة عالمية" with "معايير رؤية ٢٠٣٠". This creates a variant tagline that doesn't match the canonical.

**Severity: MODERATE** -- `poster-copy.md` has both the canonical version (lines 14, 26) AND the variant (line 53). The variant appears in the audit changelog, not the actual poster copy. This may be a documentation note rather than an actual deployment, but it should be clarified.

---

## 8. Unsourced Statistics

| File | Line | Claim | Source Provided? | Severity |
|------|------|-------|-----------------|----------|
| `phase4-content/google-ads.md` | 334 | "مساهم تخدم 95% من الشركات السعودية" | NO (flagged NEEDS VERIFICATION in file) | **CRITICAL** |
| `phase4-content/google-ads.md` | 622 | "Musahm was built for 95% of Saudi companies" | NO (flagged NEEDS VERIFICATION in file) | **CRITICAL** |
| `phase1-discovery/battle-cards.md` | 65 | "covers 95% of Saudi companies" | NO | **CRITICAL** |
| `phase1-discovery/battle-cards.md` | 227 | "95% of Saudi companies are unlisted SMBs or LLCs" | NO | **CRITICAL** |
| `phase1-discovery/battle-cards.md` | 266 | "80%+ of Saudi SMBs currently manage governance [via WhatsApp/Excel]" | NO | **MODERATE** |
| `phase1-discovery/competitive-analysis.md` | 84 | "~95% of KSA companies are unlisted SMBs" | NO | **MODERATE** |
| `AUDIT-REPORT.md` | 41 | References fabricated "67% of Saudi real estate firms lack a document audit trail" in cold-outreach.md | NO -- **explicitly flagged as fabricated** | **CRITICAL** |
| `AUDIT-REPORT.md` | 42 | References fabricated "Board secretaries spend 40% of their time searching for documents" in cold-outreach.md | NO -- **explicitly flagged as fabricated** | **CRITICAL** |
| `phase4-content/google-ads.md` | 744 | "Saudi smartphone penetration exceeds 95%" | NO (but widely known / verifiable) | LOW |

**Summary:** The "95%" company coverage claim appears in 4 files across 6 instances. The "67%" and "40%" claims in cold outreach were already identified as fabricated by prior audits. The 95% figure is plausible (Ministry of Commerce data could verify) but remains unsourced.

**Fix:**
1. **Immediately remove** the 67% and 40% fabricated statistics from `cold-outreach.md` if not already done.
2. **Source or replace** the 95% claim: verify from Ministry of Commerce corporate registry data, or replace with "the vast majority of Saudi companies" / "مساهم تخدم الشركات السعودية بأنواعها: مدرجة وغير مدرجة ومحدودة".
3. The 80%+ claim in battle cards should be softened to "most Saudi SMBs" unless sourced.

---

## 9. Mobile App Claims

| File | Line | Claim | Severity |
|------|------|-------|----------|
| `phase3-segmentation/message-house.md` | 33 | "Full-featured iOS and Android apps" | **CRITICAL** |
| `phase1-discovery/battle-cards.md` | 66 | "Native mobile apps, not a responsive website" / "تطبيقات جوال أصلية، وليس موقع متجاوب" | **CRITICAL** |
| `phase1-discovery/battle-cards.md` | 357 | Feature comparison table: Mobile Apps iOS + Android = Yes for Musahm | **CRITICAL** |
| `phase1-discovery/competitive-analysis.md` | 30 | Feature table: "Mobile Apps (iOS + Android)" = checkmark for Musahm | **CRITICAL** |
| `phase4-content/faq.md` | 304 | "NEEDS CLIENT INPUT: تحقق مما إذا كانت تطبيقات مساهم الأصلية (iOS/Android) تتضمن وظائف Vault" | MODERATE (flagged) |
| `phase4-content/faq.md` | 307 | Same in English | MODERATE (flagged) |
| `phase4-content/onboarding-sequence.md` | 336 | "تطبيق الجوال: الوصول لوثائقك المحوكمة من أي مكان" | **CRITICAL** |
| `phase1-discovery/icp.md` | 80 | "mobile app functionality" as evaluation criterion | LOW |
| `voice-guide.md` | 432 | Lists "mobile apps" as MEASURED (not headline) claim | LOW |

**Summary:** Multiple files state or imply that Vault has native iOS/Android mobile apps. The `AUDIT-REPORT.md` (line 20) explicitly warns: "If these don't exist for Vault, this is false advertising." The `faq.md` is the only file that properly flags this as NEEDS CLIENT INPUT.

**Fix:** Verify with client whether Vault has native mobile apps. If not:
1. Remove all "iOS and Android apps" claims from `battle-cards.md`, `message-house.md`, `competitive-analysis.md`
2. Remove mobile app reference from `onboarding-sequence.md`
3. Replace with "mobile-responsive web interface" / "متوافق مع الجوال عبر المتصفح" (as `faq.md` line 304 already uses)

---

## 10. Superlative Claims ("Leading" / "First" / "Only")

### "أول" (First) claims:

| File | Line | Claim | Verifiable? | Severity |
|------|------|-------|------------|----------|
| `phase4-content/press-release.md` | 14 | "**أول** نظام إدارة وثائق سعودي مبني للحوكمة" | **NO** -- cannot prove no other Saudi DMS with governance features has ever existed | **CRITICAL** |
| `phase4-content/press-release.md` | 115 | "the **First** Saudi Document Management System Built for Corporate Governance" | **NO** | **CRITICAL** |

### "الوحيدة" / "Only" claims:

| File | Line | Claim | Verifiable? | Severity |
|------|------|-------|------------|----------|
| `voice-guide.md` | 160 | "Only KSA platform with integrated shareholder registry" | YES (verified vs Majles, Ebana) | OK |
| `voice-guide.md` | 161 | "Only KSA platform offering governance + DMS in one product family" | YES (verified vs competitors) | OK |
| `voice-guide.md` | 172 | "مساهم هي المنصة السعودية الوحيدة التي تغطي دورة الحوكمة الكاملة" | YES (verified) | OK |
| `phase4-content/blog-posts.md` | 686, 779 | "المنصة الوحيدة في المملكة التي تربط السجل بالوثائق" / "The Only Platform in Saudi Arabia That Links the Registry to Documents" | YES (specific, verifiable) | OK |
| `phase4-content/google-ads.md` | 85, 301, 333 | "المنصة السعودية الوحيدة" | YES (specific differentiator) | OK |
| `phase4-content/sales-deck.md` | 251, 253, 271 | "المنصة السعودية الوحيدة" | YES | OK |
| `phase4-content/social-calendar.md` | 436, 459 | "مساهم هي المنصة السعودية الوحيدة" | YES | OK |
| `phase1-discovery/battle-cards.md` | 61 | "مساهم هي المنصة الوحيدة في السعودية بسجل مساهمين مدمج" | YES | OK |

### "رائدة" (Leading) claims:

| File | Line | Claim | Verifiable? | Severity |
|------|------|-------|------------|----------|
| `phase4-content/launch-email.md` | 43 | "شركات سعودية **رائدة** تعتمد مساهم" | **NO** -- only 3 named clients (Al-Ufuq, Miral, Amwaj) | **MODERATE** |
| `phase4-content/launch-email.md` | 86 | "**Leading** Saudi companies already trust Musahm" | **NO** | **MODERATE** |
| `phase4-content/press-release.md` | 92 | "تخدم شركات سعودية **رائدة**" | **NO** | **MODERATE** |

**Summary:**
- The "Only" claims are well-grounded and verified against competitors in the voice guide. These are defensible.
- The "First" claim in the press release headline is dangerous -- the CEO audit (line 58) explicitly warns: "'First' is a minefield. We cannot prove this."
- The "Leading" claims overstate 3 named clients as "leading Saudi companies."

**Fix:**
1. Replace "أول" in press-release headline with "نظام إدارة وثائق سعودي مبني للحوكمة" (drop "أول" entirely) or use "أول نظام سعودي يجمع الحوكمة وإدارة الوثائق في منتج واحد" (more specific, harder to disprove).
2. Replace "رائدة" with the CEO audit's suggestion: "شركات سعودية تعتمد مساهم بالفعل" (drop "leading").

---

## Priority Matrix

| # | Issue | Severity | Files Affected | Effort |
|---|-------|----------|---------------|--------|
| 1 | Seat count (10 vs 30 vs 50) | CRITICAL | 2 files | Low |
| 2 | Fabricated statistics (67%, 40%) | CRITICAL | 1 file (cold-outreach.md) | Low |
| 3 | "First" claim in press release | CRITICAL | 1 file | Low |
| 4 | Mobile app claims (if false) | CRITICAL | 5 files | Medium |
| 5 | Unsourced 95% statistic | CRITICAL | 4 files, 6 instances | Low |
| 6 | CTA verb inconsistency | CRITICAL | 10+ files | High |
| 7 | "من الصفر" overuse (30+ instances) | CRITICAL | 15+ files | High |
| 8 | Workspace name #6 Arabic variant | MODERATE | 2 files | Low |
| 9 | "رائدة" (Leading) overclaim | MODERATE | 2 files | Low |
| 10 | Contrast declaration density | MODERATE | social-calendar.md primarily | Medium |
| 11 | Poster tagline variant | MODERATE | 1 file | Low |
| 12 | Triple "ليس" AI pattern | MODERATE | social-calendar.md | Low |
| 13 | Wrong role names | RESOLVED | 0 files (already fixed) | None |

**Recommended fix order:** Items 1-5 (critical, low effort) first. Then item 6 (CTA normalization). Then item 7 ("من الصفر" variation). Items 8-12 in a single cleanup pass.
