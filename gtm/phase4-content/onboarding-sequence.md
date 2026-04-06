# Beta Onboarding Email Sequence: Musahm Vault

> **Framework:** Behavioral Onboarding (milestone-driven, action-gated)
> **Audience:** New Vault beta users (existing Musahm clients who activated Vault)
> **Sequence:** 5 emails over 14 days
> **Voice:** Vault sub-brand, guardian's vigilance, structured warmth
> **Goal:** Drive first document upload, team invite, workflow setup, and feedback collection

## Activation Milestones

Each email pushes the user toward the next milestone. Emails are skipped when the milestone is already reached (see Suppression Rules at bottom).

| Milestone               | Email          | Day | Success Metric                 |
| ----------------------- | -------------- | --- | ------------------------------ |
| Account activated       | 1: Welcome     | 0   | User logs in                   |
| First document uploaded | 2: Upload      | 2   | >= 1 document in any workspace |
| Team invited            | 3: Permissions | 5   | >= 2 users on the account      |
| Workflow created        | 4: Workflows   | 10  | >= 1 active workflow           |
| Feedback collected      | 5: Feedback    | 14  | Survey submitted               |

---

## Email 1: Welcome + First Steps

**Timing:** Day 0 (immediately after beta activation)

### Subject Line

| Language | Subject                                       |
| -------- | --------------------------------------------- |
| AR       | مرحبًا في Vault, وثائقك الآن في مكانها الصحيح |
| EN       | Welcome to Vault, your documents belong here  |

### Body: Arabic

[شعار مساهم]

أهلاً [الاسم]،

تم تفعيل Vault لحساب [اسم الشركة]. من الآن، وثائق حوكمتك لها مكان محوكم, لا مجلدات مبعثرة، لا ملفات على أجهزة شخصية.

**أول ثلاث خطوات:**

1. سجّل الدخول باستخدام حسابك في مساهم, نفس البيانات، بدون تسجيل جديد
2. تصفّح مساحات العمل الستّ الجاهزة: اجتماعات المجلس، اجتماعات الجمعية، اجتماعات اللجان، القرارات، توثيق العقود، السياسات واللوائح
3. ارفع أول وثيقة (محضر اجتماع أو قرار مجلس) وشاهد كيف ينظّمها Vault تلقائيًا

ستة مساحات عمل جاهزة. صلاحيات محوكمة. سجل تدقيق من اللحظة الأولى.

[زر: ادخل إلى Vault]

مع التقدير،
فريق مساهم

### Body: English

[Musahm Logo]

Hello [Name],

Vault is now active for [Company Name]. From this moment, your governance documents have a governed home, no more scattered folders, no more files on personal devices.

**Your first three steps:**

1. Log in with your Musahm account, same credentials, no new registration
2. Explore six pre-built workspaces: Board Meetings, Association Meetings, Committee Meetings, Decisions, Contract Documentation, Policies & Regulations
3. Upload your first document (a board minute or resolution) and see how Vault organizes it automatically

Six governed workspaces. Role-based access control. Audit trail from minute one.

[Button: Enter Vault]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                     | English     |
| ----------- | ------------------------------------------ | ----------- |
| Button text | ادخل إلى Vault                             | Enter Vault |
| Button link | ⚠️ NEEDS CLIENT INPUT: Vault dashboard URL | Same        |

### Design Notes

- Logo top center
- RTL layout for Arabic, LTR for English
- Button: full-width on mobile, centered on desktop, `#1B4332` background, white text
- Clean whitespace. No decorative borders or illustrations
- Footer: "حوكمة سعودية. منصة عالمية." / "Saudi governance. World-class platform."

---

## Email 2: Upload Your First Documents

**Timing:** Day 2 (if no documents uploaded yet; skip if user already uploaded)

### Subject Line

| Language | Subject                                                   |
| -------- | --------------------------------------------------------- |
| AR       | وثيقتك الأولى في Vault, دقيقتان فقط                       |
| EN       | Your first document in Vault, two minutes is all it takes |

### Body: Arabic

[شعار مساهم]

[الاسم]،

Vault جاهز، ومساحات العمل تنتظر وثائقك. الخطوة الأهم الآن: رفع أول وثيقة.

**كيف ترفع وثيقة:**

1. اختر مساحة العمل المناسبة, مثلاً "اجتماعات المجلس"
2. اضغط "رفع وثيقة" واختر الملف من جهازك
3. Vault يدعم PDF وWord وExcel وPowerPoint وملفات الصور

**لماذا الآن؟** كل وثيقة ترفعها تحصل فورًا على سجل تدقيق كامل: من رفعها، متى، وكل عملية بعدها. المدقق لن يسأل "أين الوثيقة؟" بل "متى تريد التقرير؟"

ابدأ بمحضر آخر اجتماع مجلس إدارة. هذه هي الوثيقة التي يبحث عنها الجميع دائمًا.

[زر: ارفع وثيقتك الأولى]

مع التقدير،
فريق مساهم

