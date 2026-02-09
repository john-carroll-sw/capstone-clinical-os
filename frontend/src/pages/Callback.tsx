/**
 * Callback - Handles OAuth callback from Okta
 * 
 * When auth is enabled, uses Okta's LoginCallback component
 * When auth is bypassed, redirects to dashboard
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginCallback } from '@okta/okta-react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { env } from '@config/env';

/**
 * Loading component shown during OAuth callback processing
 */
function CallbackLoading() {
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
        Completing authentication...
      </Typography>
    </Box>
  );
}

/**
 * Error component shown when OAuth callback fails
 */
function CallbackError({ error }: { error: Error }) {
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
        p: 3,
      }}
    >
      <Typography variant="h5" color="error" gutterBottom>
        Authentication Error
      </Typography>
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {error.message || 'An error occurred during authentication'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Please try again or contact support if the problem persists.
      </Typography>
    </Box>
  );
}

/**
 * Mock callback for when auth is bypassed
 */
function MockCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // If auth is bypassed, just redirect to home
    navigate('/', { replace: true });
  }, [navigate]);

  return <CallbackLoading />;
}

/**
 * Callback - Main export
 */
export function Callback() {
  if (env.auth.bypassAuth) {
    return <MockCallback />;
  }

  return (
    <LoginCallback
      loadingElement={<CallbackLoading />}
      errorComponent={CallbackError}
    />
  );
}

export default Callback;
