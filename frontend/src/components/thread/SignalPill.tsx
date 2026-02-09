export type SignalSeverity = "S1" | "S2" | "S3";
export type SignalType =
  | "Blocker"
  | "Risk"
  | "DecisionNeeded"
  | "Drift"
  | "Staleness"
  | "Win";

interface SignalPillProps {
  severity: SignalSeverity;
  type: SignalType;
  agingDays?: number;
  onClick?: () => void;
}

const severityColors = {
  S1: {
    bg: "bg-health-red/20",
    text: "text-health-red",
    border: "border-health-red/40",
  },
  S2: {
    bg: "bg-health-amber/20",
    text: "text-health-amber",
    border: "border-health-amber/40",
  },
  S3: {
    bg: "bg-accent-cyan/20",
    text: "text-accent-cyan",
    border: "border-accent-cyan/40",
  },
};

const typeColors = {
  Blocker: "text-health-red",
  Risk: "text-health-amber",
  DecisionNeeded: "text-accent-north",
  Drift: "text-accent-amber",
  Staleness: "text-text-muted",
  Win: "text-health-green",
};

export function SignalPill({ severity, type, agingDays, onClick }: SignalPillProps) {
  const severityColor = severityColors[severity];

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated px-3 py-1 transition-all hover:border-accent-north/30 hover:bg-bg-card"
    >
      {/* Severity Tag */}
      <span
        className={`rounded px-1.5 py-0.5 text-xs font-bold ${severityColor.bg} ${severityColor.text} ${severityColor.border} border`}
      >
        {severity}
      </span>

      {/* Type */}
      <span className={`text-xs font-medium ${typeColors[type]}`}>{type}</span>

      {/* Aging */}
      {agingDays !== undefined && (
        <span className="text-xs text-text-muted">{agingDays}d</span>
      )}
    </button>
  );
}
