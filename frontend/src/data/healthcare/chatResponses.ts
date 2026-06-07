/**
 * Mock AI Chat Responses for HelixGuard
 * 
 * Surface-specific mock responses keyed by quick-prompt text.
 * When the backend API is unavailable (demo/capstone mode), the chat panel
 * falls back to these canned but realistic replies.
 */

export interface MockChatResponse {
  content: string;
  sources?: { name: string; confidence: number; kind?: 'table' | 'AI' | 'system' }[];
}

// ─── Leadership Surface ──────────────────────────────────────

export const LEADERSHIP_MOCK_RESPONSES: Record<string, MockChatResponse> = {
  'How is the clinical AI program performing?': {
    content: `**Clinical AI Program — Weekly Snapshot**

The program is tracking well across most areas:

- **12 active use cases** deployed across Pharmacy and Nursing
- **87% clinician adoption** rate (up from 79% last month)
- **Alert fatigue reduction:** 34% fewer overridden alerts in pharmacy
- **Handoff accuracy:** Nursing SBAR completeness improved to 91%

**One area to watch:** The Drug Interaction Checker v2 model is showing slightly elevated false-positive rates (8.2% vs 5% target). The governance team has flagged it for review.

Overall the program is on track for the Q1 milestones.`,
    sources: [
      { name: 'Program Dashboard', confidence: 0.95, kind: 'table' },
      { name: 'Adoption Analytics', confidence: 0.92, kind: 'AI' },
    ],
  },

  'What needs attention this week?': {
    content: `**Items Needing Attention**

1. **Drug Interaction Checker v2** — False-positive rate at 8.2% (target: ≤5%). Governance review scheduled for Thursday.
2. **Nursing Handoff rollout to ICU** — Go-live was delayed from Monday to Wednesday due to EHR integration testing. No risk to overall timeline yet.
3. **Quarterly compliance audit** — Due Friday. 3 of 12 use cases still need updated risk assessments submitted.

**Recommended actions:**
- Attend the governance review for the interaction checker
- Follow up with the ICU nursing lead on integration readiness
- Ping use-case owners for the 3 outstanding risk assessments`,
    sources: [
      { name: 'Program Tracker', confidence: 0.93, kind: 'table' },
      { name: 'Governance Registry', confidence: 0.90, kind: 'table' },
    ],
  },

  'Show me outcomes for pharmacy': {
    content: `**Pharmacy AI Outcomes — Last 30 Days**

| Metric | Value | Trend |
|--------|-------|-------|
| Alert override rate | 18% | ↓ 6pp (was 24%) |
| Time to review (avg) | 42 sec | ↓ 15 sec |
| High-severity catches | 14 | ↑ 3 vs prior month |
| Clinician satisfaction | 4.2 / 5 | → Stable |

**Key insight:** The new alert prioritization model is working — clinicians are spending less time on low-risk alerts and catching more high-severity interactions.

**Next milestone:** Expand the renal dosing module to all pharmacy stations by Feb 15.`,
    sources: [
      { name: 'Pharmacy Analytics', confidence: 0.94, kind: 'table' },
      { name: 'AI Model Metrics', confidence: 0.91, kind: 'AI' },
    ],
  },

  'Any safety incidents?': {
    content: `**Safety Incident Summary — Last 7 Days**

**No critical (Severity 1) incidents reported.** ✓

There were **2 minor incidents** (Severity 3):

1. **False-negative alert** — The interaction checker missed a moderate warfarin–amiodarone interaction for one patient. Caught by the pharmacist during manual review. Root cause: incomplete medication reconciliation data from the transfer facility. *Corrective action in progress.*

2. **Handoff field truncation** — One nursing handoff summary was truncated at 500 characters due to a UI bug. No clinical impact; the nurse caught it during sign-off review. *Bug fix deployed Tuesday.*

Both incidents are documented in the audit log and are under standard review.`,
    sources: [
      { name: 'Safety Incident DB', confidence: 0.97, kind: 'table' },
      { name: 'Audit Log', confidence: 0.95, kind: 'system' },
    ],
  },

  'What should I focus on?': {
    content: `**Recommended Focus Areas for This Week**

Based on program status and upcoming deadlines:

1. **Governance review (Thursday)** — The Drug Interaction Checker v2 false-positive issue needs leadership visibility. Consider attending to signal executive support for the model tuning effort.

2. **Quarterly compliance audit (Friday)** — 3 use cases need risk assessment updates. A quick Slack message to owners today could prevent last-minute scrambles.

3. **ICU nursing rollout (Wednesday)** — This is the first expansion beyond Med/Surg. A successful go-live here strengthens the case for the Q2 ED expansion proposal.

**Quick win:** The pharmacy alert fatigue reduction numbers are impressive. Consider highlighting them in the next all-hands to build momentum.`,
    sources: [
      { name: 'Program Tracker', confidence: 0.90, kind: 'table' },
      { name: 'AI Prioritization', confidence: 0.88, kind: 'AI' },
    ],
  },
};

