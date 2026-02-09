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
 * Mock briefing data for demo/capstone mode when the backend is unavailable.
 */
const MOCK_BRIEFING: Briefing = {
  id: 'mock-briefing-001',
  userId: 'demo-user',
  generatedAt: new Date().toISOString(),
  type: 'on_open',
  headline: 'Clinical AI program on track — alert fatigue down 14pp, handoff accuracy needs attention',
  narrative: 'The program is at 92% overall attainment with strong momentum in patient safety. Alert override rates dropped to 18%, the best reading since the AI prioritization model launched. Clinician adoption rose to 87%. However, nursing handoff accuracy (88%) is still below the 95% target due to the EHR integration data gap. The governance review for Drug Interaction Checker v2 is Thursday — false-positive rates need to come down before the quarterly audit.',
  sections: [
    {
      type: 'wins',
      priority: 1,
      title: 'Wins This Week',
      items: [
        {
          id: 'win-1',
          summary: 'Alert override rate dropped to 18%',
          soWhat: 'Pharmacists are trusting AI recommendations more — this is the fastest improvement since launch.',
          entityType: 'keyResult',
          entityId: 'kr-alert-override',
          entityName: 'Alert Override Rate',
          changeType: 'improved',
          magnitude: 14,
          owner: 'Pharmacy AI Lead',
          isUserOwned: false,
        },
        {
          id: 'win-2',
          summary: 'Clinician adoption hit 87%',
          soWhat: 'On pace to reach 90% target 2 weeks early. Strong signal that tools are adding value.',
          entityType: 'keyResult',
          entityId: 'kr-clinician-adoption',
          entityName: 'Clinician Adoption Rate',
          changeType: 'improved',
          magnitude: 3,
          owner: 'VP Clinical Informatics',
          isUserOwned: true,
        },
        {
          id: 'win-3',
          summary: '14 high-severity interactions caught before administration',
          soWhat: 'Catch rate at 96% — 3 more catches than last month.',
          entityType: 'keyResult',
          entityId: 'kr-high-severity-catch',
          entityName: 'High-Severity Catch Rate',
          changeType: 'improved',
          magnitude: 2,
          owner: 'Patient Safety Officer',
          isUserOwned: false,
        },
      ],
    },
    {
      type: 'action_required',
      priority: 2,
      title: 'Needs Your Attention',
      items: [
        {
          id: 'action-1',
          summary: 'Nursing handoff accuracy at 88% vs 95% target',
          soWhat: 'EHR integration data gap is blocking improvement. ICU expansion contingent on resolving this.',
          entityType: 'keyResult',
          entityId: 'kr-handoff-accuracy',
          entityName: 'Handoff Accuracy Score',
          changeType: 'stalled',
          magnitude: -7,
          owner: 'Nursing Informatics',
          isUserOwned: false,
        },
        {
          id: 'action-2',
          summary: 'Drug Interaction Checker v2 false-positive rate at 8.2%',
          soWhat: 'Governance review Thursday. Model retraining needed before quarterly compliance audit.',
          entityType: 'initiative',
          entityId: 'uc-dic-v2',
          entityName: 'Drug Interaction Checker v2',
          changeType: 'new_risk',
          magnitude: 8,
          owner: 'Pharmacy AI Lead',
          isUserOwned: false,
        },
      ],
    },
    {
      type: 'awareness',
      priority: 3,
      title: 'On Your Radar',
      items: [
        {
          id: 'aware-1',
          summary: '3 use cases need risk assessment updates before Friday audit',
          soWhat: 'Quick follow-up with owners today can prevent compliance gaps.',
          entityType: 'initiative',
          entityId: 'audit-q1',
          entityName: 'Q1 Compliance Audit',
          changeType: 'new_risk',
          owner: 'Governance Team',
          isUserOwned: false,
        },
      ],
    },
    {
      type: 'context',
      priority: 4,
      title: 'Your Program Areas',
      items: [
        {
          id: 'ctx-1',
          summary: 'Patient Safety & Alert Quality: 92% attainment',
          soWhat: 'Alert fatigue reduction is the program\'s strongest story. Consider sharing results at all-hands.',
          entityType: 'objective',
          entityId: 'goal-safety',
          entityName: 'Patient Safety & Alert Quality',
          changeType: 'improved',
          magnitude: 92,
          owner: 'VP Clinical Operations',
          isUserOwned: true,
        },
        {
          id: 'ctx-2',
          summary: 'Clinical Outcomes: 83% attainment (at risk)',
          soWhat: 'Only program area in Red. Handoff accuracy is the primary driver — unblocking EHR integration is critical.',
          entityType: 'objective',
          entityId: 'goal-outcomes',
          entityName: 'Clinical Outcomes',
          changeType: 'stalled',
          magnitude: 83,
          owner: 'Chief Medical Officer',
          isUserOwned: false,
        },
      ],
    },
  ],
  portfolioStats: {
    totalObjectives: 6,
    totalKeyResults: 13,
    totalInitiatives: 12,
    avgAttainment: 92,
    healthCounts: { green: 8, amber: 4, red: 1 },
    userOwnedInitiatives: 3,
    weekOverWeekChange: 2.3,
  },
  dataAsOf: new Date().toISOString(),
  confidence: 0.94,
  isAiGenerated: true,
  feedbackProvided: null,
};

/**
 * Fetch a personalized briefing for the current user.
 * Falls back to mock data when the backend API is unavailable (demo mode).
 * 
 * @param briefingType - Type of briefing to generate (default: on_open)
 * @returns Promise<Briefing> - The generated briefing
 */
export async function fetchBriefing(
  briefingType: BriefingType = 'on_open',
  options: { forceRefresh?: boolean } = {}
): Promise<Briefing> {
  try {
    const response = await axiosInstance.get<Briefing>('/briefings/summary', {
      params: {
        briefing_type: briefingType,
        force_refresh: options.forceRefresh || undefined,
      },
    });
    return response.data;
  } catch {
    // Demo/capstone mode: return mock briefing when API is unavailable
    console.info('Briefing API unavailable — using mock data for demo');
    return { ...MOCK_BRIEFING, generatedAt: new Date().toISOString(), dataAsOf: new Date().toISOString() };
  }
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
