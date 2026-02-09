/**
 * Governance Registry — Extended use case metadata for the Governance Control Plane
 * 
 * Adds governance-specific fields to use cases: approval history, policy references,
 * allowed models, template constraints, and RBAC rules.
 */

export interface ApprovalHistoryEntry {
  id: string;
  action: 'submitted' | 'approved' | 'rejected' | 'suspended' | 'comment' | 'resubmitted';
  actor: string;
  actorRole: string;
  timestamp: string;
  comment: string;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  description: string;
  enforcedSince: string;
  category: 'data-access' | 'model-usage' | 'audit' | 'compliance' | 'safety';
}

export interface AllowedModel {
  modelId: string;
  modelName: string;
  vendor: string;
  version: string;
  approvedFor: string[];
  maxTokens: number;
  requiresHumanReview: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  useCaseId: string;
  template: string;
  version: string;
  status: 'active' | 'deprecated' | 'draft';
  lastUpdated: string;
  updatedBy: string;
}

export interface RBACRule {
  id: string;
  role: string;
  department: string;
  permissions: string[];
  useCaseIds: string[];
  description: string;
}

// ─── Approval History ────────────────────────────────────────

export const APPROVAL_HISTORY: Record<string, ApprovalHistoryEntry[]> = {
  'uc-alert-prioritization': [
    { id: 'ah-1', action: 'submitted', actor: 'VP Clinical Operations', actorRole: 'Ops Leader', timestamp: '2025-10-28T09:00:00Z', comment: 'Initial submission for medication alert AI triage. Risk assessment complete.' },
    { id: 'ah-2', action: 'comment', actor: 'CISO', actorRole: 'Governance', timestamp: '2025-11-01T14:30:00Z', comment: 'Requires additional HIPAA impact assessment. Please provide data flow diagram.' },
    { id: 'ah-3', action: 'resubmitted', actor: 'VP Clinical Operations', actorRole: 'Ops Leader', timestamp: '2025-11-10T11:00:00Z', comment: 'Added HIPAA impact assessment and data flow documentation. PHI handling reviewed by privacy officer.' },
    { id: 'ah-4', action: 'approved', actor: 'Clinical AI Governance Board', actorRole: 'Governance', timestamp: '2025-11-15T10:00:00Z', comment: 'Approved with conditions: quarterly audit reviews, human-in-the-loop required for all high-risk alerts, model version pinning.' },
  ],
  'uc-drug-interaction': [
    { id: 'ah-5', action: 'submitted', actor: 'Pharmacy Director', actorRole: 'Ops Leader', timestamp: '2025-11-15T09:00:00Z', comment: 'Chart summary generation for drug interaction context. Lower risk — read-only, no clinical decisions.' },
    { id: 'ah-6', action: 'approved', actor: 'Clinical AI Governance Board', actorRole: 'Governance', timestamp: '2025-12-01T10:00:00Z', comment: 'Approved. Low decision-impact use case. Standard audit logging applies.' },
  ],
  'uc-handoff-summary': [
    { id: 'ah-7', action: 'submitted', actor: 'Nursing Informatics Lead', actorRole: 'Ops Leader', timestamp: '2025-09-15T09:00:00Z', comment: 'AI-generated SBAR handoff summaries to reduce end-of-shift documentation burden.' },
    { id: 'ah-8', action: 'comment', actor: 'CISO', actorRole: 'Governance', timestamp: '2025-09-22T16:00:00Z', comment: 'Need clarification on patient data retention. How long are generated summaries stored?' },
    { id: 'ah-9', action: 'resubmitted', actor: 'Nursing Informatics Lead', actorRole: 'Ops Leader', timestamp: '2025-10-05T10:00:00Z', comment: 'Summaries retained for 30 days per EHR retention policy. Auto-purge configured.' },
    { id: 'ah-10', action: 'approved', actor: 'Clinical AI Governance Board', actorRole: 'Governance', timestamp: '2025-10-20T10:00:00Z', comment: 'Approved. Mandatory nurse sign-off before handoff is finalized. Editable by both sending and receiving nurse.' },
  ],
  'uc-patient-summary': [
    { id: 'ah-11', action: 'submitted', actor: 'Nursing Informatics Lead', actorRole: 'Ops Leader', timestamp: '2026-01-05T09:00:00Z', comment: 'Real-time patient status snapshots. Low complexity — synthesizes existing chart data.' },
    { id: 'ah-12', action: 'comment', actor: 'CISO', actorRole: 'Governance', timestamp: '2026-01-12T11:00:00Z', comment: 'Pending risk assessment completion. Need to verify data access scope is minimized.' },
  ],
  'uc-sepsis-early-warning': [
    { id: 'ah-13', action: 'submitted', actor: 'Chief Medical Officer', actorRole: 'Ops Leader', timestamp: '2025-12-20T09:00:00Z', comment: 'Early warning system for sepsis detection. Critical risk — directly impacts patient safety outcomes.' },
    { id: 'ah-14', action: 'rejected', actor: 'Clinical AI Governance Board', actorRole: 'Governance', timestamp: '2026-01-08T14:00:00Z', comment: 'Model maturity insufficient for production (v0.5-beta). Requires: (1) validation study on 10,000+ cases, (2) false-positive rate <15%, (3) physician override workflow. Resubmit when criteria met.' },
  ],
};

