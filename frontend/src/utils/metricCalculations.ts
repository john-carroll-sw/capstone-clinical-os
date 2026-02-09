/**
 * Standardized Metric Calculations
 * Ensures consistent attainment, pace, and state logic across all tiles
 */

import type {
  MetricConfig,
  MetricSnapshot,
  MetricCalculations,
  MetricState,
  ConfidenceLevel,
} from "@/types/metrics";

/**
 * Calculate attainment (% to target) with direction awareness
 * Returns value between 0-200% (clamped)
 */
export function calculateAttainment(
  current: number,
  target: number,
  direction: "higher_is_better" | "lower_is_better"
): number {
  if (target === 0) return 0;

  let attainment: number;
  if (direction === "higher_is_better") {
    attainment = current / target;
  } else {
    // lower_is_better: flip the ratio
    attainment = target / current;
  }

  // Clamp to [0, 2] (0% to 200%)
  return Math.max(0, Math.min(2, attainment));
}

/**
 * Calculate delta since last sprint with unit awareness
 */
export function calculateDelta(
  current: number,
  previous: number,
  unit: string
): { delta: number; delta_pp?: number } {
  const delta = current - previous;

  // For percent metrics, also calculate percentage points
  if (unit === "percent") {
    return {
      delta,
      delta_pp: delta, // Already in decimal form (e.g., 0.06 = 6pp)
    };
  }

  return { delta };
}

/**
 * Calculate time-adjusted pace index for quarterly/annual targets
 * Pace Index >= 1.0 means on track
 */
export function calculatePaceIndex(
  attainment: number,
  targetPeriod: string,
  currentDate: Date = new Date()
): number | undefined {
  // Only calculate pace for quarterly/annual targets
  if (!targetPeriod.includes("Q") && !targetPeriod.includes("EOY")) {
    return undefined;
  }

  // Parse target period to get end date
  const year = parseInt(targetPeriod.match(/\d{4}/)?.[0] || "2026");
  let endDate: Date;

  if (targetPeriod.includes("EOY")) {
    endDate = new Date(year, 11, 31); // Dec 31
  } else if (targetPeriod.includes("Q1")) {
    endDate = new Date(year, 2, 31); // Mar 31
  } else if (targetPeriod.includes("Q2")) {
    endDate = new Date(year, 5, 30); // Jun 30
  } else if (targetPeriod.includes("Q3")) {
    endDate = new Date(year, 8, 30); // Sep 30
  } else if (targetPeriod.includes("Q4")) {
    endDate = new Date(year, 11, 31); // Dec 31
  } else {
    return undefined;
  }

  // Determine period start (assume start of year or quarter)
  let startDate: Date;
  if (targetPeriod.includes("EOY")) {
    startDate = new Date(year, 0, 1); // Jan 1
  } else if (targetPeriod.includes("Q1")) {
    startDate = new Date(year, 0, 1); // Jan 1
  } else if (targetPeriod.includes("Q2")) {
    startDate = new Date(year, 3, 1); // Apr 1
  } else if (targetPeriod.includes("Q3")) {
    startDate = new Date(year, 6, 1); // Jul 1
  } else if (targetPeriod.includes("Q4")) {
    startDate = new Date(year, 9, 1); // Oct 1
  } else {
    startDate = new Date(year, 0, 1);
  }

  // Calculate time elapsed as percentage
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();
  const timeElapsedPercent = Math.max(0, Math.min(1, elapsed / totalDuration));

  if (timeElapsedPercent === 0) return undefined;

  // Pace Index = attainment / time_elapsed
  return attainment / timeElapsedPercent;
}

/**
 * Determine metric state based on attainment and pace
 */
export function determineState(
  attainment: number,
  paceIndex?: number
): MetricState {
  // Use pace index if available, otherwise use raw attainment
  const metric = paceIndex !== undefined ? paceIndex : attainment;

  if (metric >= 1.0 || attainment >= 0.95) {
    return "green";
  } else if (metric >= 0.8 || attainment >= 0.8) {
    return "amber";
  } else {
    return "red";
  }
}

/**
 * Calculate confidence level based on composite score
 * Returns both numeric score (0-100) and categorical level
 */
