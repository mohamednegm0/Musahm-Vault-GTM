# Launch Checklist: Musahm Vault Beta

> **Date:** 2026-04-02
> **Scope:** Complete pre-launch, launch week, post-launch, and ongoing operations checklist
> **Deliverables produced:** 34 files across 5 phases + supporting documents
> **Status:** All content ready for deployment. Blocked items flagged with WARNING: NEEDS CLIENT INPUT.

---

## Deliverable Index

All GTM assets produced during this execution, organized by phase. File paths are relative to the `gtm/` directory.

### Phase 1: Discovery

| # | Deliverable | File | Status |
|---|------------|------|--------|
| 1 | Brand Audit | `phase1-discovery/brand-audit.md` | Complete |
| 2 | Competitive Analysis | `phase1-discovery/competitive-analysis.md` | Complete |
| 3 | ICP + Buyer Personas | `phase1-discovery/icp.md` | Complete |
| 4 | Competitive Battle Cards (4 cards) | `phase1-discovery/battle-cards.md` | Complete |

### Phase 2: Brand

| # | Deliverable | File | Status |
|---|------------|------|--------|
| 5 | Brand Concept 1: Trust Heritage | `phase2-brand/concept-1-trust-heritage.md` | Complete |
| 6 | Brand Concept 2: Modern Digital | `phase2-brand/concept-2-modern-digital.md` | Complete |
| 7 | Brand Concept 3: KSA-Native-Tech | `phase2-brand/concept-3-ksa-native-tech.md` | Complete |
| 8 | Brand Recommendation | `phase2-brand/recommendation.md` | Complete |

### Phase 3: Segmentation + Strategy

| # | Deliverable | File | Status |
|---|------------|------|--------|
| 9 | Sector Priority Matrix | `phase3-segmentation/sector-priority-matrix.md` | Complete |
| 10 | Beta Rollout Plan (3 waves, scoring matrix) | `phase3-segmentation/beta-rollout-plan.md` | Complete |
| 11 | Message House (Musahm + Vault, 9 objection handlers) | `phase3-segmentation/message-house.md` | Complete |

### Phase 4: Content

| # | Deliverable | File | Status |
|---|------------|------|--------|
| 12 | Launch Email (bilingual, personalized) | `phase4-content/launch-email.md` | Complete |
| 13 | SMS Blast (UCS-2 compliant, multiple versions) | `phase4-content/sms-blast.md` | Complete |
| 14 | Video Script (90s, scene breakdown) | `phase4-content/video-script.md` | Complete |
| 15 | Social Media Posts (LinkedIn + Twitter, AR + EN) | `phase4-content/social-posts.md` | Complete |
| 16 | Poster Copy (print + digital) | `phase4-content/poster-copy.md` | Complete |
| 17 | Landing Page Copy (8 sections, design notes) | `phase4-content/landing-page.md` | Complete |
| 18 | Sales Deck (15 slides, speaker notes) | `phase4-content/sales-deck.md` | Complete |
| 19 | FAQ (bilingual) | `phase4-content/faq.md` | Complete |
| 20 | Onboarding Email Sequence (5 emails, 14 days) | `phase4-content/onboarding-sequence.md` | Complete |
| 21 | Nurture Email Sequence (4 emails, 21 days) | `phase4-content/nurture-sequence.md` | Complete |
| 22 | Case Study Template | `phase4-content/case-study-template.md` | Complete |
| 23 | Quick Start Guide | `phase4-content/quick-start-guide.md` | Complete |
| 24 | Google Ads Campaign (4 campaigns, 12 RSAs, full structure) | `phase4-content/google-ads.md` | Complete |
| 25 | Partner Enablement Kit (sales sheet, pitch script, FAQ, co-marketing) | `phase4-content/partner-kit.md` | Complete |

### Phase 5: Launch Operations

| # | Deliverable | File | Status |
|---|------------|------|--------|
| 26 | Beta KPI Dashboard Plan (10 KPIs, instrumentation spec) | `phase5-launch/beta-kpi-plan.md` | Complete |
| 27 | Vault User Documentation | `phase5-launch/vault-user-docs.md` | Complete |
| 28 | Win/Loss Tracking Template | `phase5-launch/win-loss-template.md` | Complete |
| 29 | Launch Checklist | `phase5-launch/launch-checklist.md` | This file |

