/**
 * Landing Page - Executive Dashboard Landing View
 * 
 * Simplified OKR Dashboard - tabs removed per feedback
 * Uses Excel data from initiatives.xlsx
 * Hierarchy: Objective -> Key Result -> Initiative -> Milestone/Update
 */

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Collapse,
  Modal,
  Fade,
  Backdrop,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  ChevronRight,
  ExpandMore,
  ArrowBack,
  Add,
  Edit,
  Close,
  Check,
  Warning,
  Dashboard,
  TrendingUp,
  RocketLaunch,
  CheckCircle,
  RadioButtonUnchecked,
  Error as ErrorIcon,
  Business,
} from "@mui/icons-material";
import { Dashboard as ValueView } from "../../pages/Dashboard";
import { SBUView } from "../../pages/SBUView";
import { useTheme } from "../../context/ThemeContext";
import { customColors } from "../../theme/muiTheme";
import { useInitiativeData } from "@/context/InitiativeDataContext";
import type { Objective, KeyResult, Initiative, Milestone, InitiativeUpdate } from "@/types";

type FilterType = "all" | "on-track" | "at-risk" | "off-track";

// Status colors
const STATUS_COLORS = {
  green: "#03cc54",
  amber: "#e0a73f",
  red: "#ba0000",
} as const;

type StatusType = "green" | "amber" | "red";

// Get status color from status string
function getStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case "green":
    case "on track":
      return STATUS_COLORS.green;
    case "amber":
    case "at risk":
      return STATUS_COLORS.amber;
    case "red":
    case "off track":
    case "blocked":
    case "critical":
      return STATUS_COLORS.red;
    default:
      return STATUS_COLORS.green;
  }
}

// Calculate status from attainment percentage (for KRs)
// ≥70% = Green, 40-69% = Amber, <40% = Red
function calculateStatusFromAttainment(attainment: number): StatusType {
  if (attainment >= 70) return "green";
  if (attainment >= 40) return "amber";
  return "red";
}

// Calculate status from confidence score (for Initiatives)
// Confidence 4-5 = Green, 3 = Amber, 1-2 = Red
function calculateStatusFromConfidence(confidence?: number): StatusType {
  if (!confidence) return "amber"; // Default to amber if no confidence
  if (confidence >= 4) return "green";
  if (confidence >= 3) return "amber";
  return "red";
}

// Get KR status - calculated from attainment
function getKRStatus(current?: number | string, target?: number | string, baseline?: number | string): StatusType {
  const attainment = calculateAttainment(current, target, baseline);
  return calculateStatusFromAttainment(attainment);
}

// Get Initiative status - calculated from confidence
function getInitiativeStatus(confidence?: number): StatusType {
  return calculateStatusFromConfidence(confidence);
}

// Parse a numeric value, stripping currency symbols and commas
function parseNumericValue(value?: number | string): number {
  if (value === undefined || value === null || value === "") return NaN;
  if (typeof value === "number") return value;
  // Strip $, commas, M/B suffixes and parse
  const cleaned = String(value)
    .replace(/[$,]/g, "")
    .replace(/M$/i, "000000")
    .replace(/B$/i, "000000000")
    .replace(/%$/i, "")
    .trim();
  return parseFloat(cleaned);
}

// Calculate attainment percentage using baseline
// Formula: (current - baseline) / (target - baseline) * 100
function calculateAttainment(current?: number | string, target?: number | string, baseline?: number | string): number {
  const c = parseNumericValue(current);
  const t = parseNumericValue(target);
  const b = parseNumericValue(baseline);
  
  if (isNaN(c)) return 0;
  if (isNaN(t)) return 0;
  
  // If baseline is provided, use the baseline formula
  if (!isNaN(b)) {
    const range = t - b; // Total distance from baseline to target
    if (range === 0) return c === t ? 100 : 0; // Avoid division by zero
    const progress = c - b; // How far we've moved from baseline
    const attainment = (progress / range) * 100;
    return Math.min(Math.max(Math.round(attainment), 0), 100);
  }
  
  // Fallback: no baseline provided, use simple ratio
  if (t === 0 && c === 0) return 100;
  if (t === 0) return 0;
  
  const ratio = c / t;
  return Math.min(Math.max(Math.round(ratio * 100), 0), 100);
}

// Helper to get KR current value (handles both column name variants) - raw value for calculations
function getKRCurrent(kr: KeyResult): number | string | undefined {
  // Excel column "Current Value" normalizes to currentValue
  return kr.current ?? (kr as Record<string, unknown>).currentValue as number | string | undefined;
}

// Helper to get KR target value (handles both column name variants) - raw value for calculations
function getKRTarget(kr: KeyResult): number | string | undefined {
  // Excel column "Target Value" normalizes to targetValue
  return kr.target ?? (kr as Record<string, unknown>).targetValue as number | string | undefined;
}

// Get KR baseline value
function getKRBaseline(kr: KeyResult): number | string | undefined {
  const krData = kr as Record<string, unknown>;
  return (krData.baselineValue as number | string | undefined) ?? (krData.baseline as number | string | undefined);
}

// Helper to get formatted current value for display (e.g., "$410M", "92%", "($0.25)")
function getKRCurrentDisplay(kr: KeyResult): string {
  const formatted = (kr as Record<string, unknown>).currentValueFormatted as string | undefined;
  if (formatted !== undefined) return formatted;
  const raw = getKRCurrent(kr);
  return raw !== undefined ? String(raw) : "—";
}

// Helper to get formatted target value for display (e.g., "$450M", "100%", "($0.12)")
function getKRTargetDisplay(kr: KeyResult): string {
  const formatted = (kr as Record<string, unknown>).targetValueFormatted as string | undefined;
  if (formatted !== undefined) return formatted;
  const raw = getKRTarget(kr);
  return raw !== undefined ? String(raw) : "—";
}

// Get formatted baseline value for display
function getKRBaselineDisplay(kr: KeyResult): string {
  const formatted = (kr as Record<string, unknown>).baselineValueFormatted as string | undefined;
  if (formatted !== undefined) return formatted;
  const raw = getKRBaseline(kr);
  return raw !== undefined ? String(raw) : "—";
}

// Helper to get KR display name - uses metric column from Excel
function getKRName(kr: KeyResult): string {
  const krData = kr as Record<string, unknown>;
  const metric = krData.metric as string | undefined;
  return metric || "";
}

// Helper to get KR metric description from "Metric" column
function getKRMetric(kr: KeyResult): string | undefined {
  // Excel column "Metric" normalizes to metric
  return (kr as Record<string, unknown>).metric as string | undefined;
}

// Check if KR has placeholder metric status
function isPlaceholderMetric(kr: KeyResult): boolean {
  const krData = kr as Record<string, unknown>;
  const metricStatus = krData.metricStatus as string | undefined;
  return metricStatus?.toLowerCase().includes("placeholder") || false;
}

type ViewMode = "value" | "sbu" | "okr";

// Helper to check if any KR in an objective has placeholder metrics
function objectiveHasPlaceholderMetrics(objectiveId: string, keyResults: KeyResult[]): boolean {
  const krs = keyResults.filter(kr => kr.objectiveId === objectiveId);
  return krs.some(kr => isPlaceholderMetric(kr));
}

interface LandingPageProps {
  onTakeAction?: (initiativeId: string) => void;
}

