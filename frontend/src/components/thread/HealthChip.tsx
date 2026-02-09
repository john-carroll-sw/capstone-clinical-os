import { useState } from "react";

export type HealthStatus = "green" | "amber" | "red" | "unknown";
export type Confidence = "high" | "medium" | "low";

interface HealthChipProps {
  status: HealthStatus;
  confidence: Confidence;
  showTooltip?: boolean;
  scores?: {
    outcome: number;
    delivery: number;
    risk: number;
    freshness: number;
  };
}

const statusColors = {
  green: {
    dot: "bg-health-green",
    text: "text-health-green",
    bg: "bg-health-green/10",
  },
  amber: {
    dot: "bg-health-amber",
    text: "text-health-amber",
    bg: "bg-health-amber/10",
  },
  red: {
    dot: "bg-health-red",
    text: "text-health-red",
    bg: "bg-health-red/10",
  },
  unknown: {
    dot: "bg-health-gray",
    text: "text-health-gray",
    bg: "bg-health-gray/10",
  },
};

const confidenceColors = {
  high: "text-health-green",
  medium: "text-health-amber",
  low: "text-health-red",
};

export function HealthChip({
  status,
  confidence,
  showTooltip = false,
  scores,
}: HealthChipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = statusColors[status];

  return (
    <div
      className="relative inline-flex items-center gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Chip */}
      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${colors.bg}`}>
        <div className={`h-2 w-2 rounded-full ${colors.dot}`} />
        <span className={`text-xs font-medium capitalize ${colors.text}`}>
          {status}
        </span>
      </div>

      {/* Confidence Badge */}
      <span className={`text-xs font-medium capitalize ${confidenceColors[confidence]}`}>
        {confidence}
      </span>

      {/* Tooltip on Hover */}
      {showTooltip && isHovered && scores && (
        <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-lg border border-border-subtle bg-bg-card p-3 shadow-lg">
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Outcome</span>
              <span className="font-medium text-text-primary">{scores.outcome}/25</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Delivery</span>
              <span className="font-medium text-text-primary">{scores.delivery}/25</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Risk</span>
              <span className="font-medium text-text-primary">{scores.risk}/25</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Freshness</span>
              <span className="font-medium text-text-primary">{scores.freshness}/25</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
