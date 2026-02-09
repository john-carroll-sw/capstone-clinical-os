/**
 * Mock nursing handoff summaries for ClinicalOS
 * 
 * AI-generated SBAR format handoff documents for end-of-shift transitions.
 * Each handoff can be edited by the outgoing nurse before sign-off.
 */

export interface SBARSection {
  /** Section label */
  label: 'Situation' | 'Background' | 'Assessment' | 'Recommendation';
  /** AI-generated content (editable) */
  content: string;
}

export interface PendingTask {
  id: string;
  description: string;
  priority: 'routine' | 'urgent' | 'stat';
  dueTime?: string;
}

export interface ChangeHighlight {
  time: string;
  description: string;
  significance: 'routine' | 'notable' | 'critical';
}

export interface NursingHandoff {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  unit: string;
  room: string;
  /** Shift being handed off */
  shiftType: 'day-to-evening' | 'evening-to-night' | 'night-to-day';
  /** AI-generated SBAR sections */
  sbar: SBARSection[];
  /** Key changes in last 12 hours */
  changeHighlights: ChangeHighlight[];
  /** Pending tasks for incoming nurse */
  pendingTasks: PendingTask[];
  /** Escalation flags */
  escalationFlags: string[];
  /** AI confidence in the summary */
  confidence: 'high' | 'medium' | 'low';
  /** Status of the handoff */
  status: 'draft' | 'reviewed' | 'signed' | 'received';
  /** Timestamp generated */
  generatedAt: string;
  /** Outgoing nurse */
  outgoingNurse: string;
  /** Incoming nurse (if assigned) */
  incomingNurse?: string;
}

