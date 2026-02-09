/**
 * Insights Page - AI-Generated Insights and Trend Analysis using Material UI
 */

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { AI_INSIGHTS, GOALS, DATA_FRESHNESS, getDataFreshnessLabel } from "../../data/mockData";
import { customColors } from "../../theme/muiTheme";
import { renderIcon, IconKey } from "../../utils/icons";

type InsightFilter = "all" | "summary" | "trend" | "anomaly" | "recommendation" | "prediction";

export function InsightsPage() {
  const [filter, setFilter] = useState<InsightFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredInsights = filter === "all" 
    ? AI_INSIGHTS 
    : AI_INSIGHTS.filter((i) => i.type === filter);

  const filters: { key: InsightFilter; label: string; icon: IconKey }[] = [
    { key: "all", label: "All", icon: "search" },
    { key: "summary", label: "Summaries", icon: "analytics" },
    { key: "trend", label: "Trends", icon: "trend_up" },
    { key: "anomaly", label: "Anomalies", icon: "warning" },
    { key: "recommendation", label: "Recommendations", icon: "recommendation" },
    { key: "prediction", label: "Predictions", icon: "prediction" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            AI Insights
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-generated analysis and recommendations for your portfolio
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {getDataFreshnessLabel(DATA_FRESHNESS.aiInsights)}
        </Typography>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {filters.map((f) => (
          <Chip
            key={f.key}
            icon={renderIcon(f.icon, { fontSize: "small" })}
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {f.label}
                {f.key !== "all" && (
                  <Chip
                    size="small"
                    label={AI_INSIGHTS.filter((i) => i.type === f.key).length}
                    sx={{ height: 18, fontSize: "0.65rem", ml: 0.5 }}
                  />
                )}
              </Box>
            }
            onClick={() => setFilter(f.key)}
            sx={{
              px: 1,
              bgcolor: filter === f.key ? "primary.main" : "background.paper",
              color: filter === f.key ? "primary.contrastText" : "text.primary",
              border: 1,
              borderColor: filter === f.key ? "primary.main" : "divider",
              "&:hover": {
                bgcolor: filter === f.key ? "primary.dark" : "action.hover",
              },
            }}
          />
        ))}
      </Box>

      {/* Insights List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredInsights.map((insight) => {
          const relatedGoals = GOALS.filter((g) => insight.relatedGoals.includes(g.id));
          const trendColors = {
            positive: customColors.health.green,
            negative: customColors.health.red,
            neutral: customColors.health.amber,
          };

          return (
            <Card
              key={insight.id}
              sx={{
                borderLeft: 4,
                borderColor: trendColors[insight.trend],
              }}
            >
              <CardContent
                onClick={() => setExpandedId(expandedId === insight.id ? null : insight.id)}
                sx={{ cursor: "pointer" }}
              >
                {/* Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1 }}>
                      <Chip
                        label={insight.type}
                        size="small"
                        sx={{ textTransform: "capitalize", fontSize: "0.7rem" }}
                      />
                      <Chip
                        label={`${insight.impact} impact`}
                        size="small"
                        sx={{
                          textTransform: "uppercase",
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          bgcolor: insight.impact === "high"
                            ? `${customColors.accent.rose}20`
                            : insight.impact === "medium"
                            ? `${customColors.accent.amber}20`
                            : "action.hover",
                          color: insight.impact === "high"
                            ? customColors.accent.rose
                            : insight.impact === "medium"
                            ? customColors.accent.amber
                            : "text.secondary",
                        }}
                      />
                      <Typography variant="caption" sx={{ color: customColors.accent.cyan }}>
                        {insight.relevanceScore}% relevant
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {insight.summary}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ alignSelf: "flex-start" }}>
                    {expandedId === insight.id ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>

                {/* So What - Always Visible */}
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="body2">
                    <Box component="span" sx={{ fontWeight: 600, color: customColors.accent.cyan }}>
                      So what?
                    </Box>{" "}
                    <Box component="span" sx={{ color: "text.secondary" }}>
                      {insight.soWhat}
                    </Box>
                  </Typography>
                </Box>
              </CardContent>

              {/* Expanded Content */}
              <Collapse in={expandedId === insight.id}>
                <Box sx={{ px: 3, pb: 3, borderTop: 1, borderColor: "divider" }}>
                  {/* Related Goals */}
                  {relatedGoals.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        Related Goals
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {relatedGoals.map((goal) => (
                          <Chip
                            key={goal.id}
                            icon={renderIcon(goal.icon, { fontSize: "small" })}
                            label={goal.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {/* Tags */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Tags
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {insight.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={`#${tag}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ))}
                      {insight.suggestedTags.map((tag) => (
                        <Chip
                          key={tag}
                          label={`+${tag}`}
                          size="small"
                          sx={{
                            fontSize: "0.7rem",
                            bgcolor: `${customColors.accent.cyan}15`,
                            color: customColors.accent.cyan,
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Sources */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Sources
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {insight.sources.map((source) => (
                        <Chip
                          key={source.id}
                          size="small"
                          icon={
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: source.confidence >= 0.9
                                  ? customColors.health.green
                                  : customColors.health.amber,
                                ml: 1,
                              }}
                            />
                          }
                          label={`${source.name} (${Math.round(source.confidence * 100)}%)`}
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Timestamps */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Generated {new Date(insight.generatedAt).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Expires {new Date(insight.expiresAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Box>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.secondary">
              No insights found for this filter.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default InsightsPage;
