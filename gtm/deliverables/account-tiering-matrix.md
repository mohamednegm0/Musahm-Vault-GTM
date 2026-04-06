# Musahm Account Tiering Matrix

> **Framework:** 4-Factor Scoring Model (Firmographic 40% + Governance Maturity 30% + Intent 20% + Engagement 10%)
> **Purpose:** Prioritize pipeline so sales spends time on winnable, high-value accounts
> **Output:** Every prospect assigned T1 (high-touch), T2 (standard), or T3 (self-serve/nurture)
> **Last updated:** 2026-04-02

---

## Scoring Model

### Factor 1: Firmographic Fit (40 points)

| Criterion | 10 points | 7 points | 4 points | 0 points |
|-----------|-----------|----------|----------|----------|
| **Entity Type** | Closed Joint-Stock (مساهمة مقفلة) | LLC (ذ.م.م) with 5+ shareholders | LLC with 1-4 shareholders | Sole proprietorship / government |
| **Employee Count** | 50-500 | 20-49 or 501-1000 | 10-19 | Under 10 or over 1000 |
| **Industry** | Real Estate, Healthcare, Education, Family Holdings | Construction, Retail, Manufacturing | Technology, Services | Agriculture, Mining (low governance density) |
| **Location** | Riyadh, Jeddah, Dammam | Other Saudi cities | GCC (non-Saudi) | Outside GCC |

**Maximum: 40 points**

#### Why These Weights

- **Closed Joint-Stock** scores highest because they have the most complex governance needs (board, shareholders, regulatory oversight) and the strongest compliance pressure.
- **50-500 employees** is the sweet spot: large enough to need governance tooling, small enough that Musahm's pricing is attractive vs. Diligent.
- **Real Estate/Healthcare/Education/Family Holdings** are sectors where governance disputes (shareholder, regulatory, succession) are most common and most expensive.

---

### Factor 2: Governance Maturity (30 points)

| Criterion | 10 points | 7 points | 4 points | 0 points |
|-----------|-----------|----------|----------|----------|
| **Current governance system** | WhatsApp + Excel (no system) | Generic DMS (SharePoint, Google Drive) | Existing governance platform (competitor) | Fully built custom solution |
| **Board activity** | Active board with quarterly+ meetings | Board meets 1-2x/year | Advisory board only | No board |
| **Shareholder complexity** | 10+ shareholders with active transfers | 5-9 shareholders | 2-4 shareholders | Single owner |

**Maximum: 30 points**

#### Why These Weights

- **WhatsApp + Excel** scores highest because these are the easiest accounts to convert -- they have maximum pain with zero switching cost.
- **Active boards with 10+ shareholders** have the most governance surface area -- every meeting, every resolution, every share transfer is a touch point where Musahm adds value.
- Accounts with **existing governance platforms** score lower because switching costs create friction, even if Musahm is superior.

---

### Factor 3: Intent Signals (20 points)

| Signal | Points |
|--------|--------|
| Visited Musahm website (any page) | 2 |
| Visited pricing or demo page | 4 |
| Downloaded content or registered for webinar | 4 |
| Responded to outbound email/LinkedIn | 3 |
| Inbound inquiry (form fill, email, call) | 6 |
| Referred by existing client | 6 |
| Actively evaluating governance platforms (from discovery) | 8 |
| Regulatory trigger event (CMA audit, IPO prep, shareholder dispute) | 10 |

**Maximum: 20 points** (cap at 20 even if multiple signals)

#### Signal Detection Sources

| Source | What to Watch For |
|--------|------------------|
| PostHog analytics | Website visits, page depth, return visits |
| LinkedIn | Engagement with Musahm posts, profile views by target personas |
| Email tracking | Opens, clicks, replies to outbound sequences |
| Partner referrals | Introductions from Al-Ufuq, Miral, Amwaj network |
| Market events | CMA announcements, Companies Law updates, industry conferences |

---

### Factor 4: Engagement Quality (10 points)

| Criterion | 10 points | 7 points | 4 points | 0 points |
|-----------|-----------|----------|----------|----------|
| **Contact level** | CEO, CFO, or Board Secretary engaged | Department head engaged | Junior staff only | No response |
| **Responsiveness** | Responds within 48 hours | Responds within 1 week | Responds after follow-up only | Ghost |

**Maximum: 10 points** (take the higher of the two scores)

---

## Tier Assignment

