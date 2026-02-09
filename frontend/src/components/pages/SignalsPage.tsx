/**
 * Signals Page - Table view with tabs and detail sidebar
 * Populated from real initiative data
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Paper,
  Divider,
  alpha,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useInitiativeData } from "../../context/InitiativeDataContext";
import { customColors } from "../../theme/muiTheme";
import { NotificationModal } from "../common";

// Theme colors: use MUI palette for auto light/dark switching

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
  
  // If it's a string date, normalize it first (replace special dashes with regular hyphens)
  if (typeof serial === "string") {
    // Replace various Unicode dashes with regular hyphen
    const normalized = serial.replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, "-");
    const parsed = new Date(normalized);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  }
  
  // Excel serial number: days since Dec 30, 1899
  if (typeof serial === "number") {
    // Excel's epoch is Dec 30, 1899
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 24 * 60 * 60 * 1000;
    return new Date(excelEpoch.getTime() + serial * msPerDay);
  }
  
  return null;
}

// Helper to calculate due status - simple: On Track if before due date, Behind if after
function calculateDueStatus(dueDate: Date | null): Signal["dueStatus"] {
  if (!dueDate) return "No Date";
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return today <= due ? "On Track" : "Behind";
}

// Format date for display
function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface SignalsPageProps {
  highlightedInitiativeId?: string | null;
  onClearHighlight?: () => void;
}

export function SignalsPage({ highlightedInitiativeId, onClearHighlight }: SignalsPageProps = {}) {
  const { initiatives, initiativeUpdates, objectives, keyResults, milestones, loading, error } = useInitiativeData();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  
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

  // Get the earliest upcoming due date from milestones for an initiative
  const getDueDateForInitiative = (initiativeId: string): Date | null => {
    const initMilestones = milestones.filter(m => m.initiativeId === initiativeId);
    if (initMilestones.length === 0) return null;
    
    // Get all valid due dates and find the earliest one
    const dueDates = initMilestones
      .map(m => excelSerialToDate(m.originalDueDate as string | number | undefined))
      .filter((d): d is Date => d !== null);
    
    if (dueDates.length === 0) return null;
    
    // Return the earliest due date
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
      
      // Calculate age in days from update date
      const updateDate = update.updateDate ? new Date(update.updateDate) : new Date();
      const ageDays = Math.max(1, Math.floor((Date.now() - updateDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Get due date from milestones
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
      
      // Get due date from milestones
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
  const actionNeeded = allSignals.filter(s => s.action === "Take Action");

  // Filter signals based on active tab
  const getFilteredSignals = () => {
    switch (activeTab) {
      case 0: return actionNeeded;
      case 1: return s1Signals;
      case 2: return s2Signals;
      case 3: return []; // Staleness - empty for now
      case 4: return allSignals;
      default: return allSignals;
    }
  };

  const filteredSignals = getFilteredSignals();

  // Auto-select highlighted initiative when navigating from OKR dashboard
  useEffect(() => {
    if (highlightedInitiativeId && allSignals.length > 0) {
      const matchingSignal = allSignals.find(s => s.initiativeId === highlightedInitiativeId);
      if (matchingSignal) {
        setSelectedSignal(matchingSignal);
        // Switch to "All" tab to ensure the signal is visible
        setActiveTab(4);
      }
    }
  }, [highlightedInitiativeId, allSignals.length]);

  if (loading) {
  return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }} color="text.secondary">Loading signals...</Typography>
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

  const severityColors = {
    S1: { bg: `${customColors.health.red}20`, color: customColors.health.red },
    S2: { bg: "#d4a01720", color: "#d4a017" },
  };

  return (
    <Box sx={{ display: "flex", gap: 3, height: "100%" }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Tabs */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 500 },
              "& .Mui-selected": { color: "primary.main" },
              "& .MuiTabs-indicator": { backgroundColor: "primary.main" },
            }}
          >
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
                  <Chip label={0} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  All
                  <Chip label={allSignals.length} size="small" sx={{ height: 20, fontSize: "0.7rem" }} />
                </Box>
              } 
            />
          </Tabs>
        </Paper>

        {/* Table */}
        {filteredSignals.length > 0 ? (
          <TableContainer component={Paper} sx={{ flex: 1 }}>
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
                      // Clear highlight when user manually selects a different signal
                      if (isHighlighted) {
                        onClearHighlight?.();
                      }
                    }}
                    sx={{ 
                      cursor: "pointer",
                      bgcolor: isHighlighted ? `${customColors.health.amber} !important` : undefined,
                      "&:hover": isHighlighted ? { bgcolor: `${customColors.health.amber} !important` } : undefined,
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
          <Card sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CardContent sx={{ textAlign: "center" }}>
              <CheckCircle sx={{ fontSize: "2.5rem", mb: 2, color: customColors.health.green }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                All Clear
              </Typography>
              <Typography color="text.secondary">
                No signals in this category
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Right Sidebar - Signal Context */}
      {selectedSignal && (
        <Paper sx={{ width: 320, p: 3, flexShrink: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: "primary.main" }}>
            Signal Context
                </Typography>

          {/* Signal Badge */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
            <Chip
              label={selectedSignal.severity}
              size="small"
                  sx={{
                fontWeight: 700,
                bgcolor: severityColors[selectedSignal.severity].bg,
                color: severityColors[selectedSignal.severity].color,
              }}
            />
            <Typography sx={{ color: severityColors[selectedSignal.severity].color }}>
              {selectedSignal.label}
                </Typography>
              </Box>

          {/* Entity */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Entity
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedSignal.entityType}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {selectedSignal.entityName}
                </Typography>
              </Box>

          <Divider sx={{ my: 2 }} />

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Description
            </Typography>
            <Typography variant="body2">
              {selectedSignal.description}
            </Typography>
          </Box>

          {/* Due Date & Status */}
          <Box sx={{ display: "flex", gap: 4, mb: 3 }}>
      <Box>
              <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Due Date
        </Typography>
              <Typography 
                variant="h6" 
                sx={{
                  fontWeight: 700,
                  color: selectedSignal.dueStatus === "Behind" ? customColors.health.red : "text.primary",
                }}
              >
                {formatDate(selectedSignal.dueDate)}
                  </Typography>
            </Box>
            <Box>
              <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Status
              </Typography>
              <Chip
                label={selectedSignal.dueStatus}
                size="small"
                sx={{
                  mt: 0.5,
                  fontWeight: 600,
                  bgcolor: selectedSignal.dueStatus === "Behind" ? `${customColors.health.red}20` :
                           selectedSignal.dueStatus === "On Track" ? `${customColors.health.green}20` :
                           "action.hover",
                  color: selectedSignal.dueStatus === "Behind" ? customColors.health.red :
                         selectedSignal.dueStatus === "On Track" ? customColors.health.green :
                         "text.secondary",
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Owner */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
              Owner
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {selectedSignal.owner}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Actions */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleRequestUpdate}
                sx={{
                  bgcolor: "primary.main",
                  textTransform: "none",
                  py: 1.5,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Request an Updated Status
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCommunicateDecision}
                sx={{
                  bgcolor: "primary.main",
                  textTransform: "none",
                  py: 1.5,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Communicate a Decision
              </Button>
            </Box>
          </Box>
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

export default SignalsPage;