// ─── Governance Surface ──────────────────────────────────────

export const GOVERNANCE_MOCK_RESPONSES: Record<string, MockChatResponse> = {
  'Show me pending use case approvals': {
    content: `**Pending Use Case Approvals (3)**

| Use Case | Department | Submitted | Risk Tier | Status |
|----------|-----------|-----------|-----------|--------|
| Sepsis Early Warning v1 | Nursing | Jan 28 | High | Awaiting clinical review |
| Lab Result Summarizer | Pharmacy | Feb 1 | Medium | Awaiting privacy review |
| Discharge Planning Assistant | Nursing | Feb 3 | Medium | In initial review |

**Action needed:**
- The **Sepsis Early Warning** has been pending for 11 days — it requires a clinical safety review before it can proceed. Consider escalating to the clinical review board.
- The other two are within normal SLA (< 10 business days).`,
    sources: [
      { name: 'Use Case Registry', confidence: 0.96, kind: 'table' },
      { name: 'Approval Workflow', confidence: 0.94, kind: 'system' },
    ],
  },

  'Any flagged AI interactions this week?': {
    content: `**Flagged AI Interactions — Last 7 Days**

**Total interactions monitored:** 12,847
**Flagged for review:** 23 (0.18%)

**Breakdown by reason:**

- **Confidence below threshold (< 70%):** 14 interactions — mostly in the Drug Interaction Checker v2 (aligns with the known false-positive issue)
- **User override of AI recommendation:** 6 interactions — all from experienced pharmacists overriding low-severity alerts (expected behavior)
- **Unexpected output format:** 3 interactions — the Nursing Handoff generator produced unusually short summaries for 3 patients with minimal chart data

**No HIPAA or patient safety flags.** All 23 flagged interactions are informational and don't require immediate action.`,
    sources: [
      { name: 'Interaction Monitor', confidence: 0.95, kind: 'AI' },
      { name: 'Audit Log', confidence: 0.93, kind: 'table' },
    ],
  },

  "What's the audit summary for pharmacy?": {
    content: `**Pharmacy AI Audit Summary — Q1 2026**

**Compliance Score: 94/100** (up from 89 last quarter)

| Category | Score | Notes |
|----------|-------|-------|
| Data handling | 98 | PHI properly anonymized in all logs |
| Model performance | 91 | False-positive rate slightly elevated |
| Access controls | 96 | RBAC properly enforced |
| Documentation | 92 | 2 use cases need updated risk assessments |
| Incident response | 95 | All incidents documented within SLA |

**Recommendations:**
1. Update risk assessments for Drug Interaction Checker v2 and Renal Dosing Module
2. Address the false-positive rate before next quarterly review
3. Consider adding automated performance regression testing`,
    sources: [
      { name: 'Audit Engine', confidence: 0.94, kind: 'system' },
      { name: 'Compliance Dashboard', confidence: 0.92, kind: 'table' },
    ],
  },

  'Are there any policy violations?': {
    content: `**Policy Violation Report — Current Period**

**No active policy violations.** ✓

**Resolved (last 30 days):**

1. **Model deployment without sign-off** (Jan 15) — A minor update to the alert prioritization model was pushed to staging without the required governance sign-off. Caught during daily review. *Resolved: process reminder sent, no patient impact.*

2. **Audit log gap** (Jan 8) — A 2-hour gap in interaction logging due to a service restart. All interactions were retroactively logged from the backup stream. *Resolved: automated monitoring added.*

**Policy compliance rate: 99.2%** across all active use cases.

The governance framework is functioning as designed — both issues were caught by existing controls.`,
    sources: [
      { name: 'Policy Engine', confidence: 0.96, kind: 'system' },
      { name: 'Violation Tracker', confidence: 0.94, kind: 'table' },
    ],
  },

  'Which use cases need quarterly review?': {
    content: `**Use Cases Due for Quarterly Review**

**Due this month (February):** 4 use cases

| Use Case | Department | Last Review | Risk Tier | Owner |
|----------|-----------|-------------|-----------|-------|
| Drug Interaction Checker v2 | Pharmacy | Nov 2025 | High | Pharmacy AI Lead |
| Alert Priority Scoring | Pharmacy | Nov 2025 | Medium | Pharmacy AI Lead |
| Nursing SBAR Generator | Nursing | Nov 2025 | Medium | Nursing Informatics |
| Renal Dosing Module | Pharmacy | Dec 2025 | High | Clinical Pharmacist |

**Upcoming (March):** 3 use cases

The two **High** risk-tier use cases (Drug Interaction Checker, Renal Dosing) require both a clinical safety review and a technical performance review. Consider scheduling these first.`,
    sources: [
      { name: 'Use Case Registry', confidence: 0.95, kind: 'table' },
      { name: 'Review Calendar', confidence: 0.93, kind: 'system' },
    ],
  },
};

