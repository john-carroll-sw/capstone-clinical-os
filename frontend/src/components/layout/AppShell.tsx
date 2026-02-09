/**
 * App Shell - Main application container using Material UI
 * Integrates sidebar, content area, and AI chat panel
 * Supports fully hidden/visible sidebar toggle
 * 
 * Uses PreferencesStore for experimental feature flags.
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
import { ForYouPage } from "../pages/ForYouPage";
import { HealthcareDashboard } from "../pages/HealthcareDashboard";
import { InsightsAlertsPage } from "../pages/InsightsAlertsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { DevPanelPage } from "../pages/DevPanelPage";

// Page types
type Page = "home" | "dashboard" | "signals" | "reports" | "settings" | "clinician" | "governance" | "dev-panel";

// Map URL paths to page IDs
const PATH_TO_PAGE: Record<string, Page> = {
  "/": "home",
  "/dashboard": "dashboard",
  "/dashboard/pharmacy": "dashboard",
  "/dashboard/nursing": "dashboard",
  "/signals": "signals",
  "/reports": "reports",
  "/settings": "settings",
  "/clinician": "clinician",
  "/clinician/pharmacy": "clinician",
  "/clinician/nursing": "clinician",
  "/governance": "governance",
  "/governance/registry": "governance",
  "/governance/audit": "governance",
  "/governance/rbac": "governance",
  "/governance/allowlists": "governance",
  "/dev-panel": "dev-panel",
};

// Map page IDs to URL paths
const PAGE_TO_PATH: Record<Page, string> = {
  "home": "/",
  "dashboard": "/dashboard",
  "signals": "/signals",
  "reports": "/reports",
  "settings": "/settings",
  "clinician": "/clinician",
  "governance": "/governance",
  "dev-panel": "/dev-panel",
};

// Ask AI Button Component for header
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

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { persona } = usePersona();
  
  // Derive active page from URL
  const activePage: Page = PATH_TO_PAGE[location.pathname] || "home";
  
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
    const titles: Record<Page, string> = {
      home: "AI Briefing",
      dashboard: "Outcomes Dashboard",
      signals: "Signals & Incidents",
      reports: "Reports",
      settings: "Settings",
      clinician: "Clinician Panel",
      governance: "Governance",
      "dev-panel": "Dev Panel",
    };
    document.title = `${titles[activePage]} | ClinicalOS`;
  }, [activePage]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsChatOpen((prev) => !prev);
      }
      // Toggle sidebar with Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsSidebarHidden((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNavigate = (pageId: string) => {
    const path = PAGE_TO_PATH[pageId as Page] || "/dashboard";
    navigate(path);
    // Clear highlight when navigating away from insights-alerts
    if (pageId !== "insights-alerts") {
      setHighlightedAlertId(null);
    }
  };

  // Handle "Take Action" from OKR Dashboard - navigate to Insights & Alerts and highlight the alert
  const handleTakeAction = (initiativeId: string) => {
    setHighlightedAlertId(initiativeId);
    navigate("/insights");
  };

  // Clear the highlighted alert
  const handleClearHighlight = () => {
    setHighlightedAlertId(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":
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
      case "settings":
        return <SettingsPage />;
      case "clinician":
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'text.secondary' }}>
            <Typography variant="h5">Clinician Panel — Coming in Phase 3</Typography>
          </Box>
        );
      case "governance":
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'text.secondary' }}>
            <Typography variant="h5">Governance Control Plane — Coming in Phase 4</Typography>
          </Box>
        );
      case "dev-panel":
        return <DevPanelPage />;
      default:
        return <ForYouPage onOpenChat={() => setIsChatOpen(true)} />;
    }
  };

  const getPageTitle = () => {
    const titles: Record<Page, string> = {
      home: "AI Briefing",
      dashboard: "Outcomes Dashboard",
      signals: "Signals & Incidents",
      reports: "Reports",
      settings: "Settings",
      clinician: "Clinician Panel",
      governance: "Governance",
      "dev-panel": "Dev Panel",
    };
    return titles[activePage];
  };

  // Calculate sidebar width for margin (used for layout calculations)
  const _sidebarWidth = isSidebarHidden 
    ? 0 
    : isSidebarCollapsed 
      ? SIDEBAR_COLLAPSED_WIDTH 
      : SIDEBAR_WIDTH;
  void _sidebarWidth; // Suppress unused variable warning

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <AppSidebar
        activeItem={activePage}
        onNavigate={handleNavigate}
        isHidden={isSidebarHidden}
        onToggleHidden={() => setIsSidebarHidden(!isSidebarHidden)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapsed={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        showExperimentalForYou={prefs.showForYou}
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
                {getPageTitle()}
              </Typography>
              <Chip
                label={`${persona.name} · ${persona.department === 'pharmacy' ? 'Pharmacy' : 'Nursing'}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Ask AI Button */}
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
