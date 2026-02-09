/**
 * Audit Log — Mock data for AI interaction audit trail
 * 
 * Every AI interaction is logged: who, what, when, patient context (anonymized),
 * AI input/output summary, action taken, and any flags.
 */

export type AuditAction = 'confirmed' | 'edited' | 'rejected' | 'auto-suppressed' | 'escalated' | 'viewed' | 'signed-off' | 'flagged' | 'overridden';
export type AuditSeverity = 'normal' | 'warning' | 'critical';
export type EscalationStatus = 'none' | 'flagged' | 'investigating' | 'resolved' | 'documented';

export interface AuditEntry {
  id: string;
  timestamp: string;
  useCaseId: string;
  useCaseName: string;
  department: string;
  userId: string;
  userRole: string;
  patientId: string; // anonymized
  aiInput: string;
  aiOutput: string;
  action: AuditAction;
  severity: AuditSeverity;
  modelVersion: string;
  confidenceScore: number;
  responseTimeMs: number;
  escalationStatus: EscalationStatus;
  escalationNote?: string;
  policyViolation?: string;
}

// ─── Helper to generate timestamps ──────────────────────────

function randomTimestamp(daysBack: number): string {
  const now = new Date('2026-02-08T18:00:00Z');
  const offset = Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - offset).toISOString();
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Seed data for generation ────────────────────────────────

const PHARMACY_USERS = [
  { id: 'user-patel', role: 'Clinical Pharmacist' },
  { id: 'user-thompson', role: 'Clinical Pharmacist' },
  { id: 'user-garcia', role: 'Clinical Pharmacist' },
  { id: 'user-kim-p', role: 'Pharmacy Technician' },
];

const NURSING_USERS = [
  { id: 'user-sarah-rn', role: 'Staff Nurse (RN)' },
  { id: 'user-johnson-rn', role: 'Staff Nurse (RN)' },
  { id: 'user-williams-rn', role: 'Charge Nurse' },
  { id: 'user-davis-rn', role: 'Staff Nurse (RN)' },
  { id: 'user-brown-rn', role: 'Staff Nurse (RN)' },
];

const ALERT_TYPES = [
  { input: 'Warfarin + Amiodarone interaction check', output: 'HIGH PRIORITY — Major CYP2C9 interaction. Recommend 30-50% warfarin dose reduction. INR monitoring in 3-5 days.', severity: 'critical' as AuditSeverity },
  { input: 'Duplicate diuretic order: Furosemide + Bumetanide', output: 'MEDIUM PRIORITY — Potential therapeutic duplication. Verify intent with prescriber.', severity: 'warning' as AuditSeverity },
  { input: 'Metformin with eGFR 28', output: 'HIGH PRIORITY — Contraindicated at eGFR <30. Recommend hold and notify prescriber.', severity: 'critical' as AuditSeverity },
  { input: 'Lisinopril + Potassium supplement', output: 'MEDIUM PRIORITY — Risk of hyperkalemia. Monitor K+ levels within 48h.', severity: 'warning' as AuditSeverity },
  { input: 'Aspirin 81mg daily — routine order', output: 'LOW PRIORITY — No interactions detected. Standard prophylactic dose.', severity: 'normal' as AuditSeverity },
  { input: 'Acetaminophen 1g Q6H PRN — liver function check', output: 'LOW PRIORITY — Total daily dose within limits. ALT/AST normal.', severity: 'normal' as AuditSeverity },
  { input: 'Vancomycin trough timing alert', output: 'MEDIUM PRIORITY — Trough level due before next dose. Recommend draw in 2h.', severity: 'warning' as AuditSeverity },
  { input: 'Insulin sliding scale + oral hypoglycemic', output: 'LOW PRIORITY — Expected combination. Glucose monitoring per protocol.', severity: 'normal' as AuditSeverity },
  { input: 'Penicillin order — allergy flag: Penicillin', output: 'HIGH PRIORITY — Documented allergy. Immediate pharmacist review required.', severity: 'critical' as AuditSeverity },
  { input: 'Heparin drip + enoxaparin overlap', output: 'HIGH PRIORITY — Dual anticoagulation risk. Verify transition protocol.', severity: 'critical' as AuditSeverity },
];

