/**
 * ItemDetailModal - Shows detailed view of a portfolio item with full context
 * 
 * Displays hierarchical data:
 * - Objective → Key Results → Initiatives → Milestones
 * 
 * Used from ForYouPage when clicking on briefing items.
 */

import { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  alpha,
  LinearProgress,
} from "@mui/material";
import {
  Close,
  Flag,
  TrendingUp,
  Rocket,
  CalendarToday,
  Person,
  CheckCircle,
  Schedule,
  Warning,
  Circle,
  ArrowForward,
} from "@mui/icons-material";
import { useInitiativeData } from "@/context/InitiativeDataContext";
import type { BriefingItem } from "@/types/briefing.types";
import type { Objective, KeyResult, Initiative, Milestone } from "@/types";
import { customColors } from "@/theme/muiTheme";

interface ItemDetailModalProps {
  open: boolean;
  onClose: () => void;
  item: BriefingItem | null;
}

// Status colors
const STATUS_COLORS = {
  green: "#03cc54",
  amber: "#e0a73f",
  red: "#ba0000",
} as const;

function getHealthColor(attainment: number | undefined): string {
  if (attainment === undefined || attainment === null) return STATUS_COLORS.amber;
  if (attainment >= 70) return STATUS_COLORS.green;
  if (attainment >= 40) return STATUS_COLORS.amber;
  return STATUS_COLORS.red;
}

function getMilestoneStatusColor(status?: string): string {
  switch (status?.toLowerCase()) {
    case "completed":
      return STATUS_COLORS.green;
    case "on track":
    case "in progress":
      return STATUS_COLORS.green;
    case "at risk":
    case "delayed":
      return STATUS_COLORS.amber;
    case "blocked":
    case "missed":
      return STATUS_COLORS.red;
    default:
      return "#9ca3af";
  }
}

function getMilestoneStatusIcon(status?: string) {
  switch (status?.toLowerCase()) {
    case "completed":
      return <CheckCircle sx={{ fontSize: 16 }} />;
    case "on track":
    case "in progress":
      return <Schedule sx={{ fontSize: 16 }} />;
    case "at risk":
    case "delayed":
      return <Warning sx={{ fontSize: 16 }} />;
    case "blocked":
    case "missed":
      return <Warning sx={{ fontSize: 16 }} />;
    default:
      return <Circle sx={{ fontSize: 16 }} />;
  }
}