export function LandingPage({ onTakeAction }: LandingPageProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [viewMode, setViewMode] = useState<ViewMode>("value");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* View Toggle - Centered Slide (3 options) */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            bgcolor: isDark ? customColors.dark.elevated : "#e8e8e8",
            borderRadius: 3,
            p: 0.75,
            position: "relative",
          }}
        >
          {/* Sliding background - handles 3 positions */}
          <Box
            sx={{
              position: "absolute",
              top: 6,
              left: viewMode === "value" ? 6 : viewMode === "sbu" ? "calc(33.33% + 2px)" : "calc(66.66% + 2px)",
              width: "calc(33.33% - 8px)",
              height: "calc(100% - 12px)",
              bgcolor: customColors.brand.navy,
              borderRadius: 2.5,
              transition: "left 0.3s ease",
              zIndex: 0,
            }}
          />
          {/* Value View Button */}
          <Box
            onClick={() => setViewMode("value")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.5,
              borderRadius: 2.5,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
              minWidth: 130,
              justifyContent: "center",
              transition: "color 0.3s ease",
            }}
          >
            <TrendingUp sx={{ fontSize: 20, color: viewMode === "value" ? "#fff" : "text.secondary", transition: "color 0.3s ease" }} />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: viewMode === "value" ? "#fff" : "text.secondary",
                transition: "color 0.3s ease",
                fontSize: "0.95rem",
              }}
            >
              Value View
            </Typography>
          </Box>
          {/* SBU View Button */}
          <Box
            onClick={() => setViewMode("sbu")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.5,
              borderRadius: 2.5,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
              minWidth: 130,
              justifyContent: "center",
              transition: "color 0.3s ease",
            }}
          >
            <Business sx={{ fontSize: 20, color: viewMode === "sbu" ? "#fff" : "text.secondary", transition: "color 0.3s ease" }} />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: viewMode === "sbu" ? "#fff" : "text.secondary",
                transition: "color 0.3s ease",
                fontSize: "0.95rem",
              }}
            >
              SBU View
            </Typography>
          </Box>
          {/* OKR View Button */}
          <Box
            onClick={() => setViewMode("okr")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.5,
              borderRadius: 2.5,
              cursor: "pointer",
              position: "relative",
              zIndex: 1,
              minWidth: 130,
              justifyContent: "center",
              transition: "color 0.3s ease",
            }}
          >
            <Dashboard sx={{ fontSize: 20, color: viewMode === "okr" ? "#fff" : "text.secondary", transition: "color 0.3s ease" }} />
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                color: viewMode === "okr" ? "#fff" : "text.secondary",
                transition: "color 0.3s ease",
                fontSize: "0.95rem",
              }}
            >
              OKR View
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Conditional View Rendering */}
      {viewMode === "okr" ? (
        <OKRDashboardContent isDark={isDark} onTakeAction={onTakeAction} />
      ) : viewMode === "sbu" ? (
        <SBUView />
      ) : (
        <ValueView />
      )}
    </Box>
  );
}

// OKR Dashboard Content - the original LandingPage content
interface OKRDashboardContentProps {
  isDark: boolean;
  onTakeAction?: (initiativeId: string) => void;
}

