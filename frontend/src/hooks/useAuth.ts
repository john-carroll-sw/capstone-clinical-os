/**
 * useAuth - Custom hook for authentication operations
 * 
 * Provides unified auth interface regardless of whether auth is enabled.
 * The primary user identifier is `lanID` from the auth token.
 * 
 * When VITE_AUTH_ENABLED=true, uses real authentication
 * When VITE_AUTH_ENABLED=false (default), returns mock authenticated state
 */

import { env } from '@config/env';
import { UserProfile, MOCK_USER } from '@/types/user.types';
import { useOktaAuth as useOktaAuthImpl } from './useOktaAuth';

export interface UseAuthReturn {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether auth state is still loading */
  isLoading: boolean;
  
  /** The authenticated user's profile */
  user: UserProfile | null;
  
  /** The user's LAN ID (primary identifier) */
  lanID: string | null;
  
  /** Initiate login flow */
  login: () => Promise<void>;
  
  /** Logout and clear session */
  logout: () => Promise<void>;
  
  /** Get the current access token for API calls */
  getAccessToken: () => Promise<string | null>;
  
  /** Any authentication error */
  error: Error | null;
}

// Static mock return value for bypassed auth
const MOCK_AUTH_RETURN: UseAuthReturn = {
  isAuthenticated: true,
  isLoading: false,
  user: MOCK_USER,
  lanID: MOCK_USER.lanID,
  login: async () => { console.log('[Dev Mode] Login bypassed'); },
  logout: async () => { console.log('[Dev Mode] Logout bypassed'); },
  getAccessToken: async () => 'dev-mock-token',
  error: null,
};

/**
 * Mock auth hook - just returns static mock data
 */
function useMockAuth(): UseAuthReturn {
  return MOCK_AUTH_RETURN;
}

/**
 * useAuth - Main export
 * 
 * When auth is bypassed (default), returns mock data.
 * When auth is enabled, uses the real Okta hook.
 */
export function useAuth(): UseAuthReturn {
  // Check if auth is bypassed - this is constant at build time
  if (env.auth.bypassAuth) {
    return useMockAuth();
  }
  
  // Auth enabled - use real auth implementation
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useOktaAuthImpl();
}

export default useAuth;
