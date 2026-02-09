/**
 * App Shell - Main application container using Material UI
 * 
 * Route structure:
 * /                        → Demo Index (full-page, no sidebar)
 * /leadership/*            → Leadership Dashboard surface
 * /clinician/*             → Clinician Panel surface
 * /governance/*            → Governance Control Plane surface
 * /settings                → Settings (shared)
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Chip,
  Fab,
  Popover,
  Button,
  Stack,
} from "@mui/material";
import {
  Mic,
  Keyboard,
  RateReview,
} from "@mui/icons-material";
import { customColors } from "../../theme/muiTheme";
import { useTheme } from "../../context/ThemeContext";
import { usePersona } from "../../context/PersonaContext";
import { usePreferences } from "../../services/preferencesStore";
import { AppSidebar } from "./AppSidebar";
import { AIChatPanel } from "../ai/AIChatPanel";
import { FeedbackWidget } from "../feedback/FeedbackWidget";
import { DemoIndexPage } from "../pages/DemoIndexPage";
import { ForYouPage } from "../pages/ForYouPage";
import { HealthcareDashboard } from "../pages/HealthcareDashboard";
import { InsightsAlertsPage } from "../pages/InsightsAlertsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { DevPanelPage } from "../pages/DevPanelPage";

// ─── Route → Surface mapping ──────────────────────────────────

export type Surface = "index" | "leadership" | "clinician" | "governance" | "settings" | "dev-panel";

export type LeadershipPage = "briefing" | "dashboard" | "signals" | "reports";
export type ClinicianPage = "pharmacy" | "nursing";
export type GovernancePage = "registry" | "audit" | "rbac" | "allowlists";

/** Derive the active surface from the current pathname */
function getSurface(pathname: string): Surface {
  if (pathname === "/") return "index";
  if (pathname.startsWith("/leadership")) return "leadership";
  if (pathname.startsWith("/clinician")) return "clinician";
  if (pathname.startsWith("/governance")) return "governance";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/dev-panel")) return "dev-panel";
  return "index";
}

/** Derive the active sub-page within a surface */
function getSubPage(pathname: string): string {
  // Leadership sub-pages
  if (pathname === "/leadership" || pathname === "/leadership/briefing") return "briefing";
  if (pathname === "/leadership/dashboard") return "dashboard";
  if (pathname === "/leadership/signals") return "signals";
  if (pathname === "/leadership/reports") return "reports";
  // Clinician sub-pages
  if (pathname === "/clinician" || pathname === "/clinician/pharmacy") return "pharmacy";
  if (pathname === "/clinician/nursing") return "nursing";
  // Governance sub-pages
  if (pathname === "/governance" || pathname === "/governance/registry") return "registry";
  if (pathname === "/governance/audit") return "audit";
  if (pathname === "/governance/rbac") return "rbac";
  if (pathname === "/governance/allowlists") return "allowlists";
  return "";
}

/** Get human-readable page title */
function getPageTitle(surface: Surface, subPage: string): string {
  const titles: Record<string, Record<string, string>> = {
    leadership: {
      briefing: "AI Briefing",
      dashboard: "Outcomes Dashboard",
      signals: "Signals & Incidents",
      reports: "Reports",
    },
    clinician: {
      pharmacy: "Pharmacy — Alert Review",
      nursing: "Nursing — Shift Handoff",
    },
    governance: {
      registry: "Use Case Registry",
      audit: "Audit Log",
      rbac: "Access Control",
      allowlists: "Allowlists & Templates",
    },
  };
  return titles[surface]?.[subPage] || "ClinicalOS";
}

// ─── Ask AI Button ────────────────────────────────────────────

function AskAIButton({ onClick }: { onClick: () => void }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1,
        borderRadius: 3,
        bgcolor: isDark 
          ? `${customColors.accent.cyan}20`
          : customColors.brand.navy,
        color: isDark ? customColors.accent.cyan : "#fff",
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: isDark 
            ? `${customColors.accent.cyan}30`
            : customColors.brand.navyLight,
        },
      }}
    >
      <Mic fontSize="small" />
      <Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>Ask AI</Typography>
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 0.5,
          px: 1,
          py: 0.25,
          borderRadius: 1,
          bgcolor: isDark ? customColors.dark.elevated : "rgba(255, 255, 255, 0.15)",
          fontSize: "0.7rem",
        }}
      >
        <Keyboard sx={{ fontSize: "0.8rem" }} />
        K
      </Box>
    </Box>
  );
}

// ─── Constants ────────────────────────────────────────────────

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