function OKRDashboardContent({ isDark, onTakeAction }: OKRDashboardContentProps) {
  const { objectives, keyResults, initiatives, milestones, initiativeUpdates, loading, error } = useInitiativeData();
  
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["D&A Value Driver", "Enablers", "Enterprise", "Uncategorized"]));
  const [selectedKR, setSelectedKR] = useState<{ kr: KeyResult; objective: Objective } | null>(null);
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [highlightedKRId, setHighlightedKRId] = useState<string | null>(null);
  const [expandedBanners, setExpandedBanners] = useState<Set<string>>(new Set());

  // Toggle banner expansion
  const toggleBanner = (category: string) => {
    setExpandedBanners(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Check if initiative is blocked (matches SignalsPage logic)
  const isInitiativeBlocked = (init: Initiative): boolean => {
    // Check if initiative has updates with blockers (S1 - matches SignalsPage)
    const hasBlockerUpdate = initiativeUpdates.some(
      u => u.initiativeId === init.initiativeId && u.blockers && u.blockers.trim() !== ""
    );
    
    // Check for blocked status
    const hasBlockedStatus = init.status?.toLowerCase().includes('blocked');
    
    return hasBlockerUpdate || hasBlockedStatus || init.isBlocked === true;
  };

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Helper functions
  const getKeyResultsForObjective = (objectiveId: string): KeyResult[] => {
    return keyResults.filter(kr => kr.objectiveId === objectiveId);
  };

  const getInitiativesForKeyResult = (keyResultId: string): Initiative[] => {
    return initiatives.filter(init => init.keyResultId === keyResultId);
  };

  const getMilestonesForInitiative = (initiativeId: string): Milestone[] => {
    return milestones.filter(m => m.initiativeId === initiativeId);
  };

  const getUpdatesForInitiative = (initiativeId: string): InitiativeUpdate[] => {
    return initiativeUpdates.filter(u => u.initiativeId === initiativeId);
  };

  // Get latest update for an initiative
  const getLatestUpdate = (initiativeId: string): string | undefined => {
    const updates = getUpdatesForInitiative(initiativeId);
    if (updates.length === 0) return undefined;
    const latest = updates[updates.length - 1];
    return latest.progress || latest.blockers;
  };

  // Get blocked initiatives for objectives in a category
  type BlockedItem = { initiative: Initiative; kr: KeyResult; objective: Objective };
  const getBlockedInfoForCategory = (categoryObjectives: Objective[]): { count: number; blockedItems: BlockedItem[] } => {
    const blockedItems: BlockedItem[] = [];
    
    for (const obj of categoryObjectives) {
      const krs = getKeyResultsForObjective(obj.objectiveId);
      for (const kr of krs) {
        const krInitiatives = getInitiativesForKeyResult(kr.keyResultId);
        const blockedInits = krInitiatives.filter(isInitiativeBlocked);
        for (const init of blockedInits) {
          blockedItems.push({ initiative: init, kr, objective: obj });
        }
      }
    }
    
    return { count: blockedItems.length, blockedItems };
  };

  // Handle "View Details" click on blocked banner
  const handleViewBlockedDetails = (objective: Objective, kr: KeyResult) => {
    // Expand the objective
    setExpandedObjectives(prev => {
      const next = new Set(prev);
      next.add(objective.objectiveId);
      return next;
    });
    
    // Highlight the KR
    setHighlightedKRId(kr.keyResultId);
    
    // Scroll to the KR after a short delay to allow expansion
    setTimeout(() => {
      const element = document.getElementById(`kr-${kr.keyResultId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
    
    // Clear highlight after 2.5 seconds
    setTimeout(() => {
      setHighlightedKRId(null);
    }, 2500);
  };

  // Filter objectives (only those with owners)
  const allObjectivesWithOwners = objectives.filter(obj => obj.objectiveOwner);
  
  // Top-level objectives only (no parent = laddersToObjectiveId is null/empty)
  const topLevelObjectives = allObjectivesWithOwners.filter(
    obj => !obj.laddersToObjectiveId || String(obj.laddersToObjectiveId).trim() === ""
  );
  
  // Child objectives (have a parent)
  const childObjectives = allObjectivesWithOwners.filter(
    obj => obj.laddersToObjectiveId && String(obj.laddersToObjectiveId).trim() !== ""
  );
  
  // Get child objectives for a parent
  const getChildObjectivesForParent = (parentObjectiveId: string): Objective[] => {
    return childObjectives.filter(obj => obj.laddersToObjectiveId === parentObjectiveId);
  };
  
  // Group top-level objectives by category, sorted alphabetically
  const categories = [...new Set(
    topLevelObjectives
      .map(obj => obj.objectiveCategory)
      .filter((cat): cat is string => Boolean(cat))
  )].sort((a, b) => a.localeCompare(b));
  
  const groupedObjectives = categories.map(category => ({
    category,
    objectives: topLevelObjectives
      .filter(obj => obj.objectiveCategory === category)
      .sort((a, b) => a.objectiveId.localeCompare(b.objectiveId))
  }));
  
  // Handle objectives without a category
  const uncategorizedObjectives = topLevelObjectives.filter(obj => !obj.objectiveCategory);
  if (uncategorizedObjectives.length > 0) {
    groupedObjectives.push({
      category: "Uncategorized",
      objectives: uncategorizedObjectives.sort((a, b) => a.objectiveId.localeCompare(b.objectiveId))
    });
  }
  
  // For backwards compatibility
  const displayObjectives = topLevelObjectives;

  // Calculate objective health based on KR attainment (worst child = parent status)
  const getObjectiveHealth = (objectiveId: string): StatusType => {
    const krs = getKeyResultsForObjective(objectiveId);
    if (krs.length === 0) return "green";
    
    // Calculate status for each KR based on attainment
    const krStatuses = krs.map(kr => getKRStatus(getKRCurrent(kr), getKRTarget(kr)));
    
    // Worst status wins: Red > Amber > Green
    if (krStatuses.includes("red")) return "red";
    if (krStatuses.includes("amber")) return "amber";
    return "green";
  };

  // Calculate average attainment for objective
  const getObjectiveAttainment = (objectiveId: string): number => {
    const krs = getKeyResultsForObjective(objectiveId);
    if (krs.length === 0) return 0;
    const sum = krs.reduce((acc, kr) => acc + calculateAttainment(getKRCurrent(kr), getKRTarget(kr), getKRBaseline(kr)), 0);
    return Math.round(sum / krs.length);
  };

  // DASH-001: Count objectives by health status for Goals summary tile
  const goalsHealthCounts = displayObjectives.reduce(
    (acc, obj) => {
      const health = getObjectiveHealth(obj.objectiveId);
      acc[health]++;
      return acc;
    },
    { green: 0, amber: 0, red: 0 } as Record<StatusType, number>
  );

  const toggleObjective = (objectiveId: string) => {
    setExpandedObjectives(prev => {
      const next = new Set(prev);
      if (next.has(objectiveId)) {
        next.delete(objectiveId);
      } else {
        next.add(objectiveId);
      }
      return next;
    });
  };

  const filterPills: { id: FilterType; label: string; color?: string }[] = [
    { id: "all", label: "All" },
    { id: "on-track", label: "On Track", color: "#03cc54" },
    { id: "at-risk", label: "At Risk", color: "#e0a73f" },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }} color="text.secondary">Loading data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Card sx={{ p: 4, textAlign: "center" }}>
        <Warning sx={{ fontSize: 48, color: "#ba0000", mb: 2 }} />
        <Typography color="error">Failed to load data: {error}</Typography>
      </Card>
    );
  }

  return (
    <Box sx={{ width: "75%", mx: "auto", pb: 8 }}>
      {/* Title + Filter Pills */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            letterSpacing: 1.5,
          }}
        >
          PORTFOLIO ({displayObjectives.length} Objectives, {keyResults.length} KRs, {initiatives.length} Initiatives)
        </Typography>

        {/* Filter Pills */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {filterPills.map((pill) => (
            <Chip
              key={pill.id}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  {pill.color && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: pill.color,
                      }}
                    />
                  )}
                  {pill.label}
                </Box>
              }
              onClick={() => setFilter(pill.id)}
              sx={{
                bgcolor: filter === pill.id
                  ? (isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)")
                  : "transparent",
                border: `1px solid ${
                  filter === pill.id
                    ? (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)")
                    : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)")
                }`,
                color: "text.primary",
                fontWeight: filter === pill.id ? 600 : 400,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                },
              }}
            />
          ))}
        </Box>
      </Box>

      {/* DASH-001: Goals Summary Tile */}
      <Card
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 2,
          bgcolor: isDark ? customColors.dark.surface : "#fff",
          border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)"}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Dashboard sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {displayObjectives.length} Goals
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: STATUS_COLORS.green }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{goalsHealthCounts.green}</Typography>
              <Typography variant="body2" color="text.secondary">On Track</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: STATUS_COLORS.amber }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{goalsHealthCounts.amber}</Typography>
              <Typography variant="body2" color="text.secondary">At Risk</Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Objectives List - Grouped by Category */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {groupedObjectives.map(({ category, objectives: categoryObjectives }) => {
          // Filter by health status
          const filteredCategoryObjectives = categoryObjectives.filter(obj => {
            if (filter === "all") return true;
            const health = getObjectiveHealth(obj.objectiveId);
            if (filter === "on-track" && health === "green") return true;
            if (filter === "at-risk" && health === "amber") return true;
            if (filter === "off-track" && health === "red") return true;
            return false;
          });
          
          if (filteredCategoryObjectives.length === 0) return null;
          
          // Calculate category-level health counts
          const categoryHealthCounts = filteredCategoryObjectives.reduce(
            (acc, obj) => {
              const health = getObjectiveHealth(obj.objectiveId);
              acc[health]++;
              return acc;
            },
            { green: 0, amber: 0, red: 0 } as Record<StatusType, number>
          );
          
          // Get blocked initiatives info for this category
          const blockedInfo = getBlockedInfoForCategory(filteredCategoryObjectives);
          
          const isCategoryExpanded = expandedCategories.has(category);
          
          return (
            <Box key={category}>
              {/* Needs Attention Banner - above category header */}
              {blockedInfo.count > 0 && (
                <Card
                  sx={{
                    mb: 1.5,
                    borderRadius: 2,
                    bgcolor: isDark ? `${STATUS_COLORS.red}12` : `${STATUS_COLORS.red}08`,
                    border: `1px solid ${STATUS_COLORS.red}40`,
                    overflow: "hidden",
                  }}
                >
                  {/* Banner Header */}
                  <Box
                    onClick={() => toggleBanner(category)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      cursor: "pointer",
                      "&:hover": { bgcolor: isDark ? `${STATUS_COLORS.red}18` : `${STATUS_COLORS.red}12` },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Warning sx={{ fontSize: 20, color: STATUS_COLORS.red }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: STATUS_COLORS.red, mb: 0.25 }}>
                          {blockedInfo.count} Initiative{blockedInfo.count !== 1 ? "s" : ""} Blocked in {category}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          Click to see blocked initiatives and take action.
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      sx={{
                        color: STATUS_COLORS.red,
                        transition: "transform 0.2s",
                        transform: expandedBanners.has(category) ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <ExpandMore />
                    </IconButton>
                  </Box>
                  
                  {/* Expandable List of Blocked Initiatives */}
                  <Collapse in={expandedBanners.has(category)}>
                    <Box
                      sx={{
                        borderTop: `1px solid ${STATUS_COLORS.red}30`,
                        px: 2,
                        pb: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1.5 }}>
                        {blockedInfo.blockedItems.map((item, index) => (
                          <Box
                            key={`${item.initiative.id}-${index}`}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1.5,
                              borderRadius: 1.5,
                              bgcolor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
                              border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                            }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                <Chip
                                  label="BLOCKED"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    bgcolor: `${STATUS_COLORS.red}20`,
                                    color: STATUS_COLORS.red,
                                  }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                  {item.initiative.initiativeName}
                                </Typography>
                              </Box>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Goal: {item.objective.objectiveName} | Owner: {item.initiative.initiativeOwner || "—"}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewBlockedDetails(item.objective, item.kr);
                              }}
                              sx={{
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                borderColor: STATUS_COLORS.red,
                                color: STATUS_COLORS.red,
                                ml: 2,
                                "&:hover": {
                                  borderColor: STATUS_COLORS.red,
                                  bgcolor: `${STATUS_COLORS.red}10`,
                                },
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                </Card>
              )}

              {/* Category Header */}
              <Box
                onClick={() => toggleCategory(category)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: isCategoryExpanded ? 2 : 0,
                  pb: 1,
                  borderBottom: 2,
                  borderColor: isDark ? "primary.main" : customColors.brand.navy,
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: isDark ? "primary.main" : customColors.brand.navy,
                      transition: "transform 0.2s",
                      transform: isCategoryExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      p: 0,
                    }}
                  >
                    <ExpandMore />
                  </IconButton>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: isDark ? "primary.main" : customColors.brand.navy,
                    }}
                  >
                    {category}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {filteredCategoryObjectives.length} Goal{filteredCategoryObjectives.length !== 1 ? "s" : ""}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={categoryHealthCounts.green}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: `${STATUS_COLORS.green}20`,
                        color: STATUS_COLORS.green,
                      }}
                    />
                    <Chip
                      label={categoryHealthCounts.amber}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: `${STATUS_COLORS.amber}20`,
                        color: STATUS_COLORS.amber,
                      }}
                    />
                  </Box>
                </Box>
              </Box>
              
              {/* Objectives in this category */}
              <Collapse in={isCategoryExpanded}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {filteredCategoryObjectives.map((objective) => {
                  const krs = getKeyResultsForObjective(objective.objectiveId);
                  const health = getObjectiveHealth(objective.objectiveId);
                  const avgAttainment = getObjectiveAttainment(objective.objectiveId);
                  const isExpanded = expandedObjectives.has(objective.objectiveId);
                  const childObjs = getChildObjectivesForParent(objective.objectiveId);

                  return (
                    <Card
                      key={objective.id}
                      sx={{
                        borderRadius: 2,
                        overflow: "hidden",
                        bgcolor: isDark ? customColors.dark.surface : "#fff",
                        border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)"}`,
                      }}
                    >
                      {/* Objective Header */}
                      <Box
                        onClick={() => toggleObjective(objective.objectiveId)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          p: 2.5,
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                          },
                        }}
                      >
                        {/* Status Bar */}
                        <Box
                          sx={{
                            width: 4,
                            height: 48,
                            borderRadius: 1,
                            bgcolor: getStatusColor(health),
                            mr: 2,
                            flexShrink: 0,
                          }}
                        />

                        {/* Title + Owner */}
                        <Box sx={{ flex: 1, minWidth: 0, mr: 3 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            <Chip
                              label={objective.objectiveId}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.65rem",
                                fontWeight: 600,
                                fontFamily: "monospace",
                                bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                              }}
                            />
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600, color: "text.primary" }}
                            >
                              {objective.objectiveName}
                            </Typography>
                            {childObjs.length > 0 && (
                              <Chip
                                label={`+${childObjs.length} Contributing`}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  bgcolor: isDark ? customColors.brand.hypermint : customColors.brand.hypermint,
                                  color: customColors.brand.navy,
                                  border: `1px solid ${customColors.brand.navy}20`,
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                            Owner: {objective.objectiveOwner}
                          </Typography>
                        </Box>

                        {/* Attainment */}
                        <Box sx={{ width: 180, mr: 4, flexShrink: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontWeight: 500, letterSpacing: 0.5 }}
                          >
                            ATTAINMENT
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
                                {avgAttainment}%
                              </Typography>
                              {objectiveHasPlaceholderMetrics(objective.objectiveId, keyResults) && (
                                <Tooltip title="Includes placeholder data" arrow placement="top">
                                  <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                                </Tooltip>
                              )}
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={avgAttainment}
                              sx={{
                                flex: 1,
                                height: 6,
                                borderRadius: 1,
                                bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                                "& .MuiLinearProgress-bar": {
                                  bgcolor: getStatusColor(health),
                                  borderRadius: 1,
                                },
                              }}
                            />
                          </Box>
                        </Box>

                        {/* KR Health Breakdown - Fixed width for alignment */}
                        <Box sx={{ width: 100, mr: 2, flexShrink: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", fontWeight: 500, letterSpacing: 0.5, display: "block", textAlign: "center", mb: 0.5 }}
                          >
                            KRs
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                            {(() => {
                              // Calculate KR health counts for this objective
                              const krHealthCounts = krs.reduce(
                                (acc, kr) => {
                                  const status = getKRStatus(getKRCurrent(kr), getKRTarget(kr));
                                  acc[status]++;
                                  return acc;
                                },
                                { green: 0, amber: 0, red: 0 } as Record<StatusType, number>
                              );
                              return (
                                <>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: STATUS_COLORS.green }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: STATUS_COLORS.green, minWidth: 12 }}>
                                      {krHealthCounts.green}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: STATUS_COLORS.amber }} />
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: STATUS_COLORS.amber, minWidth: 12 }}>
                                      {krHealthCounts.amber}
                                    </Typography>
                                  </Box>
                                </>
                              );
                            })()}
                          </Box>
                        </Box>

                        {/* Expand Chevron */}
                        <IconButton
                          size="small"
                          sx={{
                            color: "text.secondary",
                            transition: "transform 0.2s",
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          <ExpandMore />
                        </IconButton>
                      </Box>

                      {/* Expanded KRs Section */}
                      <Collapse in={isExpanded}>
                        <Box
                          sx={{
                            borderTop: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)"}`,
                            px: 2.5,
                            pb: 2,
                          }}
                        >
                          {/* Sub-Objectives (if any) */}
                          {childObjs.length > 0 && (
                            <>
                              <Typography
                                variant="overline"
                                sx={{
                                  display: "block",
                                  color: "text.secondary",
                                  fontWeight: 600,
                                  letterSpacing: 1.5,
                                  pt: 2,
                                  pb: 1,
                                }}
                              >
                                CONTRIBUTING OBJECTIVES ({childObjs.length})
                              </Typography>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                                {childObjs.map((childObj) => {
                                  const childKRs = getKeyResultsForObjective(childObj.objectiveId);
                                  const childHealth = getObjectiveHealth(childObj.objectiveId);
                                  const childAttainment = getObjectiveAttainment(childObj.objectiveId);
                                  const isChildExpanded = expandedObjectives.has(childObj.objectiveId);
                                  
                                  // Calculate KR health counts for this child objective
                                  const childKrHealthCounts = childKRs.reduce(
                                    (acc, kr) => {
                                      const status = getKRStatus(getKRCurrent(kr), getKRTarget(kr));
                                      acc[status]++;
                                      return acc;
                                    },
                                    { green: 0, amber: 0, red: 0 } as Record<StatusType, number>
                                  );
                                  
                                  return (
                                    <Card
                                      key={childObj.id}
                                      sx={{
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        bgcolor: isDark ? customColors.dark.elevated : "#fafafa",
                                        border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)"}`,
                                      }}
                                    >
                                      {/* Child Objective Header - same as parent */}
                                      <Box
                                        onClick={() => toggleObjective(childObj.objectiveId)}
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          p: 2,
                                          cursor: "pointer",
                                          "&:hover": {
                                            bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                                          },
                                        }}
                                      >
                                        {/* Status Bar */}
                                        <Box
                                          sx={{
                                            width: 4,
                                            height: 40,
                                            borderRadius: 1,
                                            bgcolor: STATUS_COLORS[childHealth],
                                            mr: 2,
                                            flexShrink: 0,
                                          }}
                                        />

                                        {/* Title + Owner */}
                                        <Box sx={{ flex: 1, minWidth: 0, mr: 3 }}>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                            <Chip
                                              label={childObj.objectiveId}
                                              size="small"
                                              sx={{
                                                height: 18,
                                                fontSize: "0.6rem",
                                                fontWeight: 600,
                                                fontFamily: "monospace",
                                                bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                                              }}
                                            />
                                            <Typography
                                              variant="body2"
                                              sx={{ fontWeight: 600, color: "text.primary" }}
                                            >
                                              {childObj.objectiveName}
                                            </Typography>
                                          </Box>
                                          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.25 }}>
                                            Owner: {childObj.objectiveOwner}
                                          </Typography>
                                        </Box>

                                        {/* Attainment */}
                                        <Box sx={{ width: 140, mr: 3, flexShrink: 0 }}>
                                          <Typography
                                            variant="caption"
                                            sx={{ color: "text.secondary", fontWeight: 500, letterSpacing: 0.5 }}
                                          >
                                            ATTAINMENT
                                          </Typography>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                              <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                                                {childAttainment}%
                                              </Typography>
                                              {objectiveHasPlaceholderMetrics(childObj.objectiveId, keyResults) && (
                                                <Tooltip title="Includes placeholder data" arrow placement="top">
                                                  <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                                                </Tooltip>
                                              )}
                                            </Box>
                                            <LinearProgress
                                              variant="determinate"
                                              value={childAttainment}
                                              sx={{
                                                flex: 1,
                                                height: 5,
                                                borderRadius: 1,
                                                bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                                                "& .MuiLinearProgress-bar": {
                                                  bgcolor: STATUS_COLORS[childHealth],
                                                  borderRadius: 1,
                                                },
                                              }}
                                            />
                                          </Box>
                                        </Box>

                                        {/* KR Health Breakdown */}
                                        <Box sx={{ width: 90, mr: 2, flexShrink: 0 }}>
                                          <Typography
                                            variant="caption"
                                            sx={{ color: "text.secondary", fontWeight: 500, letterSpacing: 0.5, display: "block", textAlign: "center", mb: 0.25 }}
                                          >
                                            KRs
                                          </Typography>
                                          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: STATUS_COLORS.green }} />
                                              <Typography variant="caption" sx={{ fontWeight: 600, color: STATUS_COLORS.green }}>
                                                {childKrHealthCounts.green}
                                              </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                                              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: STATUS_COLORS.amber }} />
                                              <Typography variant="caption" sx={{ fontWeight: 600, color: STATUS_COLORS.amber }}>
                                                {childKrHealthCounts.amber}
                                              </Typography>
                                            </Box>
                                          </Box>
                                        </Box>

                                        {/* Expand Chevron */}
                                        <IconButton
                                          size="small"
                                          sx={{
                                            color: "text.secondary",
                                            transition: "transform 0.2s",
                                            transform: isChildExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                          }}
                                        >
                                          <ExpandMore />
                                        </IconButton>
                                      </Box>
                                      
                                      {/* Child Objective's KRs */}
                                      <Collapse in={isChildExpanded}>
                                        <Box
                                          sx={{
                                            borderTop: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)"}`,
                                            px: 2,
                                            pb: 2,
                                          }}
                                        >
                                          <Typography
                                            variant="overline"
                                            sx={{
                                              display: "block",
                                              color: "text.secondary",
                                              fontWeight: 600,
                                              letterSpacing: 1.5,
                                              py: 1.5,
                                            }}
                                          >
                                            KEY RESULTS ({childKRs.length})
                                          </Typography>
                                          {childKRs.length === 0 ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                              No key results linked to this objective.
                                            </Typography>
                                          ) : (
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                              {childKRs.map((kr) => {
                                                const krInitiatives = getInitiativesForKeyResult(kr.keyResultId);
                                                const krCurrent = getKRCurrent(kr);
                                                const krTarget = getKRTarget(kr);
                                                const krBaseline = getKRBaseline(kr);
                                                const krCurrentDisplay = getKRCurrentDisplay(kr);
                                                const krTargetDisplay = getKRTargetDisplay(kr);
                                                const attainment = calculateAttainment(krCurrent, krTarget, krBaseline);
                                                const krStatus = calculateStatusFromAttainment(attainment);

                                                return (
                                                  <Box
                                                    key={kr.id}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSelectedKR({ kr, objective: childObj });
                                                    }}
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      p: 1.5,
                                                      borderRadius: 1.5,
                                                      bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                                      "&:hover": {
                                                        bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                                                      },
                                                      cursor: "pointer",
                                                    }}
                                                  >
                                                    {/* Status Dot */}
                                                    <Box
                                                      sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: "50%",
                                                        bgcolor: STATUS_COLORS[krStatus],
                                                        mr: 2,
                                                        flexShrink: 0,
                                                      }}
                                                    />

                                                    {/* Name + Target/Current */}
                                                    <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                                                        <Typography
                                                          variant="body2"
                                                          sx={{ fontWeight: 500, color: "text.primary" }}
                                                        >
                                                          {getKRName(kr)}
                                                        </Typography>
                                                        {isPlaceholderMetric(kr) && (
                                                          <Tooltip title="Based on placeholder data" arrow placement="top">
                                                            <Chip
                                                              label="Placeholder"
                                                              size="small"
                                                              sx={{
                                                                height: 16,
                                                                fontSize: "0.55rem",
                                                                fontWeight: 600,
                                                                bgcolor: "rgba(0,0,0,0.08)",
                                                                color: "text.secondary",
                                                                cursor: "help",
                                                              }}
                                                            />
                                                          </Tooltip>
                                                        )}
                                                      </Box>
                                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                          {getKRMetric(kr) ? `${getKRMetric(kr)} | ` : ""}Baseline: {getKRBaselineDisplay(kr)} | Current: {krCurrentDisplay} | Target: {krTargetDisplay} | {krInitiatives.length} Initiative{krInitiatives.length !== 1 ? "s" : ""}
                                                        </Typography>
                                                        {isPlaceholderMetric(kr) && (
                                                          <Tooltip title="Placeholder data" arrow placement="top">
                                                            <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                                                          </Tooltip>
                                                        )}
                                                      </Box>
                                                    </Box>

                                                    {/* Trend */}
                                                    <Typography
                                                      variant="body2"
                                                      sx={{
                                                        color: kr.trend?.startsWith("+") ? STATUS_COLORS.green : kr.trend?.startsWith("-") ? STATUS_COLORS.red : "text.secondary",
                                                        fontWeight: 500,
                                                        mr: 3,
                                                        minWidth: 60,
                                                        textAlign: "right",
                                                      }}
                                                    >
                                                      {kr.trend || "—"}
                                                    </Typography>

                                                    {/* Attainment */}
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 50, justifyContent: "flex-end", mr: 1 }}>
                                                      <Typography
                                                        variant="h6"
                                                        sx={{
                                                          fontWeight: 600,
                                                          color: STATUS_COLORS[krStatus],
                                                          textAlign: "right",
                                                        }}
                                                      >
                                                        {attainment}%
                                                      </Typography>
                                                      {isPlaceholderMetric(kr) && (
                                                        <Tooltip title="Based on placeholder data" arrow placement="top">
                                                          <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                                                        </Tooltip>
                                                      )}
                                                    </Box>

                                                    {/* Drill Chevron */}
                                                    <IconButton size="small" sx={{ color: "text.secondary" }}>
                                                      <ChevronRight fontSize="small" />
                                                    </IconButton>
                                                  </Box>
                                                );
                                              })}
                                            </Box>
                                          )}
                                        </Box>
                                      </Collapse>
                                    </Card>
                                  );
                                })}
                              </Box>
                            </>
                          )}

                          <Typography
                            variant="overline"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontWeight: 600,
                              letterSpacing: 1.5,
                              py: 2,
                            }}
                          >
                            KEY RESULTS ({krs.length})
                          </Typography>

                          {krs.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                              No key results linked to this objective.
                            </Typography>
                          ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                              {krs.map((kr) => {
                                const krInitiatives = getInitiativesForKeyResult(kr.keyResultId);
                                const krCurrent = getKRCurrent(kr);
                                const krTarget = getKRTarget(kr);
                                const krBaseline = getKRBaseline(kr);
                                const krCurrentDisplay = getKRCurrentDisplay(kr);
                                const krTargetDisplay = getKRTargetDisplay(kr);
                                const attainment = calculateAttainment(krCurrent, krTarget, krBaseline);
                                const krStatus = calculateStatusFromAttainment(attainment);

                                const isHighlighted = highlightedKRId === kr.keyResultId;

                                return (
                                  <Box
                                    key={kr.id}
                                    id={`kr-${kr.keyResultId}`}
                                    onClick={() => setSelectedKR({ kr, objective })}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      p: 1.5,
                                      borderRadius: 1.5,
                                      bgcolor: isHighlighted 
                                        ? (isDark ? "rgba(255, 250, 189, 0.2)" : "rgba(255, 250, 189, 0.6)")
                                        : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"),
                                      border: isHighlighted ? "2px solid #fffabd" : "2px solid transparent",
                                      transition: "all 0.3s ease-in-out",
                                      animation: isHighlighted ? "pulse 1s ease-in-out" : "none",
                                      "@keyframes pulse": {
                                        "0%": { transform: "scale(1)" },
                                        "50%": { transform: "scale(1.01)" },
                                        "100%": { transform: "scale(1)" },
                                      },
                                      "&:hover": {
                                        bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                                      },
                                      cursor: "pointer",
                                    }}
                                  >
                                    {/* Status Dot */}
                                    <Box
                                      sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        bgcolor: STATUS_COLORS[krStatus],
                                        mr: 2,
                                        flexShrink: 0,
                                      }}
                                    />

                                    {/* Name + Target/Current */}
                                    <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{ fontWeight: 500, color: "text.primary" }}
                                        >
                                          {getKRName(kr)}
                                        </Typography>
                                        {isPlaceholderMetric(kr) && (
                                          <Tooltip title="Based on placeholder data" arrow placement="top">
                                            <Chip
                                              label="Placeholder"
                                              size="small"
                                              sx={{
                                                height: 16,
                                                fontSize: "0.55rem",
                                                fontWeight: 600,
                                                bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                                                color: "text.secondary",
                                                cursor: "help",
                                              }}
                                            />
                                          </Tooltip>
                                        )}
                                      </Box>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                          {getKRMetric(kr) ? `${getKRMetric(kr)} | ` : ""}Baseline: {getKRBaselineDisplay(kr)} | Current: {krCurrentDisplay} | Target: {krTargetDisplay} | {krInitiatives.length} Initiative{krInitiatives.length !== 1 ? "s" : ""}
                                        </Typography>
                                        {isPlaceholderMetric(kr) && (
                                          <Tooltip title="Placeholder data" arrow placement="top">
                                            <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                                          </Tooltip>
                                        )}
                                      </Box>
                                    </Box>

                                    {/* Trend */}
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: kr.trend?.startsWith("+") ? STATUS_COLORS.green : kr.trend?.startsWith("-") ? STATUS_COLORS.red : "text.secondary",
                                        fontWeight: 500,
                                        mr: 3,
                                        minWidth: 80,
                                        textAlign: "right",
                                      }}
                                    >
                                      {kr.trend || "—"}
                                    </Typography>

                                    {/* Attainment */}
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 55, justifyContent: "flex-end", mr: 2 }}>
                                      <Typography
                                        variant="h6"
                                        sx={{
                                          fontWeight: 600,
                                          color: STATUS_COLORS[krStatus],
                                          textAlign: "right",
                                        }}
                                      >
                                        {attainment}%
                                      </Typography>
                                      {isPlaceholderMetric(kr) && (
                                        <Tooltip title="Based on placeholder data" arrow placement="top">
                                          <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                                        </Tooltip>
                                      )}
                                    </Box>

                                    {/* Drill Chevron */}
                                    <IconButton size="small" sx={{ color: "text.secondary" }}>
                                      <ChevronRight fontSize="small" />
                                    </IconButton>
                                  </Box>
                                );
                              })}
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </Card>
                  );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {groupedObjectives.every(g => {
        const filtered = g.objectives.filter(obj => {
          if (filter === "all") return true;
          const health = getObjectiveHealth(obj.objectiveId);
          if (filter === "on-track" && health === "green") return true;
          if (filter === "at-risk" && health === "amber") return true;
          if (filter === "off-track" && health === "red") return true;
          return false;
        });
        return filtered.length === 0;
      }) && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography>No objectives match the selected filter.</Typography>
        </Box>
      )}

      {/* KR Detail Modal */}
      <KRDetailModal
        selectedKR={selectedKR}
        onClose={() => setSelectedKR(null)}
        isDark={isDark}
        getInitiativesForKeyResult={getInitiativesForKeyResult}
        getMilestonesForInitiative={getMilestonesForInitiative}
        getUpdatesForInitiative={getUpdatesForInitiative}
        getLatestUpdate={getLatestUpdate}
        allObjectives={objectives}
        getKeyResultsForObjective={getKeyResultsForObjective}
        getObjectiveHealth={getObjectiveHealth}
        onTakeAction={(initiativeId) => {
          setSelectedKR(null); // Close modal
          onTakeAction?.(initiativeId); // Navigate to Decisions tab
        }}
        onOpenInitiativeTimeline={(init) => {
          setSelectedKR(null); // Close KR modal
          setSelectedInitiative(init); // Open initiative modal
        }}
      />

      {/* Initiative Timeline Modal */}
      <InitiativeTimelineModal
        selectedInitiative={selectedInitiative}
        onClose={() => setSelectedInitiative(null)}
        isDark={isDark}
        getMilestonesForInitiative={getMilestonesForInitiative}
      />
    </Box>
  );
}

