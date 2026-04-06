# Arabic Language & Cultural Audit: Musahm Vault GTM Package

**Date:** 2026-04-02
**Scope:** All 43 files across `gtm/` (phases 1-5, root-level supporting documents)
**Auditor Stance:** Saudi Arabic language expert and cultural consultant
**Method:** Full read of every file; cross-file consistency matrix; per-category analysis

---

## Executive Summary

The GTM package contains approximately 15,000+ words of Arabic content across 30+ files. The Arabic is generally strong MSA with genuine Saudi-market awareness. However, the package suffers from **systematic terminology drift** (the same product concepts are named differently across files), **inconsistent diacritics policy**, **register bleeding** between formal and informal channels, and **several numeral-system contradictions** that violate the package's own stated standard. The bilingual parallelism is above average but has specific divergences where Arabic and English versions make different claims.

**Overall Arabic Quality Score: 7/10**

The content reads as authored (not machine-translated), which is the most important baseline. The problems are consistency problems, not quality problems. A single normalization pass with a canonical glossary would resolve 80% of the findings below.

---

## Category 1: Terminology Consistency

### 1.1 Workspace Names

This is the single largest consistency problem in the package. The six default workspaces (sourced from `ConstDefaultWorkspaces.cs` and confirmed in `vault-user-docs.md`) have a canonical form, but at least four variant forms appear across files.

**Canonical names** (from `vault-user-docs.md` Section 1.3, sourced from code):

| # | English Canonical | Arabic Canonical |
|---|---|---|
| 1 | Board Meetings | اجتماعات مجلس الإدارة |
| 2 | Association Meetings | اجتماعات الجمعيات |
| 3 | Committee Meetings | اجتماعات اللجان |
| 4 | Decisions | القرارات |
| 5 | Contract Documentation | توثيق العقود |
| 6 | Policies & Regulations | السياسات واللوائح |

**Deviations found:**

| Workspace | Variant Used | Files Affected |
|---|---|---|
| **#2 Association Meetings** | "اجتماعات الجمعية" (singular) | `faq.md`, `landing-page.md`, `onboarding-sequence.md`, `quick-start-guide.md` |
| **#2 Association Meetings** | "اجتماعات الجمعيات العمومية" (expanded) | `press-release.md` |
| **#2 Association Meetings** | Omitted entirely (only 5 listed) | `launch-email.md`, `message-house.md` |
| **#2 Association Meetings** | "General" / "عام" | `sales-deck.md` (per AUDIT-REPORT.md finding) |
| **#5 Contract Documentation** | "العقود" (shortened) | `landing-page.md`, `message-house.md`, `social-calendar.md` |
| **#6 Policies & Regulations** | "السياسات والأنظمة" (different word) | `message-house.md`, `press-release.md` |
| **#6 Policies & Regulations** | "السياسات واللوائح" (canonical) | `faq.md`, `landing-page.md`, `onboarding-sequence.md`, `quick-start-guide.md`, `vault-user-docs.md`, `sales-deck.md` |

**Severity: CRITICAL**

A prospect who reads the FAQ, then receives the onboarding email, then opens the product will see three different names for the same workspace. This destroys confidence in a governance product where precision is the value proposition.

**Recommended fix:** Adopt the code-canonical forms from `vault-user-docs.md` across all files. Specifically:
- "اجتماعات الجمعيات" (plural, matching code) -- not "اجتماعات الجمعية" (singular)
- "توثيق العقود" (full form) -- not "العقود" alone
- "السياسات واللوائح" (canonical) -- not "السياسات والأنظمة"

**Linguistic note on "اللوائح" vs "والأنظمة":** Both are valid Arabic. "اللوائح" (regulations/bylaws) and "الأنظمة" (systems/regulations) overlap in meaning. However, the codebase uses "اللوائح" and this must be the single source of truth. Using "والأنظمة" in marketing while the product UI shows "واللوائح" will confuse users.

---

### 1.2 Role Names

**Canonical names** (from `ConstRoles.cs`, confirmed in `vault-user-docs.md` and `faq.md`):

| Level | English | Arabic |
|---|---|---|
| 1 | Viewer | عارض |
| 2 | Commenter | معلّق |
| 3 | Editor | محرر |
| 4 | Organizer | منظّم |
| 5 | Admin | مدير |

**Deviations found:**

| File | Role 2 Deviation | Role 4 Deviation |
|---|---|---|
| `onboarding-sequence.md` | "مساهم" (Contributor) | "مشرف" (Supervisor) |
| `quick-start-guide.md` | Correct ("معلّق") | Correct ("منظّم") |
| `sales-deck.md` | Correct | "مدير مساحة" (Workspace Manager) |
| `partner-kit.md` (pitch script) | "مشاهد" (Spectator) | "مسؤول" (Official/Responsible) |
| `vault-user-docs.md` | "معلق" (no shaddah) | "منظم" (no shaddah) |

