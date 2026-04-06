# Google Ads Campaign Structure: Musahm Vault Beta

> **Framework:** Campaign 6-Step (Audience → Keywords → Ad Copy → Extensions → Bid Strategy → Measurement)
> **Date:** 2026-04-02
> **Objective:** Drive beta sign-ups for Musahm Vault from Saudi governance decision-makers
> **Landing page:** `https://vault.musahm.com/beta` (confirm with web team)
> **Geographic targeting:** Saudi Arabia (primary), GCC (optional expansion in month 2)
> **Language targeting:** Arabic (primary), English (secondary for bilingual personas)
> **Device targeting:** Desktop + Mobile (Saudi executives browse heavily on mobile)

## Sitelink Landing Page Requirements

Before launching, every sitelink URL must resolve to a real page. Build or map these pages:

| Sitelink URL                     | Page Status | Required Content                                                            |
| -------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `/vault/features`                | BUILD       | Vault feature list: workspaces, ACLs, audit trail, workflows, AI extraction |
| `/vault/beta`                    | EXISTS      | Beta signup form (Tally or equivalent)                                      |
| `/about`                         | BUILD       | Company story, team, Saudi-built positioning                                |
| `/contact`                       | BUILD       | Contact form or details, business hours, email                              |
| `/demo`                          | BUILD       | Cal.com embed or demo booking form                                          |
| `/features/shareholder-registry` | BUILD       | Dedicated shareholder registry feature page                                 |
| `/why-musahm`                    | BUILD       | Competitive positioning page (use battle card content)                      |
| `/compare`                       | OPTIONAL    | Comparison table vs. competitors (Campaign 4 sitelinks)                     |

**Action for client:** Build the 6 missing pages before activating sitelinks. If pages are not ready at launch, remove the corresponding sitelinks and use only `/vault/beta` until pages are live. Running sitelinks to 404 pages will tank Quality Score.

---

## Campaign 1: Arabic Brand Search

**Goal:** Capture existing brand awareness and direct searches for Musahm.

**Bid strategy:** Target Impression Share (90%+ top-of-page) -- brand terms are cheap and high-intent. Switch to Maximize Conversions once conversion tracking is validated.

**Budget recommendation:** SAR 1,500-3,000/month (brand terms have low CPC in KSA, typically SAR 0.50-2.00)

> WARNING: NEEDS CLIENT INPUT for final budget approval.

**Landing page:** `https://vault.musahm.com/beta`

**Geographic targeting:** Saudi Arabia

### Keywords

| #   | Keyword           | Match Type | Expected Intent            |
| --- | ----------------- | ---------- | -------------------------- |
| 1   | مساهم             | Exact      | Brand search               |
| 2   | مساهم             | Phrase     | Brand + modifier           |
| 3   | منصة مساهم        | Exact      | Brand + product            |
| 4   | مساهم vault       | Exact      | Brand + sub-brand          |
| 5   | مساهم خزنة        | Exact      | Brand + sub-brand (Arabic) |
| 6   | تسجيل مساهم       | Exact      | Brand + action             |
| 7   | مساهم حوكمة       | Exact      | Brand + category           |
| 8   | مساهم إدارة وثائق | Exact      | Brand + Vault category     |
| 9   | مساهم تسجيل دخول  | Exact      | Existing user navigation   |

> **Routing note:** "مساهم تسجيل دخول" is a navigational query from existing users. This keyword's ad should link to the login page (`https://www-s2.vault.musahm.com/login` or equivalent), not the beta signup page. Set a keyword-level final URL override pointing to the login page.

| 10 | musahm | Exact | English brand search |
| 11 | musahm vault | Exact | English sub-brand |
| 12 | musahm.com | Exact | Direct URL search |
| 13 | منصة مساهم للحوكمة | Phrase | Brand + governance |
| 14 | مساهم سجل المساهمين | Exact | Brand + unique feature |

### Negative Keywords

| Keyword      | Match Type | Reason                                      |
| ------------ | ---------- | ------------------------------------------- |
| مساهم بالجيش | Phrase     | Military contribution (different meaning)   |
| مساهم عقاري  | Phrase     | Real estate shareholder (could be confused) |
| مساهمة خيرية | Phrase     | Charitable contribution                     |
| وظائف مساهم  | Phrase     | Job seekers                                 |
| تحميل مجاني  | Phrase     | Freeware seekers                            |

### RSA 1: Brand Core

**Headlines (15):**

| #   | Headline (AR)               | Characters |
| --- | --------------------------- | ---------- |
| 1   | مساهم Vault - وثائق محوكمة  | 27         |
| 2   | حوكمة سعودية. منصة عالمية   | 25         |
| 3   | نظام وثائق بُني للسعودية    | 24         |
| 4   | المنصة السعودية للحوكمة     | 22         |
| 5   | وثائقك. محمية. محوكمة       | 20         |
| 6   | سجّل في النسخة التجريبية    | 23         |
| 7   | بنينا Vault من الصفر        | 20         |
| 8   | إدارة وثائق بمعايير سعودية  | 26         |
| 9   | سجل تدقيق لكل عملية         | 20         |
| 10  | 30 مقعدا تجريبيا فقط        | 21         |
| 11  | خمسة مستويات صلاحيات        | 20         |
| 12  | حماية بمعايير الحوكمة       | 20         |
| 13  | مساهم + Vault = حوكمة كاملة | 27         |
| 14  | وثائق شركتك تستحق حماية     | 24         |
| 15  | سجّل شركتك الآن             | 16         |

**Descriptions (4):**

