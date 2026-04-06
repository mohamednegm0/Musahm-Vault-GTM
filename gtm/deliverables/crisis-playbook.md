# Crisis Communication Playbook: Musahm + Vault (Beta)

> **Framework:** Crisis P1-P4 Severity Matrix + Escalation Tree
> **Scope:** Beta phase. 30 companies max. Pre-revenue.
> **Owner:** Product + Engineering + CEO (small team, fast decisions)
> **Voice during crisis:** Transparent, factual, no hedging. Acknowledge first, explain second, fix third.
> **Date:** 2026-04-02

---

## Severity Matrix

| Level  | Name         | Definition                                                           | Examples                                                                                                           | Response Time | Decision Maker         |
| ------ | ------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------- | ---------------------- |
| **P1** | **Critical** | Service down for all tenants OR data breach OR data loss             | Full outage, database corruption, unauthorized data access, document leak to wrong tenant                          | 15 minutes    | CEO + CTO              |
| **P2** | **Major**    | Service degraded for multiple tenants OR single-tenant data exposure | Slow performance for all users, audit trail gaps, permission bypass (single user), cross-tenant data visibility    | 1 hour        | CTO + Engineering Lead |
| **P3** | **Moderate** | Feature broken for some tenants OR cosmetic data issue               | Workflow approvals stuck, AI extraction returning wrong fields, search not returning results, SMS delivery failure | 4 hours       | Engineering Lead       |
| **P4** | **Minor**    | Cosmetic issue OR single-user workflow problem                       | UI alignment bug, translation error, single user login issue, non-critical email notification failure              | 24 hours      | Engineering Lead       |

---

## Escalation Tree

```
P1: Critical (15 min)
  ├─ CTO notified immediately (phone + WhatsApp)
  ├─ CEO notified within 15 minutes
  ├─ Engineering team pulled into war room (Slack/Teams channel)
  ├─ External communication drafted within 30 minutes
  ├─ Affected clients contacted personally within 1 hour
  └─ Post-incident report within 48 hours

P2: Major (1 hour)
  ├─ CTO notified within 30 minutes
  ├─ Engineering lead begins investigation immediately
  ├─ CEO notified within 1 hour if not resolved
  ├─ Affected clients contacted within 2 hours
  └─ Post-incident report within 72 hours

P3: Moderate (4 hours)
  ├─ Engineering lead notified via ticket/Slack
  ├─ Fix scheduled within current sprint
  ├─ Affected clients notified via email (no phone needed)
  └─ Resolution note added to release notes

P4: Minor (24 hours)
  ├─ Ticket created in backlog
  ├─ Fix included in next regular release
  └─ No client notification unless asked
```

---

## Communication Templates

### P1: Service Down (All Tenants)

**Internal Slack (immediate):**

```
@channel P1 INCIDENT: [brief description]
Status: Investigating
Impact: All tenants, [specific feature]
War room: [channel/link]
Incident commander: [name]
```

**Client Email (within 1 hour):**

**AR:**

```
الموضوع: Vault, تحديث عاجل عن حالة الخدمة

[اسم العميل],

نعلمكم أن خدمة Vault تواجه حاليا [وصف المشكلة]. فريقنا الهندسي يعمل على حل المشكلة الآن.

ما نعرفه حتى الآن:
- [نقطة 1: ما الذي تأثر]
- [نقطة 2: ما الذي لا يزال يعمل]
- [نقطة 3: الإجراء الذي نتخذه]

سنرسل تحديثا آخر خلال [مدة زمنية].

بياناتكم آمنة. لم يتأثر أي محتوى مخزّن.

فريق مساهم
```

**EN:**

```
Subject: Vault -- Urgent Service Status Update

[Client name],

We are informing you that Vault is currently experiencing [description]. Our engineering team is working on resolution now.

What we know so far:
- [Point 1: what is affected]
- [Point 2: what still works]
- [Point 3: what we are doing]

We will send another update within [timeframe].

Your data is safe. No stored content has been affected.

Musahm Team
```

### P1: Data Breach (Any Severity)

**Internal Slack (immediate):**

```
@channel P1 SECURITY INCIDENT: Potential data breach
Status: Investigating
Impact: [tenant(s) affected, data type]
War room: [channel/link]
DO NOT discuss outside this channel until CEO approves communication.
```

**Client Email (within 1 hour, CEO-approved):**

**AR:**

```
الموضوع: إشعار أمني مهم, Vault

[اسم العميل],

اكتشفنا [وصف مختصر للحادث]. نريد أن نكون شفافين معكم تماما.

ما حدث:
- [وصف دقيق]

ما لم يتأثر:
- [قائمة ما هو آمن]

الإجراءات التي اتخذناها:
- [إجراء 1]
- [إجراء 2]
- [إجراء 3]

الخطوات القادمة:
- [ما سنفعله خلال الـ 24 ساعة القادمة]

نتحمل المسؤولية الكاملة. سنرسل تقريرا مفصلا خلال 48 ساعة.

للتواصل المباشر: [رقم هاتف CEO]

[اسم CEO]
الرئيس التنفيذي، مساهم
```

