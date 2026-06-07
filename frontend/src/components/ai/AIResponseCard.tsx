/**
 * AI Response Card - Dynamic UI generation based on query type
 * Supports minimized (card) and maximized (full) views
 * Creates custom visualizations based on response content
 */

import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Collapse,
  Grid,
  useTheme,
} from "@mui/material";
import {
  Fullscreen,
  FullscreenExit,
  ExpandMore,
  ExpandLess,
  Close,
} from "@mui/icons-material";
import {
  DonutChart,
  StatCard,
  AlertBanner,
} from "./AIChartComponents";
import { MarkdownContent } from "../common/MarkdownContent";
import { renderIcon, responseTypeIcons } from "../../utils/icons";
import { customColors } from "../../theme/muiTheme";

// Response types that trigger custom UI
export type ResponseType =
  | "portfolio_overview"
  | "goal_detail"
  | "kr_analysis"
  | "alerts_summary"
  | "decisions_pending"
  | "weekly_performance"
  | "trend_analysis"
  | "recommendations"
  | "custom_query"
  | "text_only";

interface AIResponseCardProps {
  type: ResponseType;
  title: string;
  summary: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onClose?: () => void;
  sources?: { name: string; confidence: number; kind?: "table" | "AI" | "system" }[];
  data?: unknown;
}

