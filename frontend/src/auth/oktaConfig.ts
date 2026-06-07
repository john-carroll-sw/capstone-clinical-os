/**
 * Auth Configuration for HelixGuard Frontend
 * 
 * Authentication is DISABLED for the capstone demo.
 * The persona switcher replaces real auth.
 * 
 * If real auth were needed, configure:
 * - VITE_OKTA_ISSUER: Your OAuth2 issuer
 * - VITE_OKTA_CLIENT_ID: Your application client ID
 * - VITE_ENVIRONMENT: Environment name (local, dev, test, prod)
 */

import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';

const ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT || 'local';

/**
 * Get auth configuration based on environment
 * All environments default to local/demo mode for the capstone
 */
const getAuthConfig = (env: string) => {
  return {
    issuer: import.meta.env.VITE_OKTA_ISSUER || 'https://placeholder.example.com/oauth2',
    clientId: import.meta.env.VITE_OKTA_CLIENT_ID || 'placeholder-client-id',
    redirectUriBase: window.location.origin
  };
};

/**
 * Get auth scopes - basic identity scopes only
 */
const getAuthScopes = (): string[] => {
  return ['openid', 'profile', 'email'];
};

const authConfig = getAuthConfig(ENVIRONMENT);
const authScopes = getAuthScopes();

// Check if auth is properly configured (not using placeholder values)
export const isOktaConfigured = authConfig.issuer && 
  !authConfig.issuer.includes('placeholder') &&
  !authConfig.issuer.includes('dummy') &&
  !authConfig.issuer.includes('your-domain') &&
  authConfig.issuer.startsWith('https://');

export const oktaAuthConfig: OktaAuthOptions = {
  issuer: authConfig.issuer,
  clientId: authConfig.clientId,
  redirectUri: `${authConfig.redirectUriBase}/login/callback`,
  postLogoutRedirectUri: authConfig.redirectUriBase,
  scopes: authScopes,
  pkce: true,
  tokenManager: {
    storage: 'localStorage' as const,
    autoRenew: true,
    autoRemove: true,
    expireEarlySeconds: 30,
  },
  storageManager: {
    token: {
      storageType: 'localStorage' as const,
    },
    cache: {
      storageType: 'localStorage' as const,
    },
    transaction: {
      storageType: 'sessionStorage' as const,
    },
  },
};

// Create the OktaAuth instance
export const oktaAuth = new OktaAuth(oktaAuthConfig);

export default oktaAuth;
