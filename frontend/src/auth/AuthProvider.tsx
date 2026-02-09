/**
 * AuthProvider - Wraps the application with authentication context
 * 
 * When VITE_AUTH_ENABLED=true, wraps with Okta Security provider
 * When VITE_AUTH_ENABLED=false (default), provides mock auth context
 */

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Security } from '@okta/okta-react';
import { OktaAuth, toRelativeUrl } from '@okta/okta-auth-js';
import { env } from '@config/env';
import { oktaAuth } from './oktaConfig';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Okta Auth Provider - wraps children with Okta Security context
 */
function OktaAuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();

  const restoreOriginalUri = async (_oktaAuth: OktaAuth, originalUri: string) => {
    // Navigate to the original URI after successful authentication
    const path = toRelativeUrl(originalUri || '/', window.location.origin);
    navigate(path, { replace: true });
  };

  const onAuthRequired = () => {
    // Redirect to login when authentication is required
    navigate('/login');
  };

  return (
    <Security
      oktaAuth={oktaAuth}
      restoreOriginalUri={restoreOriginalUri}
      onAuthRequired={onAuthRequired}
    >
      {children}
    </Security>
  );
}

/**
 * Mock Auth Provider - provides passthrough for development
 */
function MockAuthProvider({ children }: AuthProviderProps) {
  return <>{children}</>;
}

/**
 * AuthProvider - Main export
 * Selects between Okta and Mock based on VITE_AUTH_ENABLED
 */
export function AuthProvider({ children }: AuthProviderProps) {
  if (env.auth.bypassAuth) {
    // Auth disabled - use mock provider
    return <MockAuthProvider>{children}</MockAuthProvider>;
  }

  // Auth enabled - use Okta provider
  return <OktaAuthProvider>{children}</OktaAuthProvider>;
}

export default AuthProvider;
