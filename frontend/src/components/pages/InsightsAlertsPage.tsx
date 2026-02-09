/**
 * Insights & Alerts Page - Two-section layout
 * Alerts in table format (deterministic data) at top
 * AI Insights as cards (AI-generated content) below
 */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Paper,
  Divider,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  alpha,
} from "@mui/material";
import { 
  CheckCircle, 
  ExpandMore, 
  ExpandLess,
  AutoAwesome,
  Close,
} from "@mui/icons-material";
import { useInitiativeData } from "../../context/InitiativeDataContext";
import { AI_INSIGHTS, GOALS, DATA_FRESHNESS, getDataFreshnessLabel } from "../../data/mockData";
import { customColors } from "../../theme/muiTheme";
import { NotificationModal } from "../common";
import { renderIcon } from "../../utils/icons";

// Signal type definition
interface Signal {
  id: string;
  type: "blocker" | "risk" | "staleness" | "decision";
  severity: "S1" | "S2";
  label: string;
  ageDays: number;
  entityType: "Initiative" | "KR";
  entityName: string;
  description: string;
  sla: string;
  slaOverdue: boolean;
  owner: string;
  action: string;
  initiativeId: string;
  objectiveName?: string;
  status?: string;
  dueDate: Date | null;
  dueStatus: "On Track" | "Behind" | "No Date";
}

// Convert Excel serial number or date string to JS Date
function excelSerialToDate(serial: number | string | undefined): Date | null {
  if (serial === undefined || serial === null || serial === "") return null;
  
  if (typeof serial === "string") {
    const normalized = serial.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
    const parsed = new Date(normalized);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  }
  
  if (typeof serial === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + serial * msPerDay);
  }
  
  return null;
}