// ─── Default / Fallback ──────────────────────────────────────

export const DEFAULT_MOCK_RESPONSES: Record<string, MockChatResponse> = {
  ...LEADERSHIP_MOCK_RESPONSES,
};

// ─── Clinician Surface (for inline AI) ───────────────────────

export const CLINICIAN_PHARMACY_MOCK_RESPONSES: Record<string, MockChatResponse> = {
  'Explain this interaction': {
    content: `**Drug Interaction: Warfarin + Fluconazole**

Fluconazole is a potent CYP2C9 inhibitor and significantly increases warfarin levels. This is a **high-severity** interaction.

**Clinical significance:**
- Expected INR increase of 1.5–2x within 3–5 days
- Risk of bleeding events if dose not adjusted

**Recommendation:** Reduce warfarin dose by 25–50% and monitor INR within 3 days of fluconazole initiation. Consider alternative antifungal if duration > 7 days.`,
    sources: [{ name: 'Drug Interaction DB', confidence: 0.96, kind: 'table' }],
  },
  'Check dosing': {
    content: `**Dosing Check — Current Orders**

Based on the patient's current renal function (CrCl: 42 mL/min), the following adjustments are recommended:

- **Vancomycin:** Current 1g q12h → Suggest 1g q24h (renal adjustment)
- **Metformin:** Current 1000mg BID → Within range, but monitor lactic acid
- **Enoxaparin:** Current 40mg daily → Appropriate for prophylaxis at this CrCl

All other medications are within standard dosing ranges for this patient's profile.`,
    sources: [{ name: 'Dosing Calculator', confidence: 0.93, kind: 'AI' }],
  },
  'Summarize patient': {
    content: `**Patient Summary**

72-year-old male admitted 3 days ago for community-acquired pneumonia. Key details:

- **Active issues:** Pneumonia (improving), Type 2 DM, CKD Stage 3, A-fib on warfarin
- **Allergies:** Penicillin (rash), Sulfa (hives)
- **Current antibiotics:** Azithromycin + Ceftriaxone (Day 3)
- **Trending:** WBC improving (14.2 → 10.8), temp normalized, O2 sats stable on room air
- **Pending:** Blood cultures (48h, no growth), renal panel this AM`,
    sources: [{ name: 'EHR Summary', confidence: 0.91, kind: 'table' }],
  },
};

