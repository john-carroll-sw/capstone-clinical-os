/**
 * Theme Context
 * Global theme management for ClinicalOS using Material UI
 * Supports light/dark mode with brand colors
 * 
 * Uses PreferencesStore as the single source of truth for theme preference.
 */

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider, CssBaseline, type PaletteMode } from "@mui/material";
import { createAppTheme } from "../theme/muiTheme";
import { preferencesStore, type UserPreferences } from "../services/preferencesStore";

export type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: PaletteMode;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize theme from PreferencesStore
  const [theme, setThemeState] = useState<Theme>(() => preferencesStore.getValue('theme'));
  const [resolvedTheme, setResolvedTheme] = useState<PaletteMode>(() => {
    const t = preferencesStore.getValue('theme');
    if (t === 'system') {
      return 'light';
    }
    return t;
  });

  // Subscribe to PreferencesStore changes
  useEffect(() => {
    const unsubscribe = preferencesStore.subscribe((prefs: UserPreferences) => {
      setThemeState(prefs.theme);
    });
    return unsubscribe;
  }, []);

  // Resolve system theme
  useEffect(() => {
    if (theme === 'system') {
      setResolvedTheme('light');
      return;
    }

    setResolvedTheme(theme);
  }, [theme]);

  // Create MUI theme based on resolved theme
  const muiTheme = useMemo(() => createAppTheme(resolvedTheme), [resolvedTheme]);

  const setTheme = (newTheme: Theme) => {
    // Update PreferencesStore (which handles localStorage + backend sync)
    preferencesStore.set('theme', newTheme).catch(err => {
      console.error('Failed to save theme preference:', err);
    });
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
