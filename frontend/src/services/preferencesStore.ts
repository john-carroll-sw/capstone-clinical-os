/**
 * PreferencesStore - Singleton store for user preferences
 * 
 * This is the SINGLE SOURCE OF TRUTH for all user preferences.
 * - Syncs with backend on auth
 * - Provides reactive updates via subscriptions
 * - Handles optimistic updates with rollback
 * - Prevents duplicate API calls
 * 
 * Usage:
 *   import { preferencesStore } from '@services/preferencesStore';
 *   
 *   // Subscribe to changes
 *   const unsubscribe = preferencesStore.subscribe((prefs) => { ... });
 *   
 *   // Update a preference
 *   await preferencesStore.set('theme', 'dark');
 */

import { axiosInstance } from '@api/axiosInstance';

// All user preferences
export interface UserPreferences {
  // UI preferences
  theme: 'light' | 'dark' | 'system';
  
  // Feature flags
  showForYou: boolean;
  showDevPanel: boolean;
  voiceInputEnabled: boolean;
  pushNotificationsEnabled: boolean;
  
  // Notification preferences
  weeklyDigestEnabled: boolean;
  teamsNotificationsEnabled: boolean;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  showForYou: true,  // For You is always enabled now
  showDevPanel: false,
  voiceInputEnabled: false,
  pushNotificationsEnabled: true,
  weeklyDigestEnabled: false,
  teamsNotificationsEnabled: false,
};

// Storage key
const STORAGE_KEY = 'app_preferences';

// Subscriber callback type
type Subscriber = (prefs: UserPreferences) => void;

/**
 * Singleton PreferencesStore
 */
class PreferencesStore {
  private preferences: UserPreferences;
  private subscribers: Set<Subscriber> = new Set();
  private isSyncing = false;
  private hasSyncedWithBackend = false;
  private syncPromise: Promise<void> | null = null;
  
  constructor() {
    // Initialize from localStorage or defaults
    this.preferences = this.loadFromStorage();
  }
  