export const CLINICIAN_NURSING_MOCK_RESPONSES: Record<string, MockChatResponse> = {
  'Summarize changes': {
    content: `**Shift Changes Summary — Last 8 Hours**

Key changes for your patients:

- **Rm 412A:** New PRN pain medication order (morphine 2mg IV q4h). Pain score trending down (7→4).
- **Rm 415B:** Foley catheter removed per protocol. Monitor urine output q4h.
- **Rm 418A:** Diet upgraded from NPO to clear liquids. Tolerating well.
- **Rm 420C:** New consult ordered — Endocrinology for uncontrolled blood glucose (3 readings > 250 today).

No critical lab values or significant vital sign changes across your patients.`,
    sources: [{ name: 'EHR Activity Log', confidence: 0.94, kind: 'table' }],
  },
  'Flag for physician': {
    content: `**Physician Notification Draft**

Based on the current patient status, here's a suggested SBAR notification:

**S** — Patient in Rm 420C has had 3 blood glucose readings > 250 mg/dL in the past 8 hours despite sliding scale insulin.

**B** — 65-year-old with Type 2 DM, admitted for CHF exacerbation. On prednisone 40mg daily (started 2 days ago). Endocrine consult pending.

**A** — Current insulin regimen appears insufficient to manage steroid-induced hyperglycemia. Patient is asymptomatic but trending upward.

**R** — Request review of insulin regimen. Consider adding scheduled intermediate-acting insulin to cover steroid effect.

*Ready to send this to the attending?*`,
    sources: [{ name: 'SBAR Generator', confidence: 0.92, kind: 'AI' }],
  },
  'Prep for handoff': {
    content: `**Handoff Preparation — Your 4 Patients**

All SBAR summaries have been auto-generated. Here's a quick overview:

| Room | Patient | Key Focus | Status |
|------|---------|-----------|--------|
| 412A | J. Morrison | Pain management, new PRN morphine | Improving |
| 415B | M. Chen | Post-Foley removal, monitor output | Stable |
| 418A | R. Thompson | Diet advancement, pneumonia recovery | Improving |
| 420C | L. Davis | Hyperglycemia, awaiting endo consult | Needs attention |

**Action items for oncoming shift:**
1. Monitor Rm 415B urine output (first void expected within 6 hours)
2. Follow up on Rm 420C endocrine consult timing
3. Rm 412A — reassess pain at 2200

All 4 handoff summaries are ready for your review and sign-off.`,
    sources: [{ name: 'Handoff Generator', confidence: 0.93, kind: 'AI' }],
  },
};

/**
 * Look up a mock response for the given surface and prompt text.
 * Returns undefined if no match is found.
 */
export function getMockChatResponse(
  surface: string,
  prompt: string,
): MockChatResponse | undefined {
  // Try exact match first, then case-insensitive
  const lookup = (map: Record<string, MockChatResponse>) =>
    map[prompt] ?? Object.entries(map).find(([k]) => k.toLowerCase() === prompt.toLowerCase())?.[1];

  switch (surface) {
    case 'leadership':
      return lookup(LEADERSHIP_MOCK_RESPONSES);
    case 'governance':
      return lookup(GOVERNANCE_MOCK_RESPONSES);
    case 'clinician':
      // Try both pharmacy and nursing
      return lookup(CLINICIAN_PHARMACY_MOCK_RESPONSES) ?? lookup(CLINICIAN_NURSING_MOCK_RESPONSES);
    default:
      return lookup(DEFAULT_MOCK_RESPONSES);
  }
}

/**
 * Generic fallback response when no specific mock matches.
 */
export const GENERIC_MOCK_FALLBACK: MockChatResponse = {
  content: `I can help you with that! In the full HelixGuard deployment, I'd pull real-time data from the clinical AI platform to answer your question.

For this demo, try one of the **quick prompts** below — they'll show you the kind of rich, contextual responses the system provides.`,
  sources: [{ name: 'System', confidence: 1, kind: 'system' }],
};
