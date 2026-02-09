/**
 * AI Chart Components - Reusable visualization components for AI responses
 * Used in dynamic response cards to show rich data visualizations
 */

import { Box, Typography, LinearProgress, Paper } from "@mui/material";
import { CheckCircle, Warning, Error as ErrorIcon, Info } from "@mui/icons-material";
import { customColors } from "../../theme/muiTheme";
import { renderIcon, IconKey } from "../../utils/icons";

// ============================================
// MINI BAR CHART
// ============================================
interface MiniBarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
}

export function MiniBarChart({ data, maxValue, height = 100, showLabels = true }: MiniBarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));

  return (
    <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.75, height, pt: 1.5 }}>
      {data.map((item, index) => {
        const barHeight = (item.value / max) * (height - 20);
        return (
          <Box key={index} sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, mb: 0.25 }}>
              {item.value}
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: barHeight,
                bgcolor: item.color || customColors.accent.cyan,
                borderRadius: "3px 3px 0 0",
                minHeight: 4,
                transition: "height 0.3s ease",
              }}
            />
            {showLabels && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.25, fontSize: "0.6rem", textAlign: "center" }}
              >
                {item.label}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ============================================
// DONUT CHART
// ============================================
interface DonutChartProps {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  segments,
  size = 100,
  strokeWidth = 12,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((acc, seg) => acc + seg.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((segment, index) => {
          const segmentLength = (segment.value / total) * circumference;
          const offset = currentOffset;
          currentOffset += segmentLength;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {centerValue && (
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {centerValue}
            </Typography>
          )}
          {centerLabel && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
              {centerLabel}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}

// ============================================
// PROGRESS METRIC CARD
// ============================================
interface ProgressMetricProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color?: string;
}

export function ProgressMetric({
  label,
  current,
  target,
  unit = "",
  trend,
  trendValue,
  color,
}: ProgressMetricProps) {
  const progress = Math.min(100, (current / target) * 100);
  const progressColor = color || (progress >= 90 ? customColors.health.green : progress >= 70 ? customColors.health.amber : customColors.health.red);

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        {trend && trendValue && (
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: trend === "up" ? customColors.health.green : trend === "down" ? customColors.health.red : "text.secondary",
            }}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"} {trendValue}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 0.75 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {current}{unit}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          / {target}{unit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 6,
          borderRadius: 0.75,
          bgcolor: "action.hover",
          "& .MuiLinearProgress-bar": {
            borderRadius: 0.75,
            bgcolor: progressColor,
          },
        }}
      />
    </Paper>
  );
}

// ============================================
// STAT CARD
// ============================================
interface StatCardProps {
  icon?: IconKey | string;
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "stable";
  color?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatCard({
  icon,
  label,
  value,
  subValue,
  trend,
  color,
  variant = "default",
}: StatCardProps) {
  const getVariantColor = () => {
    switch (variant) {
      case "success": return customColors.health.green;
      case "warning": return customColors.health.amber;
      case "danger": return customColors.health.red;
      default: return color || "text.primary";
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        borderColor: variant !== "default" ? `${getVariantColor()}30` : "divider",
        bgcolor: variant !== "default" ? `${getVariantColor()}08` : "transparent",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75 }}>
        {icon && (
          <Box sx={{ color: "text.secondary", display: "flex" }}>
            {renderIcon(icon as IconKey, { fontSize: "small" })}
          </Box>
        )}
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: getVariantColor() }}>
          {value}
        </Typography>
        {trend && (
          <Typography
            sx={{
              fontSize: "0.9rem",
              color: trend === "up" ? customColors.health.green : trend === "down" ? customColors.health.red : "text.secondary",
            }}
          >
            {trend === "up" ? "↑" : trend === "down" ? "↓" : "→"}
          </Typography>
        )}
      </Box>
      {subValue && (
        <Typography variant="caption" color="text.secondary">
          {subValue}
        </Typography>
      )}
    </Paper>
  );
}

// ============================================
// TIMELINE / ACTIVITY LIST
// ============================================
interface TimelineItem {
  icon: string;
  title: string;
  description: string;
  time: string;
  status?: "success" | "warning" | "danger" | "info";
}

interface TimelineProps {
  items: TimelineItem[];
  maxItems?: number;
}

export function Timeline({ items, maxItems = 5 }: TimelineProps) {
  const statusColors = {
    success: customColors.health.green,
    warning: customColors.health.amber,
    danger: customColors.health.red,
    info: customColors.accent.cyan,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {items.slice(0, maxItems).map((item, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            gap: 1.5,
            pb: 1.5,
            position: "relative",
            "&::before": index < Math.min(items.length, maxItems) - 1 ? {
              content: '""',
              position: "absolute",
              left: 14,
              top: 30,
              bottom: 0,
              width: 2,
              bgcolor: "divider",
            } : undefined,
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1.25,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: item.status ? `${statusColors[item.status]}20` : "action.hover",
              color: item.status ? statusColors[item.status] : "text.secondary",
              flexShrink: 0,
            }}
          >
            {renderIcon(item.icon as IconKey, { fontSize: "small" })}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                {item.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.time}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
              {item.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ============================================
// COMPARISON TABLE
// ============================================
interface ComparisonRow {
  label: string;
  current: string | number;
  previous: string | number;
  change?: string;
  trend?: "up" | "down" | "stable";
}

interface ComparisonTableProps {
  title?: string;
  rows: ComparisonRow[];
}

export function ComparisonTable({ title, rows }: ComparisonTableProps) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 1.5, overflow: "hidden" }}>
      {title && (
        <Box sx={{ px: 1.5, py: 1, bgcolor: "action.hover" }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      )}
      {rows.map((row, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.5,
            py: 1,
            borderTop: index > 0 || title ? 1 : 0,
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" sx={{ flex: 2, fontSize: "0.85rem" }}>
            {row.label}
          </Typography>
          <Typography variant="body2" sx={{ flex: 1, textAlign: "center", fontWeight: 500, fontSize: "0.85rem" }}>
            {row.current}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1, textAlign: "center" }}>
            {row.previous}
          </Typography>
          <Box sx={{ flex: 1, textAlign: "right" }}>
            {row.change && (
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  color: row.trend === "up" ? customColors.health.green : row.trend === "down" ? customColors.health.red : "text.secondary",
                }}
              >
                {row.trend === "up" ? "+" : ""}{row.change}
              </Typography>
            )}
          </Box>
        </Box>
      ))}
    </Paper>
  );
}

// ============================================
// ALERT BANNER
// ============================================
interface AlertBannerProps {
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
}

export function AlertBanner({ severity, title, description, action, onAction }: AlertBannerProps) {
  const config = {
    critical: { color: customColors.health.red, IconComponent: ErrorIcon },
    warning: { color: customColors.health.amber, IconComponent: Warning },
    info: { color: customColors.accent.cyan, IconComponent: Info },
    success: { color: customColors.health.green, IconComponent: CheckCircle },
  };

  const { color, IconComponent } = config[severity];

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 1.5,
        borderLeft: 4,
        borderColor: color,
        bgcolor: `${color}10`,
      }}
    >
      <Box sx={{ display: "flex", gap: 1.5 }}>
        <IconComponent sx={{ color }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
          {action && onAction && (
            <Typography
              variant="body2"
              onClick={onAction}
              sx={{
                mt: 1,
                color,
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              {action} →
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default {
  MiniBarChart,
  DonutChart,
  ProgressMetric,
  StatCard,
  Timeline,
  ComparisonTable,
  AlertBanner,
};
