/**
 * MetricCard Component
 * Reusable metric tile for bi-weekly sprint tracking
 */

import type { Metric } from "@/types/metrics";
import {
  formatMetricValue,
  formatDelta,
} from "@/utils/metricCalculations";
import { useState } from "react";

interface MetricCardProps {
  metric: Metric;
  showPace?: boolean; // MVP+1 feature
  showSparkline?: boolean; // MVP+1 feature
}

const stateColors = {
  green: {
    border: "border-health-green",
    bg: "bg-health-green/5",
    text: "text-health-green",
    ring: "shadow-[0_0_0_2px_rgba(52,211,153,0.2)]",
  },
  amber: {
    border: "border-health-amber",
    bg: "bg-health-amber/5",
    text: "text-health-amber",
    ring: "shadow-[0_0_0_2px_rgba(251,191,36,0.2)]",
  },
  red: {
    border: "border-health-red",
    bg: "bg-health-red/5",
    text: "text-health-red",
    ring: "shadow-[0_0_0_2px_rgba(251,113,133,0.2)]",
  },
};

const confidenceColors = {
  high: "text-health-green",
  medium: "text-health-amber",
  low: "text-health-red",
};

export function MetricCard({
  metric,
  showPace = false,
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { config, snapshot, calculations } = metric;
  const colors = stateColors[calculations.state];

  const currentValue = formatMetricValue(snapshot.current, config.unit);
  const targetValue = formatMetricValue(snapshot.target, config.unit);
  const attainmentPercent = Math.round(calculations.attainment * 100);
  const deltaFormatted = formatDelta(
    calculations.delta,
    config.unit,
    config.direction
  );

  // Determine if delta is positive movement
  const isDeltaGood =
    (config.direction === "higher_is_better" && calculations.delta > 0) ||
    (config.direction === "lower_is_better" && calculations.delta < 0);

  return (
    <div
      className={`group relative rounded-xl border-2 ${colors.border} ${colors.bg} bg-bg-card p-6 transition-all duration-300 hover:${colors.ring}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 font-display text-lg font-semibold text-text-primary">
            {config.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Owner: {config.owner}</span>
            <span className="text-text-muted/50">•</span>
            <span>
              As of: {new Date(snapshot.as_of).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
          {config.segment && (
            <div className="mt-1 text-xs text-text-secondary">
              Segment: {config.segment}
            </div>
          )}
        </div>

        {/* State Badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
            calculations.state === "green"
              ? "bg-health-green/10"
              : calculations.state === "amber"
              ? "bg-health-amber/10"
              : "bg-health-red/10"
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full ${
              calculations.state === "green"
                ? "bg-health-green"
                : calculations.state === "amber"
                ? "bg-health-amber"
                : "bg-health-red"
            }`}
          />
          <span className={`text-xs font-medium capitalize ${colors.text}`}>
            {calculations.state === "green"
              ? "On Track"
              : calculations.state === "amber"
              ? "Watch"
              : "At Risk"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-4 h-px bg-border-subtle" />

      {/* Current Value - Hero Number */}
      <div className="mb-6">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
          Current
        </div>
        <div className="font-display text-4xl font-bold text-text-primary">
          {currentValue}
        </div>
        {snapshot.is_stale && (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-health-gray/10 px-2 py-0.5 text-xs font-medium text-health-gray">
            <div className="h-1.5 w-1.5 rounded-full bg-health-gray" />
            Stale Data
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Target */}
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
            Target
          </div>
          <div className="text-xl font-semibold text-text-secondary">
            {targetValue}
          </div>
        </div>

        {/* % to Target */}
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
            % to Target
          </div>
          <div className={`text-xl font-semibold ${colors.text}`}>
            {attainmentPercent}%
            {config.direction === "higher_is_better" ? " ↑" : " ↓"}
          </div>
        </div>

        {/* Delta vs Last Sprint */}
        <div>
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-text-muted">
            Δ vs Last
          </div>
          <div
            className={`text-xl font-semibold ${
              isDeltaGood ? "text-health-green" : "text-health-red"
            }`}
          >
            {deltaFormatted}
          </div>
        </div>
      </div>

      {/* Optional: Pace & Confidence (MVP+1) */}
      {(showPace || calculations.confidence) && (
        <div className="mt-4 flex items-center gap-4 border-t border-border-subtle pt-4 text-xs">
          {showPace && calculations.pace_index !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Pace:</span>
              <span
                className={`font-medium ${
                  calculations.pace_index >= 1.0
                    ? "text-health-green"
                    : calculations.pace_index >= 0.8
                    ? "text-health-amber"
                    : "text-health-red"
                }`}
              >
                {calculations.pace_index.toFixed(2)}x
              </span>
            </div>
          )}

          {calculations.confidence && (
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Confidence:</span>
              <span
                className={`font-medium capitalize ${
                  confidenceColors[calculations.confidence]
                }`}
              >
                {calculations.confidence}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Definition Tooltip */}
      {showTooltip && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-border-subtle bg-bg-elevated p-4 shadow-lg">
          <div className="space-y-2 text-xs">
            <div>
              <span className="font-medium text-text-primary">Source: </span>
              <span className="text-text-secondary">
                {config.data_source.system}
              </span>
            </div>
            <div>
              <span className="font-medium text-text-primary">
                Aggregation:{" "}
              </span>
              <span className="text-text-secondary">{config.aggregation}</span>
            </div>
            <div>
              <span className="font-medium text-text-primary">Period: </span>
              <span className="text-text-secondary">
                {config.current_period} (Target: {config.target_period})
              </span>
            </div>
            {config.notes && (
              <div>
                <span className="font-medium text-text-primary">Notes: </span>
                <span className="text-text-secondary">{config.notes}</span>
              </div>
            )}
            {snapshot.sample_size && (
              <div>
                <span className="font-medium text-text-primary">Sample: </span>
                <span className="text-text-secondary">
                  N = {snapshot.sample_size.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