**Severity: CRITICAL**

The `partner-kit.md` deviation is the worst: "من مشاهد إلى مسؤول" uses completely different words from the canonical "من عارض إلى مدير." A partner presenting this to a prospect will use vocabulary that does not exist in the product UI.

The `onboarding-sequence.md` deviation is dangerous because it teaches new users wrong terminology during their first week.

**Recommended fix:**
- Propagate `faq.md` canonical names to all files
- The pattern "من عارض إلى مدير" should be the standard shorthand everywhere
- Diacritics on role names should be consistent (see Section 6.3)

---

### 1.3 Product Name Variants

| Variant | Usage | Files |
|---|---|---|
| "مساهم Vault" | Most common compound | `social-posts.md`, `blog-posts.md`, `sms-blast.md`, `video-script.md`, `whatsapp-library.md` |
| "Vault من مساهم" | Possessive construction | `press-release.md`, `message-house.md` |
| "Musahm Vault" | English in Arabic context | `landing-page.md` (hero section), `quick-start-guide.md` |
| "خزنة" | Arabic translation of "Vault" | `battle-cards.md` (Ebana section only) |

**Severity: MODERATE**

"مساهم Vault" and "Vault من مساهم" are both natural Arabic constructions. The voice guide does not prescribe one over the other. However, "خزنة" (meaning "vault/safe") appearing once in `battle-cards.md` and never again is a stray artifact. If the brand decision is to keep "Vault" untranslated (which the rest of the package clearly does), then "خزنة" should be removed.

"Musahm Vault" (fully English) appearing in Arabic-primary contexts (like the landing page Arabic hero) is a minor script-mixing issue -- see Section 6.1.

**Recommended fix:** Standardize to "مساهم Vault" as the primary Arabic compound. Use "Vault من مساهم" in contexts requiring the possessive. Remove "خزنة" from `battle-cards.md`.

---

### 1.4 CTA Verb Inconsistency

| Arabic CTA | English CTA | Files |
|---|---|---|
| "فعّل Vault لشركتك" | "Activate Vault for your company" | `landing-page.md`, `whatsapp-library.md` |
| "سجّلوا" | "Register" | `sms-blast.md` |
| "سجّل شركتك الآن" | "Register your company now" | `video-script.md` |
| "احجز" | "Book / Reserve" | `cold-outreach.md` (meeting booking context) |
| "ابدأ" | "Start" | `nurture-sequence.md` |
| "فعّل Vault" | "Activate Vault" | `social-posts.md`, `whatsapp-library.md` |
| "ادخل" | "Enter / Log in" | `onboarding-sequence.md` |

**Severity: MODERATE**

The voice guide prescribes "فعّل" (Activate) as the primary CTA verb. "سجّل" (Register) is contextually appropriate for beta sign-up forms and SMS. The real problem is the scatter: a prospect encounters 4-5 different verbs across their journey. For Saudi B2B, where trust is built through consistency, this matters.

**Recommended fix:** Primary CTA = "فعّل Vault" across all high-visibility touchpoints (landing page, email, social, WhatsApp). Reserve "سجّل" for form-adjacent contexts (SMS, Google Ads). Remove "ابدأ" and "ادخل" as CTAs.

---

### 1.5 Buyer Persona Titles

**Canonical titles** (from `icp.md`):

| Persona | Arabic | English |
|---|---|---|
| Board Secretary | امين سر المجلس | Board Secretary |
| CEO | الرئيس التنفيذي | CEO |
| CFO | المدير المالي | CFO |
| Legal Counsel | المستشار القانوني | Legal Counsel |

These are used consistently across `icp.md`, `cold-outreach.md`, `win-loss-template.md`, `battle-cards.md`, and `whatsapp-library.md`. No deviations found.

**Severity: None -- PASS**

---

## Category 2: MSA Quality

### 2.1 Grammar and Morphology

The Arabic across the package is strong MSA. No systematic grammar errors were found. Specific observations:

**Correct usages worth noting:**
- Proper use of feminine/masculine agreement throughout: "بنينا" (we built, m.pl), "تستحق" (deserves, f.sg for "شركتك")
- Correct idafa constructions: "سجل تدقيق كامل" (complete audit trail), "مساحات عمل محوكمة" (governed workspaces)
- Proper elative forms: "أول نظام" (first system), "أفضل" (best)

**Minor issues:**

