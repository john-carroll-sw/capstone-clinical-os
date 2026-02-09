/**
 * App Sidebar - Surface-aware navigation
 * 
 * Shows different nav items depending on which surface you're in:
 * - Leadership: Briefing, Dashboard, Signals, Reports
 * - Clinician: Pharmacy, Nursing
 * - Governance: Registry, Audit, RBAC, Allowlists
 * 
 * Always shows: Home (back to demo index), Settings
 * Includes persona switcher and profile/theme controls.
 */

import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Chip,
  Divider,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Dashboard,
  AutoAwesome,
  Description,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu as MenuIcon,
  LightMode,
  DarkMode,
  Computer,
  Code,
  LocalHospital,
  Shield,
  NotificationsActive,
  Home,
  MedicalServices,
  SwapHoriz,
  Gavel,
  Security,
  ListAlt,
  FactCheck,
} from "@mui/icons-material";
import { useTheme, type Theme } from "../../context/ThemeContext";
import { usePersona } from "../../context/PersonaContext";
import { customColors } from "../../theme/muiTheme";
import { PersonaSwitcher } from "../PersonaSwitcher";
import type { Surface } from "./AppShell";

/**
 * Get user initials from display name
 */
function getInitials(displayName: string | undefined): string {
  if (!displayName) return '?';
  
  const withoutSuffix = displayName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  
  if (withoutSuffix.includes(',')) {
    const [last, first] = withoutSuffix.split(',').map(s => s.trim());
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  }
  
  const parts = withoutSuffix.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  
  return withoutSuffix.substring(0, 2).toUpperCase();
}

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 72;

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number | string;
  badgeColor?: "success" | "warning" | "error" | "info";
}

interface AppSidebarProps {
  surface: Surface;
  activeSubPage: string;
  onNavigate: (path: string) => void;
  isHidden?: boolean;
  onToggleHidden?: () => void;
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  showDevPanel?: boolean;
}

// ─── Surface-specific navigation items ────────────────────────

const LEADERSHIP_NAV: NavItem[] = [
  { id: "briefing", label: "AI Briefing", icon: <AutoAwesome />, path: "/leadership" },
  { id: "dashboard", label: "Outcomes Dashboard", icon: <Dashboard />, path: "/leadership/dashboard" },
  { id: "signals", label: "Signals & Incidents", icon: <NotificationsActive />, path: "/leadership/signals" },
  { id: "reports", label: "Reports", icon: <Description />, path: "/leadership/reports" },
];

const CLINICIAN_NAV: NavItem[] = [
  { id: "pharmacy", label: "Pharmacy Alerts", icon: <MedicalServices />, path: "/clinician/pharmacy" },
  { id: "nursing", label: "Nursing Handoff", icon: <SwapHoriz />, path: "/clinician/nursing" },
];

const GOVERNANCE_NAV: NavItem[] = [
  { id: "registry", label: "Use Case Registry", icon: <ListAlt />, path: "/governance" },
  { id: "audit", label: "Audit Log", icon: <FactCheck />, path: "/governance/audit" },
  { id: "rbac", label: "Access Control", icon: <Security />, path: "/governance/rbac" },
  { id: "allowlists", label: "Allowlists", icon: <Gavel />, path: "/governance/allowlists" },
];

function getNavItems(surface: Surface): NavItem[] {
  switch (surface) {
    case "leadership": return LEADERSHIP_NAV;
    case "clinician": return CLINICIAN_NAV;
    case "governance": return GOVERNANCE_NAV;
    default: return [];
  }
}

function getSurfaceLabel(surface: Surface): string {
  switch (surface) {
    case "leadership": return "Leadership Dashboard";
    case "clinician": return "Clinician Panel";
    case "governance": return "Governance";
    default: return "ClinicalOS";
  }
}

