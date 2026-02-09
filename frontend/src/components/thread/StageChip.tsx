export type Stage = "explore" | "validate" | "prove" | "scale";

interface StageChipProps {
  stage: Stage;
  daysInStage?: number;
}

const stageColors = {
  explore: {
    bg: "bg-accent-cyan/10",
    text: "text-accent-cyan",
    border: "border-accent-cyan/30",
  },
  validate: {
    bg: "bg-accent-amber/10",
    text: "text-accent-amber",
    border: "border-accent-amber/30",
  },
  prove: {
    bg: "bg-accent-north/10",
    text: "text-accent-north",
    border: "border-accent-north/30",
  },
  scale: {
    bg: "bg-health-green/10",
    text: "text-health-green",
    border: "border-health-green/30",
  },
};

export function StageChip({ stage, daysInStage }: StageChipProps) {
  const colors = stageColors[stage];

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 ${colors.bg} ${colors.border}`}
    >
      <span className={`text-xs font-medium capitalize ${colors.text}`}>
        {stage}
      </span>
      {daysInStage !== undefined && (
        <span className="text-xs text-text-muted">{daysInStage}d</span>
      )}
    </div>
  );
}
