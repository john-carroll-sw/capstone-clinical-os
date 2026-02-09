/**
 * Settings Page - User preferences and configuration
 * 
 * Uses PreferencesStore as single source of truth for all preferences.
 * 
 * Note: Theme is now managed via the profile popup in the sidebar.
 * Note: For You is always enabled (no longer a preference).
 */

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Switch,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { 
  Science, 
  NotificationsActive, 
  Campaign, 
  Summarize, 
  TipsAndUpdates,
  Logout,
} from "@mui/icons-material";
import { useUser } from "../../context/UserContext";
import { usePersona } from "../../context/PersonaContext";
import { usePreferences, type UserPreferences } from "../../services/preferencesStore";
import { customColors } from "../../theme/muiTheme";
import { PersonaSwitcher } from "../PersonaSwitcher";

/**
 * Get user initials from display name
 */
function getInitials(displayName: string | undefined): string {
  if (!displayName) return '?';
  
  // Handle "Last, First (CTR)" format
  const withoutSuffix = displayName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  
  if (withoutSuffix.includes(',')) {
    const [last, first] = withoutSuffix.split(',').map(s => s.trim());
    return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  }
  
  // Handle "First Last" format
  const parts = withoutSuffix.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  
  return withoutSuffix.substring(0, 2).toUpperCase();
}

export function SettingsPage() {
  const { profile, logout } = useUser();
  const [prefs, setPref] = usePreferences();
  
  // Local state for saving indicator
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const handlePreferenceChange = async <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setSaving(true);
    setSaveError(null);
    try {
      await setPref(key, value);
    } catch (err) {
      console.error(`Failed to save ${key}:`, err);
      setSaveError(`Failed to save preference`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleSignOut = async () => {
    await logout();
  };
  
  // User display info
  const displayName = profile?.displayName || 'User';
  const userInitials = getInitials(displayName);
  const userEmail = profile?.email || '';
  const userLanID = profile?.lanID || '';

  return (
    <Box sx={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your preferences and account settings
        </Typography>
      </Box>

      {saveError && (
        <Alert severity="error" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {/* Persona Switcher — the demo superpower */}
      <PersonaSwitcher />

      {/* Profile Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Profile
          </Typography>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: `${customColors.accent.primary}20`,
                color: customColors.accent.primary,
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              {userInitials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {displayName}
              </Typography>
              <Typography color="text.secondary">{userLanID}</Typography>
              <Typography variant="body2" color="text.secondary">{userEmail}</Typography>
              <Typography variant="body2" color="text.secondary">{profile?.domain || ''}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Notifications - Restructured */}
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <NotificationsActive sx={{ color: customColors.accent.cyan }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>
            <Chip 
              label="Coming Soon" 
              size="small" 
              sx={{ 
                bgcolor: `${customColors.accent.cyan}20`, 
                color: customColors.accent.cyan,
                fontWeight: 600,
                fontSize: "0.65rem",
              }} 
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get notified about portfolio updates via Microsoft Teams. All notifications will be delivered to Teams.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Insights */}
            <ToggleSetting
              icon={<TipsAndUpdates fontSize="small" />}
              label="Insights"
              description="Receive notifications when new insights are detected in your portfolio"
              checked={false}
              onChange={() => {}}
              disabled
              comingSoon
            />

            <Divider />

            {/* Alerts */}
            <ToggleSetting
              icon={<Campaign fontSize="small" />}
              label="Alerts"
              description="Get notified about blockers, risks, and items requiring attention"
              checked={false}
              onChange={() => {}}
              disabled
              comingSoon
            />

            <Divider />

            {/* Daily Briefings */}
            <ToggleSetting
              icon={<Summarize fontSize="small" />}
              label="Daily Briefings"
              description="Receive your personalized AI briefing each morning"
              checked={false}
              onChange={() => {}}
              disabled
              comingSoon
            />

            <Divider />

            {/* Weekly Digest */}
            <ToggleSetting
              icon={<Summarize fontSize="small" />}
              label="Weekly Digest"
              description="Get a comprehensive weekly summary with trends and patterns"
              checked={false}
              onChange={() => {}}
              disabled
              comingSoon
            />
          </Box>
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            AI Features
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <ToggleSetting
              label="Voice Input"
              description="Enable voice commands for the AI Assistant"
              checked={prefs.voiceInputEnabled}
              onChange={(checked) => handlePreferenceChange('voiceInputEnabled', checked)}
              disabled={saving}
            />
            <ToggleSetting
              label="Smart Tag Suggestions"
              description="AI will suggest tags for insights and decisions"
              checked={false}
              onChange={() => {}}
              disabled
              comingSoon
            />
            <ToggleSetting
              label="Proactive Recommendations"
              description="Receive AI recommendations based on your data"
              checked={false}
              onChange={() => {}}
              disabled
              comingSoon
            />
            <ToggleSetting
              label="Natural Language Search"
              description="Search your data using natural language queries"
              checked={false}
              onChange={() => {}}
              disabled
              comingSoon
            />
          </Box>
        </CardContent>
      </Card>

      {/* Experimental Features */}
      <Card sx={{ border: 1, borderColor: customColors.accent.purple, borderStyle: "dashed" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Science sx={{ color: customColors.accent.purple }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Experimental Features
            </Typography>
            <Chip 
              label="Beta" 
              size="small" 
              sx={{ 
                bgcolor: `${customColors.accent.purple}20`, 
                color: customColors.accent.purple,
                fontWeight: 600,
                fontSize: "0.65rem",
              }} 
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Preview features that are still in development. These may change or be removed.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <ToggleSetting
              label="Dev Panel"
              description="Enable the developer panel to directly edit initiative data"
              checked={prefs.showDevPanel}
              onChange={(checked) => handlePreferenceChange('showDevPanel', checked)}
              disabled={saving}
            />
          </Box>
          
          {saving && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">Saving...</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Card sx={{ borderColor: `${customColors.health.red}50` }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, color: customColors.health.red, mb: 2 }}>
            Account
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Sign Out
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign out of your account on this device
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Logout />}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

// Toggle Setting Component
interface ToggleSettingProps {
  icon?: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

function ToggleSetting({ 
  icon, 
  label, 
  description, 
  checked, 
  onChange, 
  disabled = false,
  comingSoon = false,
}: ToggleSettingProps) {
  return (
    <Box sx={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between", 
      opacity: disabled ? 0.6 : 1,
    }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        {icon && (
          <Box sx={{ color: "text.secondary", mt: 0.3 }}>
            {icon}
          </Box>
        )}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            {comingSoon && (
              <Chip 
                label="Soon" 
                size="small" 
                sx={{ 
                  height: 18,
                  fontSize: "0.6rem",
                  bgcolor: "action.hover",
                  color: "text.secondary",
                }} 
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </Box>
      <Switch
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        color="primary"
        disabled={disabled}
      />
    </Box>
  );
}

export default SettingsPage;