| #   | Description (AR)                                                                                         | Characters |
| --- | -------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | مساهم Vault, نظام إدارة الوثائق المبني من الصفر للحوكمة السعودية. سجل تدقيق شامل وصلاحيات بخمسة مستويات. | 90         |
| 2   | وثائق شركتك مبعثرة بين الإيميل والواتساب؟ Vault يحمي وثائق الحوكمة بمعايير سعودية. سجّل الآن.            | 88         |
| 3   | منصة سعودية تجمع الحوكمة وإدارة الوثائق في منتج واحد. المقاعد التجريبية محدودة.                          | 78         |
| 4   | بُنينا من الصفر لنظام الشركات السعودي, لأن شركاتنا تستحق حوكمة تفهمها. سجّلوا في التجريبي.               | 87         |

### RSA 2: Brand + Feature

**Headlines (15):**

| #   | Headline (AR)             | Characters |
| --- | ------------------------- | ---------- |
| 1   | مساهم, حوكمة من الصفر     | 22         |
| 2   | حوكمة سعودية. منصة عالمية | 25         |
| 3   | سجل مساهمين مدمج          | 17         |
| 4   | تواصل مساهمين عبر SMS     | 23         |
| 5   | توقيعات إلكترونية متوافقة | 24         |
| 6   | Vault, وثائق محوكمة       | 19         |
| 7   | سير عمل وموافقات آلية     | 22         |
| 8   | بحث في كل وثائقك          | 17         |
| 9   | واجهة عربية أولا          | 16         |
| 10  | واجهة عربية أصلية RTL     | 21         |
| 11  | سجّل في التجريبي مجانا    | 23         |
| 12  | مشاركة خارجية بـ OTP      | 22         |
| 13  | 30 مقعدا تجريبيا فقط      | 21         |
| 14  | لأن شركاتنا تستحق         | 19         |
| 15  | الحوكمة تبدأ بالوثائق     | 21         |

**Descriptions (4):**

| #   | Description (AR)                                                                                         | Characters |
| --- | -------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | سجل مساهمين مدمج. تواصل عبر SMS. توقيعات إلكترونية. سجل تدقيق شامل. كل ما تحتاجه الحوكمة السعودية.       | 90         |
| 2   | ستة مساحات عمل محوكمة جاهزة من اليوم الأول. صلاحيات دقيقة لكل وثيقة. مشاركة خارجية محمية برمز تحقق.      | 90         |
| 3   | لم نستورد حلا أجنبيا. بنينا منصة سعودية من الصفر, لأن شركاتنا تستحق حوكمة تفهمها. سجّلوا الآن.           | 90         |
| 4   | واجهة عربية أصلية. متوافق مع الجوال. استخراج ذكي بالذكاء الاصطناعي. جاهز للتدقيق في أي لحظة. جرّبه الآن. | 90         |

### RSA 3: Brand + Urgency

**Headlines (15):**

| #   | Headline (AR)              | Characters |
| --- | -------------------------- | ---------- |
| 1   | مساهم Vault, سجّل الآن     | 23         |
| 2   | حوكمة سعودية. منصة عالمية  | 25         |
| 3   | المقاعد التجريبية تنفد     | 22         |
| 4   | 30 شركة فقط في التجريبي    | 24         |
| 5   | وثائقك تستحق حماية سعودية  | 26         |
| 6   | سجّل قبل اكتمال العدد      | 21         |
| 7   | أول 30 شركة تحصل على وصول  | 27         |
| 8   | Vault جاهز, هل شركتك جاهزة | 28         |
| 9   | ابدأ حوكمة وثائقك اليوم    | 24         |
| 10  | لا تؤجل حماية وثائقك       | 22         |
| 11  | التسجيل التجريبي مفتوح     | 22         |
| 12  | بنينا Vault لشركتك         | 19         |
| 13  | جرّب Vault بدون التزام     | 23         |
| 14  | سجّل في دقيقتين            | 16         |
| 15  | منصة واحدة لكل وثائقك      | 23         |

**Descriptions (4):**

| #   | Description (AR)                                                                                 | Characters |
| --- | ------------------------------------------------------------------------------------------------ | ---------- |
| 1   | المقاعد التجريبية محدودة لأول 30 شركة سعودية. سجّل الآن واحصل على وصول مبكر لنظام وثائق محوكم.   | 88         |
| 2   | وثائق شركتك في الإيميل والواتساب؟ حان وقت الحوكمة. Vault يحمي ويصنّف ويتتبع كل وثيقة. سجّل الآن. | 90         |
| 3   | الشركات السعودية التي تسجل الآن تحصل على دعم مخصص ومساعدة في الإعداد. العدد محدود. سجّل اليوم.   | 88         |
| 4   | نظام الشركات يرفع معايير الحوكمة. Vault يساعدك على الامتثال من اليوم الأول. سجّل في التجريبي.    | 87         |

### Ad Extensions, Campaign 1

**Sitelinks:**

| #   | Sitelink Text (AR) | Description Line 1        | Description Line 2   | URL             |
| --- | ------------------ | ------------------------- | -------------------- | --------------- |
| 1   | ميزات Vault        | سجل تدقيق وصلاحيات        | ست مساحات عمل محوكمة | /vault/features |
| 2   | سجّل في التجريبي   | 30 مقعدا فقط              | سجّل شركتك الآن      | /vault/beta     |
| 3   | عن مساهم           | حوكمة سعودية. منصة عالمية | بُنيت من الصفر       | /about          |
| 4   | تواصل معنا         | فريق دعم سعودي            | نرد خلال ساعات العمل | /contact        |

**Callout Extensions:**

| #   | Callout (AR)       | Characters |
| --- | ------------------ | ---------- |
| 1   | صنع سعودي          | 9          |
| 2   | واجهة عربية أولا   | 16         |
| 3   | سجل تدقيق شامل     | 15         |
| 4   | متوافق مع الجوال   | 16         |
| 5   | مشاركة آمنة بـ OTP | 18         |
| 6   | توقيعات إلكترونية  | 18         |

