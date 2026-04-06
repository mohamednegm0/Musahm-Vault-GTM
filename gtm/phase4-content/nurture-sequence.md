# Lead Nurture Sequence: Musahm Vault

> **Framework:** Email Scoring Rubric (4x25: Relevance 25 + Value 25 + Urgency 25 + CTA Clarity 25)
> **Audience:** Prospects who signed up for Vault beta but have NOT logged in
> **Sequence:** 4 emails over 21 days (escalating urgency)
> **Voice:** Vault sub-brand: structured warmth, guardian authority
> **Goal:** Convert inactive sign-ups to first login
> **Exit condition:** User logs in at any point -> move to onboarding sequence (`onboarding-sequence.md`)

## Sequence Scoring

| Email              | Day | Relevance              | Value                 | Urgency                  | CTA Clarity     | Total |
| ------------------ | --- | ---------------------- | --------------------- | ------------------------ | --------------- | ----- |
| 1: Account Ready   | 3   | 25 (direct reminder)   | 20 (friction removal) | 5 (none)                 | 25 (single CTA) | 75    |
| 2: Social Proof    | 7   | 22 (peer reference)    | 20 (proof of value)   | 15 (implied scarcity)    | 22 (single CTA) | 79    |
| 3: Pain Point      | 14  | 25 (personal scenario) | 22 (problem clarity)  | 20 (rhetorical pressure) | 25 (single CTA) | 92    |
| 4: Seat Expiration | 21  | 25 (their seat)        | 18 (recap)            | 25 (deadline)            | 25 (single CTA) | 93    |

> Email 3 and 4 intentionally score highest. By Day 14 and 21, only strong messaging converts laggards.

---

## Email 1: Your Account Is Ready

**Timing:** Day 3 post-signup, no login detected

**Angle:** Gentle reminder. Acknowledge they signed up, remove friction

### Subject Line

| Language | Subject                                 |
| -------- | --------------------------------------- |
| AR       | حسابك في Vault جاهز. ابدأ من هنا        |
| EN       | Your Vault account is ready. Start here |

### Body (Arabic)

[شعار مساهم]

[الاسم]،

سجّلت في Vault قبل أيام. حسابك جاهز ومساحات العمل معدّة, ينقصك فقط تسجيل الدخول.

لن تحتاج حسابًا جديدًا. نفس بيانات مساهم تدخلك مباشرة. ستجد ستّ مساحات عمل جاهزة لتنظيم وثائق الحوكمة من اللحظة الأولى: اجتماعات المجلس، القرارات، العقود، السياسات، وغيرها.

أول خطوة: سجّل الدخول وارفع وثيقة واحدة. دقيقتان فقط.

[زر: سجّل الدخول إلى Vault]

مع التقدير،
فريق مساهم

### Body (English)

[Musahm Logo]

[Name],

You signed up for Vault a few days ago. Your account is ready and your workspaces are configured. All that remains is logging in.

No new account needed. Your same Musahm credentials get you in immediately. You will find six workspaces ready to organize your governance documents from the first moment: Board Meetings, Decisions, Contracts, Policies, and more.

First step: log in and upload one document. Two minutes is all it takes.

[Button: Log In to Vault]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                 | English         |
| ----------- | -------------------------------------- | --------------- |
| Button text | سجّل الدخول إلى Vault                  | Log In to Vault |
| Button link | ⚠️ NEEDS CLIENT INPUT: Vault login URL | Same            |

### Design Notes

- Same template as onboarding sequence (consistency builds trust)
- Short email. No feature list, no pressure. Just remove friction.
- Footer tagline: "حوكمة سعودية. منصة عالمية."

---

## Email 2: Social Proof

**Timing:** Day 7, still no login

**Angle:** Companies like yours are already inside. Your peers joined early, and seats are filling up.

### Subject Line

| Language | Subject                                                         |
| -------- | --------------------------------------------------------------- |
| AR       | شركات سعودية بدأت تنظّم وثائقها في Vault                        |
| EN       | Saudi companies are already organizing their documents in Vault |

