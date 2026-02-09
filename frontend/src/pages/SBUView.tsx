
 //SBU View - Strategic Business Unit Dashboard
 //
 // Hierarchy: SBU -> Initiatives -> Milestones per the 008 document
 // Groups initiatives by their business_unit tag from initiativeTag
 // example tags formatting:
 // {
 //   "business_unit": {
 //     "values": [
 //       { "id": "PBS" },
 //       { "id": "HP" },
 //       { "id": "Enterprise-wide" }
 //     ]
 //   }
 // }


import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Modal,
  Fade,
  Backdrop,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  ExpandMore,
  Warning,
  Business,
  CheckCircle,
  RadioButtonUnchecked,
  RocketLaunch,
  Error as ErrorIcon,
  Close,
} from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import { customColors } from "../theme/muiTheme";
import { useInitiativeData } from "@/context/InitiativeDataContext";
import type { Initiative, Milestone, InitiativeTags } from "@/types";

// Status colors
const STATUS_COLORS = {
  green: "#03cc54",
  amber: "#fbbf24",
  red: "#ba0000",
} as const;

type StatusType = "green" | "amber" | "red";

// Check if initiative has any SBU tags
function hasSBUTags(initiative: Initiative): boolean {
  const tags = initiative.initiativeTags as InitiativeTags | undefined;
  if (!tags?.business_unit?.values) return false;
  return tags.business_unit.values.some(v => Boolean(v.id));
}

// Extract all SBU values from initiative tags
function getSBUFromTags(initiative: Initiative): string[] {
  const tags = initiative.initiativeTags as InitiativeTags | undefined;
  if (!tags?.business_unit?.values) return [];
  return tags.business_unit.values.map(v => v.id).filter(Boolean);
}

// Extract only primary SBU from initiative tags
function getPrimarySBUFromTags(initiative: Initiative): string[] {
  const tags = initiative.initiativeTags as InitiativeTags | undefined;
  if (!tags?.business_unit?.values) return [];
  // Find the primary SBU
  const primarySbu = tags.business_unit.values.find(v => v.primary === true);
  if (primarySbu?.id) return [primarySbu.id];
  // Fallback to first SBU if no primary is set
  const firstSbu = tags.business_unit.values[0]?.id;
  return firstSbu ? [firstSbu] : [];
}

// Get initiative status from confidence or status field
function getInitiativeStatus(initiative: Initiative): StatusType {
  const statusStr = initiative.status?.toLowerCase() || "";
  if (statusStr.includes("blocked") || statusStr.includes("off") || statusStr.includes("red")) {
    return "red";
  }
  if (statusStr.includes("risk") || statusStr.includes("amber")) {
    return "amber";
  }
  if (statusStr.includes("track") || statusStr.includes("green") || statusStr.includes("complete")) {
    return "green";
  }
  // Fallback to confidence
  const confidence = initiative.confidence;
  if (!confidence) return "amber";
  if (confidence >= 4) return "green";
  if (confidence >= 3) return "amber";
  return "red";
}