**Structured Snippets:**

| Header | Values                                                             |
| ------ | ------------------------------------------------------------------ |
| أنواع  | حوكمة الشركات، إدارة الوثائق، سجل المساهمين، التوقيعات الإلكترونية |
| ميزات  | سجل تدقيق، صلاحيات، سير عمل، بحث بالكلمات المفتاحية، مشاركة محمية  |

---

## Campaign 2: Arabic Generic Search

**Goal:** Capture prospects searching for governance, DMS, and compliance solutions in Arabic.

**Bid strategy:** Maximize Conversions with Target CPA (set after 2 weeks of data collection). Start with Manual CPC to gather conversion data.

**Budget recommendation:** SAR 8,000-15,000/month (generic terms have higher CPC, SAR 3-10 range in KSA)

> WARNING: NEEDS CLIENT INPUT for final budget approval.

**Landing page:** `https://vault.musahm.com/beta`

**Geographic targeting:** Saudi Arabia

### Keywords

| #   | Keyword                | Match Type | Expected Intent                        |
| --- | ---------------------- | ---------- | -------------------------------------- |
| 1   | إدارة وثائق            | Phrase     | DMS category search                    |
| 2   | نظام إدارة الوثائق     | Exact      | DMS exact search                       |
| 3   | حوكمة الشركات          | Phrase     | Governance category                    |
| 4   | نظام حوكمة             | Exact      | Governance software                    |
| 5   | سجل المساهمين          | Exact      | Shareholder registry (unique feature)  |
| 6   | إدارة سجل المساهمين    | Phrase     | Shareholder registry management        |
| 7   | نظام أرشفة             | Phrase     | Archiving system                       |
| 8   | أرشفة إلكترونية        | Phrase     | Electronic archiving                   |
| 9   | نظام أرشفة وثائق       | Exact      | Document archiving system              |
| 10  | منصة حوكمة سعودية      | Exact      | Saudi governance platform              |
| 11  | إدارة مجلس الإدارة     | Phrase     | Board management                       |
| 12  | محاضر اجتماعات المجلس  | Phrase     | Board meeting minutes                  |
| 13  | نظام الشركات الجديد    | Phrase     | New Companies Law (regulatory trigger) |
| 14  | سجل تدقيق إلكتروني     | Phrase     | Electronic audit trail                 |
| 15  | توقيع إلكتروني للشركات | Phrase     | Corporate e-signatures                 |
| 16  | نظام إدارة وثائق سحابي | Exact      | Cloud DMS                              |
| 17  | حفظ وثائق الشركة       | Phrase     | Company document storage               |
| 18  | امتثال حوكمة الشركات   | Phrase     | Corporate governance compliance        |
| 19  | برنامج إدارة اللجان    | Exact      | Committee management software          |
| 20  | نظام تصويت إلكتروني    | Exact      | Electronic voting system               |

### Negative Keywords (20)

| Keyword             | Match Type | Reason                                            |
| ------------------- | ---------- | ------------------------------------------------- |
| مجاني               | Broad      | Freeware seekers                                  |
| تحميل               | Broad      | Download-only seekers                             |
| وظائف               | Broad      | Job seekers                                       |
| تعليم               | Broad      | Educational content seekers                       |
| كورس                | Broad      | Course seekers                                    |
| ماجستير             | Broad      | Academic degree seekers                           |
| حوكمة المدارس       | Phrase     | School governance (different vertical)            |
| حوكمة الحكومة       | Phrase     | Government governance (not our market)            |
| شيربوينت            | Exact      | SharePoint seekers (competitor, different intent) |
| جوجل درايف          | Exact      | Google Drive seekers                              |
| وورد                | Exact      | Microsoft Word seekers                            |
| قالب محاضر اجتماعات | Phrase     | Template seekers (not buyers)                     |
| نموذج سجل مساهمين   | Phrase     | Template seekers                                  |
| حوكمة البنوك        | Phrase     | Banking governance (enterprise, not SMB)          |
| أرشفة ورقية         | Phrase     | Paper archiving (physical, not digital)           |
| دروبوكس             | Exact      | Consumer cloud storage seekers                    |
| مفتوح المصدر        | Phrase     | Open-source seekers (different buyer profile)     |
| حوكمة المستشفيات    | Phrase     | Hospital-specific governance (niche vertical)     |
| تدريب حوكمة         | Phrase     | Governance training seekers (not software buyers) |
| رسالة ماجستير حوكمة | Phrase     | Academic research (not purchase intent)           |

### RSA 1: DMS Focus

**Headlines (15):**

| #   | Headline (AR)              | Characters |
| --- | -------------------------- | ---------- |
| 1   | نظام وثائق بُني للسعودية   | 24         |
| 2   | حوكمة سعودية. منصة عالمية  | 25         |
| 3   | إدارة وثائق محوكمة         | 19         |
| 4   | Vault, ليس مجرد تخزين      | 22         |
| 5   | سجل تدقيق لكل عملية        | 20         |
| 6   | خمسة مستويات صلاحيات       | 20         |
| 7   | مساحات عمل محوكمة جاهزة    | 23         |
| 8   | واجهة عربية من اليوم الأول | 25         |
| 9   | سجّل في النسخة التجريبية   | 23         |
| 10  | وثائقك. محمية. محوكمة      | 20         |
| 11  | جاهز للتدقيق في ثوانٍ      | 22         |
| 12  | مشاركة خارجية محمية        | 19         |
| 13  | 30 مقعدا تجريبيا فقط       | 21         |
| 14  | بنينا Vault من الصفر       | 20         |
| 15  | سير عمل وموافقات آلية      | 22         |

**Descriptions (4):**