| File | Issue | Arabic Text | Note |
|---|---|---|---|
| `sms-blast.md` | "مقعدا" without proper tanween | "30 مقعدا تجريبيا" | Should be "مقعدًا تجريبيًّا" if using diacritics, or "مقعد تجريبي" (nominative) if stripping diacritics entirely. The current form is an incomplete tanween that looks like a typo. |
| `google-ads.md` | Same issue | "30 مقعدا" | Same fix needed |
| `press-release.md` | "ربطًا مباشرًا" | Subheadline | Correct tanween here -- inconsistent with SMS where tanween is dropped |
| `social-calendar.md` W1-2 | Triple "ليس" without conjunction | "ليس عندك سجل تدقيق. ليس عندك صلاحيات. ليس عندك إثبات" | Reads as AI-generated triple repetition. Natural Arabic would use "لا" with conjunction: "لا سجل تدقيق ولا صلاحيات ولا إثبات" |
| `whatsapp-library.md` (data residency handler) | Code-switching mid-sentence | "بخصوص مواقع الخوادم تحديدًا" | The tanween on "تحديدًا" is correct and well-placed here |

**Severity: LOW** (grammar is sound overall; the "مقعدا" issue is a consistency problem, not a grammar error per se)

---

### 2.2 Machine-Translation Artifacts

No machine-translation artifacts detected. The Arabic content reads as natively authored. Key indicators:
- Natural word order (VSO where appropriate, SVO in conversational contexts)
- Idiomatic expressions: "بدل ما نستورد" (instead of importing), "الأماكن تنفد بسرعة" (seats filling fast)
- Culturally natural openings: "السلام عليكم" in WhatsApp, "السادة في" in formal email
- No calque translations from English structures

The voice guide's prescription of "Arabic-first, then create (not translate) the English version" appears to have been followed. The Arabic and English versions are genuinely parallel compositions, not translations.

**Severity: None -- PASS**

---

### 2.3 Unnatural Phrasing for Saudi Professionals

| File | Phrase | Issue |
|---|---|---|
| `message-house.md` Objection 3 | "يقدر يقرأ رسالة ويضغط زر، يقدر يستخدم مساهم" | Khaleeji colloquial ("يقدر") in what is otherwise an MSA document. This is the informal WhatsApp persona leaking into the message house reference document. |
| `social-posts.md` Twitter Variant C | "بدل ما نستورد نظام وثائق أجنبي" | "بدل ما" is colloquial. MSA form: "بدلًا من أن نستورد". However, for Twitter this register is appropriate. |
| `video-script.md` Scene 1 | "وين هي؟" | Khaleeji dialect ("وين" instead of MSA "أين"). For video VO described as "MSA with natural Khaleeji rhythm," this is intentional and appropriate. |
| `video-script.md` Scene 1 | "ما أحد يعرف مين اطّلع عليها" | "مين" is colloquial for "من" (who). Same rationale as above -- intentional for VO. |
| `whatsapp-library.md` Day 1 nudge | "لو ما وصلكم" | "لو ما" is colloquial conditional. Appropriate for WhatsApp channel. |

**Assessment:** The register choices are mostly intentional and channel-appropriate. The voice guide explicitly allows Khaleeji markers in informal channels (WhatsApp, social media, video VO). The one problem is `message-house.md` using colloquial in what should be a reference document written in MSA -- the sales team reads this document, not the prospect.

**Severity: LOW** (channel-appropriate register, with one misplaced colloquial in message-house)

---

## Category 3: Cultural Appropriateness

### 3.1 Saudi Business Culture Accuracy

**Strengths:**
- Email openings follow Saudi B2B convention: "السادة في [اسم الشركة]، عناية [اسم جهة الاتصال]،" (`launch-email.md`)
- WhatsApp openings use "السلام عليكم" consistently across all messages (`whatsapp-library.md`, `cold-outreach.md`)
- Email closings use "مع التقدير" (appropriate Saudi formal closing)
- Beta rollout plan weights "Relationship Depth" at 1.5x in scoring matrix (Saudi B2B is relationship-first)
- Sunday scheduling for launch activities (Saudi business week start)
- WhatsApp library includes Ramadan timing sensitivity ("avoid daytime hours, send after Iftar")

**No cultural red flags found.** The content does not:
- Use inappropriate religious language
- Reference alcohol, gambling, or haram activities
- Misrepresent Saudi institutions
- Use imagery descriptions that would be culturally inappropriate

---

### 3.2 Vision 2030 References

The voice guide's anti-pattern #6 explicitly bans "Hollow Vision 2030 Drop" (using Vision 2030 as decoration without substantive connection). Assessment across files:

| File | Vision 2030 Reference | Substantive? |
|---|---|---|
| `press-release.md` | "يأتي إطلاق Vault في وقت تتسارع فيه جهود تطوير الحوكمة المؤسسية" | Yes -- ties to Companies Law reform |
| `social-posts.md` Variant B | "رؤية 2030 رفعت معايير الحوكمة. وثائق شركتك جاهزة؟" | Yes -- connects to governance mandate |
| `sales-deck.md` Slide 4 | "رؤية 2030: التحول الرقمي في الحوكمة المؤسسية ركيزة أساسية" | Yes -- specific governance digitization claim |
| `social-calendar.md` W1-3 | "نظام الشركات السعودي الجديد لم يرفع المعايير على الشركات المدرجة فقط" | Yes -- Companies Law specifics |
| `video-script.md` Scene 2 | "مع اشتراطات هيئة السوق المالية ورؤية ٢٠٣٠" | Yes -- paired with CMA |
| `poster-copy.md` | "حوكمة سعودية. معايير رؤية ٢٠٣٠." | Borderline -- modifies the canonical tagline to add Vision 2030 without specific substance |