function getSurfaceIcon(surface: Surface): React.ReactNode {
  switch (surface) {
    case "leadership": return <Dashboard sx={{ fontSize: 18 }} />;
    case "clinician": return <LocalHospital sx={{ fontSize: 18 }} />;
    case "governance": return <Shield sx={{ fontSize: 18 }} />;
    default: return null;
  }
}

// ─── Main Sidebar Component ──────────────────────────────────

export function AppSidebar({ 
  surface,
  activeSubPage, 
  onNavigate, 
  isHidden = false,
  onToggleHidden,
  isCollapsed = false,
  onToggleCollapsed,
  showDevPanel = false,
}: AppSidebarProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { persona } = usePersona();
  const collapsed = isCollapsed;
  
  // Profile menu state
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const profileMenuOpen = Boolean(profileMenuAnchor);
  
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };
  
  const handleThemeSelect = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  const handleSettingsClick = () => {
    handleProfileMenuClose();
    onNavigate("/settings");
  };
  
  // User info from persona context
  const displayName = persona.name;
  const userInitials = persona.avatar;
  const userRole = persona.title;

  // Navigation items for current surface
  const navItems = getNavItems(surface);
  
  const isDark = resolvedTheme === "dark";

  // When fully hidden, show only an expand button
  if (isHidden) {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Tooltip title="Expand navigation" placement="right">
          <IconButton
            onClick={onToggleHidden}
            sx={{
              bgcolor: isDark ? customColors.dark.surface : customColors.brand.navy,
              color: isDark ? "text.primary" : "#fff",
              boxShadow: 3,
              "&:hover": {
                bgcolor: isDark ? customColors.dark.elevated : customColors.brand.navyLight,
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      {/* Collapse/Expand Tab */}
      <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
        <IconButton
          onClick={onToggleCollapsed}
          size="small"
          sx={{
            position: "fixed",
            left: collapsed ? SIDEBAR_COLLAPSED_WIDTH - 12 : SIDEBAR_WIDTH - 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: 24,
            height: 48,
            borderRadius: "0 8px 8px 0",
            bgcolor: isDark ? customColors.dark.surface : customColors.brand.navy,
            color: isDark ? "text.secondary" : "rgba(255, 255, 255, 0.8)",
            boxShadow: 2,
            transition: "left 0.2s ease-in-out",
            "&:hover": {
              bgcolor: isDark ? customColors.dark.elevated : customColors.brand.navyLight,
              color: isDark ? "text.primary" : "#fff",
            },
          }}
        >
          {collapsed ? <ChevronRight sx={{ fontSize: 16 }} /> : <ChevronLeft sx={{ fontSize: 16 }} />}
        </IconButton>
      </Tooltip>

      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            transition: "width 0.2s ease-in-out",
            boxSizing: "border-box",
            bgcolor: isDark ? customColors.dark.surface : customColors.brand.navy,
            borderRight: isDark ? `1px solid ${customColors.dark.hover}` : "none",
            overflowX: "hidden",
          },
        }}
      >
        {/* Logo — click to go home */}
        <Tooltip title={collapsed ? "Back to ClinicalOS Home" : ""} placement="right">
          <Box
            onClick={() => onNavigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              p: 2,
              minHeight: 64,
              gap: 1.5,
              cursor: "pointer",
              "&:hover": {
                bgcolor: isDark ? "action.hover" : "rgba(255, 255, 255, 0.1)",
              },
              borderRadius: 1,
              mx: 0.5,
              mt: 0.5,
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: isDark 
                  ? `linear-gradient(135deg, ${customColors.accent.primary}, ${customColors.accent.cyan})`
                  : "rgba(255, 255, 255, 0.2)",
                background: isDark 
                  ? `linear-gradient(135deg, ${customColors.accent.primary}, ${customColors.accent.cyan})`
                  : "rgba(255, 255, 255, 0.2)",
                fontWeight: 700,
                fontSize: "1.1rem",
              }}
            >
              C
            </Avatar>
            {!collapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: isDark ? "text.primary" : "#fff",
                    lineHeight: 1.2,
                    fontSize: "1.1rem",
                  }}
                >
                  ClinicalOS
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? "text.secondary" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  Clinical AI Governance
                </Typography>
              </Box>
            )}
          </Box>
        </Tooltip>

        <Divider sx={{ borderColor: isDark ? customColors.dark.hover : "rgba(255, 255, 255, 0.1)" }} />

        {/* Surface indicator */}
        {!collapsed && (
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ color: isDark ? 'text.secondary' : 'rgba(255,255,255,0.6)' }}>
                {getSurfaceIcon(surface)}
              </Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isDark ? 'text.secondary' : 'rgba(255,255,255,0.6)',
                  fontSize: '0.65rem',
                }}
              >
                {getSurfaceLabel(surface)}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Surface Navigation */}
        <List sx={{ flex: 1, px: 1, py: 0.5 }}>
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeSubPage === item.id}
              collapsed={collapsed}
              isDark={isDark}
              onClick={() => onNavigate(item.path)}
            />
          ))}

          {/* Dev Panel (if enabled) */}
          {showDevPanel && (
            <NavButton
              item={{ id: "dev-panel", label: "Dev Panel", icon: <Code />, path: "/dev-panel", badge: "Dev", badgeColor: "warning" }}
              active={surface === "dev-panel"}
              collapsed={collapsed}
              isDark={isDark}
              onClick={() => onNavigate("/dev-panel")}
            />
          )}
        </List>

        {/* Persona Switcher (compact, in sidebar) */}
        {!collapsed && (
          <>
            <Divider sx={{ borderColor: isDark ? customColors.dark.hover : "rgba(255, 255, 255, 0.1)" }} />
            <Box sx={{ 
              color: isDark ? "text.primary" : "#fff",
              '& .MuiChip-root': {
                color: isDark ? undefined : 'rgba(255,255,255,0.9)',
                borderColor: isDark ? undefined : 'rgba(255,255,255,0.3)',
              },
              '& .MuiAvatar-root': {
                bgcolor: isDark ? undefined : 'rgba(255,255,255,0.2)',
                color: isDark ? undefined : '#fff',
              },
            }}>
              <PersonaSwitcher compact />
            </Box>
          </>
        )}

        {/* Settings link */}
        <Divider sx={{ borderColor: isDark ? customColors.dark.hover : "rgba(255, 255, 255, 0.1)" }} />
        <List sx={{ px: 1, py: 0.5 }}>
          <NavButton
            item={{ id: "settings", label: "Settings", icon: <Settings />, path: "/settings" }}
            active={surface === "settings"}
            collapsed={collapsed}
            isDark={isDark}
            onClick={() => onNavigate("/settings")}
          />
        </List>

        {/* Bottom Section - Profile with popup menu */}
        <Divider sx={{ borderColor: isDark ? customColors.dark.hover : "rgba(255, 255, 255, 0.1)" }} />
        <Box sx={{ p: 1 }}>
          <Tooltip title={collapsed ? displayName : ""} placement="right">
            <Box
              onClick={handleProfileClick}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1,
                borderRadius: 2,
                cursor: "pointer",
                bgcolor: profileMenuOpen 
                  ? (isDark ? "action.selected" : "rgba(255, 255, 255, 0.15)")
                  : "transparent",
                "&:hover": {
                  bgcolor: isDark ? "action.hover" : "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isDark 
                    ? `${customColors.accent.primary}20`
                    : "rgba(255, 255, 255, 0.2)",
                  color: isDark ? customColors.accent.primary : "#fff",
                  fontSize: "0.9rem",
                  fontWeight: 500,
                }}
              >
                {userInitials}
              </Avatar>
              {!collapsed && (
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: isDark ? "text.primary" : "#fff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? "text.secondary" : "rgba(255, 255, 255, 0.6)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                    }}
                  >
                    {userRole}
                  </Typography>
                </Box>
              )}
            </Box>
          </Tooltip>

          {/* Profile Popup Menu */}
          <Menu
            anchorEl={profileMenuAnchor}
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 200,
                  mt: -1,
                  ml: 1,
                },
              },
            }}
          >
            {/* Theme Selection */}
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Theme
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Tooltip title="Light">
                  <IconButton
                    size="small"
                    onClick={() => handleThemeSelect("light")}
                    sx={{
                      bgcolor: theme === "light" ? "primary.main" : "action.hover",
                      color: theme === "light" ? "primary.contrastText" : "text.secondary",
                      "&:hover": {
                        bgcolor: theme === "light" ? "primary.dark" : "action.selected",
                      },
                    }}
                  >
                    <LightMode fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Dark">
                  <IconButton
                    size="small"
                    onClick={() => handleThemeSelect("dark")}
                    sx={{
                      bgcolor: theme === "dark" ? "primary.main" : "action.hover",
                      color: theme === "dark" ? "primary.contrastText" : "text.secondary",
                      "&:hover": {
                        bgcolor: theme === "dark" ? "primary.dark" : "action.selected",
                      },
                    }}
                  >
                    <DarkMode fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="System">
                  <IconButton
                    size="small"
                    onClick={() => handleThemeSelect("system")}
                    sx={{
                      bgcolor: theme === "system" ? "primary.main" : "action.hover",
                      color: theme === "system" ? "primary.contrastText" : "text.secondary",
                      "&:hover": {
                        bgcolor: theme === "system" ? "primary.dark" : "action.selected",
                      },
                    }}
                  >
                    <Computer fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            {/* Settings Link */}
            <MenuItem onClick={handleSettingsClick}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
          </Menu>
        </Box>
      </Drawer>
    </>
  );
}

