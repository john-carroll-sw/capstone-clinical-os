/**
 * Briefing Service - API calls for AI-powered briefings
 * 
 * Feature: 010 - For You AI Briefings
 * 
 * Handles fetching briefings and managing user preferences.
 * Uses axiosInstance to ensure Authorization headers are attached.
 */

import { axiosInstance } from '../api/axiosInstance';
import type {
  Briefing,
  BriefingType,
  BriefingFeedbackRequest,
  UserBriefingPreferences,
  UserPreferencesUpdate,
} from '../types/briefing.types';

/**
 * Fetch a personalized briefing for the current user.
 * 
 * @param briefingType - Type of briefing to generate (default: on_open)
 * @returns Promise<Briefing> - The generated briefing
 */
export async function fetchBriefing(
  briefingType: BriefingType = 'on_open',
  options: { forceRefresh?: boolean } = {}
): Promise<Briefing> {
  const response = await axiosInstance.get<Briefing>('/briefings/summary', {
    params: {
      briefing_type: briefingType,
      force_refresh: options.forceRefresh || undefined,
    },
  });
  return response.data;
}

/**
 * Submit feedback on a briefing (helpful / not_helpful).
 * 
 * @param feedback - Feedback request with briefing ID and rating
 * @returns Promise<void>
 */
export async function submitBriefingFeedback(
  feedback: BriefingFeedbackRequest
): Promise<void> {
  await axiosInstance.post('/briefings/feedback', {
    briefingId: feedback.briefingId,
    feedback: feedback.feedback,
  });
}

/**
 * Get the current user's briefing preferences.
 * 
 * @returns Promise<UserBriefingPreferences> - Current preferences
 */
export async function fetchUserPreferences(): Promise<UserBriefingPreferences> {
  const response = await axiosInstance.get<UserBriefingPreferences>(
    '/briefings/preferences'
  );
  return response.data;
}

/**
 * Update the current user's briefing preferences.
 * 
 * @param updates - Partial preferences to update
 * @returns Promise<UserBriefingPreferences> - Updated preferences
 */
export async function updateUserPreferences(
  updates: UserPreferencesUpdate
): Promise<UserBriefingPreferences> {
  const response = await axiosInstance.put<UserBriefingPreferences>(
    '/briefings/preferences',
    updates
  );
  return response.data;
}

/**
 * Helper to check if a briefing is stale (older than 4 hours).
 * Per spec: generate on-open briefing if >4 hours since last visit
 */
export function isBriefingStale(generatedAt: string | Date): boolean {
  const generated = new Date(generatedAt);
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
  return generated < fourHoursAgo;
}

/**
 * Format a date for display in briefings.
 */
export function formatBriefingDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMins < 1) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get health status color from section type or change type.
 */
export function getBriefingItemColor(
  changeType: string
): 'success' | 'warning' | 'error' | 'info' {
  switch (changeType) {
    case 'improved':
    case 'completed':
    case 'milestone':
      return 'success';
    case 'declined':
    case 'blocked':
    case 'new_risk':
      return 'error';
    case 'stalled':
      return 'warning';
    default:
      return 'info';
  }
}