**Severity: LOW** -- Vision 2030 usage is mostly substantive. The `poster-copy.md` modified tagline is the only borderline case.

---

### 3.3 "Built Saudi" Authenticity

The KSA-Native-Tech brand concept relies on the claim "بنينا من الصفر" (we built from scratch). The CEO audit correctly identifies overuse:

| Arabic Pattern | Count Across Package |
|---|---|
| "من الصفر" (from scratch) | 10+ occurrences across `press-release.md` (3x), `landing-page.md` (2x), `launch-email.md` (2x), `social-posts.md`, `whatsapp-library.md`, `video-script.md` |
| "بنينا" (we built) as opening verb | 8+ occurrences |
| "لم ننتظر حلاً أجنبياً" (we didn't wait for foreign solution) | `landing-page.md`, `launch-email.md` |

**Assessment:** The "Built Saudi" claim is genuine (the codebase confirms Saudi development), but the repetition degrades its impact. A Saudi executive reading 3-4 touchpoints will encounter "من الصفر" every time. This shifts from confidence to insecurity -- confident companies show, insecure companies keep explaining.

**Severity: MODERATE** -- Not a cultural appropriateness issue per se, but a brand-voice fatigue issue that affects how the Saudi audience perceives authenticity.

---

## Category 4: Bilingual Parallelism

### 4.1 Arabic/English Meaning Parity

The Arabic and English versions are generally parallel compositions (not translations). However, specific divergences exist:

| File | Arabic Says | English Says | Divergence |
|---|---|---|---|
| `social-posts.md` LinkedIn primary | "◾ تكامل مباشر مع سجل المساهمين ومحاضر الاجتماعات في مساهم" | "◾ Direct integration with Shareholder Registry and board meeting records" | Arabic adds "ومحاضر الاجتماعات" (and meeting records); English just says "board meeting records." The Arabic version makes a broader claim. |
| `landing-page.md` hero subheadline | "مساهم Vault: نظام إدارة الوثائق المبني من الصفر للحوكمة السعودية. محمي، محوكم، ومتكامل مع منصة مساهم." | "Musahm Vault: the document management system built from scratch for Saudi governance. Protected, governed, and connected to the Musahm platform you already use." | English adds "you already use" -- an assumption about the reader being an existing Musahm user that the Arabic omits. |
| `sms-blast.md` V1 | "صنع سعودي" | "Saudi-built" | Parallel and correct. "صنع سعودي" is a natural Arabic product-origin marker (like "صنع في الصين"). |
| `launch-email.md` subject lines | "Vault من مساهم: وثائق شركتك، الآن محوكمة" (Your documents, now governed) | "Vault by Musahm: Governed Document Management for Saudi Companies" | Arabic is personal/emotional ("وثائق شركتك"). English is descriptive/institutional. Both appropriate for their audience. |
| `whatsapp-library.md` cost handler | "المرحلة التجريبية مجانية بالكامل لأول ٣٠ شركة" | "The beta is completely free for the first 30 companies" | Parallel. But this claims "free beta" while the FAQ and landing page flag beta pricing as NEEDS CLIENT INPUT. Internal contradiction. |

**Severity: LOW** for parallelism quality. The bilingual content is well-crafted with appropriate cultural adaptation rather than literal translation. The "free beta" claim inconsistency is a content accuracy issue, not a parallelism issue.

---

### 4.2 Arabic-First Verification

The voice guide mandates Arabic-first authoring. Evidence of compliance:

- Landing page design notes specify `dir="rtl"` as the default layout
- Social posts list Arabic version before English in every file
- Email sequences present Arabic before English
- SMS blast presents Arabic versions (V1, V1B) before English (V2, V2B)
- WhatsApp library presents Arabic before English for every message

Evidence of potential non-compliance:

- `sales-deck.md` speaker notes are English-only (no Arabic speaker notes)
- `beta-kpi-plan.md` is entirely English
- `launch-checklist.md` is entirely English
- `AUDIT-REPORT.md`, `CEO-AUDIT.md`, `GTM-AUDIT-AND-EXECUTION-PLAN.md` are entirely English

**Assessment:** Customer-facing content is Arabic-first. Internal/operational documents are English-only, which is acceptable for a bilingual team. The sales deck speaker notes being English-only could be a problem if the presenter delivers in Arabic and needs Arabic-language coaching cues.

**Severity: LOW**

---

## Category 5: Saudi B2B Communication Norms

### 5.1 Email Conventions

| Convention | Expected | Actual | Files |
|---|---|---|---|
| Formal opening | "السادة في [شركة]، عناية [اسم]" | Correct | `launch-email.md` |
| Comma after name in greeting | "[اسم]،" | Correct | `cold-outreach.md`, `nurture-sequence.md` |
| Formal closing | "مع التقدير" or "مع خالص التقدير" | "مع التقدير" used | `launch-email.md` |
| Signature block | Name, title, company | Present with NEEDS CLIENT INPUT markers | All email files |
| No first-name-only address | Use full name or title | Correct -- uses "[اسم]" token | All |

**Severity: None -- PASS**

---

### 5.2 WhatsApp Informality

The `whatsapp-library.md` is the best-executed channel in the package. Specific Saudi B2B WhatsApp norms observed:

- Opens with "السلام عليكم" (correct and expected)
- Identifies sender and company in first line (required Saudi norm)
- Keeps messages under 500 characters (WhatsApp attention span)
- Ends with single CTA (not multiple)
- Uses "لو" (colloquial conditional) naturally
- Does not use excessive emoji or exclamation marks
- Best practices section explicitly warns against "هلا" or "مرحبا يا" (too informal)

**One concern:** The Day 1 Post-Email Nudge uses "لو ما وصلكم" (if you didn't receive it). This is conversationally natural but could be perceived as presumptuous -- implying the prospect ignored the email rather than missed it. A softer alternative: "في حال لم يصلكم" (in case it didn't reach you).

**Severity: LOW -- very well executed**

---

### 5.3 Formal Document Register

The `press-release.md` is properly formal MSA throughout. No colloquial markers. Proper use of:
- "أعلنت شركة مساهم" (announced -- formal past tense)
- "يأتي إطلاق Vault في وقت تتسارع فيه" (comes at a time of accelerating -- formal present)
- "يهدف إلى تمكين الشركات السعودية" (aims to enable -- formal purpose clause)
- "تفتح مساهم باب التسجيل" (opens registration -- formal declarative)

The `case-study-template.md` and `win-loss-template.md` use proper bilingual header conventions (Arabic | English) consistently.

**Severity: None -- PASS**

---

### 5.4 SMS UCS-2 Constraints

The `sms-blast.md` demonstrates strong technical awareness:
- Arabic UCS-2 encoding correctly noted (70-character single segment)
- Character counts provided for each version (V1: 62 chars, V1B: 125 chars)
- Concatenation headers accounted for (67-char segments for multi-SMS)
- Em dash retained in Arabic SMS (valid in UCS-2)
- English versions use hyphen (-) instead of em dash (GSM-7 safety)
- CITC sender ID registration requirement noted
- Opt-in/opt-out compliance mentioned

**One issue:** The Arabic V1B version at 125 characters with a typical short URL reaching ~132 characters is within the 134-character limit (2 segments), but this leaves only 2 characters of margin. If the short URL is longer than expected, it could spill into a 3-segment SMS, tripling cost.

**Severity: LOW -- technically sound with minor cost risk**

---

## Category 6: Specific Red Flags

### 6.1 Arabic/English Script Mixing

Script mixing (embedding English words in Arabic sentences or vice versa) occurs throughout the package. Assessment by context:

**Acceptable script mixing:**
- Product names: "مساهم Vault", "Musahm GRC" -- brand names retained in original script is standard practice
- Technical terms: "OTP", "SSO", "IP", "PDF" -- universal technical abbreviations
- Platform names: "WhatsApp", "SharePoint", "Google Drive" -- proper nouns

**Questionable script mixing:**
| File | Arabic Text with English | Concern |
|---|---|---|
| `landing-page.md` hero | "مساهم Vault: نظام إدارة الوثائق" | "Musahm" written in Latin script within an Arabic sentence. Should be "مساهم" (already the Arabic brand name). The compound "مساهم Vault" is acceptable; "Musahm Vault" in Arabic context is not. |
| `quick-start-guide.md` | "Musahm Vault هو نظام إدارة الوثائق المحوكم" | "Musahm Vault" in Latin within Arabic sentence. Should be "مساهم Vault هو نظام..." |
| `social-posts.md` hashtags | "#مساهم #Musahm #حوكمة_الشركات #SaudiTech" | Mixing Arabic and English hashtags is standard LinkedIn practice for bilingual reach. Acceptable. |
| `sms-blast.md` | "مساهم Vault، وثائق محوكمة، صنع سعودي" | "Vault" in Latin within Arabic SMS. Acceptable -- the product name is English. |

**Severity: LOW** -- The only real issue is "Musahm" appearing in Latin script where "مساهم" (the Arabic brand name) should be used. "Vault" remaining in Latin script is a deliberate brand decision.

---

### 6.2 Numeral System Inconsistency

The brand recommendation (`recommendation.md` Modification 3) explicitly states: **Drop Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩). Use Western Arabic numerals (0-9) as default.**

