/**
 * Reports Page - Auto-generated reports and visual summaries using Material UI
 */

import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Paper,
} from "@mui/material";
import { Add, Download, Visibility, AutoAwesome } from "@mui/icons-material";
import { GOALS, PORTFOLIO_SUMMARY, AI_INSIGHTS, REPORTS, DATA_FRESHNESS, getDataFreshnessLabel, formatPercentage } from "../../data/mockData";
import { customColors } from "../../theme/muiTheme";
import { renderIcon } from "../../utils/icons";

export function ReportsPage() {
  const typeColors: Record<string, string> = {
    "auto-generated": customColors.accent.cyan,
    "on-demand": customColors.accent.purple,
    "scheduled": customColors.accent.primary,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Auto-generated reports and visual summaries
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>
          Generate New Report
        </Button>
      </Box>

      {/* Quick Stats Visualization */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Clinical AI Program at a Glance
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {/* Goal Health Distribution */}
            <Box sx={{ flex: "1 1 45%", minWidth: 280 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Program Goal Health
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                    {/* Green segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={customColors.health.green}
                      strokeWidth="20"
                      strokeDasharray={`${(PORTFOLIO_SUMMARY.goalsHealth.green / PORTFOLIO_SUMMARY.totalGoals) * 251.2} 251.2`}
                    />
                    {/* Amber segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={customColors.health.amber}
                      strokeWidth="20"
                      strokeDasharray={`${(PORTFOLIO_SUMMARY.goalsHealth.amber / PORTFOLIO_SUMMARY.totalGoals) * 251.2} 251.2`}
                      strokeDashoffset={`${-(PORTFOLIO_SUMMARY.goalsHealth.green / PORTFOLIO_SUMMARY.totalGoals) * 251.2}`}
                    />
                    {/* Red segment */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={customColors.health.red}
                      strokeWidth="20"
                      strokeDasharray={`${(PORTFOLIO_SUMMARY.goalsHealth.red / PORTFOLIO_SUMMARY.totalGoals) * 251.2} 251.2`}
                      strokeDashoffset={`${-((PORTFOLIO_SUMMARY.goalsHealth.green + PORTFOLIO_SUMMARY.goalsHealth.amber) / PORTFOLIO_SUMMARY.totalGoals) * 251.2}`}
                    />
                  </svg>
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: customColors.health.green }} />
                    <Typography variant="body2">On Track: {PORTFOLIO_SUMMARY.goalsHealth.green}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: customColors.health.amber }} />
                    <Typography variant="body2">Watch: {PORTFOLIO_SUMMARY.goalsHealth.amber}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: customColors.health.red }} />
                    <Typography variant="body2">At Risk: {PORTFOLIO_SUMMARY.goalsHealth.red}</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* KR Progress Bars */}
            <Box sx={{ flex: "1 1 45%", minWidth: 280 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                KR Attainment by Program Area
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {GOALS.slice(0, 4).map((goal) => {
                  const avgAttainment = goal.krs.reduce((acc, kr) => acc + kr.attainment, 0) / goal.krs.length;
                  const color = avgAttainment >= 0.9 
                    ? customColors.health.green 
                    : avgAttainment >= 0.7 
                    ? customColors.health.amber 
                    : customColors.health.red;
                  
                  return (
                    <Box key={goal.id}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Box component="span" sx={{ display: "flex", color: "text.secondary" }}>
                            {renderIcon(goal.icon, { fontSize: "inherit" })}
                          </Box>
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {goal.name}
                          </span>
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color }}>
                          {formatPercentage(avgAttainment)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={avgAttainment * 100}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          bgcolor: "action.hover",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 1,
                            bgcolor: color,
                          },
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* AI Summary */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: "background.default",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AutoAwesome sx={{ color: customColors.accent.cyan, fontSize: "1rem" }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                AI Summary
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {AI_INSIGHTS[0]?.summary || "Clinical AI program performing at 92% attainment with positive momentum."}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <Box component="span" sx={{ fontWeight: 600, color: customColors.accent.cyan }}>
                So what?
              </Box>{" "}
              <Box component="span" sx={{ color: "text.secondary" }}>
                {AI_INSIGHTS[0]?.soWhat || "You're on track to hit 5 of 6 strategic goals."}
              </Box>
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5 }}>
              <Chip
                size="small"
                icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: customColors.health.green, ml: 1 }} />}
                label="Clinical AI Analytics"
                sx={{ fontSize: "0.7rem" }}
              />
              <Typography variant="caption" color="text.secondary">
                {getDataFreshnessLabel(DATA_FRESHNESS.portfolioSummary)}
              </Typography>
            </Box>
          </Paper>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Available Reports
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          {REPORTS.map((report) => (
            <Box key={report.id} sx={{ flex: "1 1 45%", minWidth: 300 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={report.type}
                        size="small"
                        sx={{
                          fontSize: "0.7rem",
                          bgcolor: `${typeColors[report.type]}20`,
                          color: typeColors[report.type],
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {report.frequency}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {report.pages} pages
                    </Typography>
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {report.description}
                  </Typography>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Generated {new Date(report.lastGenerated).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility fontSize="small" />}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Download fontSize="small" />}
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default ReportsPage;