// ─── Governance Policies ─────────────────────────────────────

export const GOVERNANCE_POLICIES: GovernancePolicy[] = [
  { id: 'gp-1', name: 'HIPAA AI Data Handling', description: 'All AI-processed PHI must be encrypted at rest and in transit. No patient data stored in model weights.', enforcedSince: '2025-06-01T00:00:00Z', category: 'compliance' },
  { id: 'gp-2', name: 'Human-in-the-Loop Mandate', description: 'All high and critical risk AI use cases require explicit human confirmation before clinical action.', enforcedSince: '2025-06-01T00:00:00Z', category: 'safety' },
  { id: 'gp-3', name: 'Model Version Pinning', description: 'Production AI models must be version-pinned. No auto-updates without governance board approval.', enforcedSince: '2025-08-15T00:00:00Z', category: 'model-usage' },
  { id: 'gp-4', name: 'Quarterly Audit Reviews', description: 'All approved use cases require quarterly audit reviews covering accuracy, flagged interactions, and adverse events.', enforcedSince: '2025-09-01T00:00:00Z', category: 'audit' },
  { id: 'gp-5', name: 'Minimum Data Access', description: 'AI use cases must access only the minimum patient data required for their function. Data scope documented in approval.', enforcedSince: '2025-06-01T00:00:00Z', category: 'data-access' },
  { id: 'gp-6', name: 'Audit Trail Retention', description: 'All AI interaction logs retained for 7 years per healthcare regulatory requirements.', enforcedSince: '2025-06-01T00:00:00Z', category: 'audit' },
  { id: 'gp-7', name: 'Bias Monitoring', description: 'AI outputs monitored quarterly for demographic bias. Disparities > 5% trigger mandatory review.', enforcedSince: '2025-10-01T00:00:00Z', category: 'safety' },
];

// ─── Allowed Models ──────────────────────────────────────────

export const ALLOWED_MODELS: AllowedModel[] = [
  { modelId: 'med-alert-v2.3', modelName: 'MedAlert Triage', vendor: 'ClinicalOS Internal', version: '2.3', approvedFor: ['uc-alert-prioritization'], maxTokens: 2048, requiresHumanReview: true },
  { modelId: 'chart-summary-v1.8', modelName: 'ChartSummary', vendor: 'ClinicalOS Internal', version: '1.8', approvedFor: ['uc-drug-interaction'], maxTokens: 4096, requiresHumanReview: false },
  { modelId: 'handoff-v3.1', modelName: 'HandoffGen', vendor: 'ClinicalOS Internal', version: '3.1', approvedFor: ['uc-handoff-summary'], maxTokens: 4096, requiresHumanReview: true },
  { modelId: 'patient-summary-v1.0', modelName: 'PatientSnap', vendor: 'ClinicalOS Internal', version: '1.0', approvedFor: ['uc-patient-summary'], maxTokens: 2048, requiresHumanReview: false },
  { modelId: 'sepsis-v0.5-beta', modelName: 'SepsisWatch', vendor: 'ClinicalOS Internal', version: '0.5-beta', approvedFor: ['uc-sepsis-early-warning'], maxTokens: 1024, requiresHumanReview: true },
];

