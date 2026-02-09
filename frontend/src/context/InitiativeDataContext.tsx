/**
 * InitiativeDataContext
 * Provides initiative data to all components via React Context
 * This ensures data is fetched ONCE at the app level, not per-component
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { fetchInitiativeData } from '../services/excelDataService';
import type { InitiativeData } from '../types';

interface InitiativeDataContextValue extends InitiativeData {
  /** Manually refresh data from the server */
  refreshData: () => Promise<void>;
}

const initialState: InitiativeData = {
  objectives: [],
  keyResults: [],
  initiatives: [],
  initiativeUpdates: [],
  milestones: [],
  loading: true,
  error: null,
};

const InitiativeDataContext = createContext<InitiativeDataContextValue | null>(null);

interface InitiativeDataProviderProps {
  children: ReactNode;
}

export function InitiativeDataProvider({ children }: InitiativeDataProviderProps) {
  const [data, setData] = useState<InitiativeData>(initialState);
  
  // Track if we're already loading to prevent duplicate calls (React 18 StrictMode fix)
  const isLoadingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const loadData = useCallback(async (force = false) => {
    // Skip if already loading or already fetched (unless forced)
    if (isLoadingRef.current || (hasFetchedRef.current && !force)) {
      return;
    }
    
    isLoadingRef.current = true;
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const result = await fetchInitiativeData();
      setData({
        ...result,
        loading: false,
        error: null,
      });
      hasFetchedRef.current = true;
    } catch (err) {
      setData({
        ...initialState,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load data',
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, []);

  // Fetch data once on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // refreshData always forces a new fetch
  const refreshData = useCallback(() => loadData(true), [loadData]);

  const contextValue: InitiativeDataContextValue = {
    ...data,
    refreshData,
  };

  return (
    <InitiativeDataContext.Provider value={contextValue}>
      {children}
    </InitiativeDataContext.Provider>
  );
}

/**
 * Hook to access initiative data from context
 * Must be used within InitiativeDataProvider
 */
export function useInitiativeData(): InitiativeDataContextValue {
  const context = useContext(InitiativeDataContext);
  
  if (!context) {
    throw new Error('useInitiativeData must be used within InitiativeDataProvider');
  }
  
  return context;
}
