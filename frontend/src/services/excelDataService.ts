/**
 * Initiative Data Service
 * Fetches initiative data from backend API
 * Uses axiosInstance for automatic auth token injection
 */

import type {
  InitiativeData,
} from '../types';
import { axiosInstance } from '../api/axiosInstance';

// Deleted IDs type
interface DeletedIds {
  objectives: string[];
  keyResults: string[];
  initiatives: string[];
  milestones: string[];
  initiativeUpdates: string[];
}

// Fetch initiative data from API
export async function fetchInitiativeData(): Promise<Omit<InitiativeData, 'loading' | 'error'>> {
  const response = await axiosInstance.get('/initiatives/data');
  const data = response.data;
  
  return {
    objectives: data.objectives || [],
    keyResults: data.keyResults || [],
    initiatives: data.initiatives || [],
    milestones: data.milestones || [],
    initiativeUpdates: data.initiativeUpdates || [],
  };
}

// Save initiative data to backend API
export async function saveInitiativeData(
  data: Omit<InitiativeData, 'loading' | 'error'> & { deletedIds?: DeletedIds }
): Promise<void> {
  await axiosInstance.put('/initiatives/data', {
    objectives: data.objectives,
    keyResults: data.keyResults,
    initiatives: data.initiatives,
    milestones: data.milestones,
    initiativeUpdates: data.initiativeUpdates,
    deletedIds: data.deletedIds,
  });
}