**Compliance check:**

| File | Numeral System Used | Compliant? |
|---|---|---|
| `sms-blast.md` | "30 مقعدا" -- Western | Yes |
| `landing-page.md` | All Western numerals | Yes |
| `faq.md` | All Western numerals | Yes |
| `press-release.md` | "٣٠ شركة" -- Eastern Arabic | **NO** |
| `whatsapp-library.md` | "٣٠ مقعدًا" -- Eastern Arabic | **NO** |
| `whatsapp-library.md` | "٥ مستويات" -- Eastern Arabic | **NO** |
| `whatsapp-library.md` | "١٠ دقائق" -- Eastern Arabic | **NO** |
| `video-script.md` | "٣٠ شركة" -- Eastern Arabic | **NO** |
| `video-script.md` | "رؤية ٢٠٣٠" -- Eastern Arabic | **NO** |
| `social-posts.md` | "30 شركة" -- Western | Yes |
| `case-study-template.md` social proof card | "٤ ساعات" -- Eastern Arabic | **NO** |
| `blog-posts.md` | Mixed -- both systems used | **NO** |
| `cold-outreach.md` | Mixed | **NO** |
| `quick-start-guide.md` | Western numerals | Yes |

**Severity: HIGH**

The package violates its own stated standard in at least 7 files. The `whatsapp-library.md` and `video-script.md` consistently use Eastern Arabic numerals, while `sms-blast.md` and `landing-page.md` consistently use Western. A prospect receiving a WhatsApp message with "٣٠" and then visiting a landing page with "30" sees two different numeral systems for the same number.

