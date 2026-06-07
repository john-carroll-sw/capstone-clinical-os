import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@auth/AuthProvider';
import { SecureRoute } from '@auth/SecureRoute';
import { AuthLayout } from '@layouts/AuthLayout';
import { Login, Callback } from '@pages/index';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, useUser } from './context/UserContext';
import { InitiativeDataProvider } from './context/InitiativeDataContext';
import { PersonaProvider } from './context/PersonaContext';
import { AppShell } from './components/layout/AppShell';
import { DemoAuthGate } from './components/DemoAuthGate';
import './index.css';

/**
 * HelixGuard - Clinical AI Governance & Decision Support
 * 
 * Three surfaces for three personas:
 * - Clinician Panel: embedded EHR-style AI assistant
 * - Leadership Dashboard: outcomes, metrics, signals
 * - Governance Control Plane: approve, configure, audit
 * 
 * Persona switcher lets evaluators toggle between perspectives.
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
    <DemoAuthGate>
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <PreferencesGate>
            <ThemeProvider>
              <PersonaProvider>
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
              </PersonaProvider>
            </ThemeProvider>
          </PreferencesGate>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
    </DemoAuthGate>
  );
}

export default App;
