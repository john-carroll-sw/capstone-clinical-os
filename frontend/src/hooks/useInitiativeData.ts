/**
 * useInitiativeData Hook
 * Fetches and provides initiative data from the Excel file
 */

import { useState, useEffect } from 'react';
import { fetchInitiativeData } from '../services/excelDataService';
import type { InitiativeData } from '../types';

const initialState: InitiativeData = {
  objectives: [],
  keyResults: [],
  initiatives: [],
  initiativeUpdates: [],
  milestones: [],
  loading: true,
  error: null,
};

export function useInitiativeData(): InitiativeData {
  const [data, setData] = useState<InitiativeData>(initialState);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        // Add cache-busting query param to force fresh fetch
        const result = await fetchInitiativeData();
        const newData: InitiativeData = {
          ...result,
          loading: false,
          error: null,
        };
        
        if (mounted) {
          setData(newData);
        }
      } catch (err) {
        if (mounted) {
          setData({
            ...initialState,
            loading: false,
            error: err instanceof Error ? err.message : 'Failed to load data',
          });
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  return data;
}