export const NURSING_HANDOFFS: NursingHandoff[] = [
  {
    id: 'handoff-001',
    patientId: 'pt-001',
    patientName: 'James Morrison',
    mrn: 'MRN-4827163',
    unit: 'Med/Surg 4A',
    room: '412-A',
    shiftType: 'day-to-evening',
    sbar: [
      {
        label: 'Situation',
        content: '72-year-old male admitted 02/05 for CHF exacerbation with underlying CKD Stage 3. Currently on IV diuretics with goal net negative 1-1.5L/day. Responding to treatment but fluid balance remains a concern.',
      },
      {
        label: 'Background',
        content: 'History of CHF (EF 35%), CKD Stage 3, atrial fibrillation on warfarin, hypertension. Allergic to penicillin and sulfa drugs. New amiodarone started today for afib rate control — pharmacy flagged warfarin interaction, dose adjustment pending. Last echo showed stable EF.',
      },
      {
        label: 'Assessment',
        content: 'Weight down 1.2kg from admission. Lungs: diminished bibasilar crackles, improved from yesterday. O2 sat 94% on 2L NC. Bilateral 1+ pitting edema (was 2+ yesterday). I&O: intake 1,200mL, output 2,450mL for day shift. BMP pending from 14:00 draw. Patient is alert, oriented, cooperative. Reports mild dyspnea with exertion but improved from admission.',
      },
      {
        label: 'Recommendation',
        content: 'Continue strict I&O monitoring. Daily weights at 0600. Watch for signs of over-diuresis (hypotension, rising creatinine). INR recheck scheduled for AM due to new amiodarone-warfarin interaction. Call MD if systolic BP < 100, UOP < 30mL/hr for 2 hours, or increasing respiratory distress. Fall precautions — patient unsteady with diuresis.',
      },
    ],
    changeHighlights: [
      { time: '08:30', description: 'Weight: 89.2kg (down 1.2kg from admission 90.4kg)', significance: 'notable' },
      { time: '10:15', description: 'New amiodarone 200mg started — pharmacy alert for warfarin interaction', significance: 'critical' },
      { time: '12:00', description: 'BNP resulted: 1,240 (down from admission 2,100)', significance: 'notable' },
      { time: '14:00', description: 'BMP drawn — results pending', significance: 'routine' },
      { time: '15:30', description: 'Ambulated to bathroom with assist x1, tolerated well', significance: 'routine' },
    ],
    pendingTasks: [
      { id: 'task-001', description: 'BMP results — check and report to MD if K+ < 3.5 or Cr > 2.0', priority: 'urgent', dueTime: '17:00' },
      { id: 'task-002', description: 'Warfarin dose — pending pharmacy recommendation re: amiodarone interaction', priority: 'urgent' },
      { id: 'task-003', description: 'Evening furosemide 40mg IV at 18:00', priority: 'routine', dueTime: '18:00' },
      { id: 'task-004', description: 'Fluid restriction reminder — max 1.5L/day', priority: 'routine' },
    ],
    escalationFlags: ['Warfarin-amiodarone interaction — dose not yet adjusted'],
    confidence: 'high',
    status: 'draft',
    generatedAt: '2026-02-08T15:45:00Z',
    outgoingNurse: 'Sarah, RN',
  },
  {
    id: 'handoff-002',
    patientId: 'pt-002',
    patientName: 'Maria Santos',
    mrn: 'MRN-3915284',
    unit: 'Med/Surg 4A',
    room: '408-B',
    shiftType: 'day-to-evening',
    sbar: [
      {
        label: 'Situation',
        content: '58-year-old female, post-op day 1 from right total hip replacement. Managing pain and beginning mobility protocol. Type 2 DM — glucose management is secondary concern.',
      },
      {
        label: 'Background',
        content: 'Elective hip replacement for severe OA. History of T2DM (A1c 7.8%), hypertension, obesity (BMI 34). Home meds include metformin 1000mg BID, lisinopril, atorvastatin. Allergic to codeine (GI upset). Metformin held peri-op, insulin sliding scale in use.',
      },
      {
        label: 'Assessment',
        content: 'Surgical site clean, dry, intact. Drain output 45mL sanguinous this shift. Pain 5/10 at rest, 7/10 with PT — managing with scheduled Tylenol + PRN Dilaudid. PT visit completed: transferred to chair x20 min, ambulated 15 feet with walker. Glucose readings: 186 (AM), 142 (lunch), 168 (pre-dinner). Using insulin sliding scale. Voiding without difficulty. Alert, in good spirits.',
      },
      {
        label: 'Recommendation',
        content: 'Continue PT/OT protocol — goal ambulate 50 feet by tomorrow. Monitor drain output (remove if < 30mL in 8 hours). Check bedtime glucose and cover per sliding scale. DVT prophylaxis: enoxaparin 40mg subQ daily at 21:00. Resume metformin when tolerating full diet and renal function confirmed stable. Encourage incentive spirometry q1h while awake.',
      },
    ],
    changeHighlights: [
      { time: '07:00', description: 'Transferred from PACU overnight — stable', significance: 'routine' },
      { time: '09:30', description: 'First PT session: stood, transferred to chair, tolerated well', significance: 'notable' },
      { time: '11:00', description: 'AM glucose 186 — covered with 4 units regular insulin per SS', significance: 'routine' },
      { time: '14:00', description: 'Ambulated 15 feet with walker and PT assist', significance: 'notable' },
      { time: '15:00', description: 'Surgical drain output 45mL total for shift (sanguinous)', significance: 'routine' },
    ],
    pendingTasks: [
      { id: 'task-005', description: 'Bedtime glucose check and sliding scale coverage', priority: 'routine', dueTime: '21:00' },
      { id: 'task-006', description: 'Enoxaparin 40mg subQ', priority: 'routine', dueTime: '21:00' },
      { id: 'task-007', description: 'Assess drain output at end of evening shift', priority: 'routine' },
      { id: 'task-008', description: 'Pain reassessment 1 hour after any PRN pain med', priority: 'routine' },
    ],
    escalationFlags: [],
    confidence: 'high',
    status: 'draft',
    generatedAt: '2026-02-08T15:50:00Z',
    outgoingNurse: 'Sarah, RN',
  },
  {
    id: 'handoff-003',
    patientId: 'pt-006',
    patientName: 'Dorothy Kim',
    mrn: 'MRN-8273641',
    unit: 'Med/Surg 4A',
    room: '410-A',
    shiftType: 'day-to-evening',
    sbar: [
      {
        label: 'Situation',
        content: '79-year-old female admitted 02/06 for community-acquired pneumonia with COPD exacerbation. On IV antibiotics and bronchodilators. Oxygen requirement has been stable today.',
      },
      {
        label: 'Background',
        content: 'Severe COPD (FEV1 38% predicted), on home O2 2L at baseline. History of frequent exacerbations (3 admissions in past year). Also has osteoporosis, GERD. Allergic to aspirin and NSAIDs (bronchospasm). Current abx: ceftriaxone + azithromycin. New fluconazole started for oral thrush — pharmacy noted interaction with simvastatin.',
      },
      {
        label: 'Assessment',
        content: 'Temp 37.8°C (down from 38.6°C yesterday). Lungs: scattered rhonchi bilaterally, right base with decreased breath sounds. O2 sat 91% on 3L NC (baseline 2L). RR 20. Sputum production: moderate, yellow-green. Using incentive spirometer but struggles to reach 750mL. Appetite fair — ate 50% of meals today. Reports fatigue but no acute distress at rest. Oral thrush improving with fluconazole.',
      },
      {
        label: 'Recommendation',
        content: 'Continue current antibiotic regimen. Encourage IS q1h and deep breathing. Monitor O2 sat — notify MD if < 88% on current O2 or if requiring > 4L to maintain 90%. Watch for respiratory fatigue (increasing RR, accessory muscle use). Simvastatin being held per pharmacy recommendation during fluconazole course. Encourage PO intake — may need dietary consult if < 50% intake continues. Fall risk due to age, dyspnea, and deconditioning.',
      },
    ],
    changeHighlights: [
      { time: '06:00', description: 'Temp trending down: 38.6 → 38.2 → 37.8°C', significance: 'notable' },
      { time: '09:00', description: 'Fluconazole started for oral thrush — simvastatin held', significance: 'notable' },
      { time: '11:30', description: 'Respiratory therapy: nebs given, moderate improvement in air movement', significance: 'routine' },
      { time: '14:00', description: 'Chest X-ray completed — results pending', significance: 'routine' },
    ],
    pendingTasks: [
      { id: 'task-009', description: 'Chest X-ray results — compare to admission film', priority: 'urgent' },
      { id: 'task-010', description: 'Evening nebulizer treatment at 20:00', priority: 'routine', dueTime: '20:00' },
      { id: 'task-011', description: 'Ceftriaxone 1g IV at 22:00', priority: 'routine', dueTime: '22:00' },
      { id: 'task-012', description: 'Encourage IS q1h while awake — log volumes', priority: 'routine' },
    ],
    escalationFlags: ['Oxygen requirement above baseline — monitor closely'],
    confidence: 'high',
    status: 'draft',
    generatedAt: '2026-02-08T15:55:00Z',
    outgoingNurse: 'Sarah, RN',
  },
  {
    id: 'handoff-004',
    patientId: 'pt-004',
    patientName: 'Linda Washington',
    mrn: 'MRN-6142837',
    unit: 'Med/Surg 4A',
    room: '415-A',
    shiftType: 'day-to-evening',
    sbar: [
      {
        label: 'Situation',
        content: '45-year-old female admitted 02/06 for left lower leg cellulitis with peripheral neuropathy. Responding well to IV antibiotics. Anticipating step-down to oral antibiotics and possible discharge tomorrow.',
      },
      {
        label: 'Background',
        content: 'Type 2 DM with peripheral neuropathy. Cellulitis from small wound on left shin she didn\'t notice due to neuropathy. No known drug allergies. Home meds: metformin, gabapentin, lisinopril. A1c 8.2% — endocrine aware.',
      },
      {
        label: 'Assessment',
        content: 'Left lower leg: erythema margins marked and receding (2cm reduction from yesterday). Warmth decreased. No purulence. Pedal pulses 2+ bilaterally. WBC 9.8 (down from admission 14.2). Afebrile x24 hours. Ambulating independently. Glucose well-controlled: AM 134, lunch 156. Good appetite, spirits, and understanding of wound care education.',
      },
      {
        label: 'Recommendation',
        content: 'Continue IV cefazolin through evening. MD considering switch to oral cephalexin in the AM — may discharge tomorrow if continues to improve. Wound care education reinforcement — patient demonstrates good understanding. Diabetes education: importance of daily foot checks. Ensure endocrine follow-up is scheduled. No special precautions needed.',
      },
    ],
    changeHighlights: [
      { time: '08:00', description: 'Cellulitis margins receding — 2cm improvement from markings', significance: 'notable' },
      { time: '10:00', description: 'WBC normalized at 9.8 (admission: 14.2)', significance: 'notable' },
      { time: '13:00', description: 'Wound care education completed — patient verbalized understanding', significance: 'routine' },
    ],
    pendingTasks: [
      { id: 'task-013', description: 'Cefazolin 1g IV at 22:00', priority: 'routine', dueTime: '22:00' },
      { id: 'task-014', description: 'Mark cellulitis margins at start of evening shift for trending', priority: 'routine' },
      { id: 'task-015', description: 'Confirm discharge plan with day team in AM', priority: 'routine' },
    ],
    escalationFlags: [],
    confidence: 'high',
    status: 'draft',
    generatedAt: '2026-02-08T16:00:00Z',
    outgoingNurse: 'Sarah, RN',
  },
];

/** Get handoffs for a specific patient */
export function getHandoffForPatient(patientId: string): NursingHandoff | undefined {
  return NURSING_HANDOFFS.find(h => h.patientId === patientId);
}

/** Get all handoffs for the current shift */
export function getShiftHandoffs(): NursingHandoff[] {
  return NURSING_HANDOFFS;
}
