import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@auth/AuthProvider';
import { SecureRoute } from '@auth/SecureRoute';
import { AuthLayout } from '@layouts/AuthLayout';
import { Login, Callback } from '@pages/index';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { InitiativeDataProvider } from './context/InitiativeDataContext';
import { AppShell } from './components/layout/AppShell';
import './index.css';

/**
 * ClinicalOS - Clinical AI Governance & Decision Support
 * A C-Suite executive dashboard for portfolio management with AI-powered insights
 * 
 * Features:
 * - Personalized AI briefings
 * - OKR Dashboard with goal tracking
 * - AI-generated insights and recommendations
 * - Natural language search and voice queries
 * - Light/Dark theme support (synced with user preference)
 */
function PreferencesGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, preferencesReady } = useUser();

  if (isAuthenticated && !preferencesReady) {
    return null;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <PreferencesGate>
            <ThemeProvider>
              <Routes>
                {/* Auth routes (public) */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/login/callback" element={<Callback />} />
                </Route>

                {/* Protected routes - main application */}
                <Route element={<SecureRoute />}>
                  <Route path="/*" element={
                    <InitiativeDataProvider>
                      <AppShell />
                    </InitiativeDataProvider>
                  } />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ThemeProvider>
          </PreferencesGate>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
