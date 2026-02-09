/**
 * Goal (OKR) Structure
 * Groups metrics by strategic goals
 */

import type { Metric } from "./metrics";

export interface Goal {
  id: string;
  name: string;
  description: string;
  owner: string;
  target_period: string;
  metric_ids: string[];
  color: string; // Accent color for the goal
  icon?: string; // Emoji or icon identifier
}

export interface GoalWithMetrics extends Goal {
  metrics: Metric[];
  rollup: {
    total_krs: number;
    green_count: number;
    amber_count: number;
    red_count: number;
    avg_attainment: number;
    health_state: "green" | "amber" | "red";
  };
}
