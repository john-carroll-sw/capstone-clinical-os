import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useUser } from '@/context/UserContext';

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

/**
 * Header - Top navigation bar with breadcrumbs, actions, and user profile
 */
export function Header() {
  const location = useLocation();
  const { profile, isAuthenticated, logout } = useUser();
  
  // User menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles: Record<string, string> = {
      '/': 'Dashboard',
      '/portfolios': 'Portfolios',
      '/analytics': 'Analytics',
      '/reports': 'Reports',
      '/settings': 'Settings',
      '/dev-panel': 'Dev Panel',
    };
    return titles[path] || 'ClinicalOS';
  };

  const getCurrentDate = () => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
  };

  const initials = getInitials(profile?.displayName);
  const displayName = profile?.displayName || 'User';
  const lanID = profile?.lanID || '';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="page-title">{getPageTitle()}</h1>
        <span className="current-date">{getCurrentDate()}</span>
      </div>

      <div className="header-right">
        <div className="header-search">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>

        <button className="header-action" title="Notifications">
          <span className="notification-badge">3</span>
        </button>

        {/* User Profile */}
        {isAuthenticated && (
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Display Name (visible on larger screens) */}
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', md: 'block' },
                color: 'text.secondary',
                fontWeight: 500,
              }}
            >
              {displayName}
            </Typography>
            
            <Tooltip title={displayName}>
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ 
                  p: 0,
                  '&:hover': {
                    bgcolor: 'rgba(212, 175, 55, 0.1)',
                  },
                }}
                aria-controls={menuOpen ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  elevation: 3,
                  sx: {
                    mt: 1,
                    minWidth: 220,
                    bgcolor: 'background.paper',
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1,
                    },
                  },
                },
              }}
            >
              {/* User Info Header */}
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {displayName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {profile?.email || ''}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                  {lanID}
                </Typography>
              </Box>

              <Divider />

              {/* Menu Items */}
              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>

              <MenuItem onClick={handleMenuClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>

              <Divider />

              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        )}
      </div>
    </header>
  );
}

export default Header;