| #   | Description (AR)                                                                              | Characters |
| --- | --------------------------------------------------------------------------------------------- | ---------- |
| 1   | Vault من مساهم, نظام إدارة وثائق بُني للحوكمة السعودية. ست مساحات عمل محوكمة. سجل تدقيق شامل. | 89         |
| 2   | وثائق شركتك في الإيميل والواتساب؟ Vault يحمي ويصنّف ويتتبع كل وثيقة محوكمة. المقاعد محدودة.   | 88         |
| 3   | صلاحيات بخمسة مستويات. سير عمل بسلاسل موافقة. مشاركة خارجية برمز تحقق. منصة سعودية من الصفر.  | 89         |
| 4   | لا شيربوينت. لا مجلدات مشتركة. نظام وثائق يفهم الحوكمة السعودية. سجّل في التجريبي الآن.       | 86         |

### RSA 2: Governance Focus

**Headlines (15):**

| #   | Headline (AR)              | Characters |
| --- | -------------------------- | ---------- |
| 1   | منصة حوكمة سعودية متكاملة  | 25         |
| 2   | حوكمة سعودية. منصة عالمية  | 25         |
| 3   | مجلس إدارة. لجان. جمعيات   | 25         |
| 4   | سجل مساهمين مدمج           | 17         |
| 5   | تواصل مساهمين عبر SMS      | 23         |
| 6   | توقيعات إلكترونية معتمدة   | 24         |
| 7   | تصويت إلكتروني آمن         | 19         |
| 8   | مصمم لنظام الشركات السعودي | 26         |
| 9   | حوكمة كاملة من منصة واحدة  | 25         |
| 10  | 30 مقعدا تجريبيا فقط       | 21         |
| 11  | بنينا مساهم من الصفر       | 20         |
| 12  | امتثال نظام الشركات        | 19         |
| 13  | سجّل شركتك اليوم           | 18         |
| 14  | لأن شركاتنا تستحق          | 19         |
| 15  | واجهة عربية أولا           | 16         |

**Descriptions (4):**

| #   | Description (AR)                                                                                  | Characters |
| --- | ------------------------------------------------------------------------------------------------- | ---------- |
| 1   | مساهم, منصة سعودية تجمع حوكمة المجلس وسجل المساهمين وإدارة الوثائق في منتج واحد.                  | 80         |
| 2   | اجتماعات. قرارات. تصويت. توقيعات. سجل مساهمين. تواصل عبر SMS. كل ما تحتاجه الحوكمة السعودية.      | 88         |
| 3   | مصمم لنظام الشركات السعودي من اليوم الأول, ليس حلا أجنبيا معرّبا. المقاعد التجريبية محدودة. سجّل. | 89         |
| 4   | معايير الحوكمة ارتفعت. مساهم بُنيت لتواكب هذا المعيار. سجّل شركتك في النسخة التجريبية الآن.       | 87         |

### RSA 3: Shareholder Registry Focus

**Headlines (15):**

| #   | Headline (AR)              | Characters |
| --- | -------------------------- | ---------- |
| 1   | سجل مساهمين إلكتروني       | 21         |
| 2   | حوكمة سعودية. منصة عالمية  | 25         |
| 3   | لا تدير مساهميك بالإكسل    | 24         |
| 4   | تتبع نقل الأسهم تلقائيا    | 23         |
| 5   | إشعارات مساهمين عبر SMS    | 24         |
| 6   | سجل مساهمين محوكم ومدقق    | 25         |
| 7   | ميزة لا يقدمها غيرنا       | 21         |
| 8   | من الإكسل إلى الحوكمة      | 22         |
| 9   | سجّل في النسخة التجريبية   | 23         |
| 10  | 30 مقعدا تجريبيا فقط       | 21         |
| 11  | مدرجة وغير مدرجة ومحدودة   | 26         |
| 12  | سجل تدقيق لكل نقل أسهم     | 24         |
| 13  | بنينا مساهم من الصفر       | 20         |
| 14  | منصة واحدة للحوكمة الكاملة | 26         |
| 15  | سجّل شركتك الآن            | 16         |

**Descriptions (4):**

| #   | Description (AR)                                                                                    | Characters |
| --- | --------------------------------------------------------------------------------------------------- | ---------- |
| 1   | سجل المساهمين ليس ملف إكسل. مساهم تتعامل معه كسجل قانوني, مع تاريخ إصدارات وتدقيق وصلاحيات.         | 88         |
| 2   | منصة سعودية بسجل مساهمين مدمج مع إشعارات SMS, تتبع كل نقل أسهم وكل تغيير رأس مال.                   | 82         |
| 3   | مدرجة أو غير مدرجة أو ذات مسؤولية محدودة, مساهم تخدم جميع أنواع الشركات السعودية. سجّل في التجريبي. | 90         |

> :warning: **NEEDS VERIFICATION:** The "95% of Saudi companies" claim requires a verifiable data source. Confirm the actual percentage of Saudi companies that are closed joint-stock, listed, or LLC entities before running this ad. Google Ads policy requires substantiation for statistical claims.

### Ad Extensions, Campaign 2

**Sitelinks:**

| #   | Sitelink Text (AR) | Description Line 1          | Description Line 2 | URL                            |
| --- | ------------------ | --------------------------- | ------------------ | ------------------------------ |
| 1   | ميزات Vault        | وثائق محوكمة بمعايير سعودية | سجل تدقيق وصلاحيات | /vault/features                |
| 2   | سجل المساهمين      | ميزة حصرية في مساهم         | إدارة أسهم محوكمة  | /features/shareholder-registry |
| 3   | سجّل في التجريبي   | 30 مقعدا فقط                | سجّل شركتك الآن    | /vault/beta                    |
| 4   | احجز عرضا تجريبيا  | جلسة خاصة بالعربية          | 30 دقيقة مع فريقنا | /demo                          |