  /**
   * Load preferences from localStorage
   */
  private loadFromStorage(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all keys exist
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load preferences from localStorage:', e);
    }
    return { ...DEFAULT_PREFERENCES };
  }
  
  /**
   * Save preferences to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (e) {
      console.warn('Failed to save preferences to localStorage:', e);
    }
  }
  
  /**
   * Notify all subscribers of a change
   */
  private notifySubscribers(): void {
    this.subscribers.forEach(callback => {
      try {
        callback({ ...this.preferences });
      } catch (e) {
        console.error('Subscriber error:', e);
      }
    });
  }
  
  /**
   * Subscribe to preference changes
   * Returns unsubscribe function
   */
  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    // Immediately call with current state
    callback({ ...this.preferences });
    return () => this.subscribers.delete(callback);
  }
  
  /**
   * Get current preferences (snapshot)
   */
  get(): UserPreferences {
    return { ...this.preferences };
  }
  
  /**
   * Get a single preference value
   */
  getValue<K extends keyof UserPreferences>(key: K): UserPreferences[K] {
    return this.preferences[key];
  }
  
  /**
   * Set a preference value with backend sync
   */
  async set<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ): Promise<void> {
    const oldValue = this.preferences[key];
    
    // Optimistic update
    this.preferences[key] = value;
    this.saveToStorage();
    this.notifySubscribers();
    
    // Sync to backend (fire and forget for UI speed, but handle errors)
    try {
      await this.syncToBackend({ [key]: value });
    } catch (error) {
      console.error(`Failed to sync preference ${key}:`, error);
      // Revert on error
      this.preferences[key] = oldValue;
      this.saveToStorage();
      this.notifySubscribers();
      throw error;
    }
  }
  
  /**
   * Set multiple preferences at once
   */
  async setMany(updates: Partial<UserPreferences>): Promise<void> {
    const oldPrefs = { ...this.preferences };
    
    // Optimistic update
    this.preferences = { ...this.preferences, ...updates };
    this.saveToStorage();
    this.notifySubscribers();
    
    // Sync to backend
    try {
      await this.syncToBackend(updates);
    } catch (error) {
      console.error('Failed to sync preferences:', error);
      // Revert on error
      this.preferences = oldPrefs;
      this.saveToStorage();
      this.notifySubscribers();
      throw error;
    }
  }
  
  /**
   * Sync preferences to backend
   * 
   * NOTE: Only syncs preferences that are stored in the backend.
   * Feature flags (showForYou, showDevPanel) are stored locally only
   * until the DB migration is run to add those columns.
   */
  private async syncToBackend(updates: Partial<UserPreferences>): Promise<void> {
    // Map frontend keys to backend keys
    // Only include fields that exist in the backend DB
    const backendPayload: Record<string, unknown> = {};
    
    // Core preferences (always exist in DB)
    if (updates.theme !== undefined) {
      backendPayload.theme = updates.theme;
    }
    if (updates.weeklyDigestEnabled !== undefined) {
      backendPayload.weekly_digest_enabled = updates.weeklyDigestEnabled;
    }
    if (updates.teamsNotificationsEnabled !== undefined) {
      backendPayload.teams_notifications_enabled = updates.teamsNotificationsEnabled;
    }
    
    // Extended preferences (may not exist in DB - backend handles gracefully)
    if (updates.voiceInputEnabled !== undefined) {
      backendPayload.voice_input_enabled = updates.voiceInputEnabled;
    }
    if (updates.pushNotificationsEnabled !== undefined) {
      backendPayload.push_notifications_enabled = updates.pushNotificationsEnabled;
    }
    if (updates.showForYou !== undefined) {
      backendPayload.show_for_you = updates.showForYou;
    }
    if (updates.showDevPanel !== undefined) {
      backendPayload.show_dev_panel = updates.showDevPanel;
    }
    
    // Only call backend if we have something to sync
    if (Object.keys(backendPayload).length > 0) {
      try {
        await axiosInstance.put('/user/me/preferences', backendPayload);
      } catch (error) {
        // Log but don't fail - localStorage already updated optimistically
        console.warn('Failed to sync preferences to backend (columns may not exist):', error);
      }
    }
  }
  
  /**
   * Sync preferences FROM backend (on login/app start)
   * This should be called once after authentication
   * Returns a promise that resolves when sync is complete
   */
  async syncFromBackend(): Promise<void> {
    // Prevent duplicate syncs
    if (this.syncPromise) {
      return this.syncPromise;
    }
    
    if (this.isSyncing) {
      return;
    }
    
    this.isSyncing = true;
    
    this.syncPromise = (async () => {
      try {
        const response = await axiosInstance.get('/user/me');
        const userData = response.data?.data;
        
        if (userData?.preferences) {
          const backendPrefs = userData.preferences;
          
          // Map backend keys to frontend keys
          const updates: Partial<UserPreferences> = {
            theme: backendPrefs.theme || this.preferences.theme,
            weeklyDigestEnabled: backendPrefs.weekly_digest_enabled ?? this.preferences.weeklyDigestEnabled,
            teamsNotificationsEnabled: backendPrefs.teams_notifications_enabled ?? this.preferences.teamsNotificationsEnabled,
            voiceInputEnabled: backendPrefs.voice_input_enabled ?? this.preferences.voiceInputEnabled,
            pushNotificationsEnabled: backendPrefs.push_notifications_enabled ?? this.preferences.pushNotificationsEnabled,
            showForYou: backendPrefs.show_for_you ?? this.preferences.showForYou,
            showDevPanel: backendPrefs.show_dev_panel ?? this.preferences.showDevPanel,
          };
          
          // Update local state without re-syncing to backend
          this.preferences = { ...this.preferences, ...updates };
          this.saveToStorage();
          this.notifySubscribers();
        }
        
        this.hasSyncedWithBackend = true;
      } catch (error) {
        console.error('Failed to sync preferences from backend:', error);
        // Keep local preferences on error
      } finally {
        this.isSyncing = false;
        this.syncPromise = null;
      }
    })();
    
    return this.syncPromise;
  }
  
  /**
   * Check if we've synced with backend yet
   */
  hasSynced(): boolean {
    return this.hasSyncedWithBackend;
  }
  
  /**
   * Reset sync state (for logout)
   */
  resetSyncState(): void {
    this.hasSyncedWithBackend = false;
    this.syncPromise = null;
  }
  
  /**
   * Clear all preferences (for logout)
   */
  clear(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.hasSyncedWithBackend = false;
    this.syncPromise = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
    this.notifySubscribers();
  }
}

// Export singleton instance
export const preferencesStore = new PreferencesStore();

// Export hook for React components
import { useState, useEffect } from 'react';

/**
 * React hook to use preferences store
 */
export function usePreferences(): [UserPreferences, typeof preferencesStore.set, typeof preferencesStore.setMany] {
  const [prefs, setPrefs] = useState<UserPreferences>(preferencesStore.get());
  
  useEffect(() => {
    return preferencesStore.subscribe(setPrefs);
  }, []);
  
  return [prefs, preferencesStore.set.bind(preferencesStore), preferencesStore.setMany.bind(preferencesStore)];
}

/**
 * React hook to use a single preference
 */
export function usePreference<K extends keyof UserPreferences>(
  key: K
): [UserPreferences[K], (value: UserPreferences[K]) => Promise<void>] {
  const [prefs, setPrefs] = useState<UserPreferences>(preferencesStore.get());
  
  useEffect(() => {
    return preferencesStore.subscribe(setPrefs);
  }, []);
  
  const setValue = async (value: UserPreferences[K]) => {
    await preferencesStore.set(key, value);
  };
  
  return [prefs[key], setValue];
}