const HANDOFF_TEMPLATES = [
  { input: 'Generate SBAR for patient MRN-4827163 (shift 0700-1900)', output: 'S: 72M admitted for CHF exacerbation. B: CKD Stage 3, on warfarin. A: Improving, diuresis effective, weight down 2kg. R: Continue current plan, recheck BMP tomorrow.', severity: 'normal' as AuditSeverity },
  { input: 'Generate SBAR for patient MRN-3891245 (shift 1900-0700)', output: 'S: 58F post-op day 2 hip replacement. B: T2DM, HTN. A: Pain controlled, ambulating with PT. R: Discharge planning tomorrow, verify home PT setup.', severity: 'normal' as AuditSeverity },
  { input: 'Generate SBAR for patient MRN-5012389 (shift 0700-1900)', output: 'S: 45M sepsis, ICU stepdown. B: No significant PMH. A: Vitals stabilizing, WBC trending down. R: Continue antibiotics, follow-up cultures at 48h. ESCALATION: Temp spike to 39.2C at 1400.', severity: 'warning' as AuditSeverity },
  { input: 'Generate SBAR for patient MRN-6723891 (shift 1900-0700)', output: 'S: 82F fall with hip fracture, pre-op. B: Afib on apixaban (held). A: Pain managed, NPO for OR tomorrow 0800. R: Pre-op checklist, type and screen, bridging anticoagulation decision pending.', severity: 'normal' as AuditSeverity },
];

const CHART_SUMMARIES = [
  { input: 'Summarize drug interaction context: Warfarin + Amiodarone', output: 'Amiodarone inhibits CYP2C9/1A2 warfarin metabolism. Patient on warfarin 5mg daily x 3 years, stable INR 2.4. New amiodarone for afib rate control. Recommend: reduce warfarin to 2.5mg, recheck INR day 3-5.', severity: 'normal' as AuditSeverity },
  { input: 'Summarize interaction: Metformin + contrast dye', output: 'Patient scheduled for CT with contrast. eGFR 45 — within guideline threshold. Recommend: hold metformin 48h post-contrast, recheck creatinine before resuming.', severity: 'normal' as AuditSeverity },
];

const PATIENT_SUMMARIES = [
  { input: 'Patient status snapshot: MRN-4827163', output: 'Changes (12h): weight -1.2kg, O2 weaned to 2L NC, BMP stable. Vitals: stable. Pending: AM labs, cardiology consult. No escalation flags.', severity: 'normal' as AuditSeverity },
  { input: 'Patient status snapshot: MRN-5012389', output: 'Changes (12h): WBC 14.2→11.8 (improving), temp normalized. Vitals: improving trend. Pending: 48h blood culture results. FLAG: lactate still 2.8 (borderline).', severity: 'warning' as AuditSeverity },
];

// ─── Generate Audit Entries ──────────────────────────────────

function generateAlertAuditEntry(index: number): AuditEntry {
  const alert = randomItem(ALERT_TYPES);
  const user = randomItem(PHARMACY_USERS);
  const actions: AuditAction[] = alert.severity === 'critical' 
    ? ['confirmed', 'confirmed', 'confirmed', 'edited', 'rejected', 'escalated']
    : alert.severity === 'warning'
    ? ['confirmed', 'confirmed', 'edited', 'auto-suppressed', 'confirmed']
    : ['auto-suppressed', 'auto-suppressed', 'confirmed', 'viewed'];
  const action = randomItem(actions);
  const isFlagged = action === 'escalated' || action === 'rejected' || (alert.severity === 'critical' && Math.random() < 0.1);
  
  return {
    id: `audit-pharm-${index}`,
    timestamp: randomTimestamp(90),
    useCaseId: 'uc-alert-prioritization',
    useCaseName: 'Medication Alert Prioritization',
    department: 'Pharmacy',
    userId: user.id,
    userRole: user.role,
    patientId: `MRN-${randomBetween(1000000, 9999999)}`,
    aiInput: alert.input,
    aiOutput: alert.output,
    action,
    severity: alert.severity,
    modelVersion: 'med-alert-v2.3',
    confidenceScore: alert.severity === 'critical' ? +(0.85 + Math.random() * 0.14).toFixed(2) : +(0.7 + Math.random() * 0.29).toFixed(2),
    responseTimeMs: randomBetween(120, 800),
    escalationStatus: isFlagged ? randomItem(['flagged', 'investigating', 'resolved', 'documented']) : 'none',
    escalationNote: isFlagged ? randomItem([
      'Pharmacist disagreed with AI triage level. Under review.',
      'AI missed documented allergy in patient history. Investigated.',
      'False positive — alert correctly suppressed by AI but flagged for quality review.',
      'Critical interaction caught by AI. Confirmed and documented as safety save.',
    ]) : undefined,
    policyViolation: Math.random() < 0.02 ? 'Human review not completed within SLA (15 min)' : undefined,
  };
}