**Callout Extensions:**

| #   | Callout (AR)          | Characters |
| --- | --------------------- | ---------- |
| 1   | صنع سعودي من الصفر    | 18         |
| 2   | سجل تدقيق لكل عملية   | 20         |
| 3   | واجهة عربية أصلية     | 17         |
| 4   | واجهة عربية أصلية RTL | 21         |
| 5   | سجل مساهمين مدمج      | 17         |
| 6   | مشاركة محمية بـ OTP   | 19         |

**Structured Snippets:**

| Header | Values                                                                                |
| ------ | ------------------------------------------------------------------------------------- |
| أنواع  | حوكمة مجلس الإدارة، إدارة الوثائق، سجل المساهمين، التوقيعات الإلكترونية، إدارة اللجان |
| قطاعات | عقارات، رعاية صحية، تعليم، شركات عائلية، شركات قابضة                                  |

---

## Campaign 3: English Search (Bilingual Decision-Makers)

**Goal:** Capture English-searching Saudi executives, expatriate board members, and bilingual governance professionals.

**Bid strategy:** Maximize Conversions. English governance keywords in KSA have lower competition than Arabic.

**Budget recommendation:** SAR 3,000-6,000/month

> WARNING: NEEDS CLIENT INPUT for final budget approval.

**Landing page:** `https://vault.musahm.com/beta` (English version)

**Geographic targeting:** Saudi Arabia (primary), UAE and Bahrain (optional)

### Keywords

| #   | Keyword                             | Match Type | Expected Intent        |
| --- | ----------------------------------- | ---------- | ---------------------- |
| 1   | document management Saudi Arabia    | Phrase     | DMS in KSA             |
| 2   | document management system KSA      | Exact      | DMS + geo              |
| 3   | corporate governance software Saudi | Exact      | Governance + geo       |
| 4   | board management software Saudi     | Phrase     | Board management + geo |
| 5   | shareholder registry software       | Phrase     | Unique feature search  |
| 6   | Saudi governance platform           | Exact      | Category + geo         |
| 7   | DMS for Saudi companies             | Exact      | DMS + audience         |
| 8   | board portal Saudi Arabia           | Phrase     | Board portal + geo     |
| 9   | audit trail software Saudi          | Phrase     | Compliance + geo       |
| 10  | Saudi Companies Law compliance      | Phrase     | Regulatory trigger     |
| 11  | corporate document management       | Phrase     | Generic DMS            |
| 12  | governance platform Arabic          | Phrase     | Arabic-specific        |
| 13  | e-signature Saudi Arabia            | Phrase     | E-signature + geo      |
| 14  | board meeting management software   | Phrase     | Board meetings         |
| 15  | Musahm Vault                        | Exact      | Brand (English)        |

### Negative Keywords

| Keyword         | Match Type | Reason                           |
| --------------- | ---------- | -------------------------------- |
| free            | Broad      | Freeware seekers                 |
| download        | Broad      | Download-only seekers            |
| jobs            | Broad      | Job seekers                      |
| careers         | Broad      | Job seekers                      |
| template        | Broad      | Template seekers                 |
| tutorial        | Broad      | Educational content              |
| course          | Broad      | Educational content              |
| government      | Phrase     | Public sector (different market) |
| SharePoint      | Exact      | Competitor, different intent     |
| Google Drive    | Exact      | Consumer storage                 |
| Dropbox         | Exact      | Consumer storage                 |
| open source DMS | Phrase     | OSS seekers (different buyer)    |

### RSA 1: Saudi-Built Positioning

**Headlines (15):**

| #   | Headline (EN)                   | Characters |
| --- | ------------------------------- | ---------- |
| 1   | Saudi-Built Document Management | 30         |
| 2   | Saudi Governance. World-Class   | 29         |
| 3   | Built for Saudi Companies Law   | 29         |
| 4   | Musahm Vault - Governed Docs    | 28         |
| 5   | Arabic-First Governance DMS     | 27         |
| 6   | Complete Audit Trail Built In   | 29         |
| 7   | Five-Level Access Control       | 25         |
| 8   | Beta Spots Are Limited          | 21         |
| 9   | Register Your Company Now       | 24         |
| 10  | Not Adapted. Built Saudi        | 24         |
| 11  | Governance That Understands     | 27         |
| 12  | Your Docs. Secured. Governed    | 27         |
| 13  | One Platform for Governance     | 26         |
| 14  | Only 30 Beta Seats Left         | 23         |
| 15  | Register for Beta Access        | 24         |

**Descriptions (4):**

| #   | Description (EN)                                                                                                                   | Characters |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Musahm Vault -- the DMS built from scratch for Saudi governance. Full audit trail, five-level access, OTP sharing. Register now.   | 90         |
| 2   | We did not translate a foreign platform. We built a Saudi one. Governed workspaces, approval workflows, AI extraction. Try it.     | 87         |
| 3   | A Saudi platform that combines governance and document management. Shareholder registry, SMS comms, e-signatures. Beta open.       | 88         |
| 4   | Board minutes in WhatsApp? Contracts in email? Vault protects your governance documents with Saudi-grade security. Register today. | 90         |

### RSA 2: Feature-Led

**Headlines (15):**

| #   | Headline (EN)                  | Characters |
| --- | ------------------------------ | ---------- |
| 1   | Governed Document Workspaces   | 28         |
| 2   | Saudi Governance. World-Class  | 29         |
| 3   | Shareholder Registry Built In  | 29         |
| 4   | SMS Shareholder Communications | 30         |
| 5   | Audit-Ready in Seconds         | 22         |
| 6   | AI Field Extraction Built In   | 28         |
| 7   | Automated Approval Workflows   | 28         |
| 8   | OTP-Verified External Sharing  | 29         |
| 9   | E-Signatures Compliant w/ Law  | 29         |
| 10  | Listed + Unlisted + LLC        | 23         |
| 11  | Beta Spots Are Limited         | 21         |
| 12  | Mobile-Responsive Web App      | 25         |
| 13  | Built for Saudi Boardrooms     | 26         |
| 14  | Register for Beta Access       | 24         |
| 15  | Version Control per Document   | 28         |