export function ItemDetailModal({ open, onClose, item }: ItemDetailModalProps) {
  const { objectives, keyResults, initiatives, milestones, initiativeUpdates } = useInitiativeData();

  // Resolve the full context based on entity type
  const context = useMemo(() => {
    if (!item) return null;

    const entityId = item.entityId;
    const entityType = item.entityType;

    let objective: Objective | undefined;
    let keyResult: KeyResult | undefined;
    let initiative: Initiative | undefined;
    let relatedKeyResults: KeyResult[] = [];
    let relatedInitiatives: Initiative[] = [];
    let relatedMilestones: Milestone[] = [];

    if (entityType === "objective") {
      objective = objectives.find(o => o.objectiveId === entityId);
      if (objective) {
        relatedKeyResults = keyResults.filter(kr => kr.objectiveId === entityId);
        const krIds = relatedKeyResults.map(kr => kr.keyResultId);
        relatedInitiatives = initiatives.filter(i => krIds.includes(i.keyResultId || ""));
        // Also get all milestones for all initiatives under this objective
        const initIds = relatedInitiatives.map(i => i.initiativeId);
        relatedMilestones = milestones.filter(m => initIds.includes(m.initiativeId || ""));
      }
    } else if (entityType === "keyResult") {
      keyResult = keyResults.find(kr => kr.keyResultId === entityId);
      if (keyResult) {
        objective = objectives.find(o => o.objectiveId === keyResult!.objectiveId);
        relatedInitiatives = initiatives.filter(i => i.keyResultId === entityId);
        const initIds = relatedInitiatives.map(i => i.initiativeId);
        relatedMilestones = milestones.filter(m => initIds.includes(m.initiativeId || ""));
      }
    } else if (entityType === "initiative") {
      initiative = initiatives.find(i => i.initiativeId === entityId);
      if (initiative) {
        keyResult = keyResults.find(kr => kr.keyResultId === initiative!.keyResultId);
        if (keyResult) {
          objective = objectives.find(o => o.objectiveId === keyResult!.objectiveId);
        }
        relatedMilestones = milestones.filter(m => m.initiativeId === entityId);
      }
    } else if (entityType === "milestone") {
      const milestone = milestones.find(m => m.milestoneId === entityId);
      if (milestone) {
        initiative = initiatives.find(i => i.initiativeId === milestone.initiativeId);
        if (initiative) {
          keyResult = keyResults.find(kr => kr.keyResultId === initiative!.keyResultId);
          if (keyResult) {
            objective = objectives.find(o => o.objectiveId === keyResult!.objectiveId);
          }
          relatedMilestones = milestones.filter(m => m.initiativeId === initiative!.initiativeId);
        }
      }
    }

    // Get recent updates for related initiatives
    const initIds = initiative 
      ? [initiative.initiativeId]
      : relatedInitiatives.map(i => i.initiativeId);
    const recentUpdates = initiativeUpdates
      .filter(u => initIds.includes(u.initiativeId || ""))
      .sort((a, b) => {
        const dateA = a.updateDate ? new Date(a.updateDate).getTime() : 0;
        const dateB = b.updateDate ? new Date(b.updateDate).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);

    return {
      objective,
      keyResult,
      initiative,
      relatedKeyResults,
      relatedInitiatives,
      relatedMilestones,
      recentUpdates,
    };
  }, [item, objectives, keyResults, initiatives, milestones, initiativeUpdates]);

  if (!item || !context) {
    return null;
  }

  const { objective, keyResult, initiative, relatedKeyResults, relatedInitiatives, relatedMilestones, recentUpdates } = context;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          backgroundImage: "none",
          borderRadius: 3,
          maxHeight: "85vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
          pb: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
          >
            {item.summary}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={item.entityType === "keyResult" ? "Key Result" : item.entityType}
              size="small"
              sx={{
                textTransform: "capitalize",
                bgcolor: alpha(customColors.accent.cyan, 0.12),
                color: customColors.accent.cyan,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
            {item.owner && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                <Person sx={{ fontSize: 14 }} />
                <Typography variant="caption">{item.owner}</Typography>
              </Box>
            )}
            {item.magnitude !== undefined && item.magnitude !== null && (
              <Chip
                label={`${item.magnitude.toFixed(0)}%`}
                size="small"
                sx={{
                  bgcolor: alpha(getHealthColor(item.magnitude), 0.12),
                  color: getHealthColor(item.magnitude),
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              />
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {/* So What - Context */}
        {item.soWhat && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", lineHeight: 1.6 }}
            >
              {item.soWhat}
            </Typography>
          </Box>
        )}

        {/* ===== HIERARCHICAL TREE VIEW FOR OBJECTIVES ===== */}
        {item.entityType === "objective" && objective && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Objective Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(customColors.accent.cyan, 0.06),
                border: "1px solid",
                borderColor: alpha(customColors.accent.cyan, 0.2),
                mb: 1,
              }}
            >
              <Flag sx={{ fontSize: 20, color: customColors.accent.cyan }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {objective.objectiveName}
                </Typography>
                {objective.objectiveOwner && (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Owner: {objective.objectiveOwner}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Key Results Tree */}
            {relatedKeyResults.length > 0 ? (
              <Box sx={{ pl: 2, borderLeft: "2px solid", borderColor: "divider", ml: 2 }}>
                {relatedKeyResults.map((kr, krIndex) => {
                  const krInitiatives = relatedInitiatives.filter(i => i.keyResultId === kr.keyResultId);
                  const isLastKr = krIndex === relatedKeyResults.length - 1;
                  
                  return (
                    <Box key={kr.keyResultId} sx={{ mb: isLastKr ? 0 : 2 }}>
                      {/* KR Card */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                          position: "relative",
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            left: -18,
                            top: "50%",
                            width: 16,
                            height: 2,
                            bgcolor: "divider",
                          },
                        }}
                      >
                        <TrendingUp sx={{ fontSize: 18, color: getHealthColor(kr.attainment) }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {kr.keyResultName}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(kr.attainment || 0, 100)}
                            sx={{
                              height: 4,
                              borderRadius: 2,
                              mt: 0.5,
                              bgcolor: alpha(getHealthColor(kr.attainment), 0.1),
                              "& .MuiLinearProgress-bar": {
                                bgcolor: getHealthColor(kr.attainment),
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>
                        <Chip
                          label={`${kr.attainment?.toFixed(0) || 0}%`}
                          size="small"
                          sx={{
                            bgcolor: alpha(getHealthColor(kr.attainment), 0.12),
                            color: getHealthColor(kr.attainment),
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>

                      {/* Initiatives under this KR */}
                      {krInitiatives.length > 0 && (
                        <Box sx={{ pl: 2, borderLeft: "2px solid", borderColor: alpha(STATUS_COLORS.green, 0.3), ml: 2, mt: 1 }}>
                          {krInitiatives.map((init, initIndex) => {
                            const initMilestones = relatedMilestones.filter(m => m.initiativeId === init.initiativeId);
                            const isLastInit = initIndex === krInitiatives.length - 1;
                            
                            return (
                              <Box key={init.initiativeId} sx={{ mb: isLastInit ? 0 : 1.5 }}>
                                {/* Initiative Card */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    p: 1.5,
                                    borderRadius: 1.5,
                                    bgcolor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    position: "relative",
                                    "&::before": {
                                      content: '""',
                                      position: "absolute",
                                      left: -18,
                                      top: "50%",
                                      width: 16,
                                      height: 2,
                                      bgcolor: alpha(STATUS_COLORS.green, 0.3),
                                    },
                                  }}
                                >
                                  <Rocket sx={{ fontSize: 16, color: STATUS_COLORS.green }} />
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {init.initiativeName}
                                    </Typography>
                                    {init.initiativeOwner && (
                                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        {init.initiativeOwner}
                                      </Typography>
                                    )}
                                  </Box>
                                  <Chip
                                    label={init.status || "Active"}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      bgcolor: alpha(
                                        init.status?.toLowerCase() === "completed" ? STATUS_COLORS.green :
                                        init.status?.toLowerCase() === "blocked" ? STATUS_COLORS.red :
                                        STATUS_COLORS.amber,
                                        0.12
                                      ),
                                      color:
                                        init.status?.toLowerCase() === "completed" ? STATUS_COLORS.green :
                                        init.status?.toLowerCase() === "blocked" ? STATUS_COLORS.red :
                                        STATUS_COLORS.amber,
                                      fontWeight: 600,
                                      fontSize: "0.65rem",
                                    }}
                                  />
                                </Box>

                                {/* Milestones under this Initiative */}
                                {initMilestones.length > 0 && (
                                  <Box sx={{ pl: 2, ml: 2, mt: 0.5 }}>
                                    {initMilestones
                                      .sort((a, b) => {
                                        const dateA = a.originalDueDate ? new Date(a.originalDueDate).getTime() : Infinity;
                                        const dateB = b.originalDueDate ? new Date(b.originalDueDate).getTime() : Infinity;
                                        return dateA - dateB;
                                      })
                                      .map((ms) => {
                                        const statusColor = getMilestoneStatusColor(ms.status);
                                        return (
                                          <Box
                                            key={ms.milestoneId}
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                              py: 0.5,
                                              pl: 1,
                                              borderLeft: "2px solid",
                                              borderColor: alpha(statusColor, 0.3),
                                            }}
                                          >
                                            <Box sx={{ color: statusColor, display: "flex" }}>
                                              {getMilestoneStatusIcon(ms.status)}
                                            </Box>
                                            <Typography variant="caption" sx={{ flex: 1, fontWeight: 500 }}>
                                              {ms.milestoneName}
                                            </Typography>
                                            {ms.originalDueDate && (
                                              <Typography variant="caption" sx={{ color: "text.secondary", fontSize: "0.65rem" }}>
                                                {new Date(ms.originalDueDate).toLocaleDateString()}
                                              </Typography>
                                            )}
                                          </Box>
                                        );
                                      })}
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "text.secondary", ml: 4, fontStyle: "italic" }}>
                No Key Results defined yet
              </Typography>
            )}
          </Box>
        )}

        {/* ===== HIERARCHICAL VIEW FOR INITIATIVES (shows parent context) ===== */}
        {item.entityType === "initiative" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Parent Context (Objective → KR) */}
            {(objective || keyResult) && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(customColors.accent.cyan, 0.04),
                  border: "1px solid",
                  borderColor: alpha(customColors.accent.cyan, 0.1),
                }}
              >
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Parent Context
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  {objective && (
                    <>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Flag sx={{ fontSize: 14, color: customColors.accent.cyan }} />
                        <Typography variant="body2">{objective.objectiveName}</Typography>
                      </Box>
                      {keyResult && <ArrowForward sx={{ fontSize: 12, color: "text.disabled" }} />}
                    </>
                  )}
                  {keyResult && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <TrendingUp sx={{ fontSize: 14, color: getHealthColor(keyResult.attainment) }} />
                      <Typography variant="body2">{keyResult.keyResultName}</Typography>
                      <Chip
                        label={`${keyResult.attainment?.toFixed(0) || 0}%`}
                        size="small"
                        sx={{
                          height: 18,
                          bgcolor: alpha(getHealthColor(keyResult.attainment), 0.12),
                          color: getHealthColor(keyResult.attainment),
                          fontWeight: 700,
                          fontSize: "0.65rem",
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Initiative Details */}
            {initiative && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(STATUS_COLORS.green, 0.04),
                  border: "1px solid",
                  borderColor: alpha(STATUS_COLORS.green, 0.2),
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Rocket sx={{ fontSize: 20, color: STATUS_COLORS.green }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {initiative.initiativeName}
                    </Typography>
                    {initiative.initiativeOwner && (
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Owner: {initiative.initiativeOwner}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={initiative.status || "Active"}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        initiative.status?.toLowerCase() === "completed" ? STATUS_COLORS.green :
                        initiative.status?.toLowerCase() === "blocked" ? STATUS_COLORS.red :
                        STATUS_COLORS.amber,
                        0.12
                      ),
                      color:
                        initiative.status?.toLowerCase() === "completed" ? STATUS_COLORS.green :
                        initiative.status?.toLowerCase() === "blocked" ? STATUS_COLORS.red :
                        STATUS_COLORS.amber,
                      fontWeight: 600,
                    }}
                  />
                </Box>
                {initiative.initiativeDescription && (
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                    {initiative.initiativeDescription}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* ===== BREADCRUMB FOR KEY RESULTS (not tree, just context) ===== */}
        {item.entityType === "keyResult" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(customColors.accent.cyan, 0.04),
              border: "1px solid",
              borderColor: alpha(customColors.accent.cyan, 0.1),
              flexWrap: "wrap",
            }}
          >
            {objective && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Flag sx={{ fontSize: 16, color: customColors.accent.cyan }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {objective.objectiveName}
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* Milestones - show for initiative/keyResult/milestone views (NOT objective, which shows inline) */}
        {relatedMilestones.length > 0 && item.entityType !== "objective" && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CalendarToday sx={{ fontSize: 18, color: customColors.accent.cyan }} />
              Milestones ({relatedMilestones.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {relatedMilestones
                .sort((a, b) => {
                  const dateA = a.originalDueDate ? new Date(a.originalDueDate).getTime() : Infinity;
                  const dateB = b.originalDueDate ? new Date(b.originalDueDate).getTime() : Infinity;
                  return dateA - dateB;
                })
                .map((ms) => {
                  const statusColor = getMilestoneStatusColor(ms.status);
                  return (
                    <Box
                      key={ms.milestoneId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor: alpha(statusColor, 0.2),
                        bgcolor: alpha(statusColor, 0.04),
                      }}
                    >
                      <Box sx={{ color: statusColor }}>
                        {getMilestoneStatusIcon(ms.status)}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {ms.milestoneName}
                        </Typography>
                        {ms.originalDueDate && (
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Due: {new Date(ms.originalDueDate).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={ms.status || "Planned"}
                        size="small"
                        sx={{
                          bgcolor: alpha(statusColor, 0.12),
                          color: statusColor,
                          fontWeight: 600,
                          fontSize: "0.65rem",
                        }}
                      />
                    </Box>
                  );
                })}
            </Box>
          </Box>
        )}

        {/* Recent Updates - show for initiative or objective views */}
        {recentUpdates.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Schedule sx={{ fontSize: 18, color: "text.secondary" }} />
              Recent Updates ({recentUpdates.length})
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {recentUpdates.map((update, idx) => (
                <Box
                  key={update.updateId || idx}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
                  {update.updateDate && (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled", display: "block", mb: 0.5 }}
                    >
                      {new Date(update.updateDate).toLocaleDateString()}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {update.updateSummary || update.updateDetails || "No details provided"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ItemDetailModal;
