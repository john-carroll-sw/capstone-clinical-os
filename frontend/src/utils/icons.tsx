/**
 * Centralized icon mappings for ClinicalOS
 * Uses Material UI icons for professional C-suite appearance
 */

import {
  TrackChanges, // Goals/targets
  TrendingUp, // Growth/trends up
  TrendingDown, // Trends down
  Analytics, // Analytics/summaries
  Assessment, // Reports/assessments
  Warning, // Warnings/anomalies
  Lightbulb, // Recommendations/insights
  AutoAwesome, // Predictions/AI
  NotificationsActive, // Alerts
  CheckCircle, // Success/completed
  Error, // Critical/errors
  Info, // Information
  AttachMoney, // Financial/money
  Security, // Compliance/security
  Timeline, // Trends/timeline
  Search, // Search
  Chat, // Comments/chat
  Loop, // Status change/refresh
  RocketLaunch, // Scale/launch
  Block, // Blocked
  LockOpen, // Unblock
  Pause, // Defer
  SwapHoriz, // Pivot
  Dashboard, // Dashboard
  FolderSpecial, // Portfolios
  BarChart, // Charts
  Settings, // Settings
  Logout, // Logout
  SvgIconComponent,
} from "@mui/icons-material";
import { SxProps, Theme } from "@mui/material";

// Type for icon keys
export type IconKey = 
  | "goal" | "target"
  | "trend_up" | "growth" | "trend_down"
  | "analytics" | "summary" | "metric"
  | "report" | "assessment"
  | "warning" | "anomaly" | "attention"
  | "insight" | "recommendation" | "lightbulb"
  | "prediction" | "ai" | "sparkle"
  | "alert" | "notification"
  | "success" | "check" | "completed"
  | "error" | "critical"
  | "info"
  | "money" | "financial" | "invest"
  | "security" | "compliance" | "shield"
  | "timeline" | "trend"
  | "search"
  | "chat" | "comment"
  | "refresh" | "status_change"
  | "scale" | "launch"
  | "block" | "divest"
  | "unblock"
  | "defer" | "pause"
  | "pivot"
  | "dashboard"
  | "portfolio"
  | "chart"
  | "settings"
  | "logout";

// Map icon keys to MUI icon components
const iconMap: Record<IconKey, SvgIconComponent> = {
  goal: TrackChanges,
  target: TrackChanges,
  trend_up: TrendingUp,
  growth: TrendingUp,
  trend_down: TrendingDown,
  analytics: Analytics,
  summary: Analytics,
  metric: Assessment,
  report: Assessment,
  assessment: Assessment,
  warning: Warning,
  anomaly: Warning,
  attention: Warning,
  insight: Lightbulb,
  recommendation: Lightbulb,
  lightbulb: Lightbulb,
  prediction: AutoAwesome,
  ai: AutoAwesome,
  sparkle: AutoAwesome,
  alert: NotificationsActive,
  notification: NotificationsActive,
  success: CheckCircle,
  check: CheckCircle,
  completed: CheckCircle,
  error: Error,
  critical: Error,
  info: Info,
  money: AttachMoney,
  financial: AttachMoney,
  invest: AttachMoney,
  security: Security,
  compliance: Security,
  shield: Security,
  timeline: Timeline,
  trend: Timeline,
  search: Search,
  chat: Chat,
  comment: Chat,
  refresh: Loop,
  status_change: Loop,
  scale: RocketLaunch,
  launch: RocketLaunch,
  block: Block,
  divest: TrendingDown,
  unblock: LockOpen,
  defer: Pause,
  pause: Pause,
  pivot: SwapHoriz,
  dashboard: Dashboard,
  portfolio: FolderSpecial,
  chart: BarChart,
  settings: Settings,
  logout: Logout,
};

/**
 * Get a Material UI icon component by key
 */
export function getIcon(key: IconKey | string): SvgIconComponent {
  return iconMap[key as IconKey] || Info;
}

/**
 * Render an icon by key with optional styling
 */
export function renderIcon(
  key: IconKey | string,
  props?: { fontSize?: "small" | "medium" | "large" | "inherit"; sx?: SxProps<Theme>; color?: "inherit" | "primary" | "secondary" | "error" | "warning" | "info" | "success" }
) {
  const IconComponent = getIcon(key);
  return <IconComponent {...props} />;
}

/**
 * Icon mappings for specific use cases
 */
export const insightTypeIcons: Record<string, IconKey> = {
  summary: "analytics",
  trend: "trend_up",
  anomaly: "warning",
  recommendation: "recommendation",
  prediction: "prediction",
};

export const activityTypeIcons: Record<string, IconKey> = {
  metric_update: "metric",
  decision: "check",
  signal: "alert",
  comment: "comment",
  status_change: "refresh",
};

export const decisionTypeIcons: Record<string, IconKey> = {
  scale: "scale",
  pivot: "pivot",
  invest: "invest",
  divest: "divest",
  unblock: "unblock",
  defer: "defer",
};

export const responseTypeIcons: Record<string, IconKey> = {
  portfolio_overview: "analytics",
  goal_detail: "goal",
  kr_analysis: "trend_up",
  alerts_summary: "alert",
  decisions_pending: "check",
  weekly_performance: "timeline",
  trend_analysis: "trend",
  recommendations: "recommendation",
  custom_query: "search",
  text_only: "chat",
};

export const goalPortfolioIcons: Record<string, IconKey> = {
  cx: "goal",
  growth: "trend_up",
  financial: "money",
  compliance: "security",
};

export const healthStateIcons: Record<string, IconKey> = {
  green: "success",
  amber: "warning",
  red: "error",
};

export default {
  getIcon,
  renderIcon,
  insightTypeIcons,
  activityTypeIcons,
  decisionTypeIcons,
  responseTypeIcons,
  goalPortfolioIcons,
  healthStateIcons,
};