### Supporting Documents

| # | Deliverable | File | Status |
|---|------------|------|--------|
| 30 | GTM Audit + Execution Plan | `GTM-AUDIT-AND-EXECUTION-PLAN.md` | Complete |
| 31 | Tool Stack (40 tools, 6 MCP servers, production pipelines) | `TOOL-STACK.md` | Complete |
| 32 | Execution Plan | `execution-plan.md` | Complete |
| 33 | Voice Guide (8 sections, prompt-ready block) | `voice-guide.md` | Complete |
| 34 | Humanizer Report | `humanizer-report.md` | Complete |

---

## Pre-Launch: T-14 to T-7

### Infrastructure Setup

| # | Task | Owner | Dependency | Tool/File Reference | Status |
|---|------|-------|-----------|---------------------|--------|
| 1 | Set up Brevo account: import client contacts, configure sender domain, verify delivery | Marketing Manager | None | `TOOL-STACK.md` -- Tier S | ⬜ |
| 2 | Install Microsoft Clarity on landing page and beta environment | Engineering + Marketing | Landing page live (#7) | `TOOL-STACK.md` -- Tier S | ⬜ |
| 3 | Set up Tally form for beta sign-up, configure confirmation redirect | Marketing Manager | None | `TOOL-STACK.md` -- Tier S | ⬜ |
| 4 | Set up Cal.com for demo scheduling, embed widget on landing page | Marketing Manager | Landing page live (#7) | `TOOL-STACK.md` -- Tier S | ⬜ |
| 5 | Set up Dub.co for UTM-tagged short links across all campaigns | Marketing Manager | None | `TOOL-STACK.md` -- Tier S | ⬜ |
| 6 | Set up Postiz for social media scheduling (load 4-week calendar) | Social Media Manager | None | `TOOL-STACK.md` -- Tier A | ⬜ |
| 7 | Deploy Vault landing page (Arabic + English) with all 8 sections | Web Dev + Marketing | Copy approved (#17) | `phase4-content/landing-page.md` | ⬜ |
| 8 | Embed Tally beta sign-up form on landing page | Web Dev | Tally configured (#3), landing page live (#7) | `phase4-content/landing-page.md` | ⬜ |
| 9 | Register SMS sender ID and test Arabic UCS-2 delivery | Marketing + IT | None | `phase4-content/sms-blast.md` | ⬜ |
| 10 | Configure 6 PostHog custom events for beta KPI tracking | Engineering | None | `phase5-launch/beta-kpi-plan.md` -- instrumentation table | ⬜ |
| 11 | Set up changedetection.io watches on Majles.tech, Ebana websites | Marketing | None | `TOOL-STACK.md` -- Tier A | ⬜ |
| 12 | Set up Google Ads conversion tracking (Tally form + Cal.com confirmation) | Performance Marketing + Engineering | Tally (#3) + Cal.com (#4) live | `phase4-content/google-ads.md` -- conversion tracking section | ⬜ |

### Content QA (Arabic Native Review)

All content was written with AI assistance. Every Arabic-facing asset requires native Arabic speaker review before deployment.

| # | Task | Owner | File to Review | Status |
|---|------|-------|---------------|--------|
| 13 | Native review: launch email | Arabic Copywriter | `phase4-content/launch-email.md` | ⬜ |
| 14 | Native review: SMS blast (all versions) | Arabic Copywriter | `phase4-content/sms-blast.md` | ⬜ |
| 15 | Native review: social media posts | Arabic Copywriter | `phase4-content/social-posts.md` | ⬜ |
| 16 | Native review: landing page copy (Arabic sections) | Arabic Copywriter | `phase4-content/landing-page.md` | ⬜ |
| 17 | Native review: Google Ads headlines + descriptions (Arabic campaigns) | Arabic Copywriter | `phase4-content/google-ads.md` -- Campaigns 1, 2 | ⬜ |
| 18 | Native review: partner kit (Arabic sections) | Arabic Copywriter | `phase4-content/partner-kit.md` | ⬜ |
| 19 | Native review: onboarding email sequence | Arabic Copywriter | `phase4-content/onboarding-sequence.md` | ⬜ |
| 20 | Native review: nurture email sequence | Arabic Copywriter | `phase4-content/nurture-sequence.md` | ⬜ |
| 21 | Native review: FAQ (Arabic answers) | Arabic Copywriter | `phase4-content/faq.md` | ⬜ |
| 22 | Native review: sales deck (Arabic slides) | Arabic Copywriter | `phase4-content/sales-deck.md` | ⬜ |
| 23 | Native review: quick start guide | Arabic Copywriter | `phase4-content/quick-start-guide.md` | ⬜ |
| 24 | Legal review: Google Ads copy (regulatory claims, e-signature compliance) | Legal | `phase4-content/google-ads.md` | ⬜ |
| 25 | Legal review: partner agreement terms | Legal | `phase4-content/partner-kit.md` -- Appendix | ⬜ |
| 26 | CEO approval: brand concept (KSA-Native-Tech / Concept 3) | CEO + Marketing | `phase2-brand/recommendation.md` | ⬜ |
| 27 | Voice guide distributed to all writers, designers, agencies | Marketing Manager | `voice-guide.md` | ⬜ |

### Technical Readiness

| # | Task | Owner | Dependency | File Reference | Status |
|---|------|-------|-----------|----------------|--------|
| 28 | Vault beta environment live, stable, accessible | Engineering | None | N/A | ⬜ |
| 29 | GRC SSO integration verified (Musahm to Vault single sign-on) | Engineering | Beta environment (#28) | N/A | ⬜ |
| 30 | Vault onboarding flow tested with 3+ internal users | Product + QA | Beta environment (#28) | `phase4-content/quick-start-guide.md` | ⬜ |
| 31 | User documentation published (Sections 1-3 minimum) | Technical Writer | None | `phase5-launch/vault-user-docs.md` | ⬜ |
| 32 | Support team briefed on Vault features, FAQ, objection handlers | Customer Success | User docs (#31) | `phase4-content/faq.md`, `phase3-segmentation/message-house.md` | ⬜ |
| 33 | Beta scoring matrix run against real client data | Account Manager | None | `phase3-segmentation/beta-rollout-plan.md` | ⬜ |
| 34 | Wave 1 clients identified and ordered (top 5 by score) | Account Manager | Scoring complete (#33) | `phase3-segmentation/beta-rollout-plan.md` | ⬜ |
| 35 | Google Ads 4 campaigns built in Google Ads console, ready to activate | Performance Marketing | Ad copy approved (#17, #24) | `phase4-content/google-ads.md` | ⬜ |
| 36 | Email templates built in Brevo (launch + onboarding + nurture) | Marketing Manager | Brevo configured (#1), copy approved (#13, #19, #20) | `phase4-content/launch-email.md`, `phase4-content/onboarding-sequence.md`, `phase4-content/nurture-sequence.md` | ⬜ |
| 37 | Product video produced and approved | Video Production + Marketing | None | `phase4-content/video-script.md` | ⬜ |
| 38 | Sales deck designed and exported to PDF/PPTX (generate via Gamma) | Marketing + Design | None | `phase4-content/sales-deck.md` | ⬜ |
| 39 | Social posts scheduled in Postiz for weeks 1-4 | Social Media Manager | Postiz configured (#6) | `phase4-content/social-posts.md` | ⬜ |

### Pre-Launch Gate

Do not proceed to Launch Week until ALL of the following are confirmed:

- [ ] Vault beta environment is stable (#28)
- [ ] Landing page is live with working Tally sign-up form (#7, #8)
- [ ] SMS sender ID is registered and tested (#9)
- [ ] PostHog custom events are instrumented (#10)
- [ ] Google Ads conversion tracking is installed (#12)
- [ ] Wave 1 clients are identified and ordered (#34)
- [ ] All Arabic copy has been native-reviewed (#13-#23)
- [ ] Brand concept is confirmed by CEO (#26)
- [ ] Support team is briefed (#32)
- [ ] Email sequences are loaded in Brevo (#36)

---

## Launch Week: T-7 to T+0

### T-7 (Sunday): VIP Pre-Notification

| # | Task | Owner | Channel | File Reference | Status |
|---|------|-------|---------|----------------|--------|
| 40 | Send personalized WhatsApp messages to Wave 1 VIP contacts | Account Manager | WhatsApp Business | Personalized (reference `phase3-segmentation/message-house.md` for talking points) | ⬜ |
| 41 | Brief existing partners/resellers on Vault launch | Business Development | Email + call | `phase4-content/partner-kit.md` | ⬜ |
| 42 | Provide partner demo accounts with open access | Product + BD | Internal | `phase4-content/partner-kit.md` | ⬜ |
| 43 | Upload 15-second video teaser to LinkedIn and Twitter | Social Media Manager | LinkedIn + Twitter | `phase4-content/video-script.md` | ⬜ |

### T-5 (Tuesday): Wave 1 Email

| # | Task | Owner | Channel | File Reference | Status |
|---|------|-------|---------|----------------|--------|
| 44 | Send Vault beta invitation email to Wave 1 clients (top 5 by score) | Marketing Manager | Brevo | `phase4-content/launch-email.md` | ⬜ |

### T-3 (Thursday): Social Warm-Up

| # | Task | Owner | Channel | File Reference | Status |
|---|------|-------|---------|----------------|--------|
| 45 | Publish LinkedIn teaser post (pain-point question format) | Social Media Manager | LinkedIn | `phase4-content/social-posts.md` | ⬜ |
| 46 | Publish Twitter teaser tweet (Triple Beat cadence) | Social Media Manager | Twitter/X | `phase4-content/social-posts.md` | ⬜ |

### T+0 (Launch Day -- Sunday): Full Activation

| # | Task | Owner | Channel | File Reference | Time (AST) | Status |
|---|------|-------|---------|----------------|-----------|--------|
| 47 | Send SMS blast to all Musahm client primary contacts | Marketing Manager | SMS | `phase4-content/sms-blast.md` | 10:00 AM | ⬜ |
| 48 | Send Wave 2 beta invitation email (clients scored 24-31) | Marketing Manager | Brevo | `phase4-content/launch-email.md` | 10:30 AM | ⬜ |
| 49 | Publish LinkedIn Vault announcement post (Arabic, pin to page) | Social Media Manager | LinkedIn | `phase4-content/social-posts.md` | 11:00 AM | ⬜ |
| 50 | Update LinkedIn company page description to include Vault | Social Media Manager | LinkedIn | N/A | 11:05 AM | ⬜ |
| 51 | Publish Twitter Vault announcement tweet (pin tweet) | Social Media Manager | Twitter/X | `phase4-content/social-posts.md` | 11:15 AM | ⬜ |
| 52 | Upload full product video to YouTube (musahmofficial) | Marketing Manager | YouTube | `phase4-content/video-script.md` | 11:30 AM | ⬜ |
| 53 | Activate all 4 Google Ads campaigns | Performance Marketing | Google Ads | `phase4-content/google-ads.md` | 12:00 PM | ⬜ |
| 54 | Send WhatsApp Business broadcast to all client contacts | Account Manager | WhatsApp Business | N/A | 12:30 PM | ⬜ |
| 55 | Notify partners: Vault is live, begin active selling | Business Development | Email + WhatsApp | `phase4-content/partner-kit.md` | 1:00 PM | ⬜ |
| 56 | Distribute press release via ZAWYA/AMEinfo (if ready) | PR / Communications | Press wire | Write from `phase3-segmentation/message-house.md` | 2:00 PM | ⬜ |
| 57 | Monitor landing page, forms, and beta environment for issues | Engineering + Product | Internal | N/A | All day | ⬜ |
| 58 | Respond to all inbound inquiries within 2 hours | Customer Success | All channels | `phase4-content/faq.md` | All day | ⬜ |

### T+2 (Tuesday): First Follow-Up

| # | Task | Owner | Channel | File Reference | Status |
|---|------|-------|---------|----------------|--------|
| 59 | Follow up with Wave 1 non-responders (72-hour rule) | Account Manager | Email + WhatsApp | `phase4-content/launch-email.md` | ⬜ |
| 60 | Publish LinkedIn follow-up post (feature spotlight) | Social Media Manager | LinkedIn | `phase4-content/social-posts.md` | ⬜ |
| 61 | Publish Twitter feature highlight tweet | Social Media Manager | Twitter/X | `phase4-content/social-posts.md` | ⬜ |
| 62 | Review Google Ads search terms report, add negative keywords | Performance Marketing | Google Ads | `phase4-content/google-ads.md` | ⬜ |

---

## Post-Launch: T+1 to T+30

### Week 1 (T+1 to T+7)

| # | Task | Owner | Cadence | File Reference | Status |
|---|------|-------|---------|----------------|--------|
| 63 | Activate onboarding email sequence for beta users who logged in | Marketing Manager | Automated (Brevo) | `phase4-content/onboarding-sequence.md` | ⬜ |
| 64 | Activate nurture email sequence for sign-ups who have NOT logged in | Marketing Manager | Automated (Brevo) | `phase4-content/nurture-sequence.md` | ⬜ |
| 65 | First weekly beta KPI check-in (Sunday 10:00 AM AST) | PM + Engineering + CS + Marketing | Weekly | `phase5-launch/beta-kpi-plan.md` -- weekly template | ⬜ |
| 66 | Host first live demo webinar (30 min, Arabic, record for YouTube) | Product Manager + CS | One-time | `phase4-content/quick-start-guide.md` for flow | ⬜ |
| 67 | Google Ads: daily monitoring, pause underperforming ads | Performance Marketing | Daily | `phase4-content/google-ads.md` -- optimization cadence | ⬜ |
| 68 | Microsoft Clarity: review heatmaps and session recordings on landing page | Marketing Manager | Daily | `TOOL-STACK.md` | ⬜ |
| 69 | Track and respond to all beta user feedback within 24 hours | Customer Success | Daily | `phase5-launch/beta-kpi-plan.md` | ⬜ |

### Week 2 (T+8 to T+14)

| # | Task | Owner | Cadence | File Reference | Status |
|---|------|-------|---------|----------------|--------|
| 70 | Second weekly beta KPI check-in | PM + Engineering + CS + Marketing | Weekly | `phase5-launch/beta-kpi-plan.md` | ⬜ |
| 71 | Send Wave 3 beta invitation email (clients scored 16-23) | Marketing Manager | One-time | `phase4-content/launch-email.md` | ⬜ |
| 72 | Publish LinkedIn post: testimonial/case study angle | Social Media Manager | One-time | `phase4-content/social-posts.md` | ⬜ |
| 73 | Publish Twitter follow-up tweet: beta extension reminder | Social Media Manager | One-time | `phase4-content/social-posts.md` | ⬜ |
| 74 | Google Ads: bi-weekly optimization (pause low CTR headlines, test new) | Performance Marketing | Bi-weekly | `phase4-content/google-ads.md` | ⬜ |
| 75 | Host repeat demo webinar for stragglers | Product Manager + CS | One-time | N/A | ⬜ |
| 76 | Begin collecting case study material from Wave 1 clients | Customer Success + Marketing | One-time | `phase4-content/case-study-template.md` | ⬜ |
| 77 | Start win/loss tracking for every deal interaction | Account Manager | Ongoing | `phase5-launch/win-loss-template.md` | ⬜ |

### Week 3-4 (T+15 to T+30)

| # | Task | Owner | Cadence | File Reference | Status |
|---|------|-------|---------|----------------|--------|
| 78 | Weekly beta KPI check-ins (weeks 3 and 4) | PM + Engineering + CS + Marketing | Weekly | `phase5-launch/beta-kpi-plan.md` | ⬜ |
| 79 | Publish first blog post: governance thought leadership (Arabic primary) | Marketing Manager | One-time | `voice-guide.md` for voice reference | ⬜ |
| 80 | Publish second blog post: Vault product deep-dive (bilingual) | Marketing Manager | One-time | `phase3-segmentation/message-house.md` for messaging | ⬜ |
| 81 | Continue weekly social publishing (1 LinkedIn + 1 Twitter minimum) | Social Media Manager | Weekly | `phase4-content/social-posts.md` | ⬜ |
| 82 | Google Ads: monthly campaign budget reallocation based on CPA | Performance Marketing | Monthly | `phase4-content/google-ads.md` | ⬜ |
| 83 | Wave 1 success gate evaluation (per beta-rollout-plan criteria) | Product Manager | One-time | `phase3-segmentation/beta-rollout-plan.md` | ⬜ |
| 84 | User satisfaction survey sent to Wave 1 beta users (1-10 scale) | Customer Success | One-time | `phase5-launch/beta-kpi-plan.md` -- KPI #8 | ⬜ |
| 85 | Partner program: first monthly review | Business Development | Monthly | `phase4-content/partner-kit.md` | ⬜ |
| 86 | Pitch exclusive story to Arabic tech press (Argaam, StartupScene ME) | PR / Communications | One-time | `phase1-discovery/battle-cards.md` for positioning | ⬜ |
| 87 | Outreach to KSA business associations (Monsha'at, Chambers of Commerce) | Business Development | One-time | N/A | ⬜ |
| 88 | First monthly win/loss analysis | Account Manager + Marketing | Monthly | `phase5-launch/win-loss-template.md` | ⬜ |

---

## Ongoing Operations (T+30 onward)

### Competitive Monitoring

| # | Task | Owner | Cadence | File Reference |
|---|------|-------|---------|----------------|
| 89 | Review changedetection.io alerts for competitor website changes | Marketing Manager | Weekly | `TOOL-STACK.md`, `phase1-discovery/battle-cards.md` |
| 90 | Update battle cards when competitor features or pricing change | Pre-Sales + Marketing | Quarterly | `phase1-discovery/battle-cards.md` |
| 91 | Request demos from Majles.tech and Ebana annually (verify competitive claims) | Business Development | Annually | `phase1-discovery/competitive-analysis.md` |

### Monthly KPI Review (per beta-kpi-plan.md)

| # | Task | Owner | Cadence | File Reference |
|---|------|-------|---------|----------------|
| 92 | Weekly beta KPI check-in (Sunday 10:00 AM AST, 30 min) | PM + Engineering + CS + Marketing | Weekly | `phase5-launch/beta-kpi-plan.md` -- weekly template |
| 93 | Monthly KPI review and report to leadership | Product Manager | Monthly | `phase5-launch/beta-kpi-plan.md` |
| 94 | Wave gate evaluation before advancing to next wave | Product Manager | Per wave | `phase3-segmentation/beta-rollout-plan.md` |
| 95 | Win/loss tracking updated for every closed deal or lost prospect | Account Manager | Per deal | `phase5-launch/win-loss-template.md` |

### Content Operations

| # | Task | Owner | Cadence | File Reference |
|---|------|-------|---------|----------------|
| 96 | LinkedIn: 1-2 posts per week (insight-led, per voice guide) | Social Media Manager | Weekly | `phase4-content/social-posts.md`, `voice-guide.md` |
| 97 | Twitter/X: 2-3 posts per week (Triple Beat cadence, one idea per post) | Social Media Manager | Weekly | `phase4-content/social-posts.md`, `voice-guide.md` |
| 98 | Blog: 2 posts per month (bilingual, alternating thought leadership and product) | Marketing Manager | Bi-monthly | `voice-guide.md` |
| 99 | Onboarding sequence: monitor completion rates, iterate underperforming emails | Marketing Manager | Weekly | `phase4-content/onboarding-sequence.md` |
| 100 | Nurture sequence: monitor conversion rates (inactive to logged-in), iterate | Marketing Manager | Weekly | `phase4-content/nurture-sequence.md` |
| 101 | Complete first case study from Wave 1 client (aim for month 2) | Marketing + Customer Success | One-time | `phase4-content/case-study-template.md` |

### Content Repurposing Calendar

| Source Content | Repurpose Into | Cadence |
|---------------|---------------|---------|
| Blog posts | LinkedIn summaries, Twitter threads, email newsletter snippets | Per blog post |
| Case studies | Sales deck slide, LinkedIn post, partner email template | Per case study |
| Demo webinar recordings | YouTube upload, 60s social clips, blog recap | Per webinar |
| Google Ads performance data | Monthly report, budget reallocation, new ad copy tests | Monthly |
| Beta KPI dashboard data | Internal report, investor update material | Monthly |
| Client feedback / testimonials | Landing page social proof, case study content, sales deck quotes | As received |
| Battle cards | Sales prep, partner training, competitor ad copy refresh | Quarterly |
| Partner kit | Training slides, onboarding materials, co-marketing refresh | Quarterly |
| Voice guide | Content briefs, AI prompt blocks, agency onboarding | Always (reference) |

### Paid Marketing Operations

| # | Task | Owner | Cadence | File Reference |
|---|------|-------|---------|----------------|
| 102 | Google Ads: search terms review, negative keyword additions | Performance Marketing | Weekly | `phase4-content/google-ads.md` |
| 103 | Google Ads: ad copy optimization (pause low CTR, test new variations) | Performance Marketing | Bi-weekly | `phase4-content/google-ads.md` |
| 104 | Google Ads: campaign budget reallocation based on CPA | Performance Marketing | Monthly | `phase4-content/google-ads.md` |
| 105 | Google Ads: full restructure evaluation | Performance Marketing | Quarterly | `phase4-content/google-ads.md` |

### Partner Operations

| # | Task | Owner | Cadence | File Reference |
|---|------|-------|---------|----------------|
| 106 | Monthly partner performance review (referrals, conversion, pipeline) | Business Development | Monthly | `phase4-content/partner-kit.md` |
| 107 | Quarterly partner training session (product updates, new features) | Product + BD | Quarterly | `phase4-content/partner-kit.md`, `phase4-content/sales-deck.md` |
| 108 | Partner referral tracking and commission reconciliation | Business Development + Finance | Monthly | `phase4-content/partner-kit.md` |

---

## Contingency Plans

| Risk | Probability | Impact | Contingency | Owner |
|------|------------|--------|-------------|-------|
| Landing page not ready by T-7 | Medium | High | Use Tally form as standalone sign-up page. Link from existing musahm.com. Use Carrd as 1-page fallback. | Web Dev |
| SMS sender ID registration delayed | Medium | Medium | Use WhatsApp Business broadcast as primary notification. Add SMS when approved. | Marketing + IT |
| Video production not ready by launch | Medium | Low | Launch without video. Use poster copy graphics or GIF screen recordings. Add video post-launch. | Video Production |
| Google Ads account setup blocked | Low | Medium | Launch all organic channels first. Add paid search at T+7. | Performance Marketing |
| In-app notification engineering delayed | High | Low | Email + SMS + WhatsApp cover the same audience. Add in-app post-launch. | Engineering |
| Beta environment unstable at launch | Low | Critical | Delay launch by 1 week. Communicate to Wave 1 as "extra quality assurance." | Engineering + Product |
| Low beta sign-up volume (first week) | Medium | High | Increase Google Ads budget by 50%. Activate partner outreach earlier. Direct BD calls to top prospects. | Marketing + BD |
| Arabic content fails native review | Medium | High | Engage Saudi Arabic-native copywriter for rewrite. Delay content deployment by 3 days. | Arabic Copywriter |
| Low email open rates (<15%) | Medium | Medium | A/B test subject lines. Switch to WhatsApp as primary channel. | Marketing Manager |
| Competitor launches during our launch window | Low | Medium | Do not react publicly. Update battle cards internally. Accelerate unique-feature messaging. | Marketing + Pre-Sales |

---

## Budget Summary

### One-Time Costs

| Item | Estimated Cost (SAR) | Notes |
|------|---------------------|-------|
| Video production | 30,000 - 100,000 | Largest optional cost. AI alternatives available (see `TOOL-STACK.md`). |
| Press release distribution | 2,000 - 5,000 | ZAWYA / AMEinfo |
| Arabic native copy review (25 deliverables) | 3,000 - 8,000 | Saudi native Arabic speaker |
| Partner badge / logo design | 1,000 - 3,000 | For partner kit co-branding materials |

### Monthly Recurring Costs

| Item | Estimated Cost (SAR) | Notes |
|------|---------------------|-------|
| Google Ads (4 campaigns) | 14,500 - 28,000 | See `phase4-content/google-ads.md` for per-campaign breakdown |
| SMS blasts | 500 - 2,000 | Per blast, UCS-2 segment pricing |
| WhatsApp Business API | 0 - 500 | 1,000 free conversations/month |
| Self-hosted tool infrastructure | 200 - 400 | ~$50-100/month (see `TOOL-STACK.md`) |
| API costs | 75 - 200 | ~$20-50/month |
| LinkedIn / Twitter / YouTube (organic) | 0 | Organic posting only |

### Total Estimated Range

| Phase | One-Time (SAR) | Monthly (SAR) |
|-------|---------------|---------------|
| Pre-launch | 36,000 - 116,000 | -- |
| Ongoing (per month) | -- | 15,275 - 31,100 |

> WARNING: NEEDS CLIENT INPUT -- Approve budget allocation. Specific amounts depend on video production scope and Google Ads commitment. Start at lower end and scale based on conversion data.

---

## Owner Role Directory

| Role | Responsibilities | Checklist Items |
|------|-----------------|-----------------|
| **Marketing Manager** | Email campaigns, content calendar, landing page, Brevo, brand coordination | #1, #3-5, #9, #36, #44, #47-48 |
| **Social Media Manager** | LinkedIn, Twitter/X, YouTube publishing, Postiz scheduling | #6, #39, #43, #45-46, #49-51, #60-61 |
| **Performance Marketing** | Google Ads setup, conversion tracking, CPA optimization | #12, #35, #53, #62, #67, #74, #82 |
| **Account Manager** | Client scoring, wave assignment, personalized outreach, follow-ups | #33-34, #40, #44, #54, #59 |
| **Business Development** | Partner program, business associations, press outreach | #41-42, #55, #85-87 |
| **Customer Success** | Support briefing, beta feedback, onboarding calls, webinars | #32, #58, #66, #69, #75-76, #84 |
| **Product Manager** | Beta environment, KPI check-ins, feature prioritization, wave gates | #30, #65, #78, #83 |
| **Engineering** | PostHog instrumentation, conversion tracking, beta stability, Clarity | #2, #10, #12, #28-29, #57 |
| **Arabic Copywriter** | Native review of all Arabic content (25 deliverables) | #13-23 |
| **Legal** | Ad copy review, partner agreement, e-signature compliance claims | #24-25 |
| **Web Dev** | Landing page deployment, form embed, Clarity/PostHog integration | #7-8 |
| **Video Production** | Product video per video-script.md, 15s teaser cut | #37, #43, #52 |
| **PR / Communications** | Press release, tech press outreach, association contact | #56, #86-87 |
| **CEO** | Brand concept approval, press release sign-off, budget approval | #26 |

> WARNING: NEEDS CLIENT INPUT -- Assign specific team members to each role. In a small team, one person may hold multiple roles. Confirm launch date and set the T-14 calendar.

---

## Post-Launch Review Schedule

| Timing | Review | Data Sources | Owner |
|--------|--------|-------------|-------|
| T+3 | Email + SMS delivery rates | Brevo, SMS provider | Marketing Manager |
| T+7 | First weekly KPI check-in + Google Ads review | PostHog, Google Ads, Clarity | PM + Marketing |
| T+14 | Second weekly KPI + landing page conversion review | PostHog, Clarity, Tally | PM + Marketing |
| T+30 | First monthly review (all channels) | All analytics, win/loss report | PM + full team |
| T+60 | End of social calendar review + case study progress | Social metrics, case study draft | Marketing |
| T+90 | Quarterly business review | Pipeline, NPS, competitive intel, KPIs | PM + CEO |

---

> حوكمة سعودية. منصة عالمية.
> Saudi governance. World-class platform.