| Tier | Score Range | Account Count Target | Engagement Model |
|------|------------|---------------------|------------------|
| **T1: High-Touch** | 70-100 | 10-15 accounts | Personalized demo, CXO Value Story, dedicated AE, weekly follow-up |
| **T2: Standard** | 45-69 | 30-50 accounts | Group demo/webinar, standard sales cycle, bi-weekly follow-up |
| **T3: Nurture** | 0-44 | Unlimited | Marketing drip, content, events. Re-score quarterly. |

---

## Per-Tier Engagement Playbook

### T1: High-Touch (70-100 points)

**Goal:** Close within 30 days of first meeting.

| Week | Action | Owner |
|------|--------|-------|
| 1 | Personalized outreach referencing specific governance pain (from research) | AE |
| 1 | Discovery call using MEDDIC framework (see `meddic-checklist.md`) | AE |
| 2 | Custom demo with prospect's industry scenario (see `demo-script.md`) | SE |
| 2 | CXO Value Story presentation to economic buyer (see `cxo-value-story.md`) | AE |
| 3 | Proposal with TCO comparison vs. current state | AE |
| 3 | Beta onboarding (15-minute setup call) | CS |
| 4 | Follow-up, address objections, push for contract | AE |

**Content to send:**
- Positioning statement one-liner (from `positioning-statement.md`)
- Battle card competitive positioning (relevant card from `battle-cards.md`)
- Client reference (Al-Ufuq, Miral, or Amwaj -- match by sector)

### T2: Standard (45-69 points)

**Goal:** Qualify to T1 or close within 60 days.

| Week | Action | Owner |
|------|--------|-------|
| 1-2 | LinkedIn connection + value-add content share | AE |
| 2-3 | Discovery call (MEDDIC light -- focus on Pain + Champion) | AE |
| 3-4 | Group demo or webinar invitation | Marketing |
| 4-6 | Individual follow-up based on demo engagement | AE |
| 6-8 | Re-score. If score improved to 70+, upgrade to T1. If not, continue T2 cycle. | AE |

**Content to send:**
- Blog posts (governance pain points, regulatory updates)
- Social media content (tag the company or persona if appropriate)
- Webinar invitations

### T3: Nurture (0-44 points)

**Goal:** Keep in awareness funnel. Re-score quarterly.

| Cadence | Action | Owner |
|---------|--------|-------|
| Monthly | Marketing email (governance insights, regulatory updates) | Marketing |
| Quarterly | Re-score using updated signal data | AE/Ops |
| Event-driven | If a trigger event occurs (CMA announcement, IPO filing), escalate to T2 immediately | AE |

---

## Wave Assignment for Beta Launch

### Wave 1 (Immediate -- first 10 accounts)

Score T1 accounts that meet ALL of these criteria:
- Firmographic score 30+
- Governance maturity score 20+ (WhatsApp/Excel, active board, 5+ shareholders)
- At least one intent signal
- Board Secretary or CEO identified by name

**Expected profile:** Saudi closed joint-stock or LLC, 50-200 employees, in Real Estate/Healthcare/Education, currently managing governance manually, with an active Board Secretary who responds to outreach.

### Wave 2 (Week 3-4 -- next 15 accounts)

T1 accounts that did not meet all Wave 1 criteria + top T2 accounts with strong intent signals.

### Wave 3 (Month 2 -- remaining 5 seats)

T2 accounts that showed engagement during Wave 1-2 marketing activities + referrals from Wave 1-2 clients.

---

## Scorecard Template

Copy for each prospect:

```
ACCOUNT: [Company Name]
DATE SCORED: [YYYY-MM-DD]
SCORED BY: [AE Name]

FIRMOGRAPHIC FIT (max 40):
  Entity Type:      ___/10
  Employee Count:   ___/10
  Industry:         ___/10
  Location:         ___/10
  Subtotal:         ___/40

GOVERNANCE MATURITY (max 30):
  Current System:   ___/10
  Board Activity:   ___/10
  Shareholders:     ___/10
  Subtotal:         ___/30

INTENT SIGNALS (max 20):
  Signals detected: ________________
  Subtotal:         ___/20

ENGAGEMENT QUALITY (max 10):
  Contact Level:    ___/10
  Subtotal:         ___/10

TOTAL SCORE:        ___/100
TIER ASSIGNMENT:    T___
WAVE ASSIGNMENT:    ___
NEXT ACTION:        ________________
```