export function calculateConfidence(
  snapshot: MetricSnapshot,
  config: MetricConfig
): { score: number; level: ConfidenceLevel } {
  const rules = config.confidence_rules;
  const asOfDate = new Date(snapshot.as_of);
  const now = new Date();
  const freshnessHours =
    (now.getTime() - asOfDate.getTime()) / (1000 * 60 * 60);

  // Component scores (0-1 scale)
  let freshnessScore = 0;
  if (freshnessHours <= config.data_source.freshness_sla_hours) {
    freshnessScore = 1;
  } else {
    // Degrade linearly up to 2x SLA, then 0
    const slaMultiple = freshnessHours / config.data_source.freshness_sla_hours;
    freshnessScore = Math.max(0, 1 - (slaMultiple - 1));
  }

  // Sample size adequacy
  let sampleScore = 0;
  if (snapshot.sample_size !== undefined) {
    sampleScore = Math.min(1, snapshot.sample_size / rules.min_n);
  } else {
    sampleScore = 0.5; // Default if not tracked
  }

  // Volatility (simplified - assume medium for now)
  const volatilityScore = 0.75;

  // Reliability (simplified - assume high for now)
  const reliabilityScore = 0.9;

  // Weighted composite
  const compositeScore =
    freshnessScore * rules.freshness_weight +
    sampleScore * rules.sample_weight +
    volatilityScore * rules.volatility_weight +
    reliabilityScore * rules.reliability_weight;

  const score = Math.round(compositeScore * 100);

  // Map to categorical level
  let level: ConfidenceLevel;
  if (score > 80) {
    level = "high";
  } else if (score > 50) {
    level = "medium";
  } else {
    level = "low";
  }

  return { score, level };
}

/**
 * Calculate all metrics for a given snapshot
 */
export function calculateMetrics(
  config: MetricConfig,
  snapshot: MetricSnapshot
): MetricCalculations {
  const attainment = calculateAttainment(
    snapshot.current,
    snapshot.target,
    config.direction
  );

  const { delta, delta_pp } = calculateDelta(
    snapshot.current,
    snapshot.previous,
    config.unit
  );

  const paceIndex = calculatePaceIndex(attainment, config.target_period);

  const state = determineState(attainment, paceIndex);

  const confidence = calculateConfidence(snapshot, config);

  return {
    attainment,
    delta,
    delta_pp,
    pace_index: paceIndex,
    state,
    confidence: confidence.level,
  };
}

/**
 * Format metric value with unit awareness
 */
export function formatMetricValue(value: number, unit: string, _format?: string): string {
  switch (unit) {
    case "percent":
      return `${Math.round(value * 100)}%`;
    case "currency":
      if (Math.abs(value) >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1)}M`;
      } else if (Math.abs(value) >= 1_000) {
        return `$${(value / 1_000).toFixed(1)}K`;
      }
      return `$${value.toFixed(0)}`;
    case "pmpm":
      return `$${value.toFixed(2)}`;
    case "count":
      if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}M`;
      } else if (value >= 1_000) {
        return `${(value / 1_000).toFixed(1)}K`;
      }
      return value.toFixed(0);
    case "index":
      return value.toFixed(0);
    default:
      return value.toFixed(2);
  }
}

/**
 * Format delta with unit awareness and direction indicators
 */
export function formatDelta(
  delta: number,
  unit: string,
  _direction: "higher_is_better" | "lower_is_better"
): string {
  const isPositive = delta > 0;

  let formattedDelta: string;
  const arrow = isPositive ? "↑" : "↓";

  switch (unit) {
    case "percent":
      formattedDelta = `${isPositive ? "+" : ""}${Math.round(delta * 100)} pp`;
      break;
    case "currency":
      if (Math.abs(delta) >= 1_000_000) {
        formattedDelta = `${isPositive ? "+" : ""}$${(delta / 1_000_000).toFixed(1)}M`;
      } else if (Math.abs(delta) >= 1_000) {
        formattedDelta = `${isPositive ? "+" : ""}$${(delta / 1_000).toFixed(1)}K`;
      } else {
        formattedDelta = `${isPositive ? "+" : ""}$${delta.toFixed(0)}`;
      }
      break;
    case "pmpm":
      formattedDelta = `${isPositive ? "+" : ""}$${delta.toFixed(2)}`;
      break;
    case "count":
      if (Math.abs(delta) >= 1_000) {
        formattedDelta = `${isPositive ? "+" : ""}${(delta / 1_000).toFixed(1)}K`;
      } else {
        formattedDelta = `${isPositive ? "+" : ""}${delta.toFixed(0)}`;
      }
      break;
    case "index":
      formattedDelta = `${isPositive ? "+" : ""}${delta.toFixed(0)}`;
      break;
    default:
      formattedDelta = `${isPositive ? "+" : ""}${delta.toFixed(2)}`;
  }

  return `${formattedDelta} ${arrow}`;
}