**EN:**

```
Subject: Important Security Notice -- Vault

[Client name],

We discovered [brief incident description]. We want to be fully transparent.

What happened:
- [Precise description]

What was not affected:
- [List of what remains safe]

Actions we have taken:
- [Action 1]
- [Action 2]
- [Action 3]

Next steps:
- [What we will do in the next 24 hours]

We take full responsibility. A detailed report will follow within 48 hours.

Direct contact: [CEO phone number]

[CEO Name]
CEO, Musahm
```

### P2: Performance Degradation

**Client Email (within 2 hours):**

**AR:**

```
الموضوع: أداء Vault, تحديث

[اسم العميل],

لاحظنا بطئا في أداء Vault يؤثر على [الميزة المتأثرة]. الخدمة تعمل لكن بسرعة أقل من المعتاد.

فريقنا يعمل على تحسين الأداء. نتوقع حل المشكلة خلال [مدة].

الوظائف الأساسية (تحميل الوثائق، عرض الملفات، سجل التدقيق) تعمل بشكل طبيعي.

فريق مساهم
```

### P3: Feature Broken

**Client Email (within 4 hours, only if client reported it):**

**AR:**

```
الموضوع: تحديث عن [اسم الميزة]

[اسم العميل],

شكرا لإبلاغنا عن [المشكلة]. تأكدنا من المشكلة وفريقنا يعمل على إصلاحها.

الحل المتوقع: [تاريخ/مدة]

في الوقت الحالي، يمكنك [حل بديل مؤقت إن وجد].

فريق مساهم
```

---

## Post-Incident Report Template

Use for P1 and P2 incidents. Deliver to affected clients and keep on file.

```
POST-INCIDENT REPORT
====================

Incident ID: [YYYY-MM-DD-###]
Severity: P[1/2]
Duration: [start time] -- [end time] ([total minutes])
Affected tenants: [count and names]
Incident commander: [name]

1. SUMMARY
   [2-3 sentence summary of what happened and what the impact was]

2. TIMELINE
   [HH:MM] [Event 1]
   [HH:MM] [Event 2]
   [HH:MM] [Event 3]
   [HH:MM] Resolution confirmed

3. ROOT CAUSE
   [Clear, non-technical explanation of why this happened]

4. IMPACT
   - Users affected: [count]
   - Data affected: [none / description]
   - Duration of impact: [minutes/hours]

5. RESOLUTION
   [What was done to fix the immediate problem]

6. PREVENTION
   [What changes are being made to prevent recurrence]
   - [Change 1 + timeline]
   - [Change 2 + timeline]
   - [Change 3 + timeline]

7. LESSONS LEARNED
   - [What went well in our response]
   - [What we will improve]
```

---

## Crisis Decision Framework

For ambiguous situations where severity is unclear:

| Question                                                | If YES                                                 | If NO                      |
| ------------------------------------------------------- | ------------------------------------------------------ | -------------------------- |
| Can ANY user access ANY other tenant's data?            | P1 -- stop everything                                  | Continue assessment        |
| Is the service completely inaccessible?                 | P1                                                     | Check partial degradation  |
| Are multiple tenants affected?                          | P2 minimum                                             | Check single-tenant impact |
| Is audit trail integrity compromised?                   | P2 minimum (governance product -- trust is everything) | Check feature-level impact |
| Is a client-facing demo or board meeting happening now? | Escalate one level                                     | Standard severity          |
| Has a client already contacted us about this?           | Escalate one level                                     | Standard severity          |

**Default rule:** When in doubt, escalate. Downgrading is better than under-responding.

---

## Beta-Phase Specifics

| Consideration        | Approach                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Team size            | Small -- everyone is on-call during beta                                                                           |
| Client count         | 30 max -- personal outreach is feasible for P1/P2                                                                  |
| SLA expectations     | Not contractual yet, but treat commitments as binding                                                              |
| Media risk           | Low -- no press coverage at this stage                                                                             |
| Regulatory reporting | No mandatory breach notification yet (pre-regulation), but treat every data incident as if reporting were required |
| Rollback capability  | Ensure every deployment can be rolled back within 15 minutes                                                       |

---

## Contacts

| Role             | Name   | Phone   | Email   |
| ---------------- | ------ | ------- | ------- |
| CEO              | [Name] | [Phone] | [Email] |
| CTO              | [Name] | [Phone] | [Email] |
| Engineering Lead | [Name] | [Phone] | [Email] |
| Client Success   | [Name] | [Phone] | [Email] |

> Fill in before beta launch. Every person on this list must have WhatsApp notifications on.

---

## Review Cadence

| Action                                           | Frequency                  |
| ------------------------------------------------ | -------------------------- |
| Test P1 escalation path (fire drill)             | Monthly during beta        |
| Review and update contact list                   | Every 2 weeks              |
| Review post-incident reports and update playbook | After every P1/P2 incident |
| Full playbook review                             | Quarterly                  |

---

> Trust is the product. Every crisis response either builds it or destroys it.
> حوكمة سعودية. منصة عالمية.
