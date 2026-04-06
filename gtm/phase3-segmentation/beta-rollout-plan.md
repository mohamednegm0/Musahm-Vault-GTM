# Musahm Vault: Beta Rollout Plan

## Client Scoring Matrix

Score each existing Musahm client on the following 5 dimensions (1–5 raw scale each, weighted to a max score of 40):

| Criterion | Weight | 1 (Low) | 3 (Medium) | 5 (High) |
|---|---|---|---|---|
| **Governance Maturity** | ×2 | Minimal Musahm usage, few meetings logged | Regular meeting usage, some features adopted | Power user: meetings + e-signatures + voting + shareholder registry |
| **Document Volume** | ×2 | <50 docs/year, simple file types | 50–200 docs/year, multiple categories | 200+ docs/year, contracts + compliance + board materials |
| **Relationship Depth** | ×1.5 | New client (<6 months), minimal contact | Active client (6–18 months), regular support interactions | Long-term client (18+ months), champion contact identified, positive NPS |
| **Company Size** | ×1 | <20 employees, 1–2 board members | 20–100 employees, 3–7 board members | 100–500 employees, 8–15 board members |
| **Industry Document-Intensity** | ×1.5 | Services/consulting (lower doc volume) | Education, healthcare (moderate) | Real estate, finance, holding companies (high doc volume, compliance-heavy) |

### Scoring Formula
```
Score = (Governance Maturity × 2) + (Document Volume × 2) + (Relationship Depth × 1.5)
        + (Company Size × 1) + (Industry Doc-Intensity × 1.5)
```

**Max possible score:** 40
**Wave 1 threshold:** 32+
**Wave 2 threshold:** 24–31
**Wave 3 threshold:** 16–23
**Below 16:** Defer to general availability

---

## Wave Structure

### Wave 1: Pilot (5 Clients)
**Duration:** 4 weeks
**Objective:** Validate core workflows, identify showstopper bugs, collect qualitative feedback

**Selection criteria:**
- Score 32+ on the matrix above
- Must have an identified champion (board secretary or admin) willing to provide weekly feedback
- Ideally covers at least 3 different sectors for diversity of use cases
- At least 1 client should be a known reference client (Al-Ufuq, Miral, or Amwaj)

**Support model:**
- Dedicated onboarding call (30 min) per client
- Direct WhatsApp line to Musahm support for Vault issues
- Weekly 15-minute check-in call with champion
- Feedback collection: structured form after Week 1, Week 2, Week 4

**Success gates to advance to Wave 2:**

| Gate | Metric | Target |
|---|---|---|
| G1 | Activation rate (uploaded at least 10 documents) | 4/5 clients (80%) |
| G2 | Critical bugs reported | 0 unresolved P0 bugs |
| G3 | User satisfaction (1–10 survey) | Average ≥ 7.0 |
| G4 | Feature completion feedback | No "dealbreaker missing feature" reported by >1 client |
| G5 | Data integrity | Zero data loss or corruption incidents |

---

### Wave 2: Expanded Beta (15 Clients)
**Duration:** 6 weeks
**Objective:** Stress-test at scale, validate onboarding without hand-holding, gather usage patterns

**Selection criteria:**
- Score 24–31 on the matrix
- Mix of self-serve onboarding (no dedicated call) and guided onboarding to test both paths
- Include at least 2 clients with bilingual (Arabic + English) user bases

**Support model:**
- Self-serve onboarding flow (in-app guide + documentation)
- Shared support channel (not dedicated per-client)
- Bi-weekly check-in with 3–5 selected clients (rotating)
- Automated usage analytics tracking (no manual reporting dependency)

**Success gates to advance to Wave 3:**

| Gate | Metric | Target |
|---|---|---|
| G1 | Activation rate (≥10 documents uploaded within first 7 days) | 12/15 clients (80%) |
| G2 | Self-serve onboarding completion | 10/15 clients complete onboarding without support ticket (67%) |
| G3 | Weekly active users (WAU) after Week 3 | ≥60% of invited users returning weekly |
| G4 | Support ticket volume | <3 tickets per client per week (avg) |
| G5 | NPS score | ≥30 (measured at end of Wave 2) |
| G6 | Churn intent | 0 clients requesting to deactivate Vault |

---

### Wave 3: Open Beta (All Eligible Musahm Clients)
**Duration:** 8 weeks (then transition to GA)
**Objective:** Full rollout, pricing validation, GA readiness confirmation

**Selection criteria:**
- All remaining Musahm clients with score 16+
- Open enrollment via in-app banner + email campaign
- No manual scoring required. Self-selection with eligibility check

**Support model:**
- Fully self-serve onboarding
- Standard support queue (same as Musahm core)
- Monthly product update webinar (optional attendance)
- Community feedback forum or structured survey at Week 4 and Week 8

**Success gates to advance to General Availability (GA):**

| Gate | Metric | Target |
|---|---|---|
| G1 | Total active Vault users | ≥100 active users across all clients |
| G2 | Document upload volume | ≥1,000 documents uploaded total |
| G3 | System uptime during beta | ≥99.5% |
| G4 | Average onboarding time (first doc upload) | <15 minutes from first login |
| G5 | Revenue readiness | Pricing tier validated, billing integration tested |
| G6 | Retention (Wave 1+2 clients still active) | ≥85% of Wave 1+2 clients still using Vault |
| G7 | Documentation completeness | User docs, FAQ, and troubleshooting guide published |

⚠️ NEEDS CLIENT INPUT: Musahm team must provide the current client list with basic metadata (sector, company size, account age, primary contact) to run the scoring matrix against real data.