### Body: English

[Musahm Logo]

[Name],

Vault is ready, and your workspaces are waiting. The most important step now: upload your first document.

**How to upload:**

1. Select the right workspace, for example, "Board Meetings"
2. Click "Upload Document" and choose the file from your device
3. Vault supports PDF, Word, Excel, PowerPoint, and image files

**Why now?** Every document you upload gets a complete audit trail immediately: who uploaded it, when, and every action after. Your auditor will not ask "where is the document?" They will ask "when do you want the report?"

Start with the minutes from your last board meeting. That is the document everyone is always looking for.

[Button: Upload Your First Document]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                       | English                    |
| ----------- | -------------------------------------------- | -------------------------- |
| Button text | ارفع وثيقتك الأولى                           | Upload Your First Document |
| Button link | ⚠️ NEEDS CLIENT INPUT: Vault upload page URL | Same                       |

### Design Notes

- Same template as Email 1
- Optional: include a simple 3-step visual strip (workspace icon → upload icon → checkmark), text-based, no heavy graphics
- Footer tagline consistent across sequence

---

## Email 3: Set Up Permissions + Invite Team

**Timing:** Day 5

### Subject Line

| Language | Subject                                                 |
| -------- | ------------------------------------------------------- |
| AR       | من يرى ماذا؟ صلاحيات Vault تحمي وثائقك                  |
| EN       | Who sees what? Vault permissions protect your documents |

### Body: Arabic

[شعار مساهم]

[الاسم]،

وثائقك في Vault الآن. الخطوة التالية: تحديد من يصل إليها.

**خمسة مستويات صلاحيات:**

- **عارض (1):** يرى الوثائق فقط، لا تعديل ولا تحميل
- **معلّق (2):** يضيف تعليقات على الوثائق ويرفع ملفات
- **محرر (3):** يعدّل أي وثيقة في مساحات عمله
- **منظّم (4):** يدير الصلاحيات والمستخدمين في مساحاته
- **مدير (5):** صلاحيات كاملة على مستوى الشركة

كل مستوى يرث صلاحيات المستوى الذي قبله. وتستطيع تخصيص الوصول لكل وثيقة على حدة.

**ادعُ فريقك الآن.** أضف أمين سر المجلس والمستشار القانوني كبداية; هم أكثر من يحتاج الوصول اليومي.

[زر: إدارة الصلاحيات والدعوات]

مع التقدير،
فريق مساهم

### Body: English

[Musahm Logo]

[Name],

Your documents are in Vault. Next step: decide who can access them.

**Five permission levels:**

- **Viewer (1):** See documents only, no editing, no downloading
- **Commenter (2):** Add comments on documents and upload files
- **Editor (3):** Edit any document in their workspaces
- **Organizer (4):** Manage permissions and users in their workspaces
- **Admin (5):** Full control across the entire company

Each level inherits the permissions of the one below it. You can also set access per individual document.

**Invite your team now.** Start with the Board Secretary and Legal Counsel; they need daily access the most.

[Button: Manage Permissions & Invitations]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                                 | English                          |
| ----------- | ------------------------------------------------------ | -------------------------------- |
| Button text | إدارة الصلاحيات والدعوات                               | Manage Permissions & Invitations |
| Button link | ⚠️ NEEDS CLIENT INPUT: Vault permissions/team page URL | Same                             |

### Design Notes

- Same template
- Permission levels can be displayed as a simple vertical list with role name bolded and description inline, no complex table needed
- Keep mobile-friendly: single column layout

---

## Email 4: Set Up Your First Workflow

**Timing:** Day 10

### Subject Line

| Language | Subject                                                 |
| -------- | ------------------------------------------------------- |
| AR       | لا وثيقة تُنشر بدون موافقة: سير العمل في Vault          |
| EN       | No document goes live without approval: Vault workflows |

### Body: Arabic

[شعار مساهم]

[الاسم]،

فريقك يستخدم Vault. وثائقكم محمية بصلاحيات واضحة. الآن، الخطوة التي تحوّل Vault من مخزن إلى نظام حوكمة حقيقي: سير العمل.

**ما هو سير العمل في Vault؟**

سلسلة موافقات تُفرض تلقائيًا قبل نشر أي وثيقة أو تعديلها. تصمّمها بصريًا, بدون كتابة كود.

**ابدأ بسير عمل بسيط:**

1. اذهب إلى إعدادات مساحة العمل
2. اختر "إنشاء سير عمل"
3. حدد: مرسل → مراجع → معتمد
4. فعّله على مساحة "القرارات" أو "السياسات واللوائح"

الآن، كل وثيقة جديدة تمر بسلسلة الموافقة قبل أن تصبح نهائية. لا شيء يخرج بدون توقيع.

[زر: أنشئ أول سير عمل]

مع التقدير،
فريق مساهم

### Body: English

[Musahm Logo]

[Name],

Your team is using Vault. Your documents are protected with clear permissions. Now, the step that turns Vault from storage into a real governance system: workflows.

