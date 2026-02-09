/**
 * Notifications Popover - High-level overview of alerts
 * Shows quick summary with option to view full alerts page
 */

import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Popover,
  Badge,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import { Notifications, CheckCircle } from "@mui/icons-material";
import { getAlertSummary, getUnreadActivities } from "../../data/mockData";
import { customColors } from "../../theme/muiTheme";
import { renderIcon } from "../../utils/icons";

interface NotificationsPopoverProps {
  onViewAlerts: () => void;
}

export function NotificationsPopover({ onViewAlerts }: NotificationsPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const alertSummary = getAlertSummary();
  const unreadCount = getUnreadActivities().length;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewAll = () => {
    handleClose();
    onViewAlerts();
  };

  const open = Boolean(anchorEl);
  const totalAlerts = alertSummary.s1Count + alertSummary.s2Count + alertSummary.s3Count;
  const badgeCount = totalAlerts + unreadCount;

  const severityConfig = {
    S1: {
      label: "Critical",
      color: customColors.health.red,
      bg: `${customColors.health.red}15`,
    },
    S2: {
      label: "High",
      color: customColors.health.amber,
      bg: `${customColors.health.amber}15`,
    },
    S3: {
      label: "Medium",
      color: "text.secondary",
      bg: "action.hover",
    },
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: "text.secondary",
          "&:hover": {
            color: "text.primary",
          },
        }}
      >
        <Badge
          badgeContent={badgeCount}
          color="error"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.65rem",
              minWidth: 18,
              height: 18,
            },
          }}
        >
          <Notifications fontSize="small" />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              mt: 1,
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            },
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Alerts Overview
            </Typography>
            {badgeCount > 0 && (
              <Chip
                label={`${badgeCount} new`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  bgcolor: `${customColors.health.red}15`,
                  color: customColors.health.red,
                }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            Items requiring your attention
          </Typography>
        </Box>

        <Divider />

        {/* Summary Stats */}
        <Box sx={{ display: "flex", p: 2, gap: 1 }}>
          <SeverityStat
            label="Critical"
            count={alertSummary.s1Count}
            color={customColors.health.red}
          />
          <SeverityStat
            label="High"
            count={alertSummary.s2Count}
            color={customColors.health.amber}
          />
          <SeverityStat
            label="Watch"
            count={alertSummary.s3Count}
            color="text.secondary"
          />
        </Box>

        <Divider />

        {/* Recent Alerts */}
        <Box sx={{ py: 1 }}>
          {alertSummary.topAlerts.length > 0 ? (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 2, py: 1, display: "block" }}
              >
                Recent Alerts
              </Typography>
              {alertSummary.topAlerts.map((alert, index) => (
                <Box
                  key={alert.id}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                    borderBottom: index < alertSummary.topAlerts.length - 1 ? 1 : 0,
                    borderColor: "divider",
                  }}
                  onClick={handleViewAll}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: severityConfig[alert.severity].bg,
                      color: severityConfig[alert.severity].color,
                      flexShrink: 0,
                    }}
                  >
                    {renderIcon(alert.goalIcon, { fontSize: "small" })}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                      <Chip
                        label={alert.severity}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          bgcolor: severityConfig[alert.severity].bg,
                          color: severityConfig[alert.severity].color,
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {alert.timeAgo}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {alert.title}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <CheckCircle sx={{ fontSize: "2rem", mb: 1, color: customColors.health.green }} />
              <Typography variant="body2" color="text.secondary">
                No active alerts
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        {/* View All Button */}
        <Box sx={{ p: 1.5 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={handleViewAll}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            View All Alerts
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// Severity Stat Component
interface SeverityStatProps {
  label: string;
  count: number;
  color: string;
}

function SeverityStat({ label, count, color }: SeverityStatProps) {
  return (
    <Box
      sx={{
        flex: 1,
        textAlign: "center",
        p: 1.5,
        borderRadius: 2,
        bgcolor: count > 0 ? `${color}10` : "transparent",
        border: 1,
        borderColor: count > 0 ? `${color}30` : "divider",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: count > 0 ? color : "text.disabled",
        }}
      >
        {count}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: count > 0 ? color : "text.disabled",
          display: "block",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export default NotificationsPopover;
