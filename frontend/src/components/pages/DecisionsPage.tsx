/**
 * Decisions Page - Decision Log and Pending Decisions using Material UI
 */

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
} from "@mui/material";
import { ExpandMore, ExpandLess, Add } from "@mui/icons-material";
import { DECISIONS, GOALS } from "../../data/mockData";
import { customColors } from "../../theme/muiTheme";
import { renderIcon, decisionTypeIcons } from "../../utils/icons";

type DecisionFilter = "all" | "open" | "approved" | "rejected" | "deferred";

interface DecisionsPageProps {
  highlightedInitiativeId?: string | null;
  onClearHighlight?: () => void;
}

export function DecisionsPage({ highlightedInitiativeId }: DecisionsPageProps) {
  const [filter, setFilter] = useState<DecisionFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Auto-expand and scroll to highlighted decision
  useEffect(() => {
    if (highlightedInitiativeId) {
      // Find a decision that matches this initiative (by checking relatedGoals or title)
      const matchingDecision = DECISIONS.find(d => 
        d.title.toLowerCase().includes(highlightedInitiativeId.toLowerCase()) ||
        d.relatedGoals.some(g => g.toLowerCase().includes(highlightedInitiativeId.toLowerCase()))
      );
      
      if (matchingDecision) {
        setFilter("all");
        setExpandedId(matchingDecision.id);
        setTimeout(() => {
          cardRefs.current[matchingDecision.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      } else {
        // If no matching decision, just switch to "open" filter to show pending decisions
        setFilter("open");
      }
    }
  }, [highlightedInitiativeId]);

  const filteredDecisions = filter === "all"
    ? DECISIONS
    : DECISIONS.filter((d) => d.status === filter);

  const pendingCount = DECISIONS.filter((d) => d.status === "open").length;

  const filters: { key: DecisionFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "deferred", label: "Deferred" },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Decisions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage strategic decisions across your portfolio
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>
          New Decision
        </Button>
      </Box>

      {/* Summary */}
      {pendingCount > 0 && (
        <Card
          sx={{
            borderLeft: 4,
            borderColor: "primary.main",
            bgcolor: (theme) => theme.palette.mode === "dark" ? "primary.main" : "primary.light",
            opacity: 0.1,
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                opacity: 0.2,
              }}
            >
              ✓
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {pendingCount} Pending
              </Typography>
              <Typography color="text.secondary">
                Decisions awaiting your input
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {filters.map((f) => {
          const count = f.key === "all" ? DECISIONS.length : DECISIONS.filter((d) => d.status === f.key).length;
          return (
            <Chip
              key={f.key}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {f.label}
                  <Chip
                    size="small"
                    label={count}
                    sx={{ height: 18, fontSize: "0.65rem", ml: 0.5 }}
                  />
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
          );
        })}
      </Box>

      {/* Decisions List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredDecisions.map((decision) => {
          const relatedGoals = GOALS.filter((g) => decision.relatedGoals.includes(g.id));
          
          const typeColors: Record<string, string> = {
            scale: customColors.health.green,
            pivot: customColors.accent.amber,
            invest: customColors.accent.cyan,
            divest: customColors.health.red,
            unblock: customColors.accent.primary,
            defer: "text.secondary",
          };

          const statusColors: Record<string, { bg: string; color: string }> = {
            open: { bg: `${customColors.accent.primary}20`, color: customColors.accent.primary },
            approved: { bg: `${customColors.health.green}20`, color: customColors.health.green },
            rejected: { bg: `${customColors.health.red}20`, color: customColors.health.red },
            deferred: { bg: "action.hover", color: "text.secondary" },
          };

          const isHighlighted = highlightedInitiativeId && (
            decision.title.toLowerCase().includes(highlightedInitiativeId.toLowerCase()) ||
            decision.relatedGoals.some(g => g.toLowerCase().includes(highlightedInitiativeId.toLowerCase()))
          );

          return (
            <Card 
              key={decision.id}
              ref={(el: HTMLDivElement | null) => { cardRefs.current[decision.id] = el; }}
              sx={{
                border: isHighlighted ? 2 : undefined,
                borderColor: isHighlighted ? "primary.main" : undefined,
                boxShadow: isHighlighted ? `0 0 12px ${customColors.accent.primary}40` : undefined,
              }}
            >
              <CardContent
                onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {/* Type Icon */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 40,
                    height: 40,
                    borderRadius: 3,
                    bgcolor: `${typeColors[decision.type]}20`,
                    color: typeColors[decision.type],
                    flexShrink: 0,
                  }}
                >
                  {renderIcon(decisionTypeIcons[decision.type] || "check", { fontSize: "small" })}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Chip
                      label={decision.status}
                      size="small"
                      sx={{
                        textTransform: "capitalize",
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        bgcolor: statusColors[decision.status]?.bg,
                        color: statusColors[decision.status]?.color,
                      }}
                    />
                    <Chip
                      label={decision.type}
                      size="small"
                      sx={{ textTransform: "capitalize", fontSize: "0.7rem" }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {decision.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {decision.description}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1.5 }}>
                    {relatedGoals.map((goal) => (
                      <Typography key={goal.id} variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box component="span" sx={{ display: "flex", color: "text.secondary" }}>
                          {renderIcon(goal.icon, { fontSize: "inherit" })}
                        </Box>
                        {goal.name}
                      </Typography>
                    ))}
                  </Box>
                </Box>

                <IconButton size="small">
                  {expandedId === decision.id ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </CardContent>

              {/* Expanded Content */}
              <Collapse in={expandedId === decision.id}>
                <Box sx={{ px: 3, pb: 3, borderTop: 1, borderColor: "divider" }}>
                  {/* Context */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Context
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {decision.context}
                    </Typography>
                  </Box>

                  {/* Options */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Options
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {decision.options.map((option, i) => (
                        <Box key={i} sx={{ flex: "1 1 30%", minWidth: 150 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderColor: decision.selectedOption === option.label
                                ? "primary.main"
                                : "divider",
                              bgcolor: decision.selectedOption === option.label
                                ? "primary.main"
                                : "transparent",
                              opacity: decision.selectedOption === option.label ? 0.1 : 1,
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {option.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.description}
                            </Typography>
                          </Paper>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Rationale (if decided) */}
                  {decision.rationale && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Rationale
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {decision.rationale}
                      </Typography>
                    </Box>
                  )}

                  {/* Metadata */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Created by {decision.createdBy}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(decision.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  {decision.status === "open" && (
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                      <Button variant="outlined" sx={{ flex: 1 }}>
                        Request More Info
                      </Button>
                      <Button variant="contained" sx={{ flex: 1 }}>
                        Make Decision
                      </Button>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Box>

      {filteredDecisions.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography color="text.secondary">
              No decisions found for this filter.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default DecisionsPage;