### Body (Arabic)

[شعار مساهم]

[الاسم]،

منذ إطلاق النسخة التجريبية، شركات سعودية بدأت بالفعل بنقل وثائق حوكمتها إلى Vault: محاضر اجتماعات، قرارات مجلس إدارة، عقود، سياسات داخلية.

ما وجدوه: مساحات عمل جاهزة لا تحتاج إعدادًا، صلاحيات واضحة لكل عضو فريق، وسجل تدقيق يسجّل كل عملية تلقائيًا. وثائقهم لم تعد مبعثرة بين الإيميل والأجهزة الشخصية.

حسابك لا يزال ينتظرك. ادخل وابدأ بوثيقة واحدة.

[زر: ابدأ الآن]

مع التقدير،
فريق مساهم

### Body (English)

[Musahm Logo]

[Name],

Since the beta launch, Saudi companies have already begun moving their governance documents into Vault: board minutes, resolutions, contracts, internal policies.

What they found: workspaces that need no setup, clear permissions for every team member, and an audit trail that records every action automatically. Their documents are no longer scattered across email and personal devices.

Your account is still waiting. Log in and start with one document.

[Button: Start Now]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                 | English   |
| ----------- | -------------------------------------- | --------- |
| Button text | ابدأ الآن                              | Start Now |
| Button link | ⚠️ NEEDS CLIENT INPUT: Vault login URL | Same      |

### Design Notes

- No specific client names unless publishing permission is confirmed (see launch-email.md client reference note)
- "Saudi companies" as anonymous social proof is safe and on-brand
- Slightly more content than Email 1, but still under 150 words per language

---

## Email 3: Pain Point

**Timing:** Day 14, still no login

**Angle:** Rhetorical Exposure. Name the pain they are living with right now

### Subject Line

| Language | Subject                              |
| -------- | ------------------------------------ |
| AR       | وثائقك لا تزال في واتساب             |
| EN       | Your documents are still in WhatsApp |

### Body (Arabic)

[شعار مساهم]

[الاسم]،

محضر آخر اجتماع مجلس إدارة, أين هو الآن؟ في إيميل أرسله أحدهم قبل أسابيع؟ في مجلد على جهاز أمين السر الشخصي؟ في مجموعة واتساب لا أحد يتذكر اسمها؟

عندما يطلب المدقق هذا المحضر، كم دقيقة ستحتاج لتجده؟

Vault بُني لحل هذه المشكلة تحديدًا. مكان واحد محوكم لكل وثائق شركتك: بصلاحيات، بسجل تدقيق، بسير عمل يمنع النشر بدون موافقة. حسابك جاهز. الخطوة الوحيدة المتبقية هي الدخول.

[زر: انقل وثائقك إلى Vault]

مع التقدير،
فريق مساهم

### Body (English)

[Musahm Logo]

[Name],

The minutes from your last board meeting. Where are they right now? In an email someone sent weeks ago? In a folder on the Secretary's personal device? In a WhatsApp group no one remembers the name of?

When an auditor requests those minutes, how many minutes will you spend searching?

Vault was built to solve exactly this problem. One governed place for all your company's documents: with permissions, with an audit trail, with workflows that prevent publication without approval. Your account is ready. The only remaining step is logging in.

[Button: Move Your Documents to Vault]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                 | English                      |
| ----------- | -------------------------------------- | ---------------------------- |
| Button text | انقل وثائقك إلى Vault                  | Move Your Documents to Vault |
| Button link | ⚠️ NEEDS CLIENT INPUT: Vault login URL | Same                         |

### Design Notes

- This email is intentionally direct. The Rhetorical Exposure pattern (voice guide, Section 3) does the work.
- No feature lists. The pain is the message.
- Single CTA, no secondary links.

---

## Email 4: Seat Expiration

**Timing:** Day 21, still no login

**Angle:** FOMO without pressure. Your beta seat has a deadline, stated as fact

### Subject Line

