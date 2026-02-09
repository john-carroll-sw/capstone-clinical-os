/**
 * UserContext - Provides user authentication state and profile throughout the app
 * 
 * This context:
 * - Provides auth state from useAuth hook
 * - Fetches user profile from backend ONCE after authentication
 * - Delegates preference management to PreferencesStore
 * 
 * The primary user identifier is `lanID` parsed from the auth token.
 */

import { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useRef,
  ReactNode 
} from 'react';
import { axiosInstance } from '@api/axiosInstance';
import { useAuth, UseAuthReturn } from '@hooks/useAuth';
import { preferencesStore, type UserPreferences } from '../services/preferencesStore';

// Re-export types for convenience
export type { UseAuthReturn } from '@hooks/useAuth';

// Full user profile from backend
export interface UserProfile {
  lanID: string;
  email: string;
  displayName: string;
  employeeID: string;
  domain: string;
}

// Context value type
interface UserContextValue extends UseAuthReturn {
  /** Full user profile from backend */
  profile: UserProfile | null;
  /** Loading state for profile fetch */
  profileLoading: boolean;
  /** Error from profile fetch */
  profileError: string | null;
  /** Refresh user profile from backend */
  refreshProfile: () => Promise<void>;
  /** Update user preferences via PreferencesStore */
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  /** Whether preferences have synced after auth */
  preferencesReady: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

// localStorage key for profile cache (NOT preferences - those go through PreferencesStore)
const PROFILE_CACHE_KEY = 'app_user_profile_cache';

interface UserProviderProps {
  children: ReactNode;
}

/**
 * UserProvider - Wraps children with user context
 */
export function UserProvider({ children }: UserProviderProps) {
  const auth = useAuth();
  
  // Refs to prevent duplicate fetches
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);
  
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    // Initialize from cache for faster perceived load
    try {
      const stored = localStorage.getItem(PROFILE_CACHE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [preferencesReady, setPreferencesReady] = useState<boolean>(() => preferencesStore.hasSynced());
  
  /**
   * Fetch user profile from backend (ONCE per session)
   */
  const fetchProfile = useCallback(async (force = false) => {
    // Prevent duplicate fetches
    if (!force && (hasFetchedRef.current || isFetchingRef.current)) {
      return;
    }
    
    if (!auth.isAuthenticated) {
      setProfile(null);
      localStorage.removeItem(PROFILE_CACHE_KEY);
      hasFetchedRef.current = false;
      return;
    }
    
    isFetchingRef.current = true;
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      const response = await axiosInstance.get('/user/me');
      const userData = response.data?.data;
      
      if (userData) {
        // Extract profile info (without preferences - those go to PreferencesStore)
        const profileData: UserProfile = {
          lanID: userData.lanID,
          email: userData.email,
          displayName: userData.displayName,
          employeeID: userData.employeeID,
          domain: userData.domain,
        };
        
        setProfile(profileData);
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileData));
        
        // Sync preferences from backend to store (this happens once)
        // The store will update ThemeContext and other subscribers
        await preferencesStore.syncFromBackend();
      }
      
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setProfileError('Failed to load user profile');
      
      // Keep cached profile on error
    } finally {
      isFetchingRef.current = false;
      setProfileLoading(false);
    }
  }, [auth.isAuthenticated]);
  
  /**
   * Update user preferences via PreferencesStore
   */
  const updatePreferences = useCallback(async (prefs: Partial<UserPreferences>) => {
    if (!auth.isAuthenticated) return;
    await preferencesStore.setMany(prefs);
  }, [auth.isAuthenticated]);
  
  // Fetch profile ONCE when authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      if (hasFetchedRef.current) {
        setPreferencesReady(true);
        return;
      }

      setPreferencesReady(false);
      fetchProfile()
        .finally(() => {
          setPreferencesReady(true);
        });
      return;
    }

    // Clear on logout
    setProfile(null);
    localStorage.removeItem(PROFILE_CACHE_KEY);
    preferencesStore.clear();
    hasFetchedRef.current = false;
    setPreferencesReady(false);
  }, [auth.isAuthenticated, fetchProfile]);
  
  const contextValue: UserContextValue = {
    ...auth,
    profile,
    profileLoading,
    profileError,
    refreshProfile: () => fetchProfile(true),
    updatePreferences,
    preferencesReady,
  };
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * useUser - Hook to access user context
 */
export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}

export default UserContext;
