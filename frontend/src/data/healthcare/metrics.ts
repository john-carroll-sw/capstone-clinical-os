/**
 * Healthcare Outcome Metrics for ClinicalOS
 * Conforms to the existing Metric type system (MetricConfig + MetricSnapshot + MetricCalculations)
 * These power the Outcomes Dashboard and MetricCard components
 */

import type { Metric } from '@/types/metrics';

// ============================================
// PHARMACY METRICS
// ============================================

const pharmacyTimeToVerify: Metric = {
  config: {
    id: 'hm-time-to-verify',
    name: 'Time-to-Verify per Order',
    unit: 'count',
    direction: 'lower_is_better',
    segment: 'Pharmacy',
    owner: 'Pharmacy Director',
    target: 90,
    target_period: 'EOY_2026',
    current_period: 'weekly',
    aggregation: 'median',
    baseline: 180,
    format: '0',
    data_source: {
      system: 'EHR Analytics',
      dataset: 'pharmacy_order_events',
      freshness_sla_hours: 24,
    },
    confidence_rules: { min_n: 100, freshness_weight: 0.3, sample_weight: 0.3, volatility_weight: 0.2, reliability_weight: 0.2 },
    notes: 'Median seconds from order queue open to pharmacist sign-off. Target: 50% reduction from baseline.',
  },
  snapshot: {
    current: 112,
    previous: 124,
    target: 90,
    as_of: '2026-02-07T08:00:00Z',
    confidence_score: 91,
    sample_size: 4280,
  },
  calculations: {
    attainment: 0.76,
    delta: -12,
    state: 'amber',
    confidence: 'high',
    pace_index: 0.92,
  },
};

const pharmacyAlertOverrideRate: Metric = {
  config: {
    id: 'hm-alert-override-rate',
    name: 'Alert Override Rate',
    unit: 'percent',
    direction: 'lower_is_better',
    segment: 'Pharmacy',
    owner: 'Pharmacy Director',
    target: 0.40,
    target_period: 'EOY_2026',
    current_period: 'weekly',
    aggregation: 'weighted_mean',
    baseline: 0.92,
    format: '0%',
    data_source: {
      system: 'Clinical Decision Support',
      dataset: 'alert_actions',
      freshness_sla_hours: 12,
    },
    confidence_rules: { min_n: 500, freshness_weight: 0.3, sample_weight: 0.3, volatility_weight: 0.2, reliability_weight: 0.2 },
    notes: 'Percentage of medication alerts overridden by pharmacists. AI prioritization should reduce low-value overrides.',
  },
  snapshot: {
    current: 0.54,
    previous: 0.61,
    target: 0.40,
    as_of: '2026-02-07T08:00:00Z',
    confidence_score: 94,
    sample_size: 12840,
  },
  calculations: {
    attainment: 0.73,
    delta: -0.07,
    delta_pp: -7,
    state: 'amber',
    confidence: 'high',
    pace_index: 0.88,
  },
};

const pharmacyHighPriorityCatch: Metric = {
  config: {
    id: 'hm-high-priority-catch',
    name: 'High-Priority Alert Catch Rate',
    unit: 'percent',
    direction: 'higher_is_better',
    segment: 'Pharmacy',
    owner: 'Pharmacy Director',
    target: 0.99,
    target_period: 'EOY_2026',
    current_period: 'weekly',
    aggregation: 'weighted_mean',
    baseline: 0.78,
    format: '0%',
    data_source: {
      system: 'Clinical Decision Support',
      dataset: 'alert_outcomes',
      freshness_sla_hours: 24,
    },
    confidence_rules: { min_n: 50, freshness_weight: 0.2, sample_weight: 0.4, volatility_weight: 0.2, reliability_weight: 0.2 },
    notes: 'Percentage of clinically significant alerts that are reviewed (not auto-suppressed). Critical safety metric.',
  },
  snapshot: {
    current: 0.962,
    previous: 0.948,
    target: 0.99,
    as_of: '2026-02-07T08:00:00Z',
    confidence_score: 88,
    sample_size: 312,
  },
  calculations: {
    attainment: 0.97,
    delta: 0.014,
    delta_pp: 1.4,
    state: 'green',
    confidence: 'high',
    pace_index: 1.1,
  },
};