function calculateDueStatus(dueDate: Date | null): Signal["dueStatus"] {
  if (!dueDate) return "No Date";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return today <= due ? "On Track" : "Behind";
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface InsightsAlertsPageProps {
  highlightedInitiativeId?: string | null;
  onClearHighlight?: () => void;
}

export function InsightsAlertsPage({ highlightedInitiativeId, onClearHighlight }: InsightsAlertsPageProps) {
  const { initiatives, initiativeUpdates, objectives, keyResults, milestones, loading, error } = useInitiativeData();
  
  // Alerts tab state
  const [alertsTab, setAlertsTab] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  
  // Insights expansion state
  const [expandedInsightIds, setExpandedInsightIds] = useState<Set<string>>(new Set());
  const [selectedInsight, setSelectedInsight] = useState<typeof AI_INSIGHTS[0] | null>(null);
  
  // Notification modal state
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [notificationMode, setNotificationMode] = useState<"request_update" | "communicate_decision">("request_update");

  const handleRequestUpdate = () => {
    setNotificationMode("request_update");
    setNotificationModalOpen(true);
  };

  const handleCommunicateDecision = () => {
    setNotificationMode("communicate_decision");
    setNotificationModalOpen(true);
  };

  const toggleInsightExpanded = (id: string) => {
    setExpandedInsightIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Get the earliest upcoming due date from milestones for an initiative
  const getDueDateForInitiative = (initiativeId: string): Date | null => {
    const initMilestones = milestones.filter(m => m.initiativeId === initiativeId);
    if (initMilestones.length === 0) return null;
    
    const dueDates = initMilestones
      .map(m => excelSerialToDate(m.originalDueDate as string | number | undefined))
      .filter((d): d is Date => d !== null);
    
    if (dueDates.length === 0) return null;
    
    return dueDates.reduce((earliest, current) => 
      current < earliest ? current : earliest
    );
  };

  // Build signals from real data
  const buildSignals = (): Signal[] => {
    const signals: Signal[] = [];

    // S1 - Blockers from updates with blockers
    const updatesWithBlockers = initiativeUpdates.filter(u => u.blockers && u.blockers.trim() !== "");
    updatesWithBlockers.forEach(update => {
      const initiative = initiatives.find(i => i.initiativeId === update.initiativeId);
      const kr = keyResults.find(k => k.keyResultId === initiative?.keyResultId);
      const objective = objectives.find(o => o.objectiveId === kr?.objectiveId);
      
      const updateDate = update.updateDate ? new Date(update.updateDate) : new Date();
      const ageDays = Math.max(1, Math.floor((Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24)));
      const dueDate = getDueDateForInitiative(update.initiativeId);
      const dueStatus = calculateDueStatus(dueDate);
      
      signals.push({
        id: update.id,
        type: "blocker",
        severity: "S1",
        label: "Blocker",
        ageDays,
        entityType: "Initiative",
        entityName: initiative?.initiativeName || update.initiativeName || "Unknown",
        description: update.blockers || "",
        sla: ageDays > 2 ? "48h (overdue)" : "48h",
        slaOverdue: ageDays > 2,
        owner: initiative?.initiativeOwner || update.updateCreatedBy || "Unknown",
        action: "Take Action",
        initiativeId: update.initiativeId,
        objectiveName: objective?.objectiveName,
        status: initiative?.status,
        dueDate,
        dueStatus,
      });
    });

    // S2 - Risks from critical initiatives
    const criticalInitiatives = initiatives.filter(i => 
      i.status?.toLowerCase().includes("critical")
    );
    criticalInitiatives.forEach(initiative => {
      const kr = keyResults.find(k => k.keyResultId === initiative.keyResultId);
      const objective = objectives.find(o => o.objectiveId === kr?.objectiveId);
      const latestUpdate = initiativeUpdates
        .filter(u => u.initiativeId === initiative.initiativeId)
        .sort((a, b) => (b.updateDate || "").localeCompare(a.updateDate || ""))[0];
      
      const updateDate = latestUpdate?.updateDate ? new Date(latestUpdate.updateDate) : new Date();
      const ageDays = Math.max(1, Math.floor((Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24)));
      const dueDate = getDueDateForInitiative(initiative.initiativeId);
      const dueStatus = calculateDueStatus(dueDate);
      
      signals.push({
        id: initiative.id,
        type: "risk",
        severity: "S2",
        label: "Risk",
        ageDays,
        entityType: "Initiative",
        entityName: initiative.initiativeName,
        description: latestUpdate?.progress || initiative.initiativeDescription || "Critical status",
        sla: "5bd",
        slaOverdue: ageDays > 5,
        owner: initiative.initiativeOwner || "Unknown",
        action: "Acknowledge",
        initiativeId: initiative.initiativeId,
        objectiveName: objective?.objectiveName,
        status: initiative.status,
        dueDate,
        dueStatus,
      });
    });

    return signals;
  };

  const allSignals = buildSignals();
  const s1Signals = allSignals.filter(s => s.severity === "S1");
  const s2Signals = allSignals.filter(s => s.severity === "S2");
  const staleSignals = allSignals.filter(s => s.type === "staleness");
  const actionNeeded = allSignals.filter(s => s.action === "Take Action");

  // Filter signals based on active tab
  const getFilteredSignals = () => {
    switch (alertsTab) {
      case 0: return allSignals;
      case 1: return actionNeeded;
      case 2: return s1Signals;
      case 3: return s2Signals;
      case 4: return staleSignals;
      default: return allSignals;
    }
  };

  const filteredSignals = getFilteredSignals();

  // Auto-select highlighted initiative when navigating from OKR Dashboard "Take Action"
  useEffect(() => {
    if (highlightedInitiativeId && allSignals.length > 0) {
      const matchingSignal = allSignals.find(s => s.initiativeId === highlightedInitiativeId);
      if (matchingSignal) {
        setSelectedSignal(matchingSignal);
        setSelectedInsight(null);
        // Switch to "All" tab (index 0) to ensure the signal is visible
        setAlertsTab(0);
      }
    }
  }, [highlightedInitiativeId, allSignals.length]);

  const severityColors = {
    S1: { bg: `${customColors.health.red}20`, color: customColors.health.red },
    S2: { bg: "#d4a01720", color: "#d4a017" },
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }} color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ border: 2, borderColor: customColors.health.red }}>
        <CardContent>
          <Typography color="error">Failed to load data: {error}</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: 3, height: "100%" }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
        
        {/* ==================== ALERTS SECTION ==================== */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Alerts
              </Typography>
              <Chip 
                label={allSignals.length} 
                size="small" 
                sx={{ 
                  height: 22, 
                  bgcolor: allSignals.length > 0 ? `${customColors.health.red}20` : undefined,
                  color: allSignals.length > 0 ? customColors.health.red : undefined,
                  fontWeight: 600,
                }} 
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              
            </Typography>
          </Box>

          {/* Alerts Tabs */}
          <Paper sx={{ mb: 2 }}>
            <Tabs
              value={alertsTab}
              onChange={(_, v) => setAlertsTab(v)}
              sx={{
                "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
                "& .Mui-selected": { color: "primary.main" },
                "& .MuiTabs-indicator": { backgroundColor: "primary.main" },
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    All
                    <Chip label={allSignals.length} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Action Needed
                    <Chip label={actionNeeded.length} size="small" sx={{ height: 20, fontSize: "0.7rem", bgcolor: `${customColors.health.red}20`, color: customColors.health.red }} />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    S1 Blockers
                    <Chip label={s1Signals.length} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    S2 Risks
                    <Chip label={s2Signals.length} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    Staleness
                    <Chip label={staleSignals.length} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                  </Box>
                } 
              />
            </Tabs>
          </Paper>

          {/* Alerts Table */}
          {filteredSignals.length > 0 ? (
            <TableContainer component={Paper}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem" }}>Signal</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem" }}>Entity</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem" }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem" }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem" }}>Owner</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: "0.7rem" }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSignals.map((signal) => {
                    const isHighlighted = highlightedInitiativeId === signal.initiativeId;
                    return (
                    <TableRow
                      key={signal.id}
                      hover
                      selected={selectedSignal?.id === signal.id}
                      onClick={() => {
                        setSelectedSignal(signal);
                        setSelectedInsight(null);
                        // Clear highlight when user manually selects a different signal
                        if (isHighlighted) {
                          onClearHighlight?.();
                        }
                      }}
                      sx={{ 
                        cursor: "pointer",
                        bgcolor: isHighlighted ? `${customColors.health.amber}40 !important` : undefined,
                        "&:hover": isHighlighted ? { bgcolor: `${customColors.health.amber}50 !important` } : undefined,
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={signal.severity}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              bgcolor: severityColors[signal.severity].bg,
                              color: severityColors[signal.severity].color,
                            }}
                          />
                          <Typography variant="body2" sx={{ color: severityColors[signal.severity].color }}>
                            {signal.label}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {signal.entityType}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {signal.entityName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 250 }}>
                        <Typography variant="body2" noWrap title={signal.description}>
                          {signal.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: signal.dueStatus === "Behind" ? customColors.health.red : "text.primary",
                            fontWeight: signal.dueStatus === "Behind" ? 600 : 400,
                          }}
                        >
                          {formatDate(signal.dueDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={signal.dueStatus}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.65rem",
                            fontWeight: 600,
                            bgcolor: signal.dueStatus === "Behind" ? `${customColors.health.red}20` :
                                     signal.dueStatus === "On Track" ? `${customColors.health.green}20` :
                                     "action.hover",
                            color: signal.dueStatus === "Behind" ? customColors.health.red :
                                   signal.dueStatus === "On Track" ? customColors.health.green :
                                   "text.secondary",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {signal.owner}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant={signal.action === "Take Action" ? "contained" : "outlined"}
                          size="small"
                          sx={{
                            textTransform: "none",
                            fontSize: "0.75rem",
                            bgcolor: signal.action === "Take Action" ? "primary.main" : "transparent",
                            borderColor: "primary.main",
                            color: signal.action === "Take Action" ? "white" : "primary.main",
                            "&:hover": {
                              bgcolor: signal.action === "Take Action" ? "primary.dark" : (theme) => alpha(theme.palette.primary.main, 0.06),
                            },
                          }}
                        >
                          {signal.action}
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Card sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <CheckCircle sx={{ fontSize: "2rem", mb: 1, color: customColors.health.green }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>All Clear</Typography>
                <Typography variant="body2" color="text.secondary">No alerts in this category</Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* ==================== AI INSIGHTS SECTION ==================== */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AutoAwesome sx={{ color: customColors.accent.cyan }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                AI Insights
              </Typography>
              <Chip 
                label={AI_INSIGHTS.length} 
                size="small" 
                sx={{ 
                  height: 22,
                  bgcolor: `${customColors.accent.cyan}20`,
                  color: customColors.accent.cyan,
                  fontWeight: 600,
                }} 
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              {getDataFreshnessLabel(DATA_FRESHNESS.aiInsights)} • AI-generated analysis
            </Typography>
          </Box>

          {/* Insights Cards */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {AI_INSIGHTS.map((insight) => {
              const trendColors = {
                positive: customColors.health.green,
                negative: customColors.health.red,
                neutral: customColors.health.amber,
              };
              const isExpanded = expandedInsightIds.has(insight.id);
              const isSelected = selectedInsight?.id === insight.id;

              return (
                <Card
                  key={insight.id}
                  onClick={() => {
                    setSelectedInsight(insight);
                    setSelectedSignal(null);
                  }}
                  sx={{
                    borderLeft: 4,
                    borderColor: trendColors[insight.trend],
                    cursor: "pointer",
                    bgcolor: isSelected ? (theme) => alpha(theme.palette.primary.main, 0.08) : undefined,
                    "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <AutoAwesome sx={{ fontSize: "1rem", color: customColors.accent.cyan }} />
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
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {insight.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {insight.summary}
                        </Typography>
                        
                        {/* So What - Always Visible */}
                        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: "background.default" }}>
                          <Typography variant="body2">
                            <Box component="span" sx={{ fontWeight: 600, color: customColors.accent.cyan }}>
                              So what?
                            </Box>{" "}
                            <Box component="span" sx={{ color: "text.secondary" }}>
                              {insight.soWhat}
                            </Box>
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); toggleInsightExpanded(insight.id); }}
                        sx={{ alignSelf: "flex-start" }}
                      >
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>
                    
                    {/* Expanded Content */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {insight.tags.slice(0, 5).map((tag) => (
                            <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
                          ))}
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* ==================== RIGHT SIDEBAR - DETAIL PANEL ==================== */}
      {(selectedSignal || selectedInsight) && (
        <Paper sx={{ width: 320, p: 3, flexShrink: 0, overflow: "auto", position: "relative" }}>
          {/* Close Button */}
          <IconButton
            size="small"
            onClick={() => {
              setSelectedSignal(null);
              setSelectedInsight(null);
            }}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                bgcolor: "action.hover",
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
          {selectedSignal && (
            <SignalDetailPanel
              signal={selectedSignal}
              severityColors={severityColors}
              onRequestUpdate={handleRequestUpdate}
              onCommunicateDecision={handleCommunicateDecision}
            />
          )}
          {selectedInsight && (
            <InsightDetailPanel insight={selectedInsight} />
          )}
        </Paper>
      )}

      {/* Notification Modal */}
      {selectedSignal && (
        <NotificationModal
          open={notificationModalOpen}
          onClose={() => setNotificationModalOpen(false)}
          mode={notificationMode}
          entityName={selectedSignal.entityName}
          entityId={selectedSignal.initiativeId}
          entityType={selectedSignal.entityType === "Initiative" ? "initiative" : "key_result"}
          signalType={selectedSignal.type}
          signalSeverity={selectedSignal.severity}
          signalDescription={selectedSignal.description}
          objectiveName={selectedSignal.objectiveName}
          owner={selectedSignal.owner}
          status={selectedSignal.status}
          ageDays={selectedSignal.ageDays}
        />
      )}
    </Box>
  );
}

// Signal Detail Panel
interface SignalDetailPanelProps {
  signal: Signal;
  severityColors: Record<string, { bg: string; color: string }>;
  onRequestUpdate: () => void;
  onCommunicateDecision: () => void;
}

function SignalDetailPanel({ signal, severityColors, onRequestUpdate, onCommunicateDecision }: SignalDetailPanelProps) {
  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "primary.main" }}>
        Signal Context
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <Chip
          label={signal.severity}
          size="small"
          sx={{
            fontWeight: 700,
            bgcolor: severityColors[signal.severity].bg,
            color: severityColors[signal.severity].color,
          }}
        />
        <Typography sx={{ color: severityColors[signal.severity].color }}>
          {signal.label}
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Entity
        </Typography>
        <Typography variant="caption" color="text.secondary">{signal.entityType}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>{signal.entityName}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Description
        </Typography>
        <Typography variant="body2">{signal.description}</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            Due Date
          </Typography>
          <Typography 
            variant="h6" 
            sx={{
              fontWeight: 700,
              color: signal.dueStatus === "Behind" ? customColors.health.red : "text.primary",
            }}
          >
            {formatDate(signal.dueDate)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
            Status
          </Typography>
          <Chip
            label={signal.dueStatus}
            size="small"
            sx={{
              mt: 0.5,
              fontWeight: 600,
              bgcolor: signal.dueStatus === "Behind" ? `${customColors.health.red}20` :
                       signal.dueStatus === "On Track" ? `${customColors.health.green}20` : "action.hover",
              color: signal.dueStatus === "Behind" ? customColors.health.red :
                     signal.dueStatus === "On Track" ? customColors.health.green : "text.secondary",
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
          Owner
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>{signal.owner}</Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Actions</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button variant="contained" fullWidth onClick={onRequestUpdate} sx={{ py: 1.5 }}>
            Request an Updated Status
          </Button>
          <Button variant="contained" fullWidth onClick={onCommunicateDecision} sx={{ py: 1.5 }}>
            Communicate a Decision
          </Button>
        </Box>
      </Box>
    </>
  );
}

// Insight Detail Panel
interface InsightDetailPanelProps {
  insight: typeof AI_INSIGHTS[0];
}

function InsightDetailPanel({ insight }: InsightDetailPanelProps) {
  const relatedGoals = GOALS.filter((g) => insight.relatedGoals.includes(g.id));
  const trendColors = {
    positive: customColors.health.green,
    negative: customColors.health.red,
    neutral: customColors.health.amber,
  };

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "primary.main" }}>
        Insight Details
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
        <AutoAwesome sx={{ color: customColors.accent.cyan }} />
        <Chip
          label={insight.type}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
        <Chip
          label={insight.trend}
          size="small"
          sx={{
            bgcolor: `${trendColors[insight.trend]}20`,
            color: trendColors[insight.trend],
          }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {insight.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {insight.summary}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3, p: 2, borderRadius: 2, bgcolor: "background.default" }}>
        <Typography variant="body2">
          <Box component="span" sx={{ fontWeight: 600, color: customColors.accent.cyan }}>
            So what?
          </Box>{" "}
          <Box component="span" sx={{ color: "text.secondary" }}>
            {insight.soWhat}
          </Box>
        </Typography>
      </Box>

      {relatedGoals.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
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
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
          Tags
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
          {insight.tags.map((tag) => (
            <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1 }}>
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
                    bgcolor: source.confidence >= 0.9 ? customColors.health.green : customColors.health.amber,
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

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          Generated {new Date(insight.generatedAt).toLocaleDateString()}
        </Typography>
        <Typography variant="caption" sx={{ color: customColors.accent.cyan }}>
          {insight.relevanceScore}% relevant
        </Typography>
      </Box>
    </>
  );
}

export default InsightsAlertsPage;
