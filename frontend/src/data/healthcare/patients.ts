/**
 * Mock patient roster for ClinicalOS
 * 
 * No real PHI — all names, MRNs, and clinical data are fictional.
 * Used by both Pharmacy and Nursing clinician views.
 */

export interface Patient {
  id: string;
  name: string;
  mrn: string;
  age: number;
  sex: 'M' | 'F';
  unit: string;
  room: string;
  primaryDiagnosis: string;
  allergies: string[];
  admitDate: string;
  attendingPhysician: string;
  /** Active medication count */
  activeMeds: number;
  /** Risk level for this encounter */
  riskLevel: 'low' | 'moderate' | 'high';
}

export const PATIENTS: Patient[] = [
  {
    id: 'pt-001',
    name: 'James Morrison',
    mrn: 'MRN-4827163',
    age: 72,
    sex: 'M',
    unit: 'Med/Surg 4A',
    room: '412-A',
    primaryDiagnosis: 'CHF exacerbation, CKD Stage 3',
    allergies: ['Penicillin', 'Sulfa'],
    admitDate: '2026-02-05',
    attendingPhysician: 'Dr. Reeves',
    activeMeds: 14,
    riskLevel: 'high',
  },
  {
    id: 'pt-002',
    name: 'Maria Santos',
    mrn: 'MRN-3915284',
    age: 58,
    sex: 'F',
    unit: 'Med/Surg 4A',
    room: '408-B',
    primaryDiagnosis: 'Post-op hip replacement, Type 2 DM',
    allergies: ['Codeine'],
    admitDate: '2026-02-07',
    attendingPhysician: 'Dr. Kim',
    activeMeds: 9,
    riskLevel: 'moderate',
  },
  {
    id: 'pt-003',
    name: 'Robert Chen',
    mrn: 'MRN-5738291',
    age: 84,
    sex: 'M',
    unit: 'ICU 2B',
    room: '204',
    primaryDiagnosis: 'Sepsis, acute kidney injury',
    allergies: ['Vancomycin (Red Man)', 'Iodine contrast'],
    admitDate: '2026-02-03',
    attendingPhysician: 'Dr. Patel',
    activeMeds: 18,
    riskLevel: 'high',
  },
  {
    id: 'pt-004',
    name: 'Linda Washington',
    mrn: 'MRN-6142837',
    age: 45,
    sex: 'F',
    unit: 'Med/Surg 4A',
    room: '415-A',
    primaryDiagnosis: 'Cellulitis, peripheral neuropathy',
    allergies: [],
    admitDate: '2026-02-06',
    attendingPhysician: 'Dr. Torres',
    activeMeds: 7,
    riskLevel: 'low',
  },
  {
    id: 'pt-005',
    name: 'Ahmed Al-Rashid',
    mrn: 'MRN-2946183',
    age: 67,
    sex: 'M',
    unit: 'Cardiac Step-down',
    room: '308-B',
    primaryDiagnosis: 'NSTEMI, afib with RVR',
    allergies: ['ACE inhibitors'],
    admitDate: '2026-02-04',
    attendingPhysician: 'Dr. Nguyen',
    activeMeds: 12,
    riskLevel: 'high',
  },
  {
    id: 'pt-006',
    name: 'Dorothy Kim',
    mrn: 'MRN-8273641',
    age: 79,
    sex: 'F',
    unit: 'Med/Surg 4A',
    room: '410-A',
    primaryDiagnosis: 'Pneumonia, COPD exacerbation',
    allergies: ['Aspirin', 'NSAIDs'],
    admitDate: '2026-02-06',
    attendingPhysician: 'Dr. Reeves',
    activeMeds: 11,
    riskLevel: 'moderate',
  },
];

export function getPatient(id: string): Patient | undefined {
  return PATIENTS.find(p => p.id === id);
}

export function getPatientsByUnit(unit: string): Patient[] {
  return PATIENTS.filter(p => p.unit === unit);
}
