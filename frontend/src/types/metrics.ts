/**
 * Metrics Types & Configuration
 * Supports bi-weekly sprint metrics with standardized calculations
 */

export type MetricDirection = "higher_is_better" | "lower_is_better";
export type MetricUnit = "percent" | "currency" | "count" | "index" | "pmpm";
export type MetricState = "green" | "amber" | "red";
export type ConfidenceLevel = "high" | "medium" | "low";

export interface MetricDataSource {
  system: string;
  dataset: string;
  freshness_sla_hours: number;
}

export interface ConfidenceRules {
  min_n: number;
  freshness_weight: number;
  sample_weight: number;
  volatility_weight: number;
  reliability_weight: number;
}

export interface MetricConfig {
  id: string;
  name: string;
  unit: MetricUnit;
  direction: MetricDirection;
  segment: string;
  owner: string;
  target: number;
  target_period: string; // e.g., "EOY_2026", "Q1_2026"
  current_period: string; // e.g., "sprint", "monthly"
  aggregation: string; // e.g., "weighted_mean", "median", "sum"
  baseline: number;
  format: string; // e.g., "0%", "$0.0a", "0"
  data_source: MetricDataSource;
  confidence_rules: ConfidenceRules;
  notes?: string;
}

export interface MetricSnapshot {
  current: number;
  previous: number; // last sprint/period
  target: number;
  as_of: string; // ISO timestamp
  confidence_score?: number; // 0-100
  sample_size?: number;
  is_stale?: boolean;
}

export interface MetricCalculations {
  attainment: number; // % to target (0-200%)
  delta: number; // change since last period
  delta_pp?: number; // for percent metrics (percentage points)
  pace_index?: number; // time-adjusted pace (>= 1.0 is on track)
  state: MetricState;
  confidence?: ConfidenceLevel;
  eta?: string; // projected date to hit target
}

export interface Metric {
  config: MetricConfig;
  snapshot: MetricSnapshot;
  calculations: MetricCalculations;
}