// ─── App Shell ────────────────────────────────────────────────

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona } = usePersona();
  
  // Derive active surface and sub-page from URL
  const surface = getSurface(location.pathname);
  const subPage = getSubPage(location.pathname);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [feedbackStyle, setFeedbackStyle] = useState<'quick' | 'guided'>('quick');
  const [feedbackAnchorEl, setFeedbackAnchorEl] = useState<HTMLElement | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  
  // State for highlighting alerts when navigating from "Take Action" button
  const [highlightedAlertId, setHighlightedAlertId] = useState<string | null>(null);
  
  // Get experimental feature flags from PreferencesStore (reactive)
  const [prefs] = usePreferences();

  // Update document title
  useEffect(() => {
    if (surface === "index") {
      document.title = "ClinicalOS — Clinical AI Governance";
    } else {
      document.title = `${getPageTitle(surface, subPage)} | ClinicalOS`;
    }
  }, [surface, subPage]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsChatOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsSidebarHidden((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    setHighlightedAlertId(null);
  };

  // Handle "Take Action" from Dashboard - navigate to Signals and highlight
  const handleTakeAction = (initiativeId: string) => {
    setHighlightedAlertId(initiativeId);
    navigate("/leadership/signals");
  };

  const handleClearHighlight = () => {
    setHighlightedAlertId(null);
  };

  // ─── Demo Index: full-page, no shell chrome ─────────────────
  if (surface === "index") {
    return <DemoIndexPage />;
  }

  // ─── Render page content based on surface + sub-page ────────
  const renderPage = () => {
    switch (surface) {
      case "leadership":
        switch (subPage) {
          case "briefing":
            return <ForYouPage onOpenChat={() => setIsChatOpen(true)} />;
          case "dashboard":
            return <HealthcareDashboard onTakeAction={handleTakeAction} />;
          case "signals":
            return (
              <InsightsAlertsPage 
                highlightedInitiativeId={highlightedAlertId}
                onClearHighlight={handleClearHighlight}
              />
            );
          case "reports":
            return <ReportsPage />;
          default:
            return <ForYouPage onOpenChat={() => setIsChatOpen(true)} />;
        }
      
      case "clinician":
        // Phase 3 placeholder — will be replaced with ClinicianPanel
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'text.secondary' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Clinician Panel — {subPage === 'nursing' ? 'Nursing Handoff' : 'Pharmacy Alerts'}
              </Typography>
              <Typography variant="body2">Coming in Phase 3</Typography>
            </Box>
          </Box>
        );
      
      case "governance":
        // Phase 4 placeholder — will be replaced with GovernancePage
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'text.secondary' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Governance — {
                  subPage === 'audit' ? 'Audit Log' :
                  subPage === 'rbac' ? 'Access Control' :
                  subPage === 'allowlists' ? 'Allowlists & Templates' :
                  'Use Case Registry'
                }
              </Typography>
              <Typography variant="body2">Coming in Phase 4</Typography>
            </Box>
          </Box>
        );
      
      case "settings":
        return <SettingsPage />;
      
      case "dev-panel":
        return <DevPanelPage />;
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <AppSidebar
        surface={surface}
        activeSubPage={subPage}
        onNavigate={handleNavigate}
        isHidden={isSidebarHidden}
        onToggleHidden={() => setIsSidebarHidden(!isSidebarHidden)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        showDevPanel={prefs.showDevPanel}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: "margin 0.2s ease-in-out",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Bar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
            backdropFilter: "blur(8px)",
            backgroundColor: (theme) => 
              theme.palette.mode === "dark" 
                ? "rgba(12, 12, 20, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                {getPageTitle(surface, subPage)}
              </Typography>
              <Chip
                label={`${persona.name} · ${persona.department === 'pharmacy' ? 'Pharmacy' : 'Nursing'}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <AskAIButton onClick={() => setIsChatOpen(true)} />
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ p: 3, flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
          {renderPage()}
        </Box>
      </Box>

      {/* AI Chat Panel */}
      <AIChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
      />

      {/* Feedback Widget */}
      <FeedbackWidget
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        style={feedbackStyle}
      />

      {/* Floating Feedback Button */}
      <Fab
        variant="extended"
        onClick={(e) => setFeedbackAnchorEl(e.currentTarget)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          bgcolor: customColors.brand.navy,
          color: "#fff",
          "&:hover": {
            bgcolor: customColors.brand.navyLight,
          },
          zIndex: 1000,
        }}
      >
        <RateReview sx={{ mr: 1 }} />
        Feedback
      </Fab>

      {/* Feedback Mode Selection Popover */}
      <Popover
        open={Boolean(feedbackAnchorEl)}
        anchorEl={feedbackAnchorEl}
        onClose={() => setFeedbackAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        sx={{ mb: 1 }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
            Choose feedback style
          </Typography>
          <Stack spacing={1}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setFeedbackStyle('quick');
                setFeedbackAnchorEl(null);
                setIsFeedbackOpen(true);
              }}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Quick</Typography>
                <Typography variant="caption" color="text.secondary">Fixed questions, ~2 min</Typography>
              </Box>
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                setFeedbackStyle('guided');
                setFeedbackAnchorEl(null);
                setIsFeedbackOpen(true);
              }}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Guided</Typography>
                <Typography variant="caption" color="text.secondary">AI conversation, ~5 min</Typography>
              </Box>
            </Button>
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}

export default AppShell;
