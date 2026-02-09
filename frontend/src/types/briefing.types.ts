/**
 * Briefing Types for the For You AI Briefings feature
 * 
 * Feature: 010 - For You AI Briefings
 * 
 * These types match the backend Pydantic models defined in
 * backend/api/models/briefing.py
 */

/** Type of briefing generation trigger */
export type BriefingType = 'weekly_digest' | 'on_open' | 'on_demand';

/** Types of briefing sections */
export type BriefingSectionType = 'action_required' | 'awareness' | 'wins' | 'context';

/** Types of changes detected in portfolio */
export type ChangeType = 'improved' | 'declined' | 'stalled' | 'milestone' | 'new_risk' | 'blocked' | 'completed';

/** Entity types that can be referenced in briefings */
export type EntityType = 'objective' | 'keyResult' | 'initiative' | 'milestone';

/** Individual item within a briefing section */
export interface BriefingItem {
  id: string;
  /** AI-generated one-liner summary */
  summary: string;
  /** Why this matters */
  soWhat: string;
  entityType: EntityType;
  /** ID to link to drill-down */
  entityId: string;
  /** Display name of the entity */
  entityName: string;
  changeType: ChangeType;
  /** % change if applicable */
  magnitude?: number;
  /** Owner of the entity */
  owner?: string;
  /** True if current user owns this */
  isUserOwned: boolean;
}

/** A section within the briefing (e.g., action_required, wins) */
export interface BriefingSection {
  type: BriefingSectionType;
  /** Sort order (lower = higher priority) */
  priority: number;
  title: string;
  items: BriefingItem[];
}

/** Aggregate portfolio statistics for the briefing */
export interface PortfolioStats {
  totalObjectives: number;
  totalKeyResults: number;
  totalInitiatives: number;
  /** Average KR attainment 0-100 */
  avgAttainment: number;
  /** green/amber/red counts */
  healthCounts: {
    green: number;
    amber: number;
    red: number;
  };
  userOwnedInitiatives: number;
  weekOverWeekChange?: number | null;
}

/** Complete briefing response for the For You page */
export interface Briefing {
  id: string;
  userId: string;
  generatedAt: string;
  type: BriefingType;
  
  /** e.g., 'Your portfolio moved +4% this week' */
  headline: string;
  /** 2-3 sentence summary */
  narrative: string;
  sections: BriefingSection[];
  
  /** Portfolio overview */
  portfolioStats: PortfolioStats;
  
  /** Data freshness indicator */
  dataAsOf: string;
  /** AI confidence score 0-1 */
  confidence: number;
  /** True when headline or narrative is LLM-generated */
  isAiGenerated: boolean;
  /** helpful/not_helpful */
  feedbackProvided?: string | null;
}

/** Request to provide feedback on a briefing */
export interface BriefingFeedbackRequest {
  briefingId: string;
  feedback: 'helpful' | 'not_helpful';
}

/** User's briefing preferences */
export interface UserBriefingPreferences {
  lanId: string;
  weeklyDigestEnabled: boolean;
  weeklyDigestDay: 'sunday' | 'monday';
  teamsNotificationsEnabled: boolean;
  teamsNotificationFrequency: 'daily' | 'weekly' | 'none';
  briefingVerbosity: 'concise' | 'detailed';
  focusAreas: string[];
  sbuFilter: string[];
}

/** Request to update user briefing preferences */
export interface UserPreferencesUpdate {
  weeklyDigestEnabled?: boolean;
  weeklyDigestDay?: 'sunday' | 'monday';
  teamsNotificationsEnabled?: boolean;
  teamsNotificationFrequency?: 'daily' | 'weekly' | 'none';
  briefingVerbosity?: 'concise' | 'detailed';
  focusAreas?: string[];
  sbuFilter?: string[];
}

/** State for the briefing UI */
export interface BriefingState {
  briefing: Briefing | null;
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
}

/** State for user preferences UI */
export interface PreferencesState {
  preferences: UserBriefingPreferences | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}
