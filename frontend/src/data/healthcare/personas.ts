/**
 * Persona definitions for HelixGuard
 * Powers the persona switcher — the demo superpower
 */

export type Department = 'pharmacy' | 'nursing';
export type Role = 'clinician' | 'ops_leader' | 'governance';

export interface Persona {
  id: string;
  name: string;
  title: string;
  department: Department;
  role: Role;
  description: string;
  defaultRoute: string;
  avatar: string; // initials
}

export const PERSONAS: Persona[] = [
  {
    id: 'dr-patel',
    name: 'Dr. Patel',
    title: 'Clinical Pharmacist',
    department: 'pharmacy',
    role: 'clinician',
    description: 'Reviews 60-80 medication orders per shift. Needs AI to cut through alert noise.',
    defaultRoute: '/clinician/pharmacy',
    avatar: 'DP',
  },
  {
    id: 'sarah-rn',
    name: 'Sarah, RN',
    title: 'Staff Nurse — Med/Surg',
    department: 'nursing',
    role: 'clinician',
    description: 'Manages 4-6 patients per shift. End-of-shift handoffs are rushed and error-prone.',
    defaultRoute: '/clinician/nursing',
    avatar: 'SR',
  },
  {
    id: 'vp-chen',
    name: 'VP Chen',
    title: 'VP Clinical Operations',
    department: 'pharmacy', // sees all departments
    role: 'ops_leader',
    description: 'Oversees clinical AI program. Reports to CMO/COO on outcomes and ROI.',
    defaultRoute: '/leadership',
    avatar: 'VC',
  },
  {
    id: 'ciso-martinez',
    name: 'CISO Martinez',
    title: 'Chief Information Security Officer',
    department: 'pharmacy', // sees all departments
    role: 'governance',
    description: 'Responsible for AI risk management, HIPAA compliance, clinical AI policy.',
    defaultRoute: '/governance',
    avatar: 'CM',
  },
];

export function getPersona(id: string): Persona | undefined {
  return PERSONAS.find(p => p.id === id);
}

export function getPersonasByRole(role: Role): Persona[] {
  return PERSONAS.filter(p => p.role === role);
}

export function getPersonasByDepartment(department: Department): Persona[] {
  return PERSONAS.filter(p => p.department === department);
}

export const DEFAULT_PERSONA = PERSONAS.find(p => p.id === 'vp-chen')!;
