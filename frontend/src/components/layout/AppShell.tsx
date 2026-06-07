/**
 * App Shell - Main application container using Material UI
 * 
 * Route structure:
 * /                        → Demo Index (full-page, no sidebar)
 * /leadership/*            → Leadership Dashboard surface
 * /clinician/*             → Clinician Panel surface
 * /governance/*            → Governance Control Plane surface
 * /{surface}/settings       → Settings (within current surface)
 */

import { useState, useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Chip,
  Fab,
  type Theme,
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
import { ClinicianPanel } from "../clinician/ClinicianPanel";
import { GovernancePage } from "../governance/GovernancePage";

// ─── Route → Surface mapping ──────────────────────────────────

export type Surface = "index" | "leadership" | "clinician" | "governance" | "dev-panel";

export type LeadershipPage = "briefing" | "dashboard" | "signals" | "reports";
export type ClinicianPage = "pharmacy" | "nursing";
export type GovernancePage = "registry" | "audit" | "rbac" | "allowlists";

/** Derive the active surface from the current pathname */
function getSurface(pathname: string): Surface {
  if (pathname === "/") return "index";
  if (pathname.startsWith("/leadership")) return "leadership";
  if (pathname.startsWith("/clinician")) return "clinician";
  if (pathname.startsWith("/governance")) return "governance";
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
  // Settings is a sub-page within each surface
  if (pathname.endsWith("/settings")) return "settings";
  return "";
}

/** Get human-readable page title */
function getPageTitle(surface: Surface, subPage: string): string {
  if (subPage === "settings") return "Settings";
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
  return titles[surface]?.[subPage] || "HelixGuard";
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

// Map surface to the expected persona role
const SURFACE_TO_ROLE: Record<string, string> = {
  leadership: 'ops_leader',
  clinician: 'clinician',
  governance: 'governance',
};

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona, setRoleQuiet, syncPersonaQuiet } = usePersona();
  
  // Derive active surface and sub-page from URL
  const surface = getSurface(location.pathname);
  const subPage = getSubPage(location.pathname);

  // Auto-sync persona role (and department for clinician sub-pages) when surface/subPage changes
  // useLayoutEffect ensures the persona is set before the first paint (avoids flash of wrong persona on cold loads)
  useLayoutEffect(() => {
    const expectedRole = SURFACE_TO_ROLE[surface];
    if (!expectedRole) return;

    // Clinician surface: sync department based on sub-page (nursing vs pharmacy)
    if (surface === 'clinician') {
      const dept = subPage === 'nursing' ? 'nursing' : 'pharmacy';
      if (persona.role !== expectedRole || persona.department !== dept) {
        syncPersonaQuiet(expectedRole as any, dept as any);
      }
      return;
    }

    if (persona.role !== expectedRole) {
      setRoleQuiet(expectedRole as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surface, subPage]);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
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
      document.title = "HelixGuard — Clinical AI Governance";
    } else {
      document.title = `${getPageTitle(surface, subPage)} | HelixGuard`;
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
    // Settings is shared across all surfaces
    if (subPage === "settings") {
      return <SettingsPage />;
    }

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
        return <ClinicianPanel department={subPage === 'nursing' ? 'nursing' : 'pharmacy'} />;
      
      case "governance":
        return <GovernancePage subPage={subPage} />;
      
      case "dev-panel":
        return <DevPanelPage />;
      
      default:
        return null;
    }
  };

  const isGlobalAssistantOpen = surface !== "clinician" && isChatOpen;
  const isClinicianSurface = surface === "clinician";

  const feedbackButtonPosition = {
    top: isClinicianSurface ? { xs: 12, sm: 12 } : "auto",
    bottom: isClinicianSurface ? "auto" : { xs: 24, sm: 24 },
    right: isGlobalAssistantOpen ? { xs: 16, md: 456 } : { xs: 16, sm: 24 },
    zIndex: (theme: Theme) => (
      isGlobalAssistantOpen ? theme.zIndex.drawer + 4 : theme.zIndex.drawer + 1
    ),
  };

  const feedbackWidgetPosition = {
    top: isClinicianSurface ? { xs: 72, sm: 76 } : "auto",
    bottom: isClinicianSurface ? "auto" : { xs: 88, sm: 92 },
    right: isGlobalAssistantOpen ? { xs: 16, md: 456 } : { xs: 16, sm: 24 },
    zIndex: (theme: Theme) => theme.zIndex.drawer + 4,
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

            {surface !== "clinician" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <AskAIButton onClick={() => setIsChatOpen(true)} />
              </Box>
            )}
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            p: isClinicianSurface ? 0 : 3,
            flex: 1,
            overflow: isClinicianSurface ? "hidden" : "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          {renderPage()}
        </Box>
      </Box>

      {/* AI Chat Panel — not shown on clinician surface */}
      {surface !== "clinician" && (
        <AIChatPanel 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)}
          surface={surface}
        />
      )}

      {/* Feedback Widget */}
      <FeedbackWidget
        open={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        positionSx={feedbackWidgetPosition}
      />

      {/* Floating Feedback Button */}
      <Fab
        variant="extended"
        onClick={() => setIsFeedbackOpen((prev) => !prev)}
        sx={{
          position: "fixed",
          ...feedbackButtonPosition,
          bgcolor: customColors.brand.navy,
          color: "#fff",
          transition: "right 0.2s ease, bottom 0.2s ease, background-color 0.2s ease",
          "&:hover": {
            bgcolor: customColors.brand.navyLight,
          },
        }}
      >
        <RateReview sx={{ mr: 1 }} />
        Feedback
      </Fab>
    </Box>
  );
}

export default AppShell;