**Descriptions (4):**

| #   | Description (EN)                                                                                                                    | Characters |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Six governed workspaces. Per-document ACLs. Complete audit trail. Automated approval workflows. Built for Saudi corporate law.      | 90         |
| 2   | Shareholder registry with SMS notifications -- a feature no other Saudi platform offers. Manage listed, unlisted, and LLC entities. | 90         |
| 3   | AI field extraction. Keyword search across all fields. Your documents, searchable and governed. Beta registration open. Try free.   | 87         |
| 4   | From board resolution to signed contract to filed document -- one audit trail, one platform, one login. Beta registration open now. | 90         |

### RSA 3: Pain-Point Led

**Headlines (15):**

| #   | Headline (EN)                   | Characters |
| --- | ------------------------------- | ---------- |
| 1   | Stop Storing Docs in WhatsApp   | 29         |
| 2   | Saudi Governance. World-Class   | 29         |
| 3   | Your Board Deserves Better      | 26         |
| 4   | Auditor Asks -- Can You Answer  | 30         |
| 5   | Excel Is Not a Registry         | 23         |
| 6   | Governance Gaps Cost More       | 25         |
| 7   | Where Are Your Docs Right Now   | 29         |
| 8   | One System. One Source of Truth | 30         |
| 9   | CMA Compliance Made Simple      | 27         |
| 10  | Beta Spots Are Limited          | 21         |
| 11  | Built by Saudis for Saudis      | 26         |
| 12  | Register in 2 Minutes           | 21         |
| 13  | Vault Governs Documents         | 23         |
| 14  | Register Your Company Today     | 27         |
| 15  | From Chaos to Governed          | 22         |

**Descriptions (4):**

| #   | Description (EN)                                                                                                                     | Characters |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 1   | Board minutes in email. Contracts in WhatsApp. Resolutions on personal devices. Your docs deserve Saudi-grade protection. Try Vault. | 90         |
| 2   | When a regulator asks for last quarter's resolution, can you find it? Vault gives you audit-ready document governance. Register now. | 90         |
| 3   | Managing shareholders in Excel? One disputed transfer costs more than years of Musahm. Governed registry with full audit trail.      | 89         |
| 4   | Saudi companies deserve governance that understands their law, their language, and their workflow. We built it. Beta is open.        | 89         |

### Ad Extensions, Campaign 3

**Sitelinks:**

| #   | Sitelink Text (EN)   | Description Line 1                    | Description Line 2              | URL                            |
| --- | -------------------- | ------------------------------------- | ------------------------------- | ------------------------------ |
| 1   | Vault Features       | Governed workspaces and audit trail   | Five-level access control       | /vault/features                |
| 2   | Shareholder Registry | Built-in registry for Saudi companies | Track every share transfer      | /features/shareholder-registry |
| 3   | Register for Beta    | Limited to 30 companies               | Register your company now       | /vault/beta                    |
| 4   | Book a Demo          | 30-minute walkthrough                 | Available in Arabic and English | /demo                          |

**Callout Extensions:**

| #   | Callout (EN)          | Characters |
| --- | --------------------- | ---------- |
| 1   | Saudi-Built Platform  | 20         |
| 2   | Arabic-First UX       | 16         |
| 3   | Full Audit Trail      | 16         |
| 4   | Mobile-Responsive     | 17         |
| 5   | OTP External Sharing  | 20         |
| 6   | E-Signatures Built In | 21         |

**Structured Snippets:**

| Header     | Values                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Types      | Board Governance, Document Management, Shareholder Registry, E-Signatures, Committee Management |
| Industries | Real Estate, Healthcare, Education, Family Holdings, Holding Companies                          |

---

## Campaign 4: Competitor Targeting

**Goal:** Intercept prospects searching for competitors and position Musahm as the Saudi-built alternative. Tone is respectful differentiation -- never bashing.

**Bid strategy:** Manual CPC (competitor terms can have variable quality scores). Monitor impression share and adjust.

**Budget recommendation:** SAR 2,000-4,000/month (lower volume but high-intent)

> WARNING: NEEDS CLIENT INPUT for final budget approval.

**Landing page:** `https://vault.musahm.com/compare` (comparison page -- if available) or `https://vault.musahm.com/beta`

**Geographic targeting:** Saudi Arabia

### Legal Note: Competitor Keyword Bidding in KSA

Saudi Arabia does not have explicit legislation prohibiting bidding on competitor brand keywords in Google Ads. Google's global policy permits bidding on competitor terms but prohibits using competitor trademarks in ad copy text. Accordingly:

- **Permitted:** Bidding on competitor brand names as keywords (e.g., "Majles," "Diligent," "Ebana").
- **Prohibited:** Using competitor names or trademarks in headline/description text.
- **Risk mitigation:** All RSAs below reference Musahm's own capabilities without naming competitors. Ad copy focuses on differentiation, not comparison.
- **Recommendation:** Monitor competitor response. If a competitor files a Google Ads trademark complaint, Google may restrict keyword-triggered ad serving for that term. This does not affect bidding itself, only ad display.
- **Saudi Trademark Law (Royal Decree M/21):** Trademark holders can challenge use of their marks in advertising. However, keyword bidding (invisible to users) has not been tested in Saudi courts. Ad copy below avoids all competitor names to eliminate risk entirely.

> WARNING: NEEDS CLIENT INPUT -- Confirm legal team approval before activating competitor keyword campaigns.