function generateChartAuditEntry(index: number): AuditEntry {
  const chart = randomItem(CHART_SUMMARIES);
  const user = randomItem(PHARMACY_USERS);
  return {
    id: `audit-chart-${index}`,
    timestamp: randomTimestamp(90),
    useCaseId: 'uc-drug-interaction',
    useCaseName: 'Drug Interaction Chart Summary',
    department: 'Pharmacy',
    userId: user.id,
    userRole: user.role,
    patientId: `MRN-${randomBetween(1000000, 9999999)}`,
    aiInput: chart.input,
    aiOutput: chart.output,
    action: randomItem(['viewed', 'viewed', 'confirmed']),
    severity: chart.severity,
    modelVersion: 'chart-summary-v1.8',
    confidenceScore: +(0.8 + Math.random() * 0.19).toFixed(2),
    responseTimeMs: randomBetween(200, 1200),
    escalationStatus: 'none',
  };
}

function generateHandoffAuditEntry(index: number): AuditEntry {
  const handoff = randomItem(HANDOFF_TEMPLATES);
  const user = randomItem(NURSING_USERS);
  const action: AuditAction = randomItem(['signed-off', 'signed-off', 'edited', 'signed-off', 'viewed']);
  const isFlagged = handoff.severity === 'warning' && Math.random() < 0.15;
  
  return {
    id: `audit-handoff-${index}`,
    timestamp: randomTimestamp(90),
    useCaseId: 'uc-handoff-summary',
    useCaseName: 'Shift Handoff Summary Generator',
    department: 'Nursing',
    userId: user.id,
    userRole: user.role,
    patientId: `MRN-${randomBetween(1000000, 9999999)}`,
    aiInput: handoff.input,
    aiOutput: handoff.output,
    action,
    severity: handoff.severity,
    modelVersion: 'handoff-v3.1',
    confidenceScore: +(0.82 + Math.random() * 0.17).toFixed(2),
    responseTimeMs: randomBetween(400, 1800),
    escalationStatus: isFlagged ? 'flagged' : 'none',
    escalationNote: isFlagged ? 'Nurse noted AI summary was missing key medication change. Corrected and flagged for model retraining.' : undefined,
  };
}

function generatePatientSummaryEntry(index: number): AuditEntry {
  const summary = randomItem(PATIENT_SUMMARIES);
  const user = randomItem(NURSING_USERS);
  
  return {
    id: `audit-summary-${index}`,
    timestamp: randomTimestamp(60),
    useCaseId: 'uc-patient-summary',
    useCaseName: 'Patient Status Summary',
    department: 'Nursing',
    userId: user.id,
    userRole: user.role,
    patientId: `MRN-${randomBetween(1000000, 9999999)}`,
    aiInput: summary.input,
    aiOutput: summary.output,
    action: 'viewed',
    severity: summary.severity,
    modelVersion: 'patient-summary-v1.0',
    confidenceScore: +(0.75 + Math.random() * 0.24).toFixed(2),
    responseTimeMs: randomBetween(150, 600),
    escalationStatus: 'none',
  };
}

// ─── Build the full log ──────────────────────────────────────

function buildAuditLog(): AuditEntry[] {
  const entries: AuditEntry[] = [];
  
  // ~250 pharmacy alert entries
  for (let i = 0; i < 250; i++) entries.push(generateAlertAuditEntry(i));
  // ~80 chart summary entries
  for (let i = 0; i < 80; i++) entries.push(generateChartAuditEntry(i));
  // ~130 handoff entries
  for (let i = 0; i < 130; i++) entries.push(generateHandoffAuditEntry(i));
  // ~40 patient summary entries
  for (let i = 0; i < 40; i++) entries.push(generatePatientSummaryEntry(i));
  
  // Sort by timestamp descending (newest first)
  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return entries;
}

export const AUDIT_LOG: AuditEntry[] = buildAuditLog();

// ─── Aggregate stats ─────────────────────────────────────────

export function getAuditStats() {
  const total = AUDIT_LOG.length;
  const flagged = AUDIT_LOG.filter(e => e.escalationStatus !== 'none').length;
  const critical = AUDIT_LOG.filter(e => e.severity === 'critical').length;
  const avgConfidence = +(AUDIT_LOG.reduce((s, e) => s + e.confidenceScore, 0) / total).toFixed(2);
  const avgResponseMs = Math.round(AUDIT_LOG.reduce((s, e) => s + e.responseTimeMs, 0) / total);
  const byUseCase = AUDIT_LOG.reduce((acc, e) => {
    acc[e.useCaseName] = (acc[e.useCaseName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const byAction = AUDIT_LOG.reduce((acc, e) => {
    acc[e.action] = (acc[e.action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return { total, flagged, critical, avgConfidence, avgResponseMs, byUseCase, byAction };
}