// KR Detail Modal
interface KRDetailModalProps {
  selectedKR: { kr: KeyResult; objective: Objective } | null;
  onClose: () => void;
  isDark: boolean;
  getInitiativesForKeyResult: (keyResultId: string) => Initiative[];
  getMilestonesForInitiative: (initiativeId: string) => Milestone[];
  getUpdatesForInitiative: (initiativeId: string) => InitiativeUpdate[];
  getLatestUpdate: (initiativeId: string) => string | undefined;
  allObjectives: Objective[];
  getKeyResultsForObjective: (objectiveId: string) => KeyResult[];
  getObjectiveHealth: (objectiveId: string) => StatusType;
  onTakeAction?: (initiativeId: string) => void;
  onOpenInitiativeTimeline?: (initiative: Initiative) => void;
}

function KRDetailModal({ 
  selectedKR, 
  onClose, 
  isDark,
  getInitiativesForKeyResult,
  getMilestonesForInitiative,
  getUpdatesForInitiative,
  getLatestUpdate,
  allObjectives,
  getKeyResultsForObjective,
  getObjectiveHealth,
  onTakeAction,
  onOpenInitiativeTimeline,
}: KRDetailModalProps) {
  const isOpen = !!selectedKR;
  const kr = selectedKR?.kr;
  const objective = selectedKR?.objective;
  
  const initiatives = kr ? getInitiativesForKeyResult(kr.keyResultId) : [];
  
  // Find child objectives that ladder up to this parent objective
  const contributingObjectives = objective 
    ? allObjectives.filter(obj => obj.laddersToObjectiveId === objective.objectiveId)
    : [];

  // Analysis state
  const [analysis, setAnalysis] = useState(kr?.analysis || "");
  const [isEditingAnalysis, setIsEditingAnalysis] = useState(false);
  const [analysisInput, setAnalysisInput] = useState("");

  const krCurrentVal = kr ? getKRCurrent(kr) : undefined;
  const krTargetVal = kr ? getKRTarget(kr) : undefined;
  const krBaselineVal = kr ? getKRBaseline(kr) : undefined;
  const krCurrentDisplay = kr ? getKRCurrentDisplay(kr) : "—";
  const krTargetDisplay = kr ? getKRTargetDisplay(kr) : "—";
  const attainmentPercent = kr ? calculateAttainment(krCurrentVal, krTargetVal, krBaselineVal) : 0;
  const krStatusCalc = calculateStatusFromAttainment(attainmentPercent);
  const healthColor = STATUS_COLORS[krStatusCalc];

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text.secondary";
    if (confidence >= 4) return STATUS_COLORS.green;
    if (confidence >= 3) return STATUS_COLORS.amber;
    return STATUS_COLORS.red;
  };

  const handleSaveAnalysis = () => {
    setAnalysis(analysisInput);
    setIsEditingAnalysis(false);
  };

  const handleStartEditAnalysis = () => {
    setAnalysisInput(analysis || kr?.analysis || "");
    setIsEditingAnalysis(true);
  };

  // Check if initiative is blocked
  const isBlocked = (init: Initiative): boolean => {
    return init.isBlocked === true || 
           init.status?.toLowerCase().includes('blocked') ||
           false;
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: { backdropFilter: "blur(4px)" },
        },
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: "80%", lg: "70%" },
            maxWidth: 900,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: isDark ? customColors.dark.surface : "#fff",
            borderRadius: 3,
            boxShadow: 24,
            border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)"}`,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 3,
              borderBottom: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)"}`,
            }}
          >
            {/* Back link */}
            <Button
              startIcon={<ArrowBack />}
              onClick={onClose}
              sx={{
                mb: 2,
                color: "text.secondary",
                "&:hover": { color: "primary.main", bgcolor: "transparent" },
              }}
            >
              {objective?.objectiveName || "Portfolio"}
            </Button>

            {/* Status and Attainment */}
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: healthColor,
                    }}
                  />
                  <Chip
                    label={krStatusCalc.toUpperCase()}
                    size="small"
                    sx={{
                      bgcolor: `${healthColor}20`,
                      color: healthColor,
                      fontWeight: 600,
                      fontSize: "0.7rem",
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    | {attainmentPercent}% attained
                  </Typography>
                  {kr && isPlaceholderMetric(kr) && (
                    <Tooltip title="Based on placeholder data" arrow placement="top">
                      <Chip
                        label="Placeholder"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.6rem",
                          fontWeight: 600,
                          bgcolor: "rgba(0,0,0,0.08)",
                          color: "text.secondary",
                          cursor: "help",
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}>
                  {kr ? getKRName(kr) : "Key Result"}
                </Typography>
                {kr && getKRMetric(kr) && (
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    Metric: {getKRMetric(kr)}
                  </Typography>
                )}
                {(!kr || !getKRMetric(kr)) && <Box sx={{ mb: 2 }} />}

                <Box sx={{ display: "flex", gap: 4 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                      Baseline
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {kr ? getKRBaselineDisplay(kr) : "—"}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                      Current
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {krCurrentDisplay}
                      </Typography>
                      {kr && isPlaceholderMetric(kr) && (
                        <Tooltip title="Placeholder data" arrow placement="top">
                          <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                      Target
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                        {krTargetDisplay}
                      </Typography>
                      {kr && isPlaceholderMetric(kr) && (
                        <Tooltip title="Placeholder data" arrow placement="top">
                          <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Progress bar */}
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                      Progress to Target
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: "text.primary" }}>
                        {attainmentPercent}%
                      </Typography>
                      {kr && isPlaceholderMetric(kr) && (
                        <Tooltip title="Based on placeholder data" arrow placement="top">
                          <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={attainmentPercent}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 1,
                        bgcolor: healthColor,
                      },
                    }}
                  />
                </Box>
              </Box>

              {/* Analysis Card - Editable */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  minWidth: 200,
                  maxWidth: 280,
                  borderRadius: 2,
                  bgcolor: isDark ? customColors.dark.elevated : "#fafafa",
                  borderColor: isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "text.secondary" }}>
                    Analysis
                  </Typography>
                  {isEditingAnalysis ? (
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <IconButton size="small" onClick={handleSaveAnalysis} sx={{ color: "#03cc54" }}>
                        <Check sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setIsEditingAnalysis(false)} sx={{ color: "#ba0000" }}>
                        <Close sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ) : (
                    <IconButton size="small" onClick={handleStartEditAnalysis} sx={{ opacity: 0.5 }}>
                      <Edit sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
                {isEditingAnalysis ? (
                  <TextField
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    value={analysisInput}
                    onChange={(e) => setAnalysisInput(e.target.value)}
                    placeholder="Enter analysis..."
                  />
                ) : (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ fontStyle: (analysis || kr?.analysis) ? "normal" : "italic", cursor: "pointer" }}
                    onClick={handleStartEditAnalysis}
                  >
                    {(analysis || kr?.analysis) ? `"${analysis || kr?.analysis}"` : '"No analysis available."'}
                  </Typography>
                )}
              </Paper>
            </Box>
          </Box>

          {/* Content - Initiatives */}
          <Box sx={{ p: 3, display: "flex", gap: 4 }}>
            {/* Left: Initiatives */}
            <Box sx={{ flex: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                  Initiatives <Chip label={initiatives.length} size="small" sx={{ ml: 1, height: 20, fontSize: "0.7rem" }} />
                </Typography>
                <Button
                  startIcon={<Add />}
                  size="small"
                  sx={{ color: "primary.main" }}
                >
                  Add Initiative
                </Button>
              </Box>

              {initiatives.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderStyle: "dashed",
                    borderColor: isDark ? customColors.dark.hover : "rgba(0,0,0,0.12)",
                    bgcolor: "transparent",
                  }}
                >
                  <Typography color="text.secondary">
                    No active initiatives linked to this KR.
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {initiatives.map((init) => {
                    const initMilestones = getMilestonesForInitiative(init.initiativeId);
                    const initUpdates = getUpdatesForInitiative(init.initiativeId);
                    const latestUpdate = getLatestUpdate(init.initiativeId);
                    const blocked = isBlocked(init);
                    // Initiative status based on confidence score per PRD
                    const initStatus = getInitiativeStatus(init.confidence);
                    const statusColor = STATUS_COLORS[initStatus];

                    return (
                      <Paper
                        key={init.id}
                        variant="outlined"
                        onClick={() => onOpenInitiativeTimeline?.(init)}
                        sx={{
                          p: 2,
                          borderLeft: 3,
                          borderLeftColor: blocked ? STATUS_COLORS.red : statusColor,
                          borderColor: isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)",
                          bgcolor: isDark ? customColors.dark.elevated : "#fafafa",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: isDark ? customColors.dark.hover : "rgba(0,0,0,0.04)",
                            borderColor: blocked ? STATUS_COLORS.red : statusColor,
                          },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: blocked ? STATUS_COLORS.red : statusColor,
                                }}
                              />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                {init.initiativeName}
                              </Typography>
                              {blocked && (
                                <Chip
                                  label="BLOCKED"
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.6rem",
                                    fontWeight: 700,
                                    bgcolor: `${STATUS_COLORS.red}20`,
                                    color: STATUS_COLORS.red,
                                  }}
                                />
                              )}
                            </Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1, flexWrap: "wrap" }}>
                              <Typography variant="caption" color="text.secondary">
                                Owner: {init.initiativeOwner || "—"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">|</Typography>
                              <Typography variant="caption" sx={{ color: getConfidenceColor(init.confidence) }}>
                                Confidence: {init.confidence ? `${init.confidence}/5` : "—"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">|</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {initMilestones.length} Milestone{initMilestones.length !== 1 ? "s" : ""} | {initUpdates.length} Update{initUpdates.length !== 1 ? "s" : ""}
                              </Typography>
                            </Box>

                            {(latestUpdate || init.latestUpdate) && (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontStyle: "italic",
                                }}
                              >
                                "{latestUpdate || init.latestUpdate}"
                              </Typography>
                            )}
                          </Box>

                          {/* Take Action button for blocked initiatives */}
                          {blocked && onTakeAction && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                onTakeAction(init.initiativeId);
                              }}
                              sx={{
                                bgcolor: STATUS_COLORS.red,
                                "&:hover": { bgcolor: "#8b0000" },
                                flexShrink: 0,
                                fontSize: "0.7rem",
                              }}
                            >
                              Take Action
                            </Button>
                          )}
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>

            {/* Right: Contributing Objectives */}
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>
                Contributing Objectives
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                These objectives ladder up to this parent.
              </Typography>
              
              {contributingObjectives.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  No contributing objectives.
                </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {contributingObjectives.map((childObj) => {
                    const childKRs = getKeyResultsForObjective(childObj.objectiveId);
                    const childHealth = getObjectiveHealth(childObj.objectiveId);
                    
                    return (
                      <Paper
                        key={childObj.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderColor: isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)",
                          bgcolor: isDark ? customColors.dark.elevated : "#fafafa",
                          cursor: "pointer",
                          "&:hover": {
                            borderColor: STATUS_COLORS[childHealth],
                          },
                        }}
                      >
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: 600, 
                            color: "text.primary",
                            mb: 1,
                            fontSize: "0.8rem",
                          }}
                        >
                          {childObj.objectiveName}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: STATUS_COLORS[childHealth],
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {childKRs.length} KR{childKRs.length !== 1 ? "s" : ""}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

// Initiative Timeline Modal - Shows horizontal milestone timeline
interface InitiativeTimelineModalProps {
  selectedInitiative: Initiative | null;
  onClose: () => void;
  isDark: boolean;
  getMilestonesForInitiative: (initiativeId: string) => Milestone[];
}

function InitiativeTimelineModal({
  selectedInitiative,
  onClose,
  isDark,
  getMilestonesForInitiative,
}: InitiativeTimelineModalProps) {
  const isOpen = !!selectedInitiative;

  // Parse milestone date (handles Excel serial dates and string dates)
  const parseMilestoneDate = (date: string | number | undefined): Date | null => {
    if (!date) return null;
    if (typeof date === "number") {
      return new Date((date - 25569) * 86400000);
    }
    if (typeof date === "string") {
      const normalized = date.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u002D]/g, "-");
      if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = normalized.split("-").map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(normalized);
    }
    return null;
  };

  // Format milestone date for display
  const formatMilestoneDate = (date: string | number | undefined): string => {
    if (!date) return "TBD";
    try {
      const dateObj = parseMilestoneDate(date);
      if (!dateObj || isNaN(dateObj.getTime())) return "TBD";
      return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "TBD";
    }
  };

  const initMilestones = selectedInitiative ? getMilestonesForInitiative(selectedInitiative.initiativeId) : [];
  
  // Sort milestones by date
  const sortedMilestones = [...initMilestones].sort((a, b) => {
    const dateA = parseMilestoneDate(a.originalDueDate);
    const dateB = parseMilestoneDate(b.originalDueDate);
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 300,
        sx: { backdropFilter: "blur(4px)" },
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", md: "85%", lg: "80%" },
            maxWidth: 1100,
            maxHeight: "85vh",
            overflow: "auto",
            bgcolor: isDark ? customColors.dark.surface : "#fff",
            borderRadius: 3,
            boxShadow: 24,
            border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)"}`,
          }}
        >
          {selectedInitiative && (
            <>
              {/* Modal Header */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)"}`,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                    <RocketLaunch sx={{ fontSize: 24, color: "primary.main" }} />
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                      {selectedInitiative.initiativeName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                    <Typography variant="body2" color="text.secondary">
                      Owner: {selectedInitiative.initiativeOwner || "—"}
                    </Typography>
                    <Chip
                      label={selectedInitiative.status || "Active"}
                      size="small"
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 600 }}
                    />
                  </Box>
                  {selectedInitiative.initiativeDescription && (
                    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1.5, maxWidth: 600 }}>
                      {selectedInitiative.initiativeDescription}
                    </Typography>
                  )}
                </Box>
                <IconButton onClick={onClose}>
                  <Close />
                </IconButton>
              </Box>

              {/* Timeline Section */}
              <Box sx={{ p: 3, flex: 1, overflow: "hidden" }}>
                <Typography
                  variant="overline"
                  sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 1.5, mb: 2, display: "block" }}
                >
                  MILESTONE TIMELINE ({sortedMilestones.length})
                </Typography>

                {/* Horizontal Scrolling Timeline */}
                <Box
                  sx={{
                    overflowX: "auto",
                    overflowY: "hidden",
                    pb: 2,
                    "&::-webkit-scrollbar": { height: 8 },
                    "&::-webkit-scrollbar-track": {
                      bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                      borderRadius: 4,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                      borderRadius: 4,
                    },
                  }}
                >
                  {sortedMilestones.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No milestones for this initiative.
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0, minWidth: "max-content", pt: 2 }}>
                      {sortedMilestones.map((milestone, idx) => {
                        const milestoneStatus = milestone.status?.toLowerCase() || "";
                        const isComplete = milestoneStatus.includes("complete");
                        const isOverdue = milestoneStatus.includes("overdue") || milestoneStatus.includes("late");
                        const isInProgress = milestoneStatus.includes("progress");
                        
                        const statusColor = isComplete
                          ? STATUS_COLORS.green
                          : isOverdue
                            ? STATUS_COLORS.red
                            : isInProgress
                              ? STATUS_COLORS.amber
                              : "text.secondary";

                        return (
                          <Box
                            key={milestone.id || idx}
                            sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 180, position: "relative" }}
                          >
                            {/* Connector line */}
                            {idx < sortedMilestones.length - 1 && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  top: 16,
                                  left: "50%",
                                  width: "100%",
                                  height: 3,
                                  bgcolor: isComplete ? STATUS_COLORS.green : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"),
                                  zIndex: 0,
                                }}
                              />
                            )}

                            {/* Status Icon */}
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: "50%",
                                bgcolor: isDark ? customColors.dark.surface : "#fff",
                                border: `3px solid ${statusColor}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1,
                                mb: 1.5,
                              }}
                            >
                              {isComplete ? (
                                <CheckCircle sx={{ fontSize: 20, color: STATUS_COLORS.green }} />
                              ) : isOverdue ? (
                                <ErrorIcon sx={{ fontSize: 20, color: STATUS_COLORS.red }} />
                              ) : (
                                <RadioButtonUnchecked sx={{ fontSize: 20, color: statusColor }} />
                              )}
                            </Box>

                            {/* Milestone Card */}
                            <Card
                              sx={{
                                p: 2,
                                width: 160,
                                borderRadius: 2,
                                bgcolor: isDark ? customColors.dark.elevated : "#fafafa",
                                border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)"}`,
                                borderTop: `3px solid ${statusColor}`,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: statusColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}
                              >
                                {formatMilestoneDate(milestone.originalDueDate)}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 600, color: "text.primary", mb: 0.5, fontSize: "0.8rem", lineHeight: 1.3 }}
                              >
                                {milestone.milestoneName}
                              </Typography>
                              <Chip
                                label={milestone.status || "Pending"}
                                size="small"
                                sx={{ height: 20, fontSize: "0.6rem", fontWeight: 600, bgcolor: `${statusColor}20`, color: statusColor }}
                              />
                            </Card>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Fade>
    </Modal>
  );
}

export default LandingPage;
