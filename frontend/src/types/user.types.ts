/**
 * User Profile Types for ClinicalOS
 * 
 * The primary user identifier is the `lanID` from the Okta token.
 * This should be used for all database interactions and audit trails.
 */

/**
 * User profile derived from Okta token claims
 */
export interface UserProfile {
  /** LAN ID - Primary user identifier (e.g., "C9N5T9") */
  lanID: string;
  
  /** User's email address */
  email: string;
  
  /** User's first name */
  firstName: string;
  
  /** User's last name */
  lastName: string;
  
  /** User's full display name */
  fullName: string;
  
  /** User's department */
  department: string;
  
  /** User's manager (if available) */
  manager?: string;
  
  /** User's job title (if available) */
  title?: string;
  
  /** User's employee ID (if available) */
  employeeID?: string;
}

/**
 * Raw Okta token claims structure
 * Contains all claims from the Okta access token
 */
export interface OktaTokenClaims {
  // Standard claims
  sub: string;
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  
  // Custom claims
  lanID: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName?: string;
  samAccountName?: string;
  department?: string;
  manager?: string;
  title?: string;
  employeeID?: string;
  userPrincipalName?: string;
  login?: string;
  
  // Scopes (array of granted scopes)
  scp?: string[];
}

/**
 * Authentication state for the application
 */
export interface AuthState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether auth state is still loading */
  isLoading: boolean;
  
  /** The authenticated user's profile (null if not authenticated) */
  user: UserProfile | null;
  
  /** Access token for API calls (null if not authenticated) */
  accessToken: string | null;
  
  /** Any authentication error */
  error: Error | null;
}

/**
 * Mock user for development when auth is bypassed
 */
export const MOCK_USER: UserProfile = {
  lanID: 'DEV_USER',
  email: 'developer@app.local',
  firstName: 'Dev',
  lastName: 'User',
  fullName: 'Dev User',
  department: 'Development',
  manager: '',
  title: 'Developer',
};

/**
 * Map Okta token claims to UserProfile
 */
export function mapClaimsToProfile(claims: OktaTokenClaims): UserProfile {
  return {
    lanID: claims.lanID || claims.samAccountName || '',
    email: claims.email || '',
    firstName: claims.firstName || '',
    lastName: claims.lastName || '',
    fullName: claims.fullName || claims.displayName || `${claims.firstName} ${claims.lastName}`.trim(),
    department: claims.department || '',
    manager: claims.manager,
    title: claims.title,
    employeeID: claims.employeeID,
  };
}

/**
 * Get user initials for avatar display
 */
export function getUserInitials(user: UserProfile | null): string {
  if (!user) return '?';
  
  const first = user.firstName?.charAt(0) || '';
  const last = user.lastName?.charAt(0) || '';
  
  if (first && last) {
    return `${first}${last}`.toUpperCase();
  }
  
  // Fallback to lanID first two chars
  return user.lanID?.substring(0, 2).toUpperCase() || '??';
}