### Keywords

| #   | Keyword                    | Match Type | Expected Intent             |
| --- | -------------------------- | ---------- | --------------------------- |
| 1   | Majles                     | Phrase     | Competitor brand            |
| 2   | مجلس تك                    | Phrase     | Competitor brand (Arabic)   |
| 3   | Majles.tech                | Exact      | Competitor domain           |
| 4   | بديل مجلس                  | Phrase     | Competitor alternative      |
| 5   | Ebana DMS                  | Exact      | Competitor brand            |
| 6   | إيبانا                     | Phrase     | Competitor brand (Arabic)   |
| 7   | بديل إيبانا                | Phrase     | Competitor alternative      |
| 8   | Diligent Board             | Phrase     | Competitor brand            |
| 9   | Diligent governance        | Phrase     | Competitor + category       |
| 10  | بديل ديليجنت               | Phrase     | Competitor alternative      |
| 11  | Majles alternative         | Phrase     | Competitor alternative (EN) |
| 12  | Diligent alternative Saudi | Phrase     | Competitor + geo            |

### Negative Keywords

| Keyword            | Match Type | Reason                                        |
| ------------------ | ---------- | --------------------------------------------- |
| مجلس الإدارة       | Exact      | Generic "board of directors" (not competitor) |
| مجلس النواب        | Exact      | Parliament (not competitor)                   |
| مجلس الشورى        | Exact      | Saudi Shura Council                           |
| مجلس الأمن         | Exact      | Security council                              |
| board of directors | Exact      | Generic governance term                       |

### RSA 1: vs. Majles Positioning

**Headlines (15):**

| #   | Headline (EN/AR)              | Characters |
| --- | ----------------------------- | ---------- |
| 1   | Governance Beyond Meetings    | 26         |
| 2   | Saudi Governance. World-Class | 29         |
| 3   | Shareholder Registry Included | 28         |
| 4   | SMS Comms Built In            | 18         |
| 5   | Listed + Unlisted + LLC       | 23         |
| 6   | Full DMS with Governance      | 24         |
| 7   | More Than Board Management    | 26         |
| 8   | Arabic-First. Not Bilingual   | 27         |
| 9   | Register for Beta Access      | 24         |
| 10  | Beta Spots Are Limited        | 21         |
| 11  | We Manage the Company         | 22         |
| 12  | One Platform. Full Governance | 28         |
| 13  | Built for Saudi Law           | 19         |
| 14  | E-Signatures + Vault + SMS    | 25         |
| 15  | الحوكمة أكبر من الاجتماعات    | 25         |

**Descriptions (4):**

| #   | Description (EN)                                                                                                              | Characters |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Governance is bigger than meetings. Musahm covers board management, shareholder registry, DMS, SMS comms, and e-signatures.   | 89         |
| 2   | Looking for a governance platform that covers listed, unlisted, and LLCs? Musahm was built for Saudi companies of every type. | 90         |

> :warning: **NEEDS VERIFICATION:** Same "95% of Saudi companies" claim as Campaign 2 RSA 3. Requires data source before launch.
> | 4 | The Saudi platform with a built-in shareholder registry and SMS communications -- capabilities no other local platform offers. | 90 |

### RSA 2: vs. All Competitors (Saudi Alternative)

**Headlines (15):**

| #   | Headline (EN/AR)              | Characters |
| --- | ----------------------------- | ---------- |
| 1   | The Saudi Governance Platform | 28         |
| 2   | حوكمة سعودية. منصة عالمية     | 25         |
| 3   | Built Saudi. Not Localized    | 26         |
| 4   | No SAR 100K Implementation    | 27         |
| 5   | Deploy in Minutes, Not Months | 29         |
| 6   | Arabic-First UX               | 16         |
| 7   | SaaS Pricing for SMBs         | 21         |
| 8   | بنينا من الصفر للسعودية       | 22         |
| 9   | Register for Beta Access      | 24         |
| 10  | Full Governance + Full DMS    | 26         |
| 11  | Beta Spots Are Limited        | 21         |
| 12  | Saudi Companies Law Ready     | 25         |
| 13  | One Login. Full Platform      | 24         |
| 14  | Saudi Governance Ready        | 22         |
| 15  | سجّل شركتك اليوم              | 18         |

**Descriptions (4):**

| #   | Description (EN)                                                                                                                  | Characters |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | Saudi-built governance platform with DMS, shareholder registry, SMS, and e-signatures. No implementation fees. Live in minutes.   | 90         |
| 2   | Why pay enterprise pricing for features built for foreign regulations? Musahm was designed for Saudi Companies Law from day one.  | 90         |
| 3   | Arabic-first interface. Saudi regulatory compliance. SMB-accessible pricing. Musahm is governance built where you operate.        | 89         |
| 4   | Deploy in minutes, not months. Subscription pricing, not SAR 100K implementations. Governance software sized for Saudi companies. | 90         |

### Ad Extensions, Campaign 4

**Sitelinks:**

| #   | Sitelink Text        | Description Line 1                 | Description Line 2   | URL                            |
| --- | -------------------- | ---------------------------------- | -------------------- | ------------------------------ |
| 1   | Why Musahm           | Saudi-built governance platform    | See the difference   | /why-musahm                    |
| 2   | Shareholder Registry | Built in. No other platform has it | Track every transfer | /features/shareholder-registry |
| 3   | Register for Beta    | Limited to 30 companies            | Register now         | /vault/beta                    |
| 4   | Book a Demo          | See Musahm in 30 minutes           | Arabic and English   | /demo                          |

**Callout Extensions:**

| #   | Callout                       | Characters |
| --- | ----------------------------- | ---------- |
| 1   | Saudi-Built Platform          | 20         |
| 2   | No Implementation Fees        | 22         |
| 3   | Deploy in Minutes             | 17         |
| 4   | Full Arabic RTL Support       | 22         |
| 5   | Shareholder Registry Built In | 29         |
| 6   | SaaS Pricing for SMBs         | 21         |