const pharmacySatisfaction: Metric = {
  config: {
    id: 'hm-pharmacist-satisfaction',
    name: 'Pharmacist Satisfaction Score',
    unit: 'count',
    direction: 'higher_is_better',
    segment: 'Pharmacy',
    owner: 'Pharmacy Director',
    target: 4.5,
    target_period: 'EOY_2026',
    current_period: 'monthly',
    aggregation: 'weighted_mean',
    baseline: 2.8,
    format: '0.0',
    data_source: {
      system: 'Staff Survey Platform',
      dataset: 'clinician_satisfaction',
      freshness_sla_hours: 720,
    },
    confidence_rules: { min_n: 20, freshness_weight: 0.2, sample_weight: 0.3, volatility_weight: 0.2, reliability_weight: 0.3 },
    notes: 'Pharmacist satisfaction with AI-assisted workflow (1-5 scale). Surveyed monthly.',
  },
  snapshot: {
    current: 3.9,
    previous: 3.6,
    target: 4.5,
    as_of: '2026-02-01T08:00:00Z',
    confidence_score: 82,
    sample_size: 38,
  },
  calculations: {
    attainment: 0.87,
    delta: 0.3,
    state: 'amber',
    confidence: 'medium',
    pace_index: 0.95,
  },
};

// ============================================
// NURSING METRICS
// ============================================

const nursingHandoffTime: Metric = {
  config: {
    id: 'hm-handoff-time',
    name: 'Handoff Completion Time',
    unit: 'count',
    direction: 'lower_is_better',
    segment: 'Nursing',
    owner: 'Nursing Director',
    target: 5,
    target_period: 'EOY_2026',
    current_period: 'weekly',
    aggregation: 'median',
    baseline: 15,
    format: '0',
    data_source: {
      system: 'EHR Analytics',
      dataset: 'handoff_events',
      freshness_sla_hours: 24,
    },
    confidence_rules: { min_n: 100, freshness_weight: 0.3, sample_weight: 0.3, volatility_weight: 0.2, reliability_weight: 0.2 },
    notes: 'Median minutes per patient handoff summary. Target: reduce from ~15 min to ~5 min.',
  },
  snapshot: {
    current: 7.2,
    previous: 8.5,
    target: 5,
    as_of: '2026-02-07T08:00:00Z',
    confidence_score: 93,
    sample_size: 1845,
  },
  calculations: {
    attainment: 0.78,
    delta: -1.3,
    state: 'amber',
    confidence: 'high',
    pace_index: 1.05,
  },
};

const nursingInfoCompleteness: Metric = {
  config: {
    id: 'hm-info-completeness',
    name: 'Information Completeness Score',
    unit: 'percent',
    direction: 'higher_is_better',
    segment: 'Nursing',
    owner: 'Nursing Director',
    target: 0.95,
    target_period: 'EOY_2026',
    current_period: 'weekly',
    aggregation: 'weighted_mean',
    baseline: 0.68,
    format: '0%',
    data_source: {
      system: 'Quality Assurance',
      dataset: 'handoff_quality_audits',
      freshness_sla_hours: 48,
    },
    confidence_rules: { min_n: 50, freshness_weight: 0.2, sample_weight: 0.3, volatility_weight: 0.2, reliability_weight: 0.3 },
    notes: 'Percentage of required handoff fields completed without receiving-nurse flags.',
  },
  snapshot: {
    current: 0.89,
    previous: 0.86,
    target: 0.95,
    as_of: '2026-02-07T08:00:00Z',
    confidence_score: 86,
    sample_size: 620,
  },
  calculations: {
    attainment: 0.94,
    delta: 0.03,
    delta_pp: 3,
    state: 'green',
    confidence: 'high',
    pace_index: 1.12,
  },
};

const nursingAdverseEvents: Metric = {
  config: {
    id: 'hm-adverse-events',
    name: 'Adverse Events During Transitions',
    unit: 'count',
    direction: 'lower_is_better',
    segment: 'Nursing',
    owner: 'Chief Nursing Officer',
    target: 2,
    target_period: 'Q1_2026',
    current_period: 'monthly',
    aggregation: 'sum',
    baseline: 12,
    format: '0',
    data_source: {
      system: 'Patient Safety Reporting',
      dataset: 'safety_events',
      freshness_sla_hours: 24,
    },
    confidence_rules: { min_n: 1, freshness_weight: 0.4, sample_weight: 0.1, volatility_weight: 0.2, reliability_weight: 0.3 },
    notes: 'Monthly count of adverse events occurring during or within 4h of shift transitions.',
  },
  snapshot: {
    current: 3,
    previous: 5,
    target: 2,
    as_of: '2026-02-01T08:00:00Z',
    confidence_score: 95,
    sample_size: 3,
  },
  calculations: {
    attainment: 0.80,
    delta: -2,
    state: 'amber',
    confidence: 'high',
    pace_index: 1.0,
  },
};