**Recommended fix:** Global find-and-replace: ٠→0, ١→1, ٢→2, ٣→3, ٤→4, ٥→5, ٦→6, ٧→7, ٨→8, ٩→9 across all files. Exception: "رؤية 2030" should always use Western numerals (it is a proper noun/brand).

---

### 6.3 Diacritics (Tashkeel) Consistency

The package has no explicit diacritics policy. Usage is sporadic:

**Diacritics present:**
| Arabic Text | File | Diacritics Applied |
|---|---|---|
| "مُعدّة مسبقاً" | `landing-page.md` | Damma + shaddah |
| "مُبلّغون" | `blog-posts.md` | Damma + shaddah |
| "بُني" / "بُنيت" | `social-posts.md`, `video-script.md` | Damma |
| "نُدير" | `linkedin-strategy.md` | Damma |
| "معلّق" / "منظّم" | `faq.md`, `quick-start-guide.md` | Shaddah |
| "فعّل" | `landing-page.md`, `whatsapp-library.md` | Shaddah |
| "ربطًا مباشرًا" | `press-release.md` | Tanween fatha |
| "مقعدًا" | `whatsapp-library.md` | Tanween fatha |

**Diacritics absent (same words elsewhere):**
| Arabic Text | File | Issue |
|---|---|---|
| "معلق" / "منظم" | `vault-user-docs.md` | Role names without shaddah |
| "مقعدا" (no tanween) | `sms-blast.md`, `google-ads.md` | Missing tanween alif |
| "بني" (no damma) | Various | Inconsistent with "بُني" elsewhere |

**Assessment:** The diacritics usage follows no consistent rule. Some files add shaddah to role names (معلّق), others do not (معلق). Some add tanween to accusative nouns (مقعدًا), others drop it (مقعدا). This creates an impression of inconsistent editorial rigor.

**Recommended policy:**
1. **Role names:** Always include shaddah where etymologically present: معلّق، منظّم، مُدير (for disambiguation: "معلق" without shaddah means "suspended")
2. **Brand vocabulary:** Always include diacritics on "بُنيت" and "فعّل" (disambiguation and brand voice)
3. **SMS/Ads:** Strip all diacritics (character count constraints; diacritics consume UCS-2 characters)
4. **Everything else:** No diacritics unless required for disambiguation

**Severity: MODERATE** -- The role name diacritics are important for disambiguation. The rest is editorial polish.

---

### 6.4 RTL/LTR Display Concerns

The `landing-page.md` design notes correctly specify:
- `dir="rtl"` on the `<html>` element for Arabic
- CSS logical properties (`margin-inline-start`, `padding-inline-end`)
- Timeline reads right-to-left in Arabic
- FAQ accordion chevrons flip in RTL
- Language toggle without page reload

**Potential issues in content files:**

