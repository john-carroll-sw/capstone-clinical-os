/**
 * Mock pharmacy medication alerts for HelixGuard
 * 
 * Simulates the alert queue a pharmacist sees when reviewing medication orders.
 * AI has pre-triaged these: high-priority get full summaries, low-priority are suppressed.
 */

export type AlertSeverity = 'high' | 'medium' | 'low';
export type AlertType = 'drug-interaction' | 'renal-dose' | 'allergy' | 'duplicate-therapy' | 'dose-range' | 'formulary';
export type AlertStatus = 'pending' | 'confirmed' | 'edited' | 'rejected' | 'overridden';

export interface PharmacyAlert {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  /** AI-assigned severity after triage */
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  /** AI-generated 2-3 sentence clinical summary */
  aiSummary: string;
  /** Relevant medications involved */
  medications: string[];
  /** Chart sections the AI references */
  chartReferences: string[];
  /** AI confidence in the triage */
  confidence: 'high' | 'medium' | 'low';
  /** Current review status */
  status: AlertStatus;
  /** Timestamp of the alert */
  timestamp: string;
  /** Optional override reason if rejected/overridden */
  overrideReason?: string;
}

export const PHARMACY_ALERTS: PharmacyAlert[] = [
  // ─── HIGH PRIORITY ────────────────────────────────────
  {
    id: 'alert-001',
    patientId: 'pt-001',
    patientName: 'James Morrison',
    mrn: 'MRN-4827163',
    severity: 'high',
    type: 'drug-interaction',
    title: 'Warfarin + Amiodarone — Major Interaction',
    aiSummary: 'New amiodarone order detected for patient on chronic warfarin therapy. Amiodarone significantly inhibits warfarin metabolism (CYP2C9), typically requiring 30-50% warfarin dose reduction. Patient\'s last INR was 2.8 (therapeutic range 2.0-3.0). Recommend empiric dose reduction and INR recheck in 3-5 days.',
    medications: ['Warfarin 5mg daily', 'Amiodarone 200mg loading'],
    chartReferences: ['Labs → Coagulation (INR 2.8, 02/07)', 'Cardiology Note (02/06)', 'Active Med List'],
    confidence: 'high',
    status: 'pending',
    timestamp: '2026-02-08T14:23:00Z',
  },
  {
    id: 'alert-002',
    patientId: 'pt-003',
    patientName: 'Robert Chen',
    mrn: 'MRN-5738291',
    severity: 'high',
    type: 'renal-dose',
    title: 'Vancomycin Dose — AKI, GFR Declining',
    aiSummary: 'Vancomycin 1g q12h ordered but patient\'s GFR has dropped from 45 to 28 mL/min over the past 48 hours. Current trough level is 22.4 mcg/mL (target 15-20). Known vancomycin sensitivity (Red Man syndrome — requires slow infusion). Recommend pharmacy-guided dosing with AUC monitoring and extended infusion time.',
    medications: ['Vancomycin 1g IV q12h', 'Piperacillin-Tazobactam 3.375g IV q8h'],
    chartReferences: ['Labs → Renal Panel (GFR 28, 02/08)', 'Labs → Vancomycin Trough (22.4, 02/08)', 'Allergy List'],
    confidence: 'high',
    status: 'pending',
    timestamp: '2026-02-08T14:18:00Z',
  },
  {
    id: 'alert-003',
    patientId: 'pt-005',
    patientName: 'Ahmed Al-Rashid',
    mrn: 'MRN-2946183',
    severity: 'high',
    type: 'allergy',
    title: 'Lisinopril Order — ACE Inhibitor Allergy',
    aiSummary: 'New lisinopril 10mg order for post-MI management, but patient has documented ACE inhibitor allergy (angioedema with enalapril, 2024). ARBs are generally considered safe alternatives. Recommend switching to losartan 50mg or valsartan 80mg per cardiology guidelines.',
    medications: ['Lisinopril 10mg daily (NEW ORDER)'],
    chartReferences: ['Allergy List (ACE inhibitor — angioedema)', 'Cardiology Consult (02/05)', 'ED Note (02/04)'],
    confidence: 'high',
    status: 'pending',
    timestamp: '2026-02-08T13:55:00Z',
  },

  // ─── MEDIUM PRIORITY ──────────────────────────────────
  {
    id: 'alert-004',
    patientId: 'pt-001',
    patientName: 'James Morrison',
    mrn: 'MRN-4827163',
    severity: 'medium',
    type: 'duplicate-therapy',
    title: 'Duplicate Diuretic — Furosemide + Bumetanide',
    aiSummary: 'Both furosemide 40mg IV and bumetanide 1mg PO are active. Likely intended as a transition from IV to PO, but both are currently active orders. Verify with care team whether furosemide should be discontinued.',
    medications: ['Furosemide 40mg IV q8h', 'Bumetanide 1mg PO BID'],
    chartReferences: ['Active Orders', 'Nephrology Note (02/07)'],
    confidence: 'medium',
    status: 'pending',
    timestamp: '2026-02-08T14:30:00Z',
  },
  {
    id: 'alert-005',
    patientId: 'pt-002',
    patientName: 'Maria Santos',
    mrn: 'MRN-3915284',
    severity: 'medium',
    type: 'dose-range',
    title: 'Metformin Dose — Borderline Renal Function',
    aiSummary: 'Metformin 1000mg BID ordered. Patient\'s GFR is 38 mL/min. Per guidelines, metformin dose should be reduced to max 1000mg/day when GFR is 30-45 mL/min. Currently at 2000mg/day total.',
    medications: ['Metformin 1000mg PO BID'],
    chartReferences: ['Labs → Renal Panel (GFR 38, 02/07)', 'Endocrine Note (02/06)'],
    confidence: 'high',
    status: 'pending',
    timestamp: '2026-02-08T13:42:00Z',
  },
  {
    id: 'alert-006',
    patientId: 'pt-006',
    patientName: 'Dorothy Kim',
    mrn: 'MRN-8273641',
    severity: 'medium',
    type: 'drug-interaction',
    title: 'Fluconazole + Simvastatin — Moderate Interaction',
    aiSummary: 'Fluconazole for fungal infection inhibits CYP3A4, increasing simvastatin levels and risk of rhabdomyolysis. Consider holding simvastatin during fluconazole course or switching to pravastatin (not CYP3A4 metabolized).',
    medications: ['Simvastatin 40mg daily', 'Fluconazole 200mg daily (NEW)'],
    chartReferences: ['Active Med List', 'ID Consult Note (02/07)'],
    confidence: 'medium',
    status: 'pending',
    timestamp: '2026-02-08T14:05:00Z',
  },

  // ─── LOW PRIORITY (AI-suppressed) ─────────────────────
  {
    id: 'alert-007',
    patientId: 'pt-004',
    patientName: 'Linda Washington',
    mrn: 'MRN-6142837',
    severity: 'low',
    type: 'formulary',
    title: 'Non-formulary: Brand Lyrica → Generic Pregabalin',
    aiSummary: 'Brand-name Lyrica ordered. Equivalent generic pregabalin is on formulary. Auto-substitution recommended.',
    medications: ['Pregabalin (Lyrica) 75mg BID'],
    chartReferences: ['Formulary Guide'],
    confidence: 'high',
    status: 'pending',
    timestamp: '2026-02-08T14:12:00Z',
  },
  {
    id: 'alert-008',
    patientId: 'pt-002',
    patientName: 'Maria Santos',
    mrn: 'MRN-3915284',
    severity: 'low',
    type: 'duplicate-therapy',
    title: 'Duplicate Antiemetic — Ondansetron PRN x2',
    aiSummary: 'Two ondansetron PRN orders with different routes (IV and PO). Likely intentional for route flexibility post-op. Low clinical risk.',
    medications: ['Ondansetron 4mg IV PRN', 'Ondansetron 8mg PO PRN'],
    chartReferences: ['Post-op Order Set'],
    confidence: 'high',
    status: 'pending',
    timestamp: '2026-02-08T13:30:00Z',
  },
  {
    id: 'alert-009',
    patientId: 'pt-006',
    patientName: 'Dorothy Kim',
    mrn: 'MRN-8273641',
    severity: 'low',
    type: 'dose-range',
    title: 'Acetaminophen — Max Daily Dose Tracking',
    aiSummary: 'Multiple acetaminophen-containing orders: Tylenol 650mg q6h PRN + Norco (hydrocodone/APAP). Total potential APAP dose is 3.9g/day if all PRNs given. Under 4g/day limit but monitor in setting of age and liver function.',
    medications: ['Acetaminophen 650mg PO q6h PRN', 'Hydrocodone/APAP 5/325mg q4h PRN'],
    chartReferences: ['Active Orders', 'LFTs (02/06)'],
    confidence: 'medium',
    status: 'pending',
    timestamp: '2026-02-08T13:15:00Z',
  },
  {
    id: 'alert-010',
    patientId: 'pt-001',
    patientName: 'James Morrison',
    mrn: 'MRN-4827163',
    severity: 'low',
    type: 'formulary',
    title: 'Therapeutic Substitution: Esomeprazole → Pantoprazole',
    aiSummary: 'Esomeprazole ordered. Hospital formulary prefers pantoprazole. Clinically equivalent for GI prophylaxis.',
    medications: ['Esomeprazole 40mg daily'],
    chartReferences: ['Formulary Guide'],
    confidence: 'high',
    status: 'pending',
    timestamp: '2026-02-08T12:45:00Z',
  },
  {
    id: 'alert-011',
    patientId: 'pt-005',
    patientName: 'Ahmed Al-Rashid',
    mrn: 'MRN-2946183',
    severity: 'low',
    type: 'dose-range',
    title: 'Metoprolol Succinate — Consider Dose Timing',
    aiSummary: 'Metoprolol succinate 100mg ordered once daily. Standard dosing for post-MI rate control. No interaction concerns. Routine monitoring recommended.',
    medications: ['Metoprolol Succinate 100mg daily'],
    chartReferences: ['Cardiology Note (02/05)'],
    confidence: 'high',
    status: 'pending',
    timestamp: '2026-02-08T12:30:00Z',
  },
  {
    id: 'alert-012',
    patientId: 'pt-004',
    patientName: 'Linda Washington',
    mrn: 'MRN-6142837',
    severity: 'low',
    type: 'duplicate-therapy',
    title: 'Duplicate Antibiotic Route — Cephalexin PO + Cefazolin IV',
    aiSummary: 'Both IV and PO first-gen cephalosporins active. Likely step-down in progress. Verify IV cefazolin should be discontinued now that PO started.',
    medications: ['Cefazolin 1g IV q8h', 'Cephalexin 500mg PO q6h'],
    chartReferences: ['Active Orders', 'Progress Note (02/07)'],
    confidence: 'medium',
    status: 'pending',
    timestamp: '2026-02-08T12:10:00Z',
  },
];

/** Summary stats for the alert queue header */
export function getAlertStats() {
  const high = PHARMACY_ALERTS.filter(a => a.severity === 'high').length;
  const medium = PHARMACY_ALERTS.filter(a => a.severity === 'medium').length;
  const low = PHARMACY_ALERTS.filter(a => a.severity === 'low').length;
  return { high, medium, low, total: PHARMACY_ALERTS.length };
}

/** Get alerts by severity */
export function getAlertsBySeverity(severity: AlertSeverity): PharmacyAlert[] {
  return PHARMACY_ALERTS.filter(a => a.severity === severity);
}

/** Get alerts for a specific patient */
export function getAlertsForPatient(patientId: string): PharmacyAlert[] {
  return PHARMACY_ALERTS.filter(a => a.patientId === patientId);
}