export function SBUView() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { initiatives, milestones, loading, error } = useInitiativeData();

  const [expandedSBUs, setExpandedSBUs] = useState<Set<string>>(new Set());
  const [expandedInitiatives, setExpandedInitiatives] = useState<Set<string>>(new Set());
  const [selectedInitiative, setSelectedInitiative] = useState<Initiative | null>(null);
  // When true, only show initiatives under their primary SBU
  const [primaryOnly, setPrimaryOnly] = useState(true);

  // Get milestones for an initiative
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

  // Filter to only initiatives with SBU tags
  const taggedInitiatives = initiatives.filter(hasSBUTags);

  // Group initiatives by SBU (primary only or all based on toggle)
  const sbuGroups = taggedInitiatives.reduce((acc, init) => {
    const sbus = primaryOnly ? getPrimarySBUFromTags(init) : getSBUFromTags(init);
    sbus.forEach(sbu => {
      if (!acc[sbu]) {
        acc[sbu] = [];
      }
      acc[sbu].push(init);
    });
    return acc;
  }, {} as Record<string, Initiative[]>);

  // Sort SBUs alphabetically, but put "Unassigned" last
  const sortedSBUs = Object.keys(sbuGroups).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });

  // Auto-expand all SBUs on first load or when primaryOnly changes
  useEffect(() => {
    if (sortedSBUs.length > 0) {
      setExpandedSBUs(new Set(sortedSBUs));
    }
  }, [sortedSBUs.length, primaryOnly]);

  // Calculate SBU-level stats
  const getSBUStats = (inits: Initiative[]) => {
    const counts = { green: 0, amber: 0, red: 0 };
    inits.forEach(init => {
      const status = getInitiativeStatus(init);
      counts[status]++;
    });
    return counts;
  };

  // Toggle SBU expansion
  const toggleSBU = (sbu: string) => {
    setExpandedSBUs(prev => {
      const next = new Set(prev);
      if (next.has(sbu)) {
        next.delete(sbu);
      } else {
        next.add(sbu);
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
          SBU VIEW ({sortedSBUs.length} Business Units, {taggedInitiatives.length} Initiatives)
        </Typography>
        {/* Primary SBU Only Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={primaryOnly}
              onChange={(e) => setPrimaryOnly(e.target.checked)}
              size="small"
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: customColors.brand.navy,
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: customColors.brand.navy,
                },
              }}
            />
          }
          label={
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Primary SBU Only
            </Typography>
          }
          labelPlacement="start"
          sx={{ mr: 0 }}
        />
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
            <Business sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {sortedSBUs.length} Business Units
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            {(() => {
              const allStats = sortedSBUs.reduce(
                (acc, sbu) => {
                  const stats = getSBUStats(sbuGroups[sbu]);
                  acc.green += stats.green;
                  acc.amber += stats.amber;
                  acc.red += stats.red;
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: STATUS_COLORS.red }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{allStats.red}</Typography>
                    <Typography variant="body2" color="text.secondary">Off Track</Typography>
                  </Box>
                </>
              );
            })()}
          </Box>
        </Box>
      </Card>

      {/* SBU Groups */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {sortedSBUs.map(sbu => {
          const inits = sbuGroups[sbu];
          const stats = getSBUStats(inits);
          const isSBUExpanded = expandedSBUs.has(sbu);

          return (
            <Box key={sbu}>
              {/* SBU Header */}
              <Box
                onClick={() => toggleSBU(sbu)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: isSBUExpanded ? 2 : 0,
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
                      transform: isSBUExpanded ? "rotate(180deg)" : "rotate(0deg)",
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
                    {sbu}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {inits.length} Initiative{inits.length !== 1 ? "s" : ""}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={stats.green}
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
                      label={stats.amber}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: `${STATUS_COLORS.amber}20`,
                        color: STATUS_COLORS.amber,
                      }}
                    />
                    <Chip
                      label={stats.red}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        bgcolor: `${STATUS_COLORS.red}20`,
                        color: STATUS_COLORS.red,
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Initiatives under this SBU */}
              <Collapse in={isSBUExpanded}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  {inits.map((init: Initiative) => {
                    const initMilestones = getMilestonesForInitiative(init.initiativeId);
                    const isInitExpanded = expandedInitiatives.has(init.initiativeId);
                    const initStatus = getInitiativeStatus(init);
                    const statusColor = STATUS_COLORS[initStatus];

                    return (
                      <Card
                        key={init.initiativeId}
                        sx={{
                          borderRadius: 2,
                          overflow: "hidden",
                          bgcolor: isDark ? customColors.dark.surface : "#fff",
                          border: `1px solid ${isDark ? customColors.dark.hover : "rgba(0,0,0,0.08)"}`,
                          borderLeft: `3px solid ${statusColor}`,
                        }}
                      >
                        {/* Initiative Header */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                          }}
                        >
                          {/* Status Dot */}
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              bgcolor: statusColor,
                              mr: 1.5,
                              flexShrink: 0,
                            }}
                          />

                          {/* Initiative Info */}
                          <Box 
                            sx={{ 
                              flex: 1, 
                              minWidth: 0, 
                              mr: 2,
                              cursor: "pointer",
                              "&:hover .init-name": {
                                color: "primary.main",
                                textDecoration: "underline",
                              },
                            }}
                            onClick={() => setSelectedInitiative(init)}
                          >
                            <Typography
                              className="init-name"
                              variant="subtitle2"
                              sx={{ fontWeight: 600, color: "text.primary", transition: "all 0.2s" }}
                            >
                              {init.initiativeName}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Owner: {init.initiativeOwner || "—"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>|</Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {initMilestones.length} milestone{initMilestones.length !== 1 ? "s" : ""}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Status Chip */}
                          <Chip
                            label={initStatus === "green" ? "On Track" : initStatus === "amber" ? "At Risk" : "Off Track"}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              mr: 1,
                              bgcolor: `${statusColor}20`,
                              color: statusColor,
                            }}
                          />

                          {/* Timeline Button */}
                          <Chip
                            label="Timeline"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInitiative(init);
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
                            onClick={() => toggleInitiative(init.initiativeId)}
                            sx={{
                              color: "text.secondary",
                              transition: "transform 0.2s",
                              transform: isInitExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          >
                            <ExpandMore fontSize="small" />
                          </IconButton>
                        </Box>

                        {/* Milestones Section (expandable) */}
                        <Collapse in={isInitExpanded}>
                          <Box sx={{ px: 2, pb: 2 }}>
                            <Typography
                              variant="caption"
                              sx={{ 
                                color: "text.secondary", 
                                fontWeight: 600, 
                                letterSpacing: 0.5,
                                display: "block",
                                mb: 1,
                              }}
                            >
                              {initMilestones.length} MILESTONE{initMilestones.length !== 1 ? "S" : ""}
                            </Typography>

                            {initMilestones.length === 0 ? (
                              <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                                No milestones for this initiative.
                              </Typography>
                            ) : (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                                {initMilestones.map((ms, idx) => {
                                  const msStatus = ms.status?.toLowerCase() || "";
                                  const isComplete = msStatus.includes("complete");
                                  const isOverdue = msStatus.includes("overdue") || msStatus.includes("late");
                                  const msColor = isComplete
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
                                        borderLeft: `3px solid ${msColor}`,
                                      }}
                                    >
                                      {isComplete ? (
                                        <CheckCircle sx={{ fontSize: 14, color: msColor }} />
                                      ) : isOverdue ? (
                                        <ErrorIcon sx={{ fontSize: 14, color: msColor }} />
                                      ) : (
                                        <RadioButtonUnchecked sx={{ fontSize: 14, color: msColor }} />
                                      )}
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
                                        sx={{ color: msColor, fontWeight: 700, fontSize: "0.8rem" }}
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
                                          bgcolor: `${msColor}40`,
                                          color: isDark ? "#fff" : msColor,
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
              </Collapse>
            </Box>
          );
        })}
      </Box>

      {sortedSBUs.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography>No initiatives found.</Typography>
        </Box>
      )}

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
                      {/* Show SBU tags */}
                      {getSBUFromTags(selectedInitiative).map(sbu => (
                        <Chip
                          key={sbu}
                          label={sbu}
                          size="small"
                          icon={<Business sx={{ fontSize: 14 }} />}
                          sx={{ 
                            height: 22, 
                            fontSize: "0.7rem", 
                            fontWeight: 600,
                            bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                          }}
                        />
                      ))}
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

                            const msColor = isComplete
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
                                    border: `3px solid ${msColor}`,
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
                                    <RadioButtonUnchecked sx={{ fontSize: 20, color: msColor }} />
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
                                    borderTop: `3px solid ${msColor}`,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ color: msColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}
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
                                    sx={{ height: 20, fontSize: "0.6rem", fontWeight: 600, bgcolor: `${msColor}20`, color: msColor }}
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

export default SBUView;