// ─── Nav Button Component ─────────────────────────────────────

interface NavButtonProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  isDark: boolean;
  onClick: () => void;
}

function NavButton({ item, active, collapsed, isDark, onClick }: NavButtonProps) {
  const content = (
    <ListItemButton
      onClick={onClick}
      selected={active}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        px: collapsed ? 1.5 : 2,
        minHeight: 44,
        justifyContent: collapsed ? "center" : "flex-start",
        color: active 
          ? (isDark ? customColors.accent.primary : "#fff")
          : (isDark ? "text.secondary" : "rgba(255, 255, 255, 0.7)"),
        bgcolor: active 
          ? (isDark ? `${customColors.accent.primary}15` : "rgba(255, 255, 255, 0.15)")
          : "transparent",
        "&:hover": {
          bgcolor: isDark 
            ? "action.hover"
            : "rgba(255, 255, 255, 0.1)",
          color: isDark ? "text.primary" : "#fff",
        },
        "&.Mui-selected": {
          bgcolor: isDark 
            ? `${customColors.accent.primary}15`
            : "rgba(255, 255, 255, 0.15)",
          "&:hover": {
            bgcolor: isDark 
              ? `${customColors.accent.primary}20`
              : "rgba(255, 255, 255, 0.2)",
          },
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : 40,
          color: "inherit",
          justifyContent: "center",
        }}
      >
        {item.badge && typeof item.badge === "number" ? (
          <Badge 
            badgeContent={item.badge} 
            color={item.badgeColor || "default"}
            sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem" } }}
          >
            {item.icon}
          </Badge>
        ) : (
          item.icon
        )}
      </ListItemIcon>
      {!collapsed && (
        <>
          <ListItemText 
            primary={item.label} 
            primaryTypographyProps={{
              fontSize: "0.875rem",
              fontWeight: active ? 500 : 400,
            }}
          />
          {item.badge && typeof item.badge === "string" && (
            <Chip
              label={item.badge}
              size="small"
              color={item.badgeColor || "default"}
              sx={{ 
                height: 20, 
                fontSize: "0.65rem",
                fontWeight: 600,
              }}
            />
          )}
        </>
      )}
    </ListItemButton>
  );

  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
}

export default AppSidebar;
