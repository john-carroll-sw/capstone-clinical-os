/**
 * Value View - Value-Driven Initiative Dashboard
 * 
 * Hierarchy: Primary Value Driver -> Key Results -> Initiatives -> Milestones
 * Groups KRs by their Primary Value Drivers for a value-focused view
 */

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  IconButton,
  LinearProgress,
  Collapse,
  CircularProgress,
  Modal,
  Fade,
  Backdrop,
  Paper,
  Button,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  Warning,
  TrendingUp,
  Flag,
  Close,
  CheckCircle,
  RadioButtonUnchecked,
  RocketLaunch,
  Error as ErrorIcon,
  ArrowBack,
  Add,
} from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import { customColors } from "../theme/muiTheme";
import { useInitiativeData } from "@/context/InitiativeDataContext";
import type { KeyResult, Initiative, Milestone } from "@/types";

// Status colors
const STATUS_COLORS = {
  green: "#03cc54",
  amber: "#e0a73f",
  red: "#ba0000",
} as const;

type StatusType = "green" | "amber" | "red";

// Parse a numeric value, stripping currency symbols and commas
function parseNumericValue(value?: number | string): number {
  if (value === undefined || value === null || value === "") return NaN;
  if (typeof value === "number") return value;
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

// Calculate status from attainment
function calculateStatusFromAttainment(attainment: number): StatusType {
  if (attainment >= 70) return "green";
  if (attainment >= 40) return "amber";
  return "red";
}

// Get KR current value
function getKRCurrent(kr: KeyResult): number | string | undefined {
  const krData = kr as Record<string, unknown>;
  return kr.current ?? (krData.currentValue as number | string | undefined) ?? (krData.currentValue2 as number | string | undefined);
}

// Get KR target value
function getKRTarget(kr: KeyResult): number | string | undefined {
  return kr.target ?? (kr as Record<string, unknown>).targetValue as number | string | undefined;
}

// Get KR baseline value
function getKRBaseline(kr: KeyResult): number | string | undefined {
  const krData = kr as Record<string, unknown>;
  return (krData.baselineValue as number | string | undefined) ?? (krData.baseline as number | string | undefined);
}

// Get formatted current value for display
function getKRCurrentDisplay(kr: KeyResult): string {
  const formatted = (kr as Record<string, unknown>).currentValueFormatted as string | undefined;
  if (formatted !== undefined) return formatted;
  const raw = getKRCurrent(kr);
  return raw !== undefined ? String(raw) : "—";
}

// Get formatted target value for display
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

// Get KR name - uses metric column from Excel
function getKRName(kr: KeyResult): string {
  const krData = kr as Record<string, unknown>;
  const metric = krData.metric as string | undefined;
  return metric || "";
}

// Get Primary Value Driver from KR (check multiple possible field names)
function getPrimaryValueDriver(kr: KeyResult): string {
  const krData = kr as Record<string, unknown>;
  // "PRIMARY VALUE DRIVER" column normalizes to primaryValueDriver
  const driver = krData.primaryValueDriver;
  return (driver as string) || "Uncategorized";
}

// Check if KR has placeholder metric status
function isPlaceholderMetric(kr: KeyResult): boolean {
  const krData = kr as Record<string, unknown>;
  const metricStatus = krData.metricStatus as string | undefined;
  return metricStatus?.toLowerCase().includes("placeholder") || false;
}


export function Dashboard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { keyResults, initiatives, milestones, loading, error } = useInitiativeData();

  const [expandedTags, setExpandedTags] = useState<Set<string>>(new Set());
  const [expandedKRs, setExpandedKRs] = useState<Set<string>>(new Set());
  const [expandedInitiatives, setExpandedInitiatives] = useState<Set<string>>(new Set());
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  const [selectedKR, setSelectedKR] = useState<KeyResult | null>(null);

  // Get initiatives for a key result
  // Check multiple possible field names since Excel column names vary
  const getInitiativesForKeyResult = (keyResultId: string): Initiative[] => {
    const matched = initiatives.filter(init => {
      const initData = init as Record<string, unknown>;
      // Check various possible field names for the KR reference
      const krRef = init.keyResultId 
        || initData.krId 
        || initData.parentKeyResultId 
        || initData.keyResult
        || initData.parentKeyResult;
      return krRef === keyResultId;
    });
    return matched;
  };

  // Get milestones for an initiative
  // Check multiple possible field names since Excel column names vary
  const getMilestonesForInitiative = (initiativeId: string): Milestone[] => {
    return milestones.filter(m => {
      const msData = m as Record<string, unknown>;
      const initRef = m.initiativeId 
        || msData.parentInitiativeId 
        || msData.parentInitiative
        || msData.initId
        || msData.initiative;
      return initRef === initiativeId;
    });
  };

  // Get all milestones for a Value Driver (through KRs -> Initiatives -> Milestones)
  // Filter: next 6 months OR recently completed (last 30 days)
  const getMilestonesForDriver = (driverKRs: KeyResult[]): { milestone: Milestone; initiative: Initiative }[] => {
    const krIds = driverKRs.map(kr => kr.keyResultId);
    const linkedInitiatives = initiatives.filter(init => {
      const initData = init as Record<string, unknown>;
      const krRef = init.keyResultId || initData.krId || initData.parentKeyResultId;
      return krIds.includes(krRef as string);
    });
    const initIds = linkedInitiatives.map(i => i.initiativeId);
    
    const now = new Date();
    const sixMonthsOut = new Date();
    sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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

    const filteredMilestones: { milestone: Milestone; initiative: Initiative }[] = [];
    
    // Helper to get milestone's initiative reference
    const getMilestoneInitRef = (m: Milestone): string | undefined => {
      const msData = m as Record<string, unknown>;
      return (m.initiativeId 
        || msData.parentInitiativeId 
        || msData.parentInitiative
        || msData.initId
        || msData.initiative) as string | undefined;
    };

    milestones.forEach(m => {
      const milestoneInitRef = getMilestoneInitRef(m);
      if (!milestoneInitRef || !initIds.includes(milestoneInitRef)) return;
      
      const targetDate = parseMilestoneDate(m.originalDueDate);
      if (!targetDate || isNaN(targetDate.getTime())) {
        // Include milestones without dates
        const parentInit = linkedInitiatives.find(i => i.initiativeId === milestoneInitRef);
        if (parentInit) {
          filteredMilestones.push({ milestone: m, initiative: parentInit });
        }
        return;
      }
      
      const isComplete = m.status?.toLowerCase().includes("complete");
      const isUpcoming = targetDate <= sixMonthsOut && targetDate >= now;
      const isRecentlyCompleted = isComplete && targetDate >= thirtyDaysAgo;
      
      if (isUpcoming || isRecentlyCompleted) {
        const parentInit = linkedInitiatives.find(i => i.initiativeId === milestoneInitRef);
        if (parentInit) {
          filteredMilestones.push({ milestone: m, initiative: parentInit });
        }
      }
    });

    // Sort by date
    return filteredMilestones.sort((a, b) => {
      const dateA = parseMilestoneDate(a.milestone.originalDueDate);
      const dateB = parseMilestoneDate(b.milestone.originalDueDate);
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Toggle milestone section expansion
  const toggleMilestoneSection = (driver: string) => {
    setExpandedMilestones(prev => {
      const next = new Set(prev);
      if (next.has(driver)) {
        next.delete(driver);
      } else {
        next.add(driver);
      }
      return next;
    });
  };

  // Filter out KRs without a primary value driver, then group by driver
  const krsWithDriver = keyResults.filter(kr => {
    const krData = kr as Record<string, unknown>;
    const driver = krData.primaryValueDriver;
    return driver && String(driver).trim() !== "";
  });

  const driverGroups = krsWithDriver.reduce((acc, kr) => {
    const driver = getPrimaryValueDriver(kr);
    if (!acc[driver]) {
      acc[driver] = [];
    }
    acc[driver].push(kr);
    return acc;
  }, {} as Record<string, KeyResult[]>);

  // Sort drivers alphabetically
  const sortedDrivers = Object.keys(driverGroups).sort((a, b) => a.localeCompare(b));

  // Auto-expand all drivers on first load
  useEffect(() => {
    if (sortedDrivers.length > 0 && expandedTags.size === 0) {
      setExpandedTags(new Set(sortedDrivers));
    }
  }, [sortedDrivers.length]);


  // Calculate driver-level stats
  const getDriverStats = (krs: KeyResult[]) => {
    const counts = { green: 0, amber: 0, red: 0 };
    let totalAttainment = 0;
    krs.forEach(kr => {
      const attainment = calculateAttainment(getKRCurrent(kr), getKRTarget(kr), getKRBaseline(kr));
      const status = calculateStatusFromAttainment(attainment);
      counts[status]++;
      totalAttainment += attainment;
    });
    return {
      counts,
      avgAttainment: krs.length > 0 ? Math.round(totalAttainment / krs.length) : 0,
    };
  };

  // Toggle driver expansion
  const toggleDriver = (driver: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev);
      if (next.has(driver)) {
        next.delete(driver);
      } else {
        next.add(driver);
      }
      return next;
    });
  };

  // Toggle KR expansion
  const toggleKR = (krId: string) => {
    setExpandedKRs(prev => {
      const next = new Set(prev);
      if (next.has(krId)) {
        next.delete(krId);
      } else {
        next.add(krId);
      }
      return next;
    });
  };

  // Toggle Initiative expansion
  const toggleInitiative = (initId: string) => {
    setExpandedInitiatives(prev => {
      const next = new Set(prev);
      if (next.has(initId)) {
        next.delete(initId);
      } else {
        next.add(initId);
      }
      return next;
    });
  };

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
      {/* Header */}
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
          VALUE VIEW ({sortedDrivers.length} Value Drivers, {krsWithDriver.length} KRs, {initiatives.length} Initiatives)
        </Typography>
      </Box>

      {/* Summary Card */}
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
            <TrendingUp sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {sortedDrivers.length} Value Drivers
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            {(() => {
              const allStats = sortedDrivers.reduce(
                (acc, driver) => {
                  const stats = getDriverStats(driverGroups[driver]);
                  acc.green += stats.counts.green;
                  acc.amber += stats.counts.amber;
                  acc.red += stats.counts.red;
                  return acc;
                },
                { green: 0, amber: 0, red: 0 }
              );
              return (
                <>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: STATUS_COLORS.green }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{allStats.green}</Typography>
                    <Typography variant="body2" color="text.secondary">On Track</Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: STATUS_COLORS.amber }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{allStats.amber}</Typography>
                    <Typography variant="body2" color="text.secondary">At Risk</Typography>
                  </Box>
                </>
              );
            })()}
          </Box>
        </Box>
      </Card>

      {/* Value Driver Groups */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {sortedDrivers.map(driver => {
          const krs = driverGroups[driver];
          const stats = getDriverStats(krs);
          const isDriverExpanded = expandedTags.has(driver);

          return (
            <Box key={driver}>
              {/* Driver Header */}
              <Box
                onClick={() => toggleDriver(driver)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: isDriverExpanded ? 2 : 0,
                  pb: 1,
                  borderBottom: 2,
                  borderColor: isDark ? "primary.main" : customColors.brand.navy,
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    sx={{
                      color: isDark ? "primary.main" : customColors.brand.navy,
                      transition: "transform 0.2s",
                      transform: isDriverExpanded ? "rotate(180deg)" : "rotate(0deg)",
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
                    {driver}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {krs.length} KR{krs.length !== 1 ? "s" : ""} | Avg {stats.avgAttainment}%
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={stats.counts.green}
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
                      label={stats.counts.amber}
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

              {/* Key Results under this driver */}
              <Collapse in={isDriverExpanded}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {krs.map(kr => {
                    const krCurrent = getKRCurrent(kr);
                    const krTarget = getKRTarget(kr);
                    const krBaseline = getKRBaseline(kr);
                    const attainment = calculateAttainment(krCurrent, krTarget, krBaseline);
                    const krStatus = calculateStatusFromAttainment(attainment);
                    const krInitiatives = getInitiativesForKeyResult(kr.keyResultId);
                    const isKRExpanded = expandedKRs.has(kr.keyResultId);

                    return (
                      <Card
                        key={kr.id}
                        sx={{
                          borderRadius: 2,
                          overflow: "hidden",
                          bgcolor: isDark ? customColors.dark.surface : "#fff",
                          border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)"}`,
                        }}
                      >
                        {/* KR Header - KPI Format */}
                        <Box
                          onClick={() => toggleKR(kr.keyResultId)}
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
                          {/* Status Dot */}
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: STATUS_COLORS[krStatus],
                              mr: 1.5,
                              flexShrink: 0,
                            }}
                          />

                          {/* KPI Info */}
                          <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography
                                variant="subtitle2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedKR(kr);
                                }}
                                sx={{ 
                                  fontWeight: 600, 
                                  color: "text.primary",
                                  cursor: "pointer",
                                  "&:hover": {
                                    color: "primary.main",
                                    textDecoration: "underline",
                                  },
                                }}
                              >
                                {getKRName(kr)}
                              </Typography>
                              {isPlaceholderMetric(kr) && (
                                <Tooltip 
                                  title="This metric uses placeholder data. Actual values will be updated when available."
                                  arrow
                                  placement="top"
                                >
                                  <Chip
                                    label="Placeholder"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: "0.6rem",
                                      fontWeight: 600,
                                      bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                                      color: "text.secondary",
                                      cursor: "help",
                                    }}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}>
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Baseline: {getKRBaselineDisplay(kr)} | Current: {getKRCurrentDisplay(kr)} | Target: {getKRTargetDisplay(kr)}
                              </Typography>
                              {isPlaceholderMetric(kr) && (
                                <Tooltip title="Based on placeholder data" arrow placement="top">
                                  <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>

                          {/* Attainment % */}
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mr: 2, flexShrink: 0 }}>
                            <Box sx={{ textAlign: "right" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                                <Typography
                                  variant="h6"
                                  sx={{ 
                                    fontWeight: 600, 
                                    color: STATUS_COLORS[krStatus],
                                    fontSize: "1rem",
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
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Attainment
                              </Typography>
                            </Box>
                            {(krStatus === "green" || krStatus === "amber") && (
                              <Chip
                                label={krStatus === "green" ? "On Track" : "At Risk"}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: `${STATUS_COLORS[krStatus]}20`,
                                  color: STATUS_COLORS[krStatus],
                                }}
                              />
                            )}
                          </Box>

                          {/* Initiatives Count */}
                          <Chip
                            label={`${krInitiatives.length} Initiative${krInitiatives.length !== 1 ? "s" : ""}`}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              mr: 1,
                              bgcolor: krInitiatives.length > 0 
                                ? (isDark ? "rgba(3,204,84,0.15)" : "rgba(3,204,84,0.1)") 
                                : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
                              color: krInitiatives.length > 0 ? STATUS_COLORS.green : "text.secondary",
                            }}
                          />

                          {/* Details Button */}
                          <Chip
                            label="Details"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedKR(kr);
                            }}
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              mr: 1,
                              cursor: "pointer",
                              bgcolor: isDark ? "primary.dark" : "primary.main",
                              color: "#fff",
                              "&:hover": { bgcolor: isDark ? "primary.main" : "primary.dark" },
                            }}
                          />

                          {/* Expand Icon */}
                          <IconButton
                            size="small"
                            sx={{
                              color: "text.secondary",
                              transition: "transform 0.2s",
                              transform: isKRExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          >
                            <ExpandMore fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Progress Bar */}
                        <Box sx={{ px: 2, pb: 1.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={attainment}
                            sx={{
                              height: 4,
                              borderRadius: 1,
                              bgcolor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                              "& .MuiLinearProgress-bar": {
                                bgcolor: STATUS_COLORS[krStatus],
                                borderRadius: 1,
                              },
                            }}
                          />
                        </Box>

                        {/* Initiatives Section (expandable) */}
                        <Collapse in={isKRExpanded}>
                          <Box sx={{ px: 2, pb: 2 }}>
                            {/* Initiatives count header */}
                            <Box sx={{ 
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1.5,
                            }}>
                              <Typography
                                variant="caption"
                                sx={{ 
                                  color: krInitiatives.length > 0 ? STATUS_COLORS.green : "text.secondary", 
                                  fontWeight: 600, 
                                  letterSpacing: 0.5, 
                                }}
                              >
                                {krInitiatives.length} INITIATIVE{krInitiatives.length !== 1 ? "S" : ""}
                              </Typography>
                            </Box>

                            {krInitiatives.length === 0 ? (
                              <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                                No initiatives linked to this KPI.
                              </Typography>
                            ) : (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {krInitiatives.map((init: Initiative) => {
                                  const initMilestones = getMilestonesForInitiative(init.initiativeId);
                                  const isInitExpanded = expandedInitiatives.has(init.initiativeId);

                                  return (
                                    <Card
                                      key={init.initiativeId}
                                      sx={{
                                        borderRadius: 1.5,
                                        bgcolor: isDark ? customColors.dark.elevated : "#f8f9fa",
                                        border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)"}`,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          p: 1.5,
                                        }}
                                      >
                                        <Box 
                                          sx={{ 
                                            flex: 1, 
                                            cursor: "pointer",
                                            "&:hover .init-name": {
                                              color: "primary.main",
                                              textDecoration: "underline",
                                            },
                                          }}
                                          onClick={() => setSelectedInitiative(init)}
                                        >
                                          <Typography className="init-name" variant="body2" sx={{ fontWeight: 600, transition: "all 0.2s" }}>
                                            {init.initiativeName}
                                          </Typography>
                                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            {initMilestones.length} milestone{initMilestones.length !== 1 ? "s" : ""}
                                          </Typography>
                                        </Box>
                                        <Chip
                                          label="Timeline"
                                          size="small"
                                          onClick={() => setSelectedInitiative(init)}
                                          sx={{
                                            height: 22,
                                            fontSize: "0.65rem",
                                            fontWeight: 600,
                                            mr: 1,
                                            cursor: "pointer",
                                            bgcolor: isDark ? "primary.dark" : "primary.main",
                                            color: "#fff",
                                            "&:hover": { bgcolor: isDark ? "primary.main" : "primary.dark" },
                                          }}
                                        />
                                        <IconButton size="small" onClick={() => toggleInitiative(init.initiativeId)}>
                                          <ExpandMore
                                            fontSize="small"
                                            sx={{
                                              transition: "transform 0.2s",
                                              transform: isInitExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                            }}
                                          />
                                        </IconButton>
                                      </Box>

                                      <Collapse in={isInitExpanded}>
                                        <Box sx={{ px: 1.5, pb: 1.5 }}>
                                          {initMilestones.length === 0 ? (
                                            <Typography variant="caption" sx={{ color: "text.disabled" }}>
                                              No milestones
                                            </Typography>
                                          ) : (
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                                              {initMilestones.map((ms, idx) => {
                                                const msStatus = ms.status?.toLowerCase() || "";
                                                const isComplete = msStatus.includes("complete");
                                                const isOverdue = msStatus.includes("overdue") || msStatus.includes("late");
                                                const statusColor = isComplete
                                                  ? STATUS_COLORS.green
                                                  : isOverdue
                                                    ? STATUS_COLORS.red
                                                    : STATUS_COLORS.amber;

                                                const formatMsDate = (date: string | number | undefined): string => {
                                                  if (!date) return "TBD";
                                                  try {
                                                    let dateObj: Date;
                                                    if (typeof date === "number") {
                                                      dateObj = new Date((date - 25569) * 86400000);
                                                    } else if (typeof date === "string") {
                                                      const normalized = date.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u002D]/g, "-");
                                                      if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                                        const [year, month, day] = normalized.split("-").map(Number);
                                                        dateObj = new Date(year, month - 1, day);
                                                      } else {
                                                        dateObj = new Date(normalized);
                                                      }
                                                    } else {
                                                      return "TBD";
                                                    }
                                                    if (isNaN(dateObj.getTime())) return "TBD";
                                                    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                                                  } catch {
                                                    return "TBD";
                                                  }
                                                };

                                                return (
                                                  <Box
                                                    key={ms.id || idx}
                                                    sx={{
                                                      display: "flex",
                                                      alignItems: "center",
                                                      gap: 1,
                                                      p: 1,
                                                      borderRadius: 1,
                                                      bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                                      borderLeft: `3px solid ${statusColor}`,
                                                    }}
                                                  >
                                                    <Box
                                                      sx={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        bgcolor: statusColor,
                                                        flexShrink: 0,
                                                      }}
                                                    />
                                                    <Typography
                                                      variant="caption"
                                                      sx={{
                                                        flex: 1,
                                                        fontWeight: 500,
                                                        textDecoration: isComplete ? "line-through" : "none",
                                                        color: isComplete ? "text.disabled" : "text.primary",
                                                      }}
                                                    >
                                                      {ms.milestoneName}
                                                    </Typography>
                                                    <Typography
                                                      variant="body2"
                                                      sx={{ color: statusColor, fontWeight: 700, fontSize: "0.8rem" }}
                                                    >
                                                      {formatMsDate(ms.originalDueDate)}
                                                    </Typography>
                                                    <Chip
                                                      label={ms.status || "Pending"}
                                                      size="small"
                                                      sx={{
                                                        height: 20,
                                                        fontSize: "0.65rem",
                                                        fontWeight: 700,
                                                        bgcolor: `${statusColor}40`,
                                                        color: isDark ? "#fff" : statusColor,
                                                      }}
                                                    />
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
                            )}
                          </Box>
                        </Collapse>
                      </Card>
                    );
                  })}
                </Box>
              </Collapse>

              {/* Milestones Section for this Driver */}
              {isDriverExpanded && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    onClick={() => toggleMilestoneSection(driver)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? customColors.dark.elevated : "#f4f4f4",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Flag sx={{ fontSize: 18, color: "primary.main" }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Milestones (Next 6 Months)
                      </Typography>
                      <Chip
                        label={getMilestonesForDriver(krs).length}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                        }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      sx={{
                        color: "text.secondary",
                        transition: "transform 0.2s",
                        transform: expandedMilestones.has(driver) ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <ExpandMore fontSize="small" />
                    </IconButton>
                  </Box>

                  <Collapse in={expandedMilestones.has(driver)}>
                    <Box
                      sx={{
                        mt: 1,
                        maxHeight: 400,
                        overflowY: "auto",
                        overflowX: "hidden",
                        "&::-webkit-scrollbar": {
                          width: 6,
                        },
                        "&::-webkit-scrollbar-track": {
                          bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                          borderRadius: 3,
                        },
                        "&::-webkit-scrollbar-thumb": {
                          bgcolor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                          borderRadius: 3,
                        },
                      }}
                    >
                      {(() => {
                        const driverMilestones = getMilestonesForDriver(krs);
                        
                        if (driverMilestones.length === 0) {
                          return (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", p: 2 }}>
                              No upcoming milestones for this value driver.
                            </Typography>
                          );
                        }

                        const formatMilestoneDate = (date: string | number | undefined): string => {
                          if (!date) return "TBD";
                          try {
                            let dateObj: Date;
                            if (typeof date === "number") {
                              dateObj = new Date((date - 25569) * 86400000);
                            } else if (typeof date === "string") {
                              const normalized = date.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u002D]/g, "-");
                              if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                const [year, month, day] = normalized.split("-").map(Number);
                                dateObj = new Date(year, month - 1, day);
                              } else {
                                dateObj = new Date(normalized);
                              }
                            } else {
                              return "TBD";
                            }
                            if (isNaN(dateObj.getTime())) return "TBD";
                            return dateObj.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            });
                          } catch {
                            return "TBD";
                          }
                        };

                        return (
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            {driverMilestones.map(({ milestone, initiative }, idx) => {
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
                                  sx={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: isDark ? customColors.dark.surface : "#fff",
                                    border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)"}`,
                                    borderLeft: `3px solid ${statusColor}`,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      bgcolor: statusColor,
                                      mt: 0.5,
                                      mr: 1.5,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 600, color: "text.primary", mb: 0.25 }}
                                    >
                                      {milestone.milestoneName}
                                    </Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        Initiative: {initiative.initiativeName}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ textAlign: "right", flexShrink: 0, ml: 2 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 700, color: statusColor, fontSize: "0.85rem" }}
                                    >
                                      {formatMilestoneDate(milestone.originalDueDate)}
                                    </Typography>
                                    <Chip
                                      label={milestone.status || "Pending"}
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        fontWeight: 700,
                                        bgcolor: `${statusColor}40`,
                                        color: isDark ? "#fff" : statusColor,
                                        mt: 0.5,
                                      }}
                                    />
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        );
                      })()}
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {sortedDrivers.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography>No key results found.</Typography>
        </Box>
      )}

      {/* KR Detail Modal - Matching OKR View */}
      <Modal
        open={!!selectedKR}
        onClose={() => setSelectedKR(null)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { backdropFilter: "blur(4px)" },
          },
        }}
      >
        <Fade in={!!selectedKR}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: { xs: "95%", md: "85%", lg: "80%" },
              maxWidth: 1100,
              maxHeight: "90vh",
              overflow: "auto",
              bgcolor: isDark ? customColors.dark.surface : "#fff",
              borderRadius: 3,
              boxShadow: 24,
              border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)"}`,
            }}
          >
            {selectedKR && (() => {
              const krCurrent = getKRCurrent(selectedKR);
              const krTarget = getKRTarget(selectedKR);
              const krBaseline = getKRBaseline(selectedKR);
              const krAttainment = calculateAttainment(krCurrent, krTarget, krBaseline);
              const krStatus = calculateStatusFromAttainment(krAttainment);
              const krInits = getInitiativesForKeyResult(selectedKR.keyResultId);
              const healthColor = STATUS_COLORS[krStatus];
              const driver = getPrimaryValueDriver(selectedKR);

              return (
                <>
                  {/* Header */}
                  <Box sx={{ p: 3, borderBottom: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.06)"}` }}>
                    {/* Back link */}
                    <Button
                      startIcon={<ArrowBack />}
                      onClick={() => setSelectedKR(null)}
                      sx={{
                        mb: 2,
                        color: "text.secondary",
                        "&:hover": { color: "primary.main", bgcolor: "transparent" },
                      }}
                    >
                      {driver}
                    </Button>

                    {/* Status and Attainment */}
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 3 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: healthColor }} />
                          <Chip
                            label={krStatus.toUpperCase()}
                            size="small"
                            sx={{
                              bgcolor: `${healthColor}20`,
                              color: healthColor,
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            | {krAttainment}% attained
                          </Typography>
                          {isPlaceholderMetric(selectedKR) && (
                            <Tooltip title="Based on placeholder data" arrow placement="top">
                              <Chip
                                label="Placeholder"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: "0.6rem",
                                  fontWeight: 600,
                                  bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                                  color: "text.secondary",
                                  cursor: "help",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}>
                          {getKRName(selectedKR)}
                        </Typography>

                        <Box sx={{ display: "flex", gap: 4, mt: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                              Baseline
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                                {getKRBaselineDisplay(selectedKR)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                              Current
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                                {getKRCurrentDisplay(selectedKR)}
                              </Typography>
                              {isPlaceholderMetric(selectedKR) && (
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
                                {getKRTargetDisplay(selectedKR)}
                              </Typography>
                              {isPlaceholderMetric(selectedKR) && (
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
                                {krAttainment}%
                              </Typography>
                              {isPlaceholderMetric(selectedKR) && (
                                <Tooltip title="Based on placeholder data" arrow placement="top">
                                  <Typography variant="caption" sx={{ color: "text.disabled", cursor: "help" }}>*</Typography>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={krAttainment}
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
                    </Box>
                  </Box>

                  {/* Content - Initiatives */}
                  <Box sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "text.primary" }}>
                        Initiatives <Chip label={krInits.length} size="small" sx={{ ml: 1, height: 20, fontSize: "0.7rem" }} />
                      </Typography>
                      <Button startIcon={<Add />} size="small" sx={{ color: "primary.main" }}>
                        Add Initiative
                      </Button>
                    </Box>

                    {krInits.length === 0 ? (
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
                        {krInits.map((init) => {
                          const initMilestones = getMilestonesForInitiative(init.initiativeId);
                          const initStatus = init.status?.toLowerCase() || "";
                          const isBlocked = initStatus.includes("blocked");
                          const statusColor = isBlocked ? STATUS_COLORS.red : STATUS_COLORS.green;

                          return (
                            <Paper
                              key={init.initiativeId}
                              variant="outlined"
                              sx={{
                                p: 2,
                                borderLeft: 3,
                                borderLeftColor: statusColor,
                                borderColor: isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)",
                                bgcolor: isDark ? customColors.dark.elevated : "#fafafa",
                              }}
                            >
                              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: statusColor }} />
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "text.primary" }}>
                                      {init.initiativeName}
                                    </Typography>
                                    {isBlocked && (
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
                                    <Typography variant="caption" color="text.secondary">
                                      {initMilestones.length} Milestone{initMilestones.length !== 1 ? "s" : ""}
                                    </Typography>
                                  </Box>

                                  {/* Milestones preview */}
                                  {initMilestones.length > 0 && (
                                    <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                                      {initMilestones.slice(0, 2).map((ms, idx) => {
                                        const msStatus = ms.status?.toLowerCase() || "";
                                        const isComplete = msStatus.includes("complete");
                                        const isOverdue = msStatus.includes("overdue") || msStatus.includes("late");
                                        const msColor = isComplete ? STATUS_COLORS.green : isOverdue ? STATUS_COLORS.red : STATUS_COLORS.amber;
                                        
                                        return (
                                          <Box
                                            key={ms.id || idx}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              p: 0.5,
                                              borderRadius: 0.5,
                                              bgcolor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                                            }}
                                          >
                                            {isComplete ? (
                                              <CheckCircle sx={{ fontSize: 12, color: msColor }} />
                                            ) : (
                                              <RadioButtonUnchecked sx={{ fontSize: 12, color: msColor }} />
                                            )}
                                            <Typography variant="caption" sx={{ flex: 1, fontSize: "0.7rem" }}>
                                              {ms.milestoneName}
                                            </Typography>
                                            <Chip
                                              label={ms.status || "Pending"}
                                              size="small"
                                              sx={{
                                                height: 14,
                                                fontSize: "0.5rem",
                                                fontWeight: 600,
                                                bgcolor: `${msColor}30`,
                                                color: msColor,
                                              }}
                                            />
                                          </Box>
                                        );
                                      })}
                                      {initMilestones.length > 2 && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                                          +{initMilestones.length - 2} more
                                        </Typography>
                                      )}
                                    </Box>
                                  )}
                                </Box>

                                <Chip
                                  label="Timeline"
                                  size="small"
                                  onClick={() => {
                                    setSelectedKR(null);
                                    setSelectedInitiative(init);
                                  }}
                                  sx={{
                                    height: 24,
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    bgcolor: isDark ? "primary.dark" : "primary.main",
                                    color: "#fff",
                                    "&:hover": { bgcolor: isDark ? "primary.main" : "primary.dark" },
                                  }}
                                />
                              </Box>
                            </Paper>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                </>
              );
            })()}
          </Box>
        </Fade>
      </Modal>

      {/* Initiative Modal */}
      <Modal
        open={!!selectedInitiative}
        onClose={() => setSelectedInitiative(null)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 300,
          sx: { backdropFilter: "blur(4px)" },
        }}
      >
        <Fade in={!!selectedInitiative}>
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
                  <IconButton onClick={() => setSelectedInitiative(null)}>
                    <Close />
                  </IconButton>
                </Box>

                {/* Timeline Section */}
                <Box sx={{ p: 3, flex: 1, overflow: "hidden" }}>
                  <Typography
                    variant="overline"
                    sx={{ color: "text.secondary", fontWeight: 600, letterSpacing: 1.5, mb: 2, display: "block" }}
                  >
                    MILESTONE TIMELINE ({getMilestonesForInitiative(selectedInitiative.initiativeId).length})
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
                    {(() => {
                      const initMilestones = getMilestonesForInitiative(selectedInitiative.initiativeId);
                      
                      const parseDate = (date: string | number | undefined): number => {
                        if (!date) return 0;
                        if (typeof date === "number") return (date - 25569) * 86400000;
                        if (typeof date === "string") {
                          const normalized = date.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u002D]/g, "-");
                          if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const [year, month, day] = normalized.split("-").map(Number);
                            return new Date(year, month - 1, day).getTime();
                          }
                          return new Date(normalized).getTime() || 0;
                        }
                        return 0;
                      };

                      const sortedMilestones = [...initMilestones].sort((a, b) => parseDate(a.originalDueDate) - parseDate(b.originalDueDate));

                      if (sortedMilestones.length === 0) {
                        return (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                            No milestones for this initiative.
                          </Typography>
                        );
                      }

                        return (
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

                              const formatDate = (date: string | number | undefined) => {
                                if (!date) return "TBD";
                                try {
                                  let dateObj: Date;
                                  if (typeof date === "number") {
                                    dateObj = new Date((date - 25569) * 86400000);
                                  } else if (typeof date === "string") {
                                    const normalized = date.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D\u002D]/g, "-");
                                    if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                      const [year, month, day] = normalized.split("-").map(Number);
                                      dateObj = new Date(year, month - 1, day);
                                    } else {
                                      dateObj = new Date(normalized);
                                    }
                                  } else {
                                    return "TBD";
                                  }
                                  if (isNaN(dateObj.getTime())) return "TBD";
                                  return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                                } catch {
                                  return "TBD";
                                }
                              };

                              return (
                                <Box
                                  key={milestone.id || idx}
                                  sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: 180, flexShrink: 0, position: "relative" }}
                                >
                                  {/* Connector line */}
                                  {idx < sortedMilestones.length - 1 && (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: 16,
                                        left: 90,
                                        width: 180,
                                        height: 3,
                                        bgcolor: isComplete ? STATUS_COLORS.green : (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"),
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
                                    {formatDate(milestone.originalDueDate)}
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
                      );
                    })()}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

export default Dashboard;