export function AIResponseCard({
  type,
  title,
  summary,
  isFullscreen,
  onToggleFullscreen,
  onClose,
  sources,
  data,
}: AIResponseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const theme = useTheme();
  const safe_sources = Array.isArray(sources) ? sources : [];
  const max_confidence = safe_sources.length
    ? Math.max(...safe_sources.map((source) => Number(source.confidence) || 0))
    : null;

  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "—";
    }
    return `${Math.round(value)}%`;
  };

  // Markdown styles for AI responses
  const markdownStyles = {
    "& p": {
      margin: 0,
      marginBottom: "0.5em",
      "&:last-child": { marginBottom: 0 },
    },
    "& strong": {
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
    "& em": {
      fontStyle: "italic",
    },
    "& ul, & ol": {
      margin: "0.5em 0",
      paddingLeft: "1.5em",
    },
    "& li": {
      marginBottom: "0.25em",
    },
    "& code": {
      backgroundColor: theme.palette.action.hover,
      padding: "0.1em 0.4em",
      borderRadius: "3px",
      fontSize: "0.9em",
      fontFamily: "monospace",
    },
    "& pre": {
      backgroundColor: theme.palette.action.hover,
      padding: "0.75em",
      borderRadius: "6px",
      overflow: "auto",
      "& code": {
        backgroundColor: "transparent",
        padding: 0,
      },
    },
    "& blockquote": {
      borderLeft: `3px solid ${theme.palette.divider}`,
      marginLeft: 0,
      paddingLeft: "1em",
      color: theme.palette.text.secondary,
    },
    "& a": {
      color: theme.palette.primary.main,
      textDecoration: "underline",
    },
    "& h1, & h2, & h3, & h4, & h5, & h6": {
      margin: "0.5em 0 0.25em",
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
  };

  // Render the appropriate UI based on response type
  const renderContent = () => {
    switch (type) {
      case "portfolio_overview":
        return data ? <PortfolioOverviewUI isFullscreen={isFullscreen} data={data} formatPercentage={formatPercentage} /> : null;
      case "alerts_summary":
        return data ? <AlertsSummaryUI isFullscreen={isFullscreen} data={data} /> : null;
      default:
        return null;
    }
  };

  const hasCustomUI = Boolean(data) && type !== "text_only" && type !== "custom_query";

  return (
    <Paper
      elevation={isFullscreen ? 8 : 0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: isFullscreen ? "none" : 1,
        borderColor: "divider",
        transition: "all 0.3s ease",
        ...(isFullscreen && {
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          borderRadius: 0,
          display: "flex",
          flexDirection: "column",
        }),
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          bgcolor: isFullscreen ? "background.default" : "transparent",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
          <ResponseTypeIcon type={type} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant={isFullscreen ? "subtitle1" : "body2"}
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
            {isFullscreen && (
              <Typography variant="body2" color="text.secondary">
                AI insights based on your data
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {hasCustomUI && (
            <IconButton
              onClick={() => setIsExpanded(!isExpanded)}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          )}
          {hasCustomUI && (
            <IconButton
              onClick={onToggleFullscreen}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          )}
          {isFullscreen && onClose && (
            <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
              <Close />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Summary (always visible in minimized view) */}
      {!isFullscreen && (
        <Box sx={{ px: 1.5, py: 1.25, color: "text.secondary", ...markdownStyles }}>
          <MarkdownContent>{summary}</MarkdownContent>
        </Box>
      )}

      {/* Expandable Content */}
      <Collapse in={isExpanded || isFullscreen}>
        <Box
          sx={{
            p: 1.5,
            pt: isFullscreen ? 1.5 : 0,
            ...(isFullscreen && {
              flex: 1,
              overflow: "auto",
            }),
          }}
        >
          {isFullscreen && (
            <Box sx={{ mb: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: "background.default",
                  mb: 2,
                  color: "text.secondary",
                  ...markdownStyles,
                }}
              >
                <MarkdownContent>{summary}</MarkdownContent>
              </Paper>
            </Box>
          )}

          {renderContent()}

          {/* Sources */}
          {isFullscreen && safe_sources.length > 0 && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                Data Sources
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                <Chip
                  size="small"
                  label={`Confidence ${Math.round((max_confidence ?? 0) * 100)}%`}
                  sx={{ fontSize: "0.65rem", height: 20 }}
                />
                {safe_sources.map((source, i) => (
                  <Chip
                    key={i}
                    size="small"
                    icon={
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: source.confidence >= 0.9 ? customColors.health.green : customColors.health.amber,
                          ml: 1,
                        }}
                      />
                    }
                    label={`${source.name}${source.kind ? ` (${source.kind})` : ""}`}
                    sx={{ fontSize: "0.65rem", height: 20 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

// Response type icon component
function ResponseTypeIcon({ type }: { type: ResponseType }) {
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: 1.25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: `${customColors.accent.cyan}15`,
        color: customColors.accent.cyan,
      }}
    >
      {renderIcon(responseTypeIcons[type] || "info", { fontSize: "small" })}
    </Box>
  );
}

// ============================================
// PORTFOLIO OVERVIEW UI
// ============================================
type PortfolioOverviewData = {
  objectiveCount?: number;
  krCount?: number;
  initiativeCount?: number;
  avgAttainmentPct?: number;
  needsAttention?: number;
  alerts?: {
    criticalCount?: number;
    highCount?: number;
    openCount?: number;
  };
};

function PortfolioOverviewUI({
  isFullscreen,
  data,
  formatPercentage,
}: {
  isFullscreen: boolean;
  data: PortfolioOverviewData;
  formatPercentage: (value: number | null | undefined) => string;
}) {
  const alerts = data.alerts;
  const alertSegments = alerts
    ? [
        { label: "Critical", value: alerts.criticalCount || 0, color: customColors.health.red },
        { label: "High", value: alerts.highCount || 0, color: customColors.health.amber },
        { label: "Open", value: alerts.openCount || 0, color: customColors.accent.cyan },
      ]
    : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: isFullscreen ? 3 : 6 }}>
          <StatCard
            icon="goal"
            label="Objectives"
            value={data.objectiveCount ?? 0}
            variant="default"
          />
        </Grid>
        <Grid size={{ xs: 6, md: isFullscreen ? 3 : 6 }}>
          <StatCard
            icon="analytics"
            label="Key Results"
            value={data.krCount ?? 0}
            variant="default"
          />
        </Grid>
        <Grid size={{ xs: 6, md: isFullscreen ? 3 : 6 }}>
          <StatCard
            icon="trend_up"
            label="Avg Attainment"
            value={formatPercentage(data.avgAttainmentPct)}
            variant="success"
          />
        </Grid>
        <Grid size={{ xs: 6, md: isFullscreen ? 3 : 6 }}>
          <StatCard
            icon="warning"
            label="Needs Attention"
            value={data.needsAttention ?? 0}
            variant={(data.needsAttention ?? 0) > 0 ? "warning" : "success"}
          />
        </Grid>
      </Grid>

      {isFullscreen && alertSegments.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Alert Distribution
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <DonutChart
              segments={alertSegments}
              centerValue={String((alerts?.criticalCount || 0) + (alerts?.highCount || 0) + (alerts?.openCount || 0))}
              centerLabel="Alerts"
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1.5 }}>
            {alertSegments.map((item) => (
              <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: item.color }} />
                <Typography variant="caption">
                  {item.label}: {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

// ============================================
// ALERTS SUMMARY UI
// ============================================
type AlertsSummaryData = {
  criticalCount?: number;
  highCount?: number;
  openCount?: number;
  items?: { name?: string; status?: string; owner?: string }[];
};

function AlertsSummaryUI({ isFullscreen, data }: { isFullscreen: boolean; data: AlertsSummaryData }) {
  const items = data.items ?? [];
  const criticalItems = items.filter((item) => (item.status || "").toLowerCase().includes("red") || (item.status || "").toLowerCase().includes("blocked"));
  const highItems = items.filter((item) => !criticalItems.includes(item));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Grid container spacing={1.5}>
        <Grid size={4}>
          <StatCard icon="critical" label="Critical" value={data.criticalCount ?? 0} variant={(data.criticalCount ?? 0) > 0 ? "danger" : "default"} />
        </Grid>
        <Grid size={4}>
          <StatCard icon="warning" label="High" value={data.highCount ?? 0} variant={(data.highCount ?? 0) > 0 ? "warning" : "default"} />
        </Grid>
        <Grid size={4}>
          <StatCard icon="timeline" label="Open" value={data.openCount ?? 0} />
        </Grid>
      </Grid>

      {criticalItems.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            Critical Blockers
          </Typography>
          {criticalItems.map((item, index) => (
            <AlertBanner
              key={`${item.name}-${index}`}
              severity="critical"
              title={item.name || "Unnamed initiative"}
              description={`${item.status || "Unknown"} • ${item.owner || "Unassigned"}`}
            />
          ))}
        </Box>
      )}

      {highItems.length > 0 && isFullscreen && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            High Priority
          </Typography>
          {highItems.map((item, index) => (
            <AlertBanner
              key={`${item.name}-${index}`}
              severity="warning"
              title={item.name || "Unnamed initiative"}
              description={`${item.status || "Unknown"} • ${item.owner || "Unassigned"}`}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}

export default AIResponseCard;
