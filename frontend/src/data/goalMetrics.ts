/**
 * Goal-Metric Integration
 * Combines goals with their associated metrics and rollup calculations
 */

import type { GoalWithMetrics } from "@/types/goals";
import type { Metric } from "@/types/metrics";
import { goals } from "./goals";
import { getAllMetrics, getMetricById } from "./mockMetricData";

/**
 * Calculate rollup stats for a goal based on its metrics
 */
function calculateGoalRollup(metrics: Metric[]) {
  const greenCount = metrics.filter((m) => m.calculations.state === "green").length;
  const amberCount = metrics.filter((m) => m.calculations.state === "amber").length;
  const redCount = metrics.filter((m) => m.calculations.state === "red").length;

  const avgAttainment =
    metrics.reduce((sum, m) => sum + m.calculations.attainment, 0) / metrics.length;

  // Determine goal health state
  let healthState: "green" | "amber" | "red";
  if (redCount > 0 || avgAttainment < 0.8) {
    healthState = "red";
  } else if (amberCount > 0 || avgAttainment < 0.95) {
    healthState = "amber";
  } else {
    healthState = "green";
  }

  return {
    total_krs: metrics.length,
    green_count: greenCount,
    amber_count: amberCount,
    red_count: redCount,
    avg_attainment: avgAttainment,
    health_state: healthState,
  };
}

/**
 * Get all goals with their metrics and rollup stats
 */
export function getAllGoalsWithMetrics(): GoalWithMetrics[] {
  return goals.map((goal) => {
    const metrics = goal.metric_ids
      .map((id) => getMetricById(id))
      .filter((m): m is Metric => m !== undefined);

    const rollup = calculateGoalRollup(metrics);

    return {
      ...goal,
      metrics,
      rollup,
    };
  });
}

/**
 * Get a single goal with its metrics
 */
export function getGoalWithMetrics(goalId: string): GoalWithMetrics | undefined {
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return undefined;

  const metrics = goal.metric_ids
    .map((id) => getMetricById(id))
    .filter((m): m is Metric => m !== undefined);

  const rollup = calculateGoalRollup(metrics);

  return {
    ...goal,
    metrics,
    rollup,
  };
}

/**
 * Get portfolio-level summary stats
 */
export function getPortfolioSummary() {
  const allGoals = getAllGoalsWithMetrics();
  const allMetrics = getAllMetrics();

  const totalGoals = allGoals.length;
  const totalKRs = allMetrics.length;

  const goalsGreen = allGoals.filter((g) => g.rollup.health_state === "green").length;
  const goalsAmber = allGoals.filter((g) => g.rollup.health_state === "amber").length;
  const goalsRed = allGoals.filter((g) => g.rollup.health_state === "red").length;

  const krsGreen = allMetrics.filter((m) => m.calculations.state === "green").length;
  const krsAmber = allMetrics.filter((m) => m.calculations.state === "amber").length;
  const krsRed = allMetrics.filter((m) => m.calculations.state === "red").length;

  const avgAttainment =
    allMetrics.reduce((sum, m) => sum + m.calculations.attainment, 0) / allMetrics.length;

  return {
    total_goals: totalGoals,
    total_krs: totalKRs,
    goals: {
      green: goalsGreen,
      amber: goalsAmber,
      red: goalsRed,
    },
    krs: {
      green: krsGreen,
      amber: krsAmber,
      red: krsRed,
    },
    avg_attainment: avgAttainment,
  };
}
