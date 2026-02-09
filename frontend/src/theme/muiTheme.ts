/**
 * MUI Theme Configuration
 * ClinicalOS - Clinical AI Governance & Decision Support
 * 
 * Light mode: Brand colors
 * Dark mode: Modern executive dashboard
 */

import { createTheme, type ThemeOptions, type PaletteMode } from '@mui/material';

// Brand Colors
const BRAND = {
  navy: '#003087',
  navyLight: '#1a4a9c',
  green: '#00a94f',
  greenLight: '#00c95e',
  teal: '#007a8a',
  orange: '#ff6b00',
  hypermint: '#3effc0',
};

// Dark theme colors
const DARK = {
  void: '#12141a',
  surface: '#181b22',
  elevated: '#1f232b',
  card: '#242a33',
  hover: '#2b323d',
};

// Health/Status colors
const HEALTH = {
  green: '#22c55e',
  greenLight: '#16a34a',
  amber: '#f59e0b',
  amberLight: '#d97706',
  red: '#ef4444',
  redLight: '#dc2626',
};

// Accent colors
const ACCENT = {
  primary: BRAND.navy,
  cyan: '#d4af37',
  emerald: '#2f9e72',
  amber: '#e0a73f',
  rose: '#d26b7c',
  purple: '#6c5aa8',
};

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'dark'
      ? {
          // Dark mode palette
          primary: {
            main: BRAND.navy,
            light: BRAND.navyLight,
            dark: '#00225f',
          },
          secondary: {
            main: BRAND.teal,
            light: '#1f9aa8',
            dark: '#00505a',
          },
          success: {
            main: HEALTH.green,
            light: '#4ade80',
            dark: '#16a34a',
          },
          warning: {
            main: HEALTH.amber,
            light: '#fcd34d',
            dark: '#d97706',
          },
          error: {
            main: HEALTH.red,
            light: '#f87171',
            dark: '#dc2626',
          },
          background: {
            default: DARK.void,
            paper: DARK.card,
          },
          text: {
            primary: '#f8f8fc',
            secondary: '#b4b4c8',
            disabled: '#5a5a6c',
          },
          divider: 'rgba(255, 255, 255, 0.06)',
          action: {
            active: '#f8f8fc',            hover: 'rgba(255, 255, 255, 0.05)',
            selected: 'rgba(0, 48, 135, 0.15)',
            disabled: 'rgba(255, 255, 255, 0.3)',
          },
        }
      : {
          // Light mode palette
          primary: {
            main: BRAND.navy,
            light: BRAND.navyLight,
            dark: '#001f5c',
          },
          secondary: {
            main: BRAND.teal,
            light: '#009aa8',
            dark: '#005a66',
          },
          success: {
            main: HEALTH.greenLight,
            light: HEALTH.green,
            dark: '#15803d',
          },
          warning: {
            main: HEALTH.amberLight,
            light: HEALTH.amber,
            dark: '#b45309',
          },
          error: {
            main: HEALTH.redLight,
            light: HEALTH.red,
            dark: '#b91c1c',
          },
          background: {
            default: '#f5f7fa',
            paper: '#ffffff',
          },
          text: {
            primary: '#1a1a2e',
            secondary: '#4a4a5a',
            disabled: '#8a8a9a',
          },
          divider: 'rgba(0, 0, 0, 0.08)',
          action: {
            active: BRAND.navy,
            hover: 'rgba(0, 48, 135, 0.04)',
            selected: 'rgba(0, 48, 135, 0.08)',
          },
        }),
  },
  typography: {
    fontFamily: '"Satoshi", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: '"Clash Display", "Inter", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontFamily: '"Clash Display", "Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily: '"Clash Display", "Inter", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontFamily: '"Clash Display", "Inter", sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: '"Clash Display", "Inter", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Clash Display", "Inter", sans-serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 1px 3px rgba(0, 0, 0, 0.1)',
    '0 2px 4px rgba(0, 0, 0, 0.1)',
    '0 4px 6px rgba(0, 0, 0, 0.1)',
    '0 6px 8px rgba(0, 0, 0, 0.1)',
    '0 8px 12px rgba(0, 0, 0, 0.1)',
    '0 10px 16px rgba(0, 0, 0, 0.1)',
    '0 12px 20px rgba(0, 0, 0, 0.1)',
    '0 14px 24px rgba(0, 0, 0, 0.1)',
    '0 16px 28px rgba(0, 0, 0, 0.1)',
    '0 18px 32px rgba(0, 0, 0, 0.1)',
    '0 20px 36px rgba(0, 0, 0, 0.1)',
    '0 22px 40px rgba(0, 0, 0, 0.1)',
    '0 24px 44px rgba(0, 0, 0, 0.1)',
    '0 26px 48px rgba(0, 0, 0, 0.1)',
    '0 28px 52px rgba(0, 0, 0, 0.15)',
    '0 30px 56px rgba(0, 0, 0, 0.15)',
    '0 32px 60px rgba(0, 0, 0, 0.15)',
    '0 34px 64px rgba(0, 0, 0, 0.15)',
    '0 36px 68px rgba(0, 0, 0, 0.2)',
    '0 38px 72px rgba(0, 0, 0, 0.2)',
    '0 40px 76px rgba(0, 0, 0, 0.2)',
    '0 42px 80px rgba(0, 0, 0, 0.25)',
    '0 44px 84px rgba(0, 0, 0, 0.3)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          padding: '10px 16px',
        },
      },
    },
  },
});

export const createAppTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode));

// Custom colors for use in components
export const customColors = {
  health: HEALTH,
  accent: ACCENT,
  brand: BRAND,
  dark: DARK,
};

export type CustomColors = typeof customColors;
