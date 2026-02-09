/**
 * For You Page - AI-Powered Personalized Briefings
 * 
 * Feature: 010 - For You AI Briefings
 * 
 * Displays an AI-generated briefing with:
 * - Portfolio overview and stats
 * - Wins (positive first!)
 * - Items requiring attention
 * - Context section
 * - Personalized narrative
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Fade,
  Grow,
  Collapse,
  Skeleton,
  alpha,
} from "@mui/material";
import { ItemDetailModal } from "./ItemDetailModal";
import {
  AutoAwesome,
  TrendingUp,
  TrendingDown,
  ThumbUp,
  ThumbDown,
  Refresh,
  Warning,
  EmojiEvents,
  Visibility,
  ChevronRight,
  AccessTime,
  Person,
  FiberManualRecord,
  ExpandMore,
} from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import { customColors } from "../../theme/muiTheme";
import { useUser } from "../../context/UserContext";
import {
  fetchBriefing,
  submitBriefingFeedback,
  formatBriefingDate,
  getBriefingItemColor,
} from "../../services/briefingService";
import type {
  Briefing,
  BriefingSection,
  BriefingItem,
} from "../../types/briefing.types";

interface ForYouPageProps {
  onOpenChat: () => void;
}

// Status colors matching the rest of the app
const STATUS_COLORS = {
  green: "#03cc54",
  amber: "#e0a73f",
  red: "#ba0000",
} as const;

// Section type to display config
const SECTION_CONFIG: Record<string, { 
  icon: React.ReactNode; 
  color: string; 
  title: string;
  emptyMessage: string;
}> = {
  wins: {
    icon: <EmojiEvents />,
    color: STATUS_COLORS.green,
    title: "Wins This Week",
    emptyMessage: "No wins to celebrate yet this week — keep pushing!",
  },
  action_required: {
    icon: <Warning />,
    color: STATUS_COLORS.red,
    title: "Needs Your Attention",
    emptyMessage: "No blockers or at-risk items right now — great job!",
  },
  awareness: {
    icon: <Visibility />,
    color: STATUS_COLORS.amber,
    title: "On Your Radar",
    emptyMessage: "Nothing flagged for awareness at this time.",
  },
  context: {
    icon: <Person />,
    color: customColors.accent.cyan,
    title: "Your Program Areas",
    emptyMessage: "No program areas are currently assigned to you. When you own program goals or use cases, they'll appear here with relevant updates.",
  },
};

export function ForYouPage({ onOpenChat }: ForYouPageProps) {
  const { profile } = useUser();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["wins", "action_required", "context"])
  );
  const [selectedItem, setSelectedItem] = useState<BriefingItem | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  
  // Refs to prevent duplicate fetches in StrictMode
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Handle item click - open detail modal
  const handleItemClick = useCallback((item: BriefingItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setDetailModalOpen(false);
    // Delay clearing selected item to allow modal close animation
    setTimeout(() => setSelectedItem(null), 200);
  }, []);

  // Time-based greeting with user's name
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  
  // Extract first name from displayName (e.g., "Last, First (CTR)" -> "First")
  const firstName = profile?.displayName
    ? profile.displayName.split(',')[1]?.trim().split(' ')[0] || profile.displayName.split(' ')[0]
    : null;
  
  const greeting = firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;

  // Toggle section expansion
  const toggleSection = (sectionType: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionType)) {
        next.delete(sectionType);
      } else {
        next.add(sectionType);
      }
      return next;
    });
  };

  // Fetch briefing on mount
  const loadBriefing = useCallback(async (force = false) => {
    if (!force && (hasFetchedRef.current || isFetchingRef.current)) {
      return;
    }
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchBriefing("on_open", { forceRefresh: force });
      
      // Sort sections: wins first (positive!), then action_required, then awareness, then context
      const sectionOrder = ["wins", "action_required", "awareness", "context"];
      const sortedSections = [...data.sections].sort((a, b) => {
        const aIndex = sectionOrder.indexOf(a.type);
        const bIndex = sectionOrder.indexOf(b.type);
        return aIndex - bIndex;
      });
      
      setBriefing({ ...data, sections: sortedSections });
      
      // Auto-expand sections with items (and always context)
      const toExpand = new Set<string>(["context"]);
      sortedSections.forEach((section) => {
        if (section.items.length > 0) {
          toExpand.add(section.type);
        }
      });
      setExpandedSections(toExpand);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error("Failed to load briefing:", err);
      setError(err instanceof Error ? err.message : "Failed to load briefing");
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBriefing();
  }, [loadBriefing]);

  useEffect(() => {
    if (!loading) {
      setShowSlowMessage(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowMessage(true), 1500);
    return () => clearTimeout(timer);
  }, [loading]);
  
  const handleRefresh = () => {
    hasFetchedRef.current = false;
    loadBriefing(true);
  };

  const handleFeedback = async (feedback: "helpful" | "not_helpful") => {
    if (!briefing || feedbackSubmitting) return;
    setFeedbackSubmitting(true);
    try {
      await submitBriefingFeedback({ briefingId: briefing.id, feedback });
      setBriefing((prev) => prev ? { ...prev, feedbackProvided: feedback } : null);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    const loadingMessage = showSlowMessage
      ? "Still working — ensuring you get the best possible briefing."
      : "Generating your AI briefing...";
    return (
      <Box 
        sx={{ 
          display: "flex",
          flexDirection: "column",
          gap: 4,
          pb: 6,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Box sx={{ position: "relative" }}>
            <CircularProgress 
              size={40} 
              thickness={2}
              sx={{ color: customColors.accent.cyan }}
            />
            <AutoAwesome 
              sx={{ 
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 18,
                color: customColors.accent.cyan,
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 0.4, transform: "translate(-50%, -50%) scale(1)" },
                  "50%": { opacity: 1, transform: "translate(-50%, -50%) scale(1.08)" },
                },
              }}
            />
          </Box>
          <Typography sx={{ color: "text.secondary", fontSize: "0.95rem" }}>
            {loadingMessage}
          </Typography>
        </Box>

        <Box>
          <Skeleton variant="text" width="35%" height={48} />
          <Box
            sx={{
              mt: 3,
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${alpha(customColors.accent.cyan, 0.03)} 0%, transparent 50%)`
                  : `linear-gradient(135deg, ${alpha(customColors.accent.cyan, 0.05)} 0%, transparent 50%)`,
            }}
          >
            <Skeleton variant="text" width="25%" />
            <Skeleton variant="text" width="80%" height={32} />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="rectangular" height={76} sx={{ mt: 2, borderRadius: 2 }} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 3 }}>
              <Skeleton variant="rounded" width={140} height={32} />
              <Skeleton variant="rounded" width={120} height={32} />
              <Skeleton variant="rounded" width={110} height={32} />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Skeleton variant="rounded" height={72} />
          <Skeleton variant="rounded" height={72} />
          <Skeleton variant="rounded" height={72} />
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "center", 
          justifyContent: "center", 
          minHeight: "60vh",
          gap: 2,
        }}
      >
        <Warning sx={{ fontSize: 64, color: STATUS_COLORS.amber }} />
        <Typography variant="h6" sx={{ color: "text.secondary" }}>
          Unable to load your briefing
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 400, textAlign: "center" }}>
          {error}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={handleRefresh}
          sx={{ 
            borderColor: customColors.accent.cyan,
            color: customColors.accent.cyan,
            "&:hover": {
              borderColor: customColors.accent.cyan,
              bgcolor: alpha(customColors.accent.cyan, 0.08),
            },
          }}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  if (!briefing) {
    return null;
  }

  // Calculate stats for the summary line
  const actionCount = briefing.sections.find(s => s.type === "action_required")?.items.length || 0;
  const winsCount = briefing.sections.find(s => s.type === "wins")?.items.length || 0;
  
  // Build display sections (ensure we always show key sections)
  const displaySections = buildDisplaySections(briefing.sections);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, pb: 6 }}>
      {/* ========== HERO BRIEFING SECTION ========== */}
      <Fade in timeout={600}>
        <Box>
          {/* Greeting */}
          <Typography 
            variant="h3"
            sx={{ 
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "text.primary",
              mb: 4,
            }}
          >
            {greeting}
          </Typography>

          {/* Main Briefing Card */}
          <Box
            sx={{
              position: "relative",
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: alpha(customColors.accent.cyan, 0.2),
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${alpha(customColors.accent.cyan, 0.03)} 0%, transparent 50%)`
                  : `linear-gradient(135deg, ${alpha(customColors.accent.cyan, 0.05)} 0%, transparent 50%)`,
              overflow: "hidden",
            }}
          >
            {/* Header Row */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {briefing.isAiGenerated && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: alpha(customColors.accent.cyan, 0.15),
                    }}
                  >
                    <AutoAwesome sx={{ fontSize: 18, color: customColors.accent.cyan }} />
                  </Box>
                )}
                <Typography 
                  sx={{ 
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: customColors.accent.cyan,
                  }}
                >
                  Your Briefing
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 0.5,
                    color: "text.secondary",
                    fontSize: "0.7rem",
                  }}
                >
                  <AccessTime sx={{ fontSize: 12 }} />
                  Updated {formatBriefingDate(briefing.dataAsOf)}
                </Typography>
                <Tooltip title="Refresh briefing">
                  <IconButton 
                    size="small" 
                    onClick={handleRefresh}
                    sx={{ 
                      color: "text.secondary",
                      "&:hover": { color: customColors.accent.cyan },
                    }}
                  >
                    <Refresh sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Headline */}
            <Typography 
              variant="h5"
              sx={{ 
                fontWeight: 600,
                lineHeight: 1.4,
                color: "text.primary",
                mb: 2,
                maxWidth: 800,
              }}
            >
              {briefing.headline}
            </Typography>

            {/* Narrative - formatted as bullet points */}
            <Box 
              sx={{ 
                maxWidth: 800, 
                color: "text.secondary",
                fontSize: "0.9rem",
                lineHeight: 1.6,
                "& p": { margin: 0 },
                "& ul": { 
                  margin: 0, 
                  paddingLeft: "1.25rem",
                  "& li": { 
                    mb: 0.75,
                    "& p": { display: "inline" },
                  },
                },
                "& strong": { color: "text.primary", fontWeight: 600 },
                "& a": { color: customColors.accent.cyan },
              }}
            >
              <ReactMarkdown>{formatNarrativeAsList(briefing.narrative)}</ReactMarkdown>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mt: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ minHeight: 28, display: "flex", alignItems: "center" }}>
                {briefing.isAiGenerated && (
                  <Chip
                    size="small"
                    icon={<AutoAwesome sx={{ fontSize: 14 }} />}
                    label="Generated by AI"
                    variant="filled"
                    sx={{
                      bgcolor: alpha(customColors.accent.cyan, 0.15),
                      color: customColors.accent.cyan,
                      "& .MuiChip-icon": {
                        color: customColors.accent.cyan,
                      },
                    }}
                  />
                )}
              </Box>
              <Box 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "flex-end",
                  gap: 1,
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{ color: "text.secondary", fontSize: "0.75rem" }}
                >
                  Was this helpful?
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleFeedback("helpful")}
                    disabled={!!briefing.feedbackProvided || feedbackSubmitting}
                    sx={{
                      width: 28,
                      height: 28,
                      color: briefing.feedbackProvided === "helpful" 
                        ? STATUS_COLORS.green 
                        : "text.disabled",
                      bgcolor: briefing.feedbackProvided === "helpful"
                        ? alpha(STATUS_COLORS.green, 0.1)
                        : "transparent",
                      "&:hover": {
                        bgcolor: alpha(STATUS_COLORS.green, 0.1),
                        color: STATUS_COLORS.green,
                      },
                    }}
                  >
                    <ThumbUp sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleFeedback("not_helpful")}
                    disabled={!!briefing.feedbackProvided || feedbackSubmitting}
                    sx={{
                      width: 28,
                      height: 28,
                      color: briefing.feedbackProvided === "not_helpful" 
                        ? STATUS_COLORS.red 
                        : "text.disabled",
                      bgcolor: briefing.feedbackProvided === "not_helpful"
                        ? alpha(STATUS_COLORS.red, 0.1)
                        : "transparent",
                      "&:hover": {
                        bgcolor: alpha(STATUS_COLORS.red, 0.1),
                        color: STATUS_COLORS.red,
                      },
                    }}
                  >
                    <ThumbDown sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {/* Quick Stats Row */}
            <Box 
              sx={{ 
                display: "flex", 
                flexWrap: "wrap",
                gap: 3,
                mt: 4,
                pt: 3,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <StatPill 
                label="Program Health"
                value={`${Math.round(briefing.portfolioStats.avgAttainment)}%`}
                trend={briefing.portfolioStats.weekOverWeekChange}
              />
              <StatPill 
                label="Active KRs"
                value={briefing.portfolioStats.totalKeyResults}
                breakdown={{
                  green: briefing.portfolioStats.healthCounts.green,
                  amber: briefing.portfolioStats.healthCounts.amber,
                  red: briefing.portfolioStats.healthCounts.red,
                }}
              />
              {winsCount > 0 && (
                <StatPill 
                  label="Wins"
                  value={winsCount}
                  accent="green"
                />
              )}
              {actionCount > 0 && (
                <StatPill 
                  label="Needs Attention"
                  value={actionCount}
                  accent="red"
                />
              )}
              {briefing.portfolioStats.userOwnedInitiatives > 0 && (
                <StatPill 
                  label="Your Use Cases"
                  value={briefing.portfolioStats.userOwnedInitiatives}
                  icon={<Person sx={{ fontSize: 14 }} />}
                />
              )}
            </Box>


          </Box>
        </Box>
      </Fade>

      {/* ========== BRIEFING SECTIONS (Collapsible) ========== */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {displaySections.map((section, index) => (
          <Grow in key={section.type} timeout={400 + index * 100}>
            <Box>
              <SectionBlock 
                section={section} 
                isExpanded={expandedSections.has(section.type)}
                onToggle={() => toggleSection(section.type)}
                onItemClick={handleItemClick}
              />
            </Box>
          </Grow>
        ))}
      </Box>

      {/* Ask AI CTA */}
      <Fade in timeout={800}>
        <Box 
          sx={{ 
            display: "flex",
            justifyContent: "center",
            pt: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<AutoAwesome />}
            onClick={onOpenChat}
            sx={{
              borderColor: alpha(customColors.accent.cyan, 0.3),
              color: customColors.accent.cyan,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontSize: "0.9rem",
              "&:hover": {
                borderColor: customColors.accent.cyan,
                bgcolor: alpha(customColors.accent.cyan, 0.08),
              },
            }}
          >
            Ask AI
          </Button>
        </Box>
      </Fade>

      {/* Item Detail Modal */}
      <ItemDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        item={selectedItem}
      />
    </Box>
  );
}

/**
 * Format the narrative as a bulleted list for better readability
 */
function formatNarrativeAsList(narrative: string): string {
  // Split on sentence boundaries and filter empty
  const sentences = narrative
    .split(/(?<=\.)\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  if (sentences.length <= 1) {
    return narrative;
  }
  
  // Convert to bullet list
  return sentences.map(s => `- ${s}`).join("\n");
}

/**
 * Build display sections ensuring we always show: Wins, Needs Attention, Context
 * Order: Wins first (positive!), then Needs Attention, then Awareness, then Context
 */
function buildDisplaySections(sections: BriefingSection[]): BriefingSection[] {
  const sectionMap = new Map<string, BriefingSection>();
  sections.forEach(s => sectionMap.set(s.type, s));
  
  const result: BriefingSection[] = [];
  
  // Wins first (positive focus!)
  result.push(sectionMap.get("wins") || {
    type: "wins",
    priority: 1,
    title: "Wins This Week",
    items: [],
  });
  
  // Needs attention
  result.push(sectionMap.get("action_required") || {
    type: "action_required",
    priority: 2,
    title: "Needs Your Attention",
    items: [],
  });
  
  // Awareness (only if has items)
  const awareness = sectionMap.get("awareness");
  if (awareness && awareness.items.length > 0) {
    result.push(awareness);
  }
  
  // Your Program Areas always shown
  result.push(sectionMap.get("context") || {
    type: "context",
    priority: 4,
    title: "Your Program Areas",
    items: [],
  });
  
  return result;
}

// ============================================================================
// Sub-components
// ============================================================================

interface StatPillProps {
  label: string;
  value: string | number;
  trend?: number | null;
  breakdown?: { green: number; amber: number; red: number };
  accent?: "green" | "red" | "amber";
  icon?: React.ReactNode;
}

function StatPill({ label, value, trend, breakdown, accent, icon }: StatPillProps) {
  const accentColor = accent ? STATUS_COLORS[accent] : undefined;
  
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Typography 
        sx={{ 
          fontSize: "0.65rem",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {icon}
        <Typography 
          sx={{ 
            fontSize: "1.5rem",
            fontWeight: 700,
            color: accentColor || "text.primary",
            fontFeatureSettings: "'tnum'",
          }}
        >
          {value}
        </Typography>
        {trend !== undefined && trend !== null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
            {trend >= 0 ? (
              <TrendingUp sx={{ fontSize: 16, color: STATUS_COLORS.green }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: STATUS_COLORS.red }} />
            )}
            <Typography 
              sx={{ 
                fontSize: "0.75rem",
                fontWeight: 600,
                color: trend >= 0 ? STATUS_COLORS.green : STATUS_COLORS.red,
              }}
            >
              {trend > 0 ? "+" : ""}{trend.toFixed(0)}%
            </Typography>
          </Box>
        )}
      </Box>
      {/* Breakdown dots below the value */}
      {breakdown && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.25 }}>
          <StatusDot color={STATUS_COLORS.green} count={breakdown.green} />
          <StatusDot color={STATUS_COLORS.amber} count={breakdown.amber} />
          <StatusDot color={STATUS_COLORS.red} count={breakdown.red} />
        </Box>
      )}
    </Box>
  );
}

function StatusDot({ color, count }: { color: string; count: number }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
      <FiberManualRecord sx={{ fontSize: 8, color }} />
      <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 500 }}>
        {count}
      </Typography>
    </Box>
  );
}

interface SectionBlockProps {
  section: BriefingSection;
  isExpanded: boolean;
  onToggle: () => void;
  onItemClick?: (item: BriefingItem) => void;
}

function SectionBlock({ section, isExpanded, onToggle, onItemClick }: SectionBlockProps) {
  const config = SECTION_CONFIG[section.type] || SECTION_CONFIG.context;
  const isEmpty = section.items.length === 0;
  
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      {/* Section Header (Clickable) */}
      <Box 
        onClick={onToggle}
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          p: 2,
          cursor: "pointer",
          transition: "background-color 0.15s",
          "&:hover": {
            bgcolor: alpha(config.color, 0.04),
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: 1.5,
              bgcolor: alpha(config.color, 0.12),
              color: config.color,
              "& svg": { fontSize: 16 },
            }}
          >
            {config.icon}
          </Box>
          <Typography 
            sx={{ 
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            {config.title}
          </Typography>
          {!isEmpty && (
            <Chip
              label={section.items.length}
              size="small"
              sx={{
                height: 20,
                minWidth: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
                bgcolor: alpha(config.color, 0.15),
                color: config.color,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          )}
        </Box>
        
        <IconButton 
          size="small" 
          sx={{ color: "text.secondary" }}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          <ExpandMore 
            sx={{ 
              fontSize: 20,
              transition: "transform 0.2s",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }} 
          />
        </IconButton>
      </Box>

      {/* Section Content (Collapsible) */}
      <Collapse in={isExpanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          {isEmpty ? (
            // Empty state
            <Typography 
              sx={{ 
                color: "text.secondary", 
                fontSize: "0.85rem",
                fontStyle: "italic",
                py: 2,
                px: 1,
              }}
            >
              {config.emptyMessage}
            </Typography>
          ) : (
            // Items
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {section.items.map((item) => (
                <ItemRow 
                  key={item.id} 
                  item={item} 
                  sectionColor={config.color} 
                  onClick={onItemClick}
                />
              ))}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

interface ItemRowProps {
  item: BriefingItem;
  sectionColor: string;
  onClick?: (item: BriefingItem) => void;
}

function ItemRow({ item, sectionColor, onClick }: ItemRowProps) {
  const itemColor = getBriefingItemColor(item.changeType);
  const statusColor = itemColor === "success" 
    ? STATUS_COLORS.green 
    : itemColor === "error" 
    ? STATUS_COLORS.red 
    : STATUS_COLORS.amber;

  return (
    <Box
      onClick={() => onClick?.(item)}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: alpha(sectionColor, 0.15),
        bgcolor: alpha(sectionColor, 0.02),
        transition: "all 0.15s ease",
        cursor: onClick ? "pointer" : "default",
        "&:hover": onClick ? {
          borderColor: alpha(sectionColor, 0.3),
          bgcolor: alpha(sectionColor, 0.05),
          "& .arrow-icon": {
            opacity: 1,
            transform: "translateX(0)",
          },
        } : {},
      }}
    >
      {/* Status indicator */}
      <Box
        sx={{
          width: 3,
          height: 40,
          borderRadius: 1,
          bgcolor: statusColor,
          flexShrink: 0,
          mt: 0.5,
        }}
      />
      
      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography 
            sx={{ 
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "text.primary",
              lineHeight: 1.4,
            }}
          >
            {item.summary}
          </Typography>
          {item.isUserOwned && (
            <Chip
              label="Yours"
              size="small"
              icon={<Person sx={{ fontSize: "12px !important" }} />}
              sx={{
                height: 18,
                fontSize: "0.6rem",
                fontWeight: 600,
                bgcolor: alpha(customColors.accent.cyan, 0.12),
                color: customColors.accent.cyan,
                "& .MuiChip-icon": { ml: 0.5 },
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}
        </Box>
        
        <Typography 
          sx={{ 
            fontSize: "0.8rem",
            color: "text.secondary",
            lineHeight: 1.5,
            mt: 0.5,
          }}
        >
          {item.soWhat}
        </Typography>
        
        {/* Meta row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
          <Typography 
            sx={{ 
              fontSize: "0.65rem",
              color: "text.disabled",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {item.entityType === "keyResult" ? "Key Result" : item.entityType}
          </Typography>
          {item.owner && (
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
              {item.owner}
            </Typography>
          )}
          {item.magnitude !== undefined && item.magnitude !== null && (
            <Typography 
              sx={{ 
                fontSize: "0.7rem",
                fontWeight: 600,
                color: statusColor,
              }}
            >
              {item.magnitude.toFixed(0)}%
            </Typography>
          )}
        </Box>
      </Box>
      
      {/* Arrow */}
      <ChevronRight 
        className="arrow-icon"
        sx={{ 
          fontSize: 20,
          color: "text.disabled",
          opacity: 0,
          transform: "translateX(-4px)",
          transition: "all 0.15s ease",
          flexShrink: 0,
          mt: 1,
        }}
      />
    </Box>
  );
}

export default ForYouPage;