**What is a Vault workflow?**

An approval chain enforced automatically before any document is published or modified. You design it visually, no code required.

**Start with a simple workflow:**

1. Go to your workspace settings
2. Select "Create Workflow"
3. Define: Submitter → Reviewer → Approver
4. Activate it on the "Decisions" or "Policies & Regulations" workspace

Now, every new document passes through the approval chain before it becomes final. Nothing goes live without sign-off.

[Button: Create Your First Workflow]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                          | English                    |
| ----------- | ----------------------------------------------- | -------------------------- |
| Button text | أنشئ أول سير عمل                                | Create Your First Workflow |
| Button link | ⚠️ NEEDS CLIENT INPUT: Vault workflow setup URL | Same                       |

### Design Notes

- Same template
- Optional: simple 3-node flow diagram (text-based): Submitter → Reviewer → Approver
- Keep the diagram inline, no heavy images. MJML text block with arrows

---

## Email 5: Beta Feedback + What's Coming

**Timing:** Day 14

### Subject Line

| Language | Subject                                                |
| -------- | ------------------------------------------------------ |
| AR       | أسبوعان مع Vault, رأيكم يشكّل المنتج                   |
| EN       | Two weeks with Vault, your feedback shapes the product |

### Body: Arabic

[شعار مساهم]

[الاسم]،

مرّ أسبوعان منذ بدأتم استخدام Vault. أنتم من أوائل من جرّب هذا المنتج, ورأيكم ليس مجرد ملاحظات، بل قرارات تصميم.

**نريد أن نعرف:**

- ما أكثر ميزة استخدمتموها؟
- ما الذي لم يكن واضحًا أو سهلاً؟
- ما الذي تحتاجونه ولم تجدوه بعد؟

أجيبوا عن ثلاثة أسئلة فقط; لن تأخذ أكثر من دقيقتين.

**ما القادم في Vault:**

- **تكامل التقويم:** ربط اجتماعات مجلس الإدارة بالتقويم مباشرة مع تذكيرات تلقائية
- **واجهة متوافقة مع الجوال:** الوصول لوثائقك المحوكمة من أي متصفح
- **تقارير الحوكمة:** لوحة تحليلات تُظهر نشاط الوثائق والصلاحيات والتدقيق

بنينا Vault لشركاتكم. ساعدونا نبنيه بالشكل الذي تستحقونه.

[زر: شاركنا رأيك]

مع التقدير،
فريق مساهم

### Body: English

[Musahm Logo]

[Name],

Two weeks since you started using Vault. You are among the first to experience this product, and your feedback is not just commentary, it is a design decision.

**We want to know:**

- Which feature did you use the most?
- What was unclear or difficult?
- What do you need that you have not found yet?

Three questions only, two minutes of your time.

**What is coming to Vault:**

- **Calendar integration:** Link board meetings to your calendar with automatic reminders
- **Mobile-responsive interface:** Access your governed documents from any browser
- **Governance reporting:** Analytics dashboard showing document activity, permissions, and audit metrics

We built Vault for Saudi companies. Help us build it the way yours deserves.

[Button: Share Your Feedback]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                     | English             |
| ----------- | ------------------------------------------ | ------------------- |
| Button text | شاركنا رأيك                                | Share Your Feedback |
| Button link | ⚠️ NEEDS CLIENT INPUT: Feedback survey URL | Same                |

### Design Notes

- Same template as all previous emails
- "What's coming" section can use a simple icon + text list (no screenshots of unreleased features)
- Footer tagline + unsubscribe link

---

## Sequence Logic & Suppression Rules

| Trigger                                 | Action                                                 |
| --------------------------------------- | ------------------------------------------------------ |
| User uploads a document before Day 2    | Skip Email 2                                           |
| User invites a team member before Day 5 | Skip Email 3                                           |
| User creates a workflow before Day 10   | Skip Email 4                                           |
| User unsubscribes at any point          | Remove from sequence                                   |
| User has not logged in at all by Day 5  | Switch to nurture sequence (see `nurture-sequence.md`) |

---

## Template Specifications

| Parameter          | Value                                                            |
| ------------------ | ---------------------------------------------------------------- |
| From name (AR)     | فريق مساهم                                                       |
| From name (EN)     | Musahm Team                                                      |
| From email         | ⚠️ NEEDS CLIENT INPUT: Sender email address                      |
| Reply-to           | ⚠️ NEEDS CLIENT INPUT: Support email address                     |
| Template framework | MJML (responsive, RTL-compatible)                                |
| Button color       | `#1B4332` (dark institutional green), white text                 |
| Font               | System font stack (no custom web fonts for email deliverability) |
| Footer             | Tagline + company address + unsubscribe link                     |
| Preheader text     | First sentence of email body (auto-extracted)                    |

---

> ⚠️ NEEDS CLIENT INPUT: Vault dashboard URL, upload page URL, permissions page URL, workflow setup URL, feedback survey URL, sender email address, support email address.
