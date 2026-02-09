/**
 * useOktaAuth - Real authentication hook
 * 
 * This module is only loaded when VITE_AUTH_ENABLED=true.
 * It requires the auth Security context to be present.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOktaAuth as useOktaAuthContext } from '@okta/okta-react';
import { 
  UserProfile, 
  mapClaimsToProfile,
  OktaTokenClaims,
} from '@/types/user.types';
import type { UseAuthReturn } from './useAuth';

/**
 * Hook for real authentication
 * Must be used within the auth Security context
 */
export function useOktaAuth(): UseAuthReturn {
  const { authState, oktaAuth } = useOktaAuthContext();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!authState?.isAuthenticated) {
      setUser(null);
      return;
    }

    try {
      const accessToken = authState.accessToken;
      if (accessToken?.claims) {
        const claims = accessToken.claims as unknown as OktaTokenClaims;
        
        if (!claims.lanID) {
          console.warn('Token missing lanID claim');
          setError(new Error('User identity (lanID) not found in token'));
          return;
        }
        
        const profile = mapClaimsToProfile(claims);
        setUser(profile);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
    }
  }, [authState?.isAuthenticated, authState?.accessToken]);

  const login = useCallback(async () => {
    try {
      await oktaAuth.signInWithRedirect();
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err : new Error('Login failed'));
    }
  }, [oktaAuth]);

  const logout = useCallback(async () => {
    try {
      await oktaAuth.signOut();
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err : new Error('Logout failed'));
    }
  }, [oktaAuth]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await oktaAuth.getAccessToken();
      return token || null;
    } catch (err) {
      console.error('Failed to get access token:', err);
      return null;
    }
  }, [oktaAuth]);

  return {
    isAuthenticated: authState?.isAuthenticated ?? false,
    isLoading: !authState || authState.isPending === true,
    user,
    lanID: user?.lanID || null,
    login,
    logout,
    getAccessToken,
    error,
  };
}