| File | Concern |
|---|---|
| All files with mixed Arabic/English in tables | Markdown tables with Arabic and English columns will render differently depending on the rendering engine's BiDi algorithm. Tables in `win-loss-template.md`, `case-study-template.md`, and `vault-user-docs.md` place Arabic in the left column and English in the right -- this is correct for LTR rendering contexts (like GitHub/Markdown), but would need column reordering for RTL web rendering. |
| `sms-blast.md` | Arabic SMS with "Vault" embedded will have correct BiDi in modern phones. No action needed. |
| `social-posts.md` hashtags | Mixed-script hashtags (#مساهم #Musahm) will display correctly on LinkedIn/Twitter as each platform handles BiDi per-token. |

**Severity: LOW** -- The design specifications are correct. Content files are Markdown (LTR rendering context), so their column order is appropriate for the authoring format. The frontend team's RTL implementation will handle display-time reordering.

---

## Appendix A: Per-File Arabic Quality Summary

| File | Arabic Content Volume | Quality | Key Issues |
|---|---|---|---|
| `voice-guide.md` | Medium | 9/10 | Reference document. Defines the standard. |
| `battle-cards.md` | Medium | 7/10 | "خزنة" stray artifact, "95%" unverifiable claim |
| `brand-audit.md` | Low | 8/10 | Minimal Arabic. Tagline analysis is sound. |
| `icp.md` | Medium | 8/10 | Persona titles consistent. Pain points natural. |
| `message-house.md` | High | 7/10 | Workspace name deviation (السياسات والأنظمة), colloquial in objection handler |
| `press-release.md` | Very High | 8/10 | Strong formal MSA. Eastern Arabic numerals violate standard. Workspace name deviation. |
| `landing-page.md` | Very High | 8/10 | Good quality. "Musahm Vault" Latin script in Arabic hero. |
| `faq.md` | Very High | 9/10 | Canonical reference for terminology. Best file for role names. |
| `launch-email.md` | High | 8/10 | Strong. Only 5 workspaces listed (omits Association Meetings). |
| `sms-blast.md` | Medium | 8/10 | Well-engineered for UCS-2. "مقعدا" tanween issue. |
| `social-posts.md` | Very High | 8/10 | Good bilingual quality. 7 hashtags per post is excessive. |
| `video-script.md` | High | 9/10 | Khaleeji VO markers are intentional. Eastern Arabic numerals. |
| `whatsapp-library.md` | Very High | 9/10 | Best channel-specific Arabic. Eastern Arabic numerals throughout. |
| `cold-outreach.md` | Very High | 7/10 | Fabricated statistics. Mixed numeral systems. |
| `nurture-sequence.md` | High | 8/10 | Clean. No fabrications. |
| `onboarding-sequence.md` | High | 5/10 | Wrong role names (مساهم، مشرف). Existing features as "coming soon." |
| `quick-start-guide.md` | High | 9/10 | Correct role names. Correct workspace names. Clean MSA. |
| `blog-posts.md` | Very High | 8/10 | Strong long-form Arabic. Mixed numeral systems in some posts. |
| `case-study-template.md` | High | 8/10 | Clean. Eastern Arabic numeral in social proof card. |
| `partner-kit.md` | High | 6/10 | Wrong role names (مشاهد/مسؤول). Al-Ufuq sector wrong. |
| `poster-copy.md` | Low | 7/10 | Modified tagline. |
| `sales-deck.md` | Very High | 7/10 | Strong Arabic. Wrong workspace name. Speaker notes English-only. |
| `google-ads.md` | Medium | 7/10 | "مقعدا" tanween issue. Mobile app claims (if false). |
| `linkedin-strategy.md` | High | 7/10 | Good Arabic. Banner color inconsistency. Hashtag overuse. |
| `social-calendar.md` | Very High | 7/10 | Triple "ليس" AI pattern. Workspace names deviate. |
| `vault-user-docs.md` | Medium | 9/10 | Code-sourced. Canonical workspace/role reference. Role names lack shaddah. |
| `win-loss-template.md` | Medium | 8/10 | Clean bilingual headers. |

---

## Appendix B: Canonical Glossary (Recommended)

This glossary should be distributed to all content authors, translators, and the Arabic native reviewer as the single source of truth.

### Product Names
| Term | Arabic | English | Notes |
|---|---|---|---|
| Platform name | مساهم | Musahm | Always Arabic in Arabic contexts |
| DMS product | مساهم Vault | Musahm Vault | "Vault" stays in Latin script |
| DMS possessive | Vault من مساهم | Vault by Musahm | For sentences requiring possessive |

### Workspaces (Code-Canonical)
| # | Arabic | English |
|---|---|---|
| 1 | اجتماعات مجلس الإدارة | Board Meetings |
| 2 | اجتماعات الجمعيات | Association Meetings |
| 3 | اجتماعات اللجان | Committee Meetings |
| 4 | القرارات | Decisions |
| 5 | توثيق العقود | Contract Documentation |
| 6 | السياسات واللوائح | Policies & Regulations |

### Roles (Code-Canonical, with Diacritics)
| Level | Arabic | English |
|---|---|---|
| 1 | عارض | Viewer |
| 2 | معلّق | Commenter |
| 3 | محرر | Editor |
| 4 | منظّم | Organizer |
| 5 | مدير | Admin |

### Core Features
| Feature | Arabic | English |
|---|---|---|
| Audit trail | سجل تدقيق | Audit trail |
| Access control | صلاحيات | Permissions / Access control |
| External sharing | مشاركة خارجية | External sharing |
| One-time password | كلمة مرور لمرة واحدة (OTP) | One-time password (OTP) |
| Watermark | علامة مائية | Watermark |
| Workflow | سير عمل | Workflow |
| Shareholder Registry | سجل المساهمين | Shareholder Registry |
| Smart search | بحث ذكي | Intelligent search |
| Ask Vault | اسأل Vault | Ask Vault |
| Governed workspaces | مساحات عمل محوكمة | Governed workspaces |

### CTA Vocabulary
| Context | Arabic CTA | English CTA |
|---|---|---|
| Primary (landing page, email, social) | فعّل Vault لشركتك | Activate Vault for your company |
| Form-adjacent (SMS, ads) | سجّل الآن | Register now |
| Meeting booking | احجز عرضًا | Book a demo |

### Regulatory Terms
| Term | Arabic | English |
|---|---|---|
| Companies Law | نظام الشركات | Companies Law |
| CMA | هيئة السوق المالية | Capital Market Authority (CMA) |
| Vision 2030 | رؤية 2030 | Vision 2030 |
| PDPL | نظام حماية البيانات الشخصية | Personal Data Protection Law (PDPL) |
| E-Transactions Law | نظام التعاملات الإلكترونية | Electronic Transactions Law |
| CBAHI | المجلس المركزي لاعتماد المنشآت الصحية | CBAHI |

### Numeral Standard
**Western Arabic numerals (0-9) in all contexts.** No Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩).