// ─── Prompt Templates ────────────────────────────────────────

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'pt-1',
    name: 'Medication Alert Triage',
    useCaseId: 'uc-alert-prioritization',
    template: 'Given the following medication order and patient context, classify this alert as HIGH, MEDIUM, or LOW priority. Provide a clinical rationale in 2-3 sentences.\n\nPatient: {{patient_context}}\nMedication Order: {{medication_order}}\nExisting Medications: {{current_meds}}\nRelevant Labs: {{recent_labs}}',
    version: '2.1',
    status: 'active',
    lastUpdated: '2026-01-15T10:00:00Z',
    updatedBy: 'Clinical AI Governance Board',
  },
  {
    id: 'pt-2',
    name: 'Drug Interaction Summary',
    useCaseId: 'uc-drug-interaction',
    template: 'Summarize the clinical significance of the interaction between {{drug_a}} and {{drug_b}} for this patient. Include: mechanism, severity, recommended monitoring, and relevant chart references.\n\nPatient Context: {{patient_context}}\nRecent Labs: {{recent_labs}}',
    version: '1.5',
    status: 'active',
    lastUpdated: '2026-01-10T14:00:00Z',
    updatedBy: 'Pharmacy Director',
  },
  {
    id: 'pt-3',
    name: 'SBAR Handoff Generator',
    useCaseId: 'uc-handoff-summary',
    template: 'Generate a structured SBAR handoff summary for this patient.\n\nSituation: Current admission reason and status\nBackground: Relevant medical history, current medications, allergies\nAssessment: Key findings, changes in last 12h, current vitals trends\nRecommendation: Pending tasks, escalation flags, follow-up items\n\nPatient Data: {{patient_chart_data}}\nShift Period: {{shift_start}} to {{shift_end}}',
    version: '3.0',
    status: 'active',
    lastUpdated: '2026-01-20T09:00:00Z',
    updatedBy: 'Nursing Informatics Lead',
  },
  {
    id: 'pt-4',
    name: 'Patient Status Snapshot',
    useCaseId: 'uc-patient-summary',
    template: 'Provide a concise status snapshot for this patient highlighting:\n1. Key changes in the last 12 hours\n2. Current vital signs trend (stable/improving/declining)\n3. Pending tasks or orders\n4. Escalation flags if any\n\nPatient Chart: {{patient_chart_data}}',
    version: '1.0',
    status: 'draft',
    lastUpdated: '2026-01-05T11:00:00Z',
    updatedBy: 'Nursing Informatics Lead',
  },
  {
    id: 'pt-5',
    name: 'Medication Alert Triage (Legacy)',
    useCaseId: 'uc-alert-prioritization',
    template: 'Classify the following medication alert. Output: priority level and reason.\n\nAlert: {{alert_data}}',
    version: '1.0',
    status: 'deprecated',
    lastUpdated: '2025-08-01T10:00:00Z',
    updatedBy: 'Clinical AI Governance Board',
  },
];

// ─── RBAC Rules ──────────────────────────────────────────────

export const RBAC_RULES: RBACRule[] = [
  { id: 'rbac-1', role: 'Clinical Pharmacist', department: 'Pharmacy', permissions: ['use', 'view-audit'], useCaseIds: ['uc-alert-prioritization', 'uc-drug-interaction'], description: 'Can use pharmacy AI tools and view own audit history' },
  { id: 'rbac-2', role: 'Pharmacy Technician', department: 'Pharmacy', permissions: ['view'], useCaseIds: ['uc-alert-prioritization'], description: 'Can view AI-triaged alerts but cannot confirm/reject' },
  { id: 'rbac-3', role: 'Staff Nurse (RN)', department: 'Nursing', permissions: ['use', 'view-audit'], useCaseIds: ['uc-handoff-summary', 'uc-patient-summary'], description: 'Can use nursing AI tools and view own audit history' },
  { id: 'rbac-4', role: 'Charge Nurse', department: 'Nursing', permissions: ['use', 'view-audit', 'override'], useCaseIds: ['uc-handoff-summary', 'uc-patient-summary'], description: 'Can use nursing AI tools, view audits, and override AI recommendations' },
  { id: 'rbac-5', role: 'VP Clinical Operations', department: 'All', permissions: ['view-dashboard', 'view-audit', 'request-use-case'], useCaseIds: ['uc-alert-prioritization', 'uc-drug-interaction', 'uc-handoff-summary', 'uc-patient-summary', 'uc-sepsis-early-warning'], description: 'Can view all dashboards and audit logs, submit new use case requests' },
  { id: 'rbac-6', role: 'CISO / Governance', department: 'All', permissions: ['approve', 'suspend', 'configure', 'view-audit', 'manage-allowlists', 'manage-rbac'], useCaseIds: ['uc-alert-prioritization', 'uc-drug-interaction', 'uc-handoff-summary', 'uc-patient-summary', 'uc-sepsis-early-warning'], description: 'Full governance control: approve/suspend use cases, configure policies, manage allowlists and RBAC' },
  { id: 'rbac-7', role: 'IT Security Analyst', department: 'All', permissions: ['view-audit', 'flag-incident'], useCaseIds: ['uc-alert-prioritization', 'uc-drug-interaction', 'uc-handoff-summary', 'uc-patient-summary', 'uc-sepsis-early-warning'], description: 'Can view all audit logs and flag incidents for investigation' },
];