**Structured Snippets:**

| Header     | Values                                                                       |
| ---------- | ---------------------------------------------------------------------------- |
| Types      | Governance Platform, Document Management, Shareholder Registry, E-Signatures |
| Industries | Real Estate, Healthcare, Education, Family Holdings                          |

---

## Cross-Campaign Settings

### Conversion Tracking (Required Before Launch)

| Conversion Action              | Type      | Value                 | Source                                |
| ------------------------------ | --------- | --------------------- | ------------------------------------- |
| Beta form submission           | Primary   | SAR 50 (placeholder)  | Tally form thank-you page or redirect |
| Demo booking                   | Primary   | SAR 100 (placeholder) | Cal.com confirmation page             |
| Landing page engagement (>60s) | Secondary | SAR 5 (placeholder)   | Google Ads tag                        |
| Phone call (if enabled)        | Secondary | SAR 30 (placeholder)  | Call extension                        |

> WARNING: NEEDS CLIENT INPUT for actual conversion values based on expected beta-to-paid conversion rates.

### Audience Targeting (Layered)

| Audience                       | Type         | Application                       |
| ------------------------------ | ------------ | --------------------------------- |
| Business decision-makers       | In-market    | Observation (bid adjustment +20%) |
| Corporate governance software  | In-market    | Observation (bid adjustment +25%) |
| Business management software   | In-market    | Observation (bid adjustment +15%) |
| C-suite executives             | Demographics | Observation (bid adjustment +20%) |
| Company size: 20-500 employees | Demographics | Observation (bid adjustment +15%) |

### Ad Schedule

| Day               | Hours (AST)   | Bid Adjustment                                            |
| ----------------- | ------------- | --------------------------------------------------------- |
| Sunday - Thursday | 08:00 - 18:00 | +20% (Saudi business hours, peak decision-maker activity) |
| Sunday - Thursday | 18:00 - 23:00 | 0% (evening browsing, research phase)                     |
| Friday - Saturday | 10:00 - 22:00 | -10% (weekend, lower intent but some C-level browsing)    |
| All days          | 23:00 - 08:00 | -30% (low activity, minimal governance search volume)     |

**Note:** Saudi Arabia business week is Sunday through Thursday. Friday-Saturday is the weekend. Ramadan and national holidays may shift browsing patterns; monitor and adjust during these periods.

### Total Budget Summary

| Campaign              | Monthly Budget (SAR) | % of Total | Notes                                           |
| --------------------- | -------------------- | ---------- | ----------------------------------------------- |
| Arabic Brand Search   | 1,500 - 3,000        | ~10%       | Low CPC, high conversion rate, brand protection |
| Arabic Generic Search | 8,000 - 15,000       | ~55%       | Highest volume, primary demand capture          |
| English Search        | 3,000 - 6,000        | ~20%       | Bilingual executives, expat board members       |
| Competitor Targeting  | 2,000 - 4,000        | ~15%       | Low volume, high intent, differentiation        |
| **Total**             | **14,500 - 28,000**  | **100%**   | **Adjust after 2 weeks of data**                |

> WARNING: NEEDS CLIENT INPUT -- These are range estimates. Final budgets depend on CPA targets, conversion rates, and overall marketing budget allocation. Start at the lower end and scale based on ROAS.

### Device Bid Adjustments

| Device  | Bid Adjustment | Rationale                                                                           |
| ------- | -------------- | ----------------------------------------------------------------------------------- |
| Desktop | 0% (baseline)  | Primary conversion device for enterprise software demos                             |
| Mobile  | +15%           | Saudi executives browse governance content heavily on mobile; high discovery intent |
| Tablet  | -20%           | Low volume in KSA B2B; insufficient data to justify parity spend                    |

**Notes:**

- Saudi smartphone penetration exceeds 95%. Mobile is a discovery channel; conversions may complete on desktop.
- Set up cross-device conversion tracking to attribute mobile-initiated, desktop-completed conversions.
- Review device performance after 2 weeks and adjust. If mobile CPA exceeds desktop CPA by >40%, reduce mobile bid adjustment.
- For Campaign 1 (Brand), consider +25% mobile since brand searches skew mobile.

### Geographic Targeting

| Region                    | Targeting | Bid Adjustment | Rationale                                                                                     |
| ------------------------- | --------- | -------------- | --------------------------------------------------------------------------------------------- |
| Riyadh                    | Primary   | +25%           | Capital city, highest concentration of corporate HQs, CMA, and governance-sensitive companies |
| Jeddah                    | Secondary | +10%           | Second-largest business hub, strong real estate and healthcare sectors                        |
| Dammam / Eastern Province | Secondary | +10%           | Oil & gas ecosystem, family holdings, industrial companies                                    |
| Rest of KSA               | Tertiary  | 0% (baseline)  | Lower density but still relevant for education and healthcare sectors                         |

**Note:** Do not expand to UAE/Bahrain/GCC until KSA campaigns have 4+ weeks of data and positive ROAS. English Campaign 3 may be expanded first due to lower language barrier.

### Optimization Cadence

| Timeframe             | Action                                                 |
| --------------------- | ------------------------------------------------------ |
| Daily (first 2 weeks) | Check spend pacing, pause underperforming ads          |
| Weekly                | Review search terms report, add negatives, adjust bids |
| Bi-weekly             | Pause low-CTR headlines, test new variations           |
| Monthly               | Campaign-level budget reallocation based on CPA        |
| Quarterly             | Full restructure if needed, new keyword research       |

---

> حوكمة سعودية. منصة عالمية.
> Saudi governance. World-class platform.