---

## Appendix C: Priority Fix List

### Immediate (Before Any Content Ships)

| # | Issue | Category | Files to Fix | Fix |
|---|---|---|---|---|
| 1 | Workspace name #6: "السياسات والأنظمة" | Terminology | `message-house.md`, `press-release.md` | Change to "السياسات واللوائح" |
| 2 | Workspace name #2: singular vs plural | Terminology | `faq.md`, `landing-page.md`, `onboarding-sequence.md`, `quick-start-guide.md` | Change "اجتماعات الجمعية" to "اجتماعات الجمعيات" |
| 3 | Workspace name #2: omitted entirely | Terminology | `launch-email.md`, `message-house.md` | Add "اجتماعات الجمعيات" to workspace lists |
| 4 | Role names in onboarding | Terminology | `onboarding-sequence.md` | Replace "مساهم/مشرف" with "معلّق/منظّم" |
| 5 | Role names in partner kit | Terminology | `partner-kit.md` | Replace "مشاهد/مسؤول" with "عارض/مدير" |
| 6 | Eastern Arabic numerals | Red Flag | `press-release.md`, `whatsapp-library.md`, `video-script.md`, `case-study-template.md`, `blog-posts.md`, `cold-outreach.md` | Convert all to Western Arabic (0-9) |
| 7 | "خزنة" stray artifact | Terminology | `battle-cards.md` | Remove or replace with "Vault" |
| 8 | "مقعدا" incomplete tanween | MSA Quality | `sms-blast.md`, `google-ads.md` | Either "مقعدًا" (with tanween) or "مقعد" (stripped) |

### Before Launch

| # | Issue | Category | Files to Fix | Fix |
|---|---|---|---|---|
| 9 | CTA verb scatter | Terminology | Multiple | Standardize per glossary |
| 10 | Diacritics on role names | Red Flag | `vault-user-docs.md` | Add shaddah: معلّق, منظّم |
| 11 | "Musahm" in Latin in Arabic text | Script Mixing | `landing-page.md`, `quick-start-guide.md` | Use "مساهم" in Arabic contexts |
| 12 | Triple "ليس" AI pattern | MSA Quality | `social-calendar.md` | Rewrite with conjunctions |
| 13 | Colloquial in message-house | MSA Quality | `message-house.md` | Rewrite objection handler 3 in MSA |
| 14 | Hashtag count | Saudi B2B | `social-posts.md`, `social-calendar.md` | Reduce to 3-4 per post |
| 15 | "من الصفر" overuse | Cultural | Multiple | Vary phrasing; use in max 3 files |

---

## Methodology Notes

- All 43 files in `gtm/` were read in full
- Arabic text was evaluated against Modern Standard Arabic (MSA) grammar, Saudi business communication conventions, and the package's own voice guide and brand recommendation
- Terminology consistency was checked against code-canonical sources (`ConstRoles.cs`, `ConstDefaultWorkspaces.cs`, `ConstPermissions.cs`) as documented in `vault-user-docs.md`
- The numeral standard was checked against the explicit directive in `recommendation.md` Modification 3
- Cultural appropriateness was evaluated from the perspective of a Saudi B2B decision-maker (Board Secretary, CEO, CFO, Legal Counsel personas defined in `icp.md`)
- This audit does not duplicate findings already documented in `AUDIT-REPORT.md` or `CEO-AUDIT.md` unless they have Arabic-specific dimensions not covered in those reports
