/**
 * Initiative Tracker Type Definitions
 * Hierarchy: Objective -> KeyResult -> Initiative -> (InitiativeUpdate, Milestone)
 */

// Initiative Tags structure from DB (JSONB)
export interface InitiativeTagValue {
  id: string;
  primary?: boolean;
}

export interface InitiativeTagCategory {
  values: InitiativeTagValue[];
  source: string;
}

export interface InitiativeTags {
  business_unit?: InitiativeTagCategory;
  capability?: InitiativeTagCategory;
  functional_area?: InitiativeTagCategory;
  _meta?: {
    version: number;
    last_updated: string;
    updated_by: string;
  };
}

export interface Objective {
  id: string;
  objectiveId: string;
  objectiveName: string;
  objectiveOwner?: string;
  objectiveCategory?: string; // "Enterprise" | "D&A Value Driver" | "Enablers"
  targetCompletionDate?: number | string;
  laddersToObjectiveId?: string; // null/empty = top-level, otherwise = child laddering to parent
  laddersToObjectiveName?: string; // Display name of parent objective
  [key: string]: unknown;
}

export interface KeyResult {
  id: string;
  keyResultId: string;
  keyResultName?: string;
  objectiveId: string;
  parentObjective?: string;
  // Metric fields for KR detail view
  target?: number | string;
  current?: number | string;
  attainment?: number;
  trend?: string; // e.g., "+4 WoW"
  status?: 'green' | 'amber' | 'red' | string;
  analysis?: string;
  [key: string]: unknown;
}

export interface Initiative {
  id: string;
  initiativeId: string;
  keyResultId: string;
  initiativeName: string;
  initiativeDescription?: string;
  initiativeOwner?: string;
  primaryTeam?: string;
  priority?: string;
  startDate?: string | number;
  endDate?: string | number;
  status?: string;
  // KR Detail view fields
  confidence?: number; // 1-5 score
  latestUpdate?: string; // Brief snippet of most recent update
  isBlocked?: boolean;
  // SBU tagging from DB
  initiativeTags?: InitiativeTags;
  [key: string]: unknown;
}

export interface InitiativeUpdate {
  id: string;
  updateId?: string;
  initiativeId: string;
  initiativeName?: string;
  updateDate?: string;
  updateSummary?: string;
  updateDetails?: string;
  progress?: string;
  blockers?: string;
  recommendation?: string;
  updateCreatedBy?: string;
  [key: string]: unknown;
}

export interface Milestone {
  id: string;
  milestoneId?: string;
  initiativeId: string;
  milestoneName: string;
  milestoneType?: string;
  status?: string;
  originalDueDate?: string | number;
  completedDate?: string | number;
  [key: string]: unknown;
}

// Data store type
export interface InitiativeData {
  objectives: Objective[];
  keyResults: KeyResult[];
  initiatives: Initiative[];
  initiativeUpdates: InitiativeUpdate[];
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
}
