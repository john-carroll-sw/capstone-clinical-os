/**
 * AI Use Case definitions for ClinicalOS
 * Each use case maps to a department and has associated workflows + metrics
 */

export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'suspended';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface UseCase {
  id: string;
  name: string;
  departmentId: string;
  description: string;
  workflow: string;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  modelVersion: string;
  metricIds: string[];
  lastAuditDate: string;
  totalInteractions: number;
  flaggedInteractions: number;
}

export const USE_CASES: UseCase[] = [
  {
    id: 'uc-alert-prioritization',
    name: 'Medication Alert Prioritization',
    departmentId: 'pharmacy',
    description: 'AI triages medication alerts into high/medium/suppressed priority levels based on patient context, reducing alert fatigue for pharmacists.',
    workflow: 'Pharmacist opens order queue → AI prioritizes alerts → Pharmacist reviews high-priority → Confirm/Edit/Reject → Audit logged',
    riskLevel: 'high',
    status: 'approved',
    approvedBy: 'Clinical AI Governance Board',
    approvedAt: '2025-11-15T10:00:00Z',
    modelVersion: 'med-alert-v2.3',
    metricIds: ['hm-time-to-verify', 'hm-alert-override-rate', 'hm-high-priority-catch'],
    lastAuditDate: '2026-01-20T14:00:00Z',
    totalInteractions: 14523,
    flaggedInteractions: 23,
  },
  {
    id: 'uc-drug-interaction',
    name: 'Drug Interaction Chart Summary',
    departmentId: 'pharmacy',
    description: 'Generates concise chart summaries highlighting relevant drug interactions, lab values, and patient history for pharmacist review.',
    workflow: 'Alert triggers → AI generates chart summary → Links to relevant EHR sections → Pharmacist reviews context',
    riskLevel: 'medium',
    status: 'approved',
    approvedBy: 'Clinical AI Governance Board',
    approvedAt: '2025-12-01T10:00:00Z',
    modelVersion: 'chart-summary-v1.8',
    metricIds: ['hm-time-to-verify'],
    lastAuditDate: '2026-01-18T09:00:00Z',
    totalInteractions: 8912,
    flaggedInteractions: 11,
  },
  {
    id: 'uc-handoff-summary',
    name: 'Shift Handoff Summary Generator',
    departmentId: 'nursing',
    description: 'AI generates structured SBAR handoff summaries from patient chart data, reducing manual compilation time.',
    workflow: 'Nurse opens handoff panel → AI generates SBAR summary → Nurse reviews/edits → Signs off → Receiving nurse gets finalized doc',
    riskLevel: 'medium',
    status: 'approved',
    approvedBy: 'Clinical AI Governance Board',
    approvedAt: '2025-10-20T10:00:00Z',
    modelVersion: 'handoff-v3.1',
    metricIds: ['hm-handoff-time', 'hm-info-completeness', 'hm-adverse-events'],
    lastAuditDate: '2026-01-22T11:00:00Z',
    totalInteractions: 22841,
    flaggedInteractions: 45,
  },
  {
    id: 'uc-patient-summary',
    name: 'Patient Status Summary',
    departmentId: 'nursing',
    description: 'Real-time AI-generated patient status snapshots highlighting key changes, pending tasks, and escalation flags.',
    workflow: 'Nurse views patient → AI summarizes status changes in last 12h → Highlights escalation flags → Nurse reviews',
    riskLevel: 'low',
    status: 'pending',
    modelVersion: 'patient-summary-v1.0',
    metricIds: ['hm-handoff-time'],
    lastAuditDate: '2026-01-15T16:00:00Z',
    totalInteractions: 3205,
    flaggedInteractions: 8,
  },
  {
    id: 'uc-sepsis-early-warning',
    name: 'Sepsis Early Warning',
    departmentId: 'nursing',
    description: 'AI monitors vitals and labs for early sepsis indicators, alerting nursing staff before clinical deterioration.',
    workflow: 'Continuous monitoring → AI flags risk → Nurse reviews → Escalate to physician if confirmed',
    riskLevel: 'critical',
    status: 'draft',
    modelVersion: 'sepsis-v0.5-beta',
    metricIds: [],
    lastAuditDate: '2026-01-10T10:00:00Z',
    totalInteractions: 0,
    flaggedInteractions: 0,
  },
];

export function getUseCasesByDepartment(departmentId: string): UseCase[] {
  return USE_CASES.filter(uc => uc.departmentId === departmentId);
}

export function getUseCaseById(id: string): UseCase | undefined {
  return USE_CASES.find(uc => uc.id === id);
}
