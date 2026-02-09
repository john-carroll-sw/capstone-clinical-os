/**
 * Department definitions for ClinicalOS
 * Maps to the top level of the healthcare data hierarchy:
 *   Department → AI Use Case → Workflow → Outcome Metric
 */

export interface Department {
  id: string;
  name: string;
  shortName: string;
  description: string;
  color: string;
  icon: string;
  useCaseIds: string[];
  headcount: number;
  aiAdoptionRate: number; // 0-1
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'pharmacy',
    name: 'Pharmacy — Medication Safety',
    shortName: 'Pharmacy',
    description: 'AI-powered medication alert prioritization and clinical decision support for pharmacists reviewing orders.',
    color: '#2563eb', // blue
    icon: '💊',
    useCaseIds: ['uc-alert-prioritization', 'uc-drug-interaction'],
    headcount: 42,
    aiAdoptionRate: 0.73,
  },
  {
    id: 'nursing',
    name: 'Nursing — Patient Handoffs',
    shortName: 'Nursing',
    description: 'AI-generated shift handoff summaries for nursing staff, reducing transition time and improving continuity.',
    color: '#059669', // emerald
    icon: '🩺',
    useCaseIds: ['uc-handoff-summary', 'uc-patient-summary'],
    headcount: 186,
    aiAdoptionRate: 0.61,
  },
];

export function getDepartmentById(id: string): Department | undefined {
  return DEPARTMENTS.find(d => d.id === id);
}
