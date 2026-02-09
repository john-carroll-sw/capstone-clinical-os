/**
 * Mock Metric Data
 * Generates realistic snapshots for all 12 KRs
 */

import type { MetricSnapshot, Metric } from "@/types/metrics";
import { metricConfigs } from "./metricConfigs";
import { calculateMetrics } from "@/utils/metricCalculations";

// Mock snapshots with realistic data
export const mockSnapshots: Record<string, MetricSnapshot> = {
  digital_issue_resolution_rate: {
    current: 0.50,
    previous: 0.46,
    target: 0.8,
    as_of: "2026-01-20T12:00:00Z",
    sample_size: 8500,
    is_stale: false,
  },
  customer_nps: {
    current: 58,
    previous: 54,
    target: 60,
    as_of: "2026-01-20T12:00:00Z",
    sample_size: 420,
    is_stale: false,
  },
  mau: {
    current: 115000,
    previous: 108000,
    target: 120000,
    as_of: "2026-01-20T12:00:00Z",
    sample_size: 115000,
    is_stale: false,
  },
  transparency_trust: {
    current: 0.77,
    previous: 0.74,
    target: 0.8,
    as_of: "2026-01-13T12:00:00Z", // Week old
    sample_size: 620,
    is_stale: false,
  },
  revenue_growth_disruptive_ai: {
    current: 46000000,
    previous: 42000000,
    target: 50000000,
    as_of: "2026-01-19T12:00:00Z",
    sample_size: 145,
    is_stale: false,
  },
  opex_reduction_margin_growth: {
    current: 28500000,
    previous: 26000000,
    target: 30000000,
    as_of: "2026-01-19T12:00:00Z",
    sample_size: 68,
    is_stale: false,
  },
  risk_adjusted_tcc_pmpm: {
    current: 348.5,
    previous: 352.2,
    target: 345.0,
    as_of: "2026-01-18T12:00:00Z",
    sample_size: 1250,
    is_stale: false,
  },
  data_partner_gp_growth: {
    current: 19200000,
    previous: 18100000,
    target: 20000000,
    as_of: "2026-01-19T12:00:00Z",
    sample_size: 28,
    is_stale: false,
  },
  ai_mau: {
    current: 7200,
    previous: 6800,
    target: 7500,
    as_of: "2026-01-20T12:00:00Z",
    sample_size: 7200,
    is_stale: false,
  },
  gold_assets_coverage: {
    current: 0.96,
    previous: 0.92,
    target: 1.0,
    as_of: "2026-01-19T12:00:00Z",
    sample_size: 50,
    is_stale: false,
  },
  anomaly_detection_sla: {
    current: 0.93,
    previous: 0.90,
    target: 0.95,
    as_of: "2026-01-20T12:00:00Z",
    sample_size: 142,
    is_stale: false,
  },
  risk_actions_implemented: {
    current: 0.52,
    previous: 0.48,
    target: 0.7,
    as_of: "2026-01-19T12:00:00Z",
    sample_size: 72,
    is_stale: false,
  },
  client_nps: {
    current: 52,
    previous: 50,
    target: 55,
    as_of: "2026-01-20T12:00:00Z",
    sample_size: 35,
    is_stale: false,
  },
};

/**
 * Generate full metric objects with calculations
 */
export function getAllMetrics(): Metric[] {
  return metricConfigs.map((config) => {
    const snapshot = mockSnapshots[config.id];
    if (!snapshot) {
      throw new Error(`Missing snapshot for metric: ${config.id}`);
    }

    const calculations = calculateMetrics(config, snapshot);

    return {
      config,
      snapshot,
      calculations,
    };
  });
}

/**
 * Get a single metric by ID
 */
export function getMetricById(id: string): Metric | undefined {
  const config = metricConfigs.find((c) => c.id === id);
  if (!config) return undefined;

  const snapshot = mockSnapshots[id];
  if (!snapshot) return undefined;

  const calculations = calculateMetrics(config, snapshot);

  return {
    config,
    snapshot,
    calculations,
  };
}

/**
 * Sort metrics by various criteria
 */
export function sortMetrics(
  metrics: Metric[],
  sortBy: "state" | "attainment" | "delta" | "name"
): Metric[] {
  const sorted = [...metrics];

  switch (sortBy) {
    case "state":
      // Red first, then Amber, then Green
      const stateOrder = { red: 0, amber: 1, green: 2 };
      sorted.sort(
        (a, b) =>
          stateOrder[a.calculations.state] -
          stateOrder[b.calculations.state]
      );
      break;
    case "attainment":
      // Lowest attainment first (furthest from target)
      sorted.sort(
        (a, b) => a.calculations.attainment - b.calculations.attainment
      );
      break;
    case "delta":
      // Most negative delta first (considering direction)
      sorted.sort((a, b) => {
        const aDelta =
          a.config.direction === "higher_is_better"
            ? a.calculations.delta
            : -a.calculations.delta;
        const bDelta =
          b.config.direction === "higher_is_better"
            ? b.calculations.delta
            : -b.calculations.delta;
        return aDelta - bDelta;
      });
      break;
    case "name":
      sorted.sort((a, b) => a.config.name.localeCompare(b.config.name));
      break;
  }

  return sorted;
}

/**
 * Filter metrics by state
 */
export function filterMetricsByState(
  metrics: Metric[],
  state: "green" | "amber" | "red"
): Metric[] {
  return metrics.filter((m) => m.calculations.state === state);
}
