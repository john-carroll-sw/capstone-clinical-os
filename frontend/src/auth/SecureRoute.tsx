/**
 * SecureRoute - Protects routes that require authentication
 * 
 * When auth is enabled, redirects unauthenticated users to Okta login
 * When auth is bypassed (default), allows all access
 */

import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';
import { toRelativeUrl } from '@okta/okta-auth-js';
import { Box, CircularProgress, Typography } from '@mui/material';
import { env } from '@config/env';

/**
 * Loading spinner shown while checking auth state
 */
function AuthLoading() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <CircularProgress size={48} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        Checking authentication...
      </Typography>
    </Box>
  );
}

/**
 * SecureRoute with Okta integration
 */
function OktaSecureRoute() {
  const { authState, oktaAuth } = useOktaAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState) return;

    if (!authState.isAuthenticated && !authState.isPending) {
      // Save the current location to redirect back after login
      const originalUri = toRelativeUrl(
        window.location.href,
        window.location.origin
      );
      oktaAuth.setOriginalUri(originalUri);
      
      // Redirect to Okta login
      oktaAuth.signInWithRedirect();
    }
  }, [authState, oktaAuth, navigate]);

  // Show loading while auth state is being determined
  if (!authState || authState.isPending) {
    return <AuthLoading />;
  }

  // If not authenticated, show loading (redirect is happening)
  if (!authState.isAuthenticated) {
    return <AuthLoading />;
  }

  // Authenticated - render child routes
  return <Outlet />;
}

/**
 * Mock secure route for development
 */
function MockSecureRoute() {
  return <Outlet />;
}

/**
 * SecureRoute - Main export
 * Protects routes based on VITE_AUTH_ENABLED setting
 */
export function SecureRoute() {
  if (env.auth.bypassAuth) {
    // Auth disabled - allow all access
    return <MockSecureRoute />;
  }

  // Auth enabled - require Okta authentication
  return <OktaSecureRoute />;
}

export default SecureRoute;