| Language | Subject                                                            |
| -------- | ------------------------------------------------------------------ |
| AR       | مقعدك التجريبي في Vault ينتهي خلال ⚠️ NEEDS CLIENT INPUT: [X] أيام |
| EN       | Your Vault beta seat expires in ⚠️ NEEDS CLIENT INPUT: [X] days    |

### Body (Arabic)

[شعار مساهم]

[الاسم]،

سجّلت في النسخة التجريبية من Vault قبل ثلاثة أسابيع. حسابك لا يزال محجوزًا, لكن المقاعد التجريبية محدودة، ومقعدك ينتهي خلال ⚠️ NEEDS CLIENT INPUT: [X] أيام.

بعد هذا التاريخ، يُتاح مقعدك لشركة أخرى في قائمة الانتظار.

لم نبنِ Vault ليبقى فارغًا. بنيناه لأن وثائق الشركات السعودية تستحق حماية حقيقية: لا مجلدات مشتركة ولا مرفقات إيميل.

إذا قررت البدء، الدخول يستغرق ثوانٍ. نفس حسابك في مساهم.

[زر: فعّل مقعدك قبل انتهائه]

مع التقدير،
فريق مساهم

### Body (English)

[Musahm Logo]

[Name],

You signed up for the Vault beta three weeks ago. Your account is still reserved, but beta seats are limited, and yours expires in ⚠️ NEEDS CLIENT INPUT: [X] days.

After that date, your seat becomes available to another company on the waitlist.

We did not build Vault to sit empty. We built it because Saudi companies' documents deserve real protection, not shared folders and email attachments.

If you decide to start, logging in takes seconds. Same Musahm credentials.

[Button: Activate Your Seat Before It Expires]

With regards,
The Musahm Team

### CTA

| Element     | Arabic                                 | English                              |
| ----------- | -------------------------------------- | ------------------------------------ |
| Button text | فعّل مقعدك قبل انتهائه                 | Activate Your Seat Before It Expires |
| Button link | ⚠️ NEEDS CLIENT INPUT: Vault login URL | Same                                 |

### Design Notes

- No countdown timers or red-alert styling. The urgency is in the words, not the design.
- Same clean template as the rest of the sequence. Institutional, not promotional.
- This is the last email. If no login after this, mark as "cold" in CRM and move to quarterly re-engagement.

---

## Sequence Logic

| Condition                       | Action                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------ |
| User logs in at any point       | Exit nurture → enter onboarding sequence (Email 1, Day 0)                      |
| User unsubscribes               | Remove from all sequences                                                      |
| No login after Email 4 (Day 21) | Mark as "cold lead" in CRM. Re-engage in 90 days or on next product milestone. |
| User replies to any email       | Route to sales/support for personal follow-up                                  |

---

## Urgency Calibration

| Email      | Urgency Level | Tone                                                        |
| ---------- | ------------- | ----------------------------------------------------------- |
| 1 (Day 3)  | None          | Helpful reminder. Remove friction.                          |
| 2 (Day 7)  | Low           | Social proof. Others are already inside.                    |
| 3 (Day 14) | Medium        | Name the pain. Make the status quo uncomfortable.           |
| 4 (Day 21) | High          | Deadline is real. Seat expires. Stated as fact, not threat. |

The sequence never begs. It never uses exclamation marks. It escalates by making the cost of inaction clearer with each email.

---

## Template Specifications

| Parameter          | Value                                            |
| ------------------ | ------------------------------------------------ |
| From name (AR)     | فريق مساهم                                       |
| From name (EN)     | Musahm Team                                      |
| From email         | ⚠️ NEEDS CLIENT INPUT: Sender email address      |
| Reply-to           | ⚠️ NEEDS CLIENT INPUT: Support email address     |
| Template framework | MJML (responsive, RTL-compatible)                |
| Button color       | `#1B4332` (dark institutional green), white text |
| Footer             | Tagline + company address + unsubscribe link     |

---

> ⚠️ NEEDS CLIENT INPUT: Vault login URL, sender email address, support email address, beta seat expiration period [X], total beta seat count for social proof calibration.
