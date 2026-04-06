# SMS Blast: Musahm Vault Beta Announcement

> **Encoding note:** Arabic text uses UCS-2 encoding, limiting a single SMS segment to **70 characters**. Messages exceeding 70 characters split into segments of ~67 characters each (concatenation headers). English text uses GSM-7 encoding with a **160-character** single-segment limit. The em dash character is valid in UCS-2 but NOT in GSM-7; English versions use a hyphen (-) instead.

---

## Version 1: Formal Arabic, Single SMS

**Segment count: 1 SMS**
**Character count: 62** (with placeholder) | **~69 with typical short URL**

```
مساهم Vault، وثائق محوكمة، صنع سعودي. 30 مقعدا. سجلوا: [رابط]
```

**Translation:** Musahm Vault, governed documents, built Saudi. 30 seats. Register: [link]

**Voice notes:** Front-loads brand name. "صنع سعودي" (built Saudi) is the Concept 3 identity anchor. "وثائق محوكمة" (governed documents) aligns with Vault sub-brand vocabulary. "30 مقعدا" provides urgency. No emoji, no exclamation marks.

---

## Version 1B: Formal Arabic, Extended (2 segments)

**Segment count: 2 SMS segments**
**Character count: 125** (with placeholder) | **~132 with typical short URL** (limit: 134)

```
مساهم Vault متاح تجريبيا، نظام وثائق سعودي بسجل تدقيق وصلاحيات محوكمة. بصفتكم عملاء مساهم، أنتم أول 30 مدعوين. سجلوا: [رابط]
```

**Translation:** Musahm Vault is available in beta, a Saudi document system with audit trail and governed permissions. As Musahm clients, you are the first 30 invited. Register: [link]

**Cost:** 2x per-message rate. Use for Wave 1 high-value clients only (board secretaries at target accounts).

**Voice notes:** Aligned with English V2B on core message: Saudi-built + audit trail + governed access + urgency (first 30). "بصفتكم عملاء مساهم" earns the right to pitch by acknowledging the existing relationship.

---

## Version 2: English, Single SMS

**Segment count: 1 SMS** (GSM-7 encoding, 160-char limit)
**Character count: 118** (with placeholder) | **~126 with typical short URL**

```
Musahm Vault - Saudi-built document governance. Full audit trail, governed access. 30 beta seats only. Register: [link]
```

**Voice notes:** Mirrors the Arabic V1 message: Saudi-built identity + governed documents + audit trail + access control + urgency (30 seats) + CTA. Hyphen used instead of em dash (GSM-7 compatible). No emoji, no exclamation marks.

---

## Version 2B: English, Extended (single SMS, uses more of the 160-char budget)

**Segment count: 1 SMS** (GSM-7 encoding)
**Character count: 147** (with placeholder) | **~155 with typical short URL**

```
Musahm Vault beta is live. Saudi-built governance DMS - audit trail, five-level access, governed workflows. First 30 seats only. Register: [link]
```

**Voice notes:** Expands on V2 with specific proof points (five-level access, governed workflows) while staying in a single GSM-7 segment. Mirrors Arabic V1B's level of detail. Use when the SMS budget allows more content per message.

---

## Message Alignment Matrix

Both Arabic and English versions now carry the same core message in each tier:

| Element               | Arabic (V1 / V1B)          | English (V2 / V2B)                       |
| --------------------- | -------------------------- | ---------------------------------------- |
| **Brand identity**    | صنع سعودي                  | Saudi-built                              |
| **Value proposition** | وثائق محوكمة               | governed documents / document governance |
| **Key proof points**  | سجل تدقيق + صلاحيات محوكمة | audit trail + governed access            |
| **Urgency**           | 30 مقعدا / أول 30 مدعوين   | 30 beta seats only / First 30 seats      |
| **CTA**               | سجلوا                      | Register                                 |

Neither version reads as a translation of the other. Both feel native in their language while delivering the same strategic message.

---

## Deployment Notes

| Parameter            | Recommendation                                                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Timing**           | Sunday 10:00 AM AST (KSA business week start)                                                                                                                     |
| **Sender ID**        | "Musahm" (branded sender, must be pre-registered with CITC)                                                                                                       |
| **Target**           | Primary contacts from Musahm client accounts (board secretaries first, then CEOs)                                                                                 |
| **Language routing** | Send Arabic version to Arabic-preference contacts, English to English-preference. If preference unknown, default to Arabic.                                       |
| **Follow-up**        | If no response within 72 hours, send email version as follow-up (see `launch-email.md`)                                                                           |
| **Opt-out**          | Include opt-out mechanism per KSA CITC regulations                                                                                                                |
| **Opt-in**           | Verify recipients have opted into marketing communications before sending. KSA CITC regulations penalize unsolicited commercial SMS.                              |
| **Cost model**       | Arabic SMS = 1 segment (V1) or 2 segments (V1B) via UCS-2. English SMS = 1 segment (V2 or V2B) via GSM-7. Budget accordingly.                                     |
| **A/B test**         | For Wave 1, split Arabic recipients 50/50 between V1 (short) and V1B (extended). Measure click-through rate to determine which performs better for Wave 2.        |
| **Coordination**     | Part of launch sequence: SMS (Sunday AM) → Email follow-up (Wednesday if no response) → WhatsApp (following Sunday). See `launch-checklist.md` for full sequence. |

---

> **NEEDS CLIENT INPUT:** SMS gateway/service provider, branded sender ID registration status with CITC, final landing page URL for [رابط]/[link], opt-in verification status of client contact list, and confirmation of 30-seat beta cap.