const nursingSatisfaction: Metric = {
  config: {
    id: 'hm-nurse-satisfaction',
    name: 'Nurse Satisfaction Score',
    unit: 'count',
    direction: 'higher_is_better',
    segment: 'Nursing',
    owner: 'Nursing Director',
    target: 4.5,
    target_period: 'EOY_2026',
    current_period: 'monthly',
    aggregation: 'weighted_mean',
    baseline: 3.1,
    format: '0.0',
    data_source: {
      system: 'Staff Survey Platform',
      dataset: 'clinician_satisfaction',
      freshness_sla_hours: 720,
    },
    confidence_rules: { min_n: 30, freshness_weight: 0.2, sample_weight: 0.3, volatility_weight: 0.2, reliability_weight: 0.3 },
    notes: 'Nurse satisfaction with AI handoff tools (1-5 scale). Surveyed monthly.',
  },
  snapshot: {
    current: 4.1,
    previous: 3.8,
    target: 4.5,
    as_of: '2026-02-01T08:00:00Z',
    confidence_score: 85,
    sample_size: 92,
  },
  calculations: {
    attainment: 0.91,
    delta: 0.3,
    state: 'green',
    confidence: 'high',
    pace_index: 1.02,
  },
};

// ============================================
// CROSS-DEPARTMENT PROGRAM METRICS
// ============================================

const overallAIAdoption: Metric = {
  config: {
    id: 'hm-ai-adoption',
    name: 'AI Tool Adoption Rate',
    unit: 'percent',
    direction: 'higher_is_better',
    segment: 'All Departments',
    owner: 'VP Clinical Operations',
    target: 0.85,
    target_period: 'EOY_2026',
    current_period: 'weekly',
    aggregation: 'weighted_mean',
    baseline: 0.15,
    format: '0%',
    data_source: {
      system: 'Usage Analytics',
      dataset: 'ai_tool_usage',
      freshness_sla_hours: 24,
    },
    confidence_rules: { min_n: 50, freshness_weight: 0.3, sample_weight: 0.3, volatility_weight: 0.2, reliability_weight: 0.2 },
    notes: 'Percentage of eligible clinicians actively using AI tools (at least 1 interaction/week).',
  },
  snapshot: {
    current: 0.67,
    previous: 0.62,
    target: 0.85,
    as_of: '2026-02-07T08:00:00Z',
    confidence_score: 92,
    sample_size: 228,
  },
  calculations: {
    attainment: 0.79,
    delta: 0.05,
    delta_pp: 5,
    state: 'amber',
    confidence: 'high',
    pace_index: 0.95,
  },
};

// ============================================
// EXPORTS
// ============================================

export const PHARMACY_METRICS: Metric[] = [
  pharmacyTimeToVerify,
  pharmacyAlertOverrideRate,
  pharmacyHighPriorityCatch,
  pharmacySatisfaction,
];

export const NURSING_METRICS: Metric[] = [
  nursingHandoffTime,
  nursingInfoCompleteness,
  nursingAdverseEvents,
  nursingSatisfaction,
];

export const PROGRAM_METRICS: Metric[] = [
  overallAIAdoption,
];

export const ALL_HEALTHCARE_METRICS: Metric[] = [
  ...PHARMACY_METRICS,
  ...NURSING_METRICS,
  ...PROGRAM_METRICS,
];

export function getMetricsByDepartment(departmentId: string): Metric[] {
  const segmentMap: Record<string, Metric[]> = {
    pharmacy: PHARMACY_METRICS,
    nursing: NURSING_METRICS,
  };
  return segmentMap[departmentId] || [];
}

export function getMetricById(id: string): Metric | undefined {
  return ALL_HEALTHCARE_METRICS.find(m => m.config.id === id);
}
