/**
 * CENTRALIZED MOCK DATA
 * =====================
 * ALL mock data for ClinicalOS lives here.
 * When replacing with real API calls, search for imports from this file.
 * 
 * Data includes:
 * - User & Auth
 * - Portfolio & Goals
 * - Metrics & KRs
 * - AI Insights & Summaries
 * - Signals & Decisions
 * - Activity & Notifications
 * - Recommendations
 */

// ============================================
// USER & AUTH DATA
// ============================================
export interface MockUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: "Chief Executive Officer" | "Chief Operating Officer" | "Chief Financial Officer" | "Chief Technology Officer" | "VP" | "Director";
  avatar?: string;
  department: string;
  preferences: {
    theme: "light" | "dark" | "system";
    voiceEnabled: boolean;
    notificationsEnabled: boolean;
    briefingTime: string;
  };
  lastLogin: string;
}

export const CURRENT_USER: MockUser = {
  id: "user-chief-001",
  email: "demo.user@example.com",
  name: "Demo User",
  firstName: "Demo",
  lastName: "User",
  role: "Chief Executive Officer",
  department: "Executive Leadership",
  preferences: {
    theme: "dark",
    voiceEnabled: true,
    notificationsEnabled: true,
    briefingTime: "08:00",
  },
  lastLogin: new Date().toISOString(),
};

// ============================================
// PORTFOLIO SUMMARY DATA
// ============================================
export interface PortfolioSummary {
  totalGoals: number;
  totalKRs: number;
  avgAttainment: number;
  needsAttention: number;
  goalsHealth: { green: number; amber: number; red: number };
  krsHealth: { green: number; amber: number; red: number };
  weekOverWeekChange: number;
  lastUpdated: string;
  dataSource: string;
}

export const PORTFOLIO_SUMMARY: PortfolioSummary = {
  totalGoals: 6,
  totalKRs: 13,
  avgAttainment: 0.92,
  needsAttention: 1,
  goalsHealth: { green: 3, amber: 2, red: 1 },
  krsHealth: { green: 8, amber: 4, red: 1 },
  weekOverWeekChange: 2.3,
  lastUpdated: "2026-01-23T09:00:00Z",
  dataSource: "Clinical AI Program Analytics v2.4",
};

// ============================================
// STRATEGIC GOALS DATA
// ============================================
export interface Goal {
  id: string;
  name: string;
  description: string;
  icon: string;
  owner: string;
  ownerEmail: string;
  targetPeriod: string;
  healthState: "green" | "amber" | "red";
  krs: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

export interface KeyResult {
  id: string;
  name: string;
  description: string;
  current: number;
  target: number;
  baseline: number;
  unit: string;
  format: "percentage" | "currency" | "number" | "score";
  direction: "higher_is_better" | "lower_is_better";
  healthState: "green" | "amber" | "red";
  attainment: number;
  trend: "up" | "down" | "stable";
  delta: string;
  confidence: "high" | "medium" | "low";
  lastUpdated: string;
  dataSource: string;
  signals: Signal[];
}

export interface Signal {
  id: string;
  type: "blocker" | "risk" | "opportunity" | "update";
  severity: "S1" | "S2" | "S3";
  title: string;
  description: string;
  createdAt: string;
  dueDate?: string;
  owner: string;
  status: "open" | "in_progress" | "resolved";
}

export const GOALS: Goal[] = [
  {
    id: "goal-safety",
    name: "Patient Safety & Alert Quality",
    description: "Reduce alert fatigue and improve AI-assisted catch rates for high-severity clinical events",
    icon: "security",
    owner: "VP Clinical Operations",
    ownerEmail: "vpco@example.com",
    targetPeriod: "EOY 2026",
    healthState: "green",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-alert-override",
        name: "Alert Override Rate",
        description: "Percentage of AI-generated alerts overridden by clinicians (lower = better signal quality)",
        current: 18,
        target: 15,
        baseline: 32,
        unit: "%",
        format: "percentage",
        direction: "lower_is_better",
        healthState: "green",
        attainment: 0.92,
        trend: "up",
        delta: "-3pp WoW",
        confidence: "high",
        lastUpdated: "2026-01-23T08:00:00Z",
        dataSource: "Pharmacy Alert Analytics",
        signals: [],
      },
      {
        id: "kr-high-severity-catch",
        name: "High-Severity Catch Rate",
        description: "Percentage of high-severity drug interactions caught before administration",
        current: 96,
        target: 99,
        baseline: 82,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.97,
        trend: "up",
        delta: "+2pp WoW",
        confidence: "high",
        lastUpdated: "2026-01-23T08:00:00Z",
        dataSource: "Patient Safety Monitoring",
        signals: [],
      },
      {
        id: "kr-safety-incidents",
        name: "AI-Related Safety Incidents",
        description: "Number of patient safety incidents involving AI-assisted decisions (lower = better)",
        current: 2,
        target: 0,
        baseline: 8,
        unit: "incidents",
        format: "number",
        direction: "lower_is_better",
        healthState: "amber",
        attainment: 0.75,
        trend: "up",
        delta: "-1 WoW",
        confidence: "high",
        lastUpdated: "2026-01-22T12:00:00Z",
        dataSource: "Safety Incident Tracker",
        signals: [],
      },
    ],
  },
  {
    id: "goal-outcomes",
    name: "Clinical Outcomes",
    description: "Improve measurable patient outcomes through AI-assisted clinical decision support",
    icon: "assessment",
    owner: "Chief Medical Officer",
    ownerEmail: "cmo@example.com",
    targetPeriod: "EOY 2026",
    healthState: "red",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-handoff-accuracy",
        name: "Handoff Accuracy Score",
        description: "SBAR completeness score for AI-generated nursing handoff summaries",
        current: 88,
        target: 95,
        baseline: 71,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "red",
        attainment: 0.83,
        trend: "up",
        delta: "+3pp WoW",
        confidence: "high",
        lastUpdated: "2026-01-18T12:00:00Z",
        dataSource: "Nursing Quality Dashboard",
        signals: [
          {
            id: "sig-1",
            type: "blocker",
            severity: "S1",
            title: "EHR integration data gap",
            description: "SBAR generator missing medication reconciliation data from transfers — blocking accuracy improvement",
            createdAt: "2026-01-14T10:00:00Z",
            dueDate: "2026-01-24T17:00:00Z",
            owner: "Nursing Informatics",
            status: "open",
          },
        ],
      },
    ],
  },
  {
    id: "goal-adoption",
    name: "Clinician Adoption & Engagement",
    description: "Drive clinician adoption and satisfaction with AI-assisted tools across departments",
    icon: "trend_up",
    owner: "VP Clinical Informatics",
    ownerEmail: "vpci@example.com",
    targetPeriod: "EOY 2026",
    healthState: "green",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-clinician-adoption",
        name: "Clinician Adoption Rate",
        description: "Percentage of eligible clinicians actively using AI tools weekly",
        current: 87,
        target: 90,
        baseline: 52,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.97,
        trend: "up",
        delta: "+3pp WoW",
        confidence: "high",
        lastUpdated: "2026-01-23T06:00:00Z",
        dataSource: "Usage Analytics Platform",
        signals: [],
      },
      {
        id: "kr-clinician-nps",
        name: "Clinician Satisfaction (NPS)",
        description: "Net Promoter Score from clinicians using AI tools",
        current: 42,
        target: 50,
        baseline: 18,
        unit: "points",
        format: "score",
        direction: "higher_is_better",
        healthState: "amber",
        attainment: 0.84,
        trend: "up",
        delta: "+5 WoW",
        confidence: "medium",
        lastUpdated: "2026-01-20T12:00:00Z",
        dataSource: "Clinician Survey Platform",
        signals: [],
      },
    ],
  },
  {
    id: "goal-efficiency",
    name: "Operational Efficiency & ROI",
    description: "Demonstrate measurable time and cost savings from clinical AI deployment",
    icon: "money",
    owner: "Chief Financial Officer",
    ownerEmail: "cfo@example.com",
    targetPeriod: "EOY 2026",
    healthState: "amber",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-time-saved",
        name: "Clinician Time Saved",
        description: "Average minutes saved per clinician per shift through AI-assisted workflows",
        current: 22,
        target: 30,
        baseline: 0,
        unit: "min",
        format: "number",
        direction: "higher_is_better",
        healthState: "amber",
        attainment: 0.73,
        trend: "up",
        delta: "+4 min WoW",
        confidence: "high",
        lastUpdated: "2026-01-19T17:00:00Z",
        dataSource: "Workflow Analytics Engine",
        signals: [],
      },
      {
        id: "kr-cost-avoidance",
        name: "Cost Avoidance from AI Catches",
        description: "Estimated costs avoided through AI-flagged safety events and optimized workflows",
        current: 2800000,
        target: 4000000,
        baseline: 0,
        unit: "$",
        format: "currency",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.70,
        trend: "up",
        delta: "+$400K WoW",
        confidence: "medium",
        lastUpdated: "2026-01-19T17:00:00Z",
        dataSource: "Financial Impact Model",
        signals: [],
      },
      {
        id: "kr-review-time",
        name: "Avg. Review Time per Order",
        description: "Average time pharmacists spend reviewing medication orders with AI assistance",
        current: 42,
        target: 35,
        baseline: 65,
        unit: "sec",
        format: "number",
        direction: "lower_is_better",
        healthState: "amber",
        attainment: 0.77,
        trend: "up",
        delta: "-5 sec WoW",
        confidence: "high",
        lastUpdated: "2026-01-19T17:00:00Z",
        dataSource: "Pharmacy Workflow Analytics",
        signals: [],
      },
    ],
  },
  {
    id: "goal-compliance",
    name: "Regulatory Compliance & Governance",
    description: "Ensure all clinical AI use cases meet HIPAA, FDA, and institutional compliance standards",
    icon: "security",
    owner: "Chief Information Security Officer",
    ownerEmail: "ciso@example.com",
    targetPeriod: "EOY 2026",
    healthState: "green",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-audit-score",
        name: "Compliance Audit Score",
        description: "Average compliance audit score across all active AI use cases",
        current: 94,
        target: 98,
        baseline: 78,
        unit: "pts",
        format: "score",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.96,
        trend: "up",
        delta: "+2 WoW",
        confidence: "high",
        lastUpdated: "2026-01-22T12:00:00Z",
        dataSource: "Governance Audit Platform",
        signals: [],
      },
      {
        id: "kr-risk-actions",
        name: "Risk Mitigations Completed",
        description: "Percentage of identified AI risk mitigation actions implemented",
        current: 52,
        target: 70,
        baseline: 40,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "amber",
        attainment: 0.74,
        trend: "down",
        delta: "-2pp WoW",
        confidence: "medium",
        lastUpdated: "2026-01-21T12:00:00Z",
        dataSource: "Risk Management Platform",
        signals: [
          {
            id: "sig-2",
            type: "risk",
            severity: "S2",
            title: "Resource constraint on risk remediation",
            description: "Governance team bandwidth limiting pace of AI risk action implementation",
            createdAt: "2026-01-18T14:00:00Z",
            owner: "Governance Team Lead",
            status: "in_progress",
          },
        ],
      },
    ],
  },
  {
    id: "goal-expansion",
    name: "Program Growth & Readiness",
    description: "Expand clinical AI program to new departments and build organizational AI readiness",
    icon: "goal",
    owner: "VP Clinical Informatics",
    ownerEmail: "vpci@example.com",
    targetPeriod: "EOY 2026",
    healthState: "green",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-departments-live",
        name: "Departments with AI Live",
        description: "Number of clinical departments with at least one active AI use case",
        current: 4,
        target: 6,
        baseline: 2,
        unit: "depts",
        format: "number",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.67,
        trend: "up",
        delta: "+1 WoW",
        confidence: "high",
        lastUpdated: "2026-01-20T12:00:00Z",
        dataSource: "Program Management Office",
        signals: [],
      },
      {
        id: "kr-use-cases",
        name: "Active Use Cases",
        description: "Number of AI use cases in production across all departments",
        current: 12,
        target: 15,
        baseline: 6,
        unit: "use cases",
        format: "number",
        direction: "higher_is_better",
        healthState: "amber",
        attainment: 0.80,
        trend: "up",
        delta: "+1 WoW",
        confidence: "high",
        lastUpdated: "2026-01-22T12:00:00Z",
        dataSource: "Use Case Registry",
        signals: [],
      },
    ],
  },
];

// ============================================
// AI INSIGHTS & SUMMARIES
// ============================================
export interface AIInsight {
  id: string;
  type: "summary" | "trend" | "anomaly" | "recommendation" | "prediction";
  title: string;
  summary: string;
  soWhat: string; // The "so what" insight
  impact: "high" | "medium" | "low";
  trend: "positive" | "negative" | "neutral";
  relevanceScore: number; // 0-100
  relatedGoals: string[];
  relatedKRs: string[];
  sources: AISource[];
  tags: string[];
  suggestedTags: string[];
  generatedAt: string;
  expiresAt: string;
}

export interface AISource {
  id: string;
  name: string;
  type: "database" | "report" | "survey" | "api" | "model";
  confidence: number;
  lastUpdated: string;
  url?: string;
}

export const AI_INSIGHTS: AIInsight[] = [
  {
    id: "insight-1",
    type: "summary",
    title: "Clinical AI Program Performance",
    summary: "The clinical AI program is tracking at 92% overall attainment with 8 of 13 KRs on track. Alert quality improved +2.3% this week across both pharmacy and nursing.",
    soWhat: "You're on pace to hit 5 of 6 program goals. Focus attention on Clinical Outcomes — handoff accuracy is the only area at risk.",
    impact: "high",
    trend: "positive",
    relevanceScore: 98,
    relatedGoals: ["goal-safety", "goal-outcomes", "goal-adoption"],
    relatedKRs: ["kr-alert-override", "kr-handoff-accuracy", "kr-clinician-adoption"],
    sources: [
      { id: "src-1", name: "Clinical AI Program Analytics", type: "database", confidence: 0.95, lastUpdated: "2026-01-23T09:00:00Z" },
      { id: "src-2", name: "KR Status Calculator", type: "model", confidence: 0.92, lastUpdated: "2026-01-23T09:00:00Z" },
    ],
    tags: ["program-health", "weekly-review", "executive-summary"],
    suggestedTags: ["q1-2026", "clinical-ai"],
    generatedAt: "2026-01-23T09:05:00Z",
    expiresAt: "2026-01-24T09:05:00Z",
  },
  {
    id: "insight-2",
    type: "trend",
    title: "Alert Fatigue Reduction Accelerating",
    summary: "Alert override rate dropped to 18% (from 24% last month). This is the fastest improvement since the AI prioritization model went live.",
    soWhat: "Pharmacists are trusting AI recommendations more. At this pace, you'll hit the 15% target 2 weeks ahead of schedule. Consider publishing these results to build support for the ED expansion.",
    impact: "high",
    trend: "positive",
    relevanceScore: 92,
    relatedGoals: ["goal-safety"],
    relatedKRs: ["kr-alert-override"],
    sources: [
      { id: "src-3", name: "Pharmacy Alert Analytics", type: "database", confidence: 0.94, lastUpdated: "2026-01-23T08:00:00Z" },
    ],
    tags: ["alert-fatigue", "pharmacy", "trending-improvement"],
    suggestedTags: ["accelerating", "publish-results"],
    generatedAt: "2026-01-23T09:10:00Z",
    expiresAt: "2026-01-24T09:10:00Z",
  },
  {
    id: "insight-3",
    type: "anomaly",
    title: "Nursing Handoff Accuracy Below Target",
    summary: "SBAR completeness score at 88% vs 95% target. Improvement has slowed since the EHR data gap was identified.",
    soWhat: "Handoff quality directly impacts patient safety and nurse satisfaction. The EHR integration blocker must be resolved before the ICU expansion can proceed.",
    impact: "high",
    trend: "negative",
    relevanceScore: 95,
    relatedGoals: ["goal-outcomes"],
    relatedKRs: ["kr-handoff-accuracy"],
    sources: [
      { id: "src-4", name: "Nursing Quality Dashboard", type: "database", confidence: 0.91, lastUpdated: "2026-01-18T12:00:00Z" },
      { id: "src-5", name: "SBAR Scoring Model", type: "model", confidence: 0.89, lastUpdated: "2026-01-15T12:00:00Z" },
    ],
    tags: ["nursing", "handoff", "at-risk", "needs-attention"],
    suggestedTags: ["ehr-integration", "icu-expansion-blocker"],
    generatedAt: "2026-01-23T09:15:00Z",
    expiresAt: "2026-01-24T09:15:00Z",
  },
  {
    id: "insight-4",
    type: "prediction",
    title: "Cost Avoidance Forecast",
    summary: "AI-assisted safety catches are projected to avoid $4.2M in costs by EOY, exceeding the $4M target by 5%.",
    soWhat: "Strong ROI story to present to the board. Consider requesting incremental funding for 3 additional use cases in the Q2 budget cycle.",
    impact: "medium",
    trend: "positive",
    relevanceScore: 85,
    relatedGoals: ["goal-efficiency", "goal-expansion"],
    relatedKRs: ["kr-cost-avoidance", "kr-use-cases"],
    sources: [
      { id: "src-6", name: "Financial Impact Model", type: "model", confidence: 0.82, lastUpdated: "2026-01-19T17:00:00Z" },
      { id: "src-7", name: "Safety Event Analytics", type: "database", confidence: 0.94, lastUpdated: "2026-01-23T06:00:00Z" },
    ],
    tags: ["roi", "cost-avoidance", "forecast", "positive-outlook"],
    suggestedTags: ["board-ready", "q2-budget"],
    generatedAt: "2026-01-23T09:20:00Z",
    expiresAt: "2026-01-30T09:20:00Z",
  },
  {
    id: "insight-5",
    type: "recommendation",
    title: "Drug Interaction Checker v2 Needs Tuning",
    summary: "False-positive rate at 8.2% (target ≤5%). Governance review is Thursday — this model is the top contributor to remaining alert fatigue.",
    soWhat: "Reducing false positives by 3pp would save an estimated 8 minutes per pharmacist per shift. Prioritize model retraining before the quarterly compliance review.",
    impact: "medium",
    trend: "neutral",
    relevanceScore: 78,
    relatedGoals: ["goal-safety", "goal-compliance"],
    relatedKRs: ["kr-alert-override"],
    sources: [
      { id: "src-8", name: "Model Performance Dashboard", type: "database", confidence: 0.88, lastUpdated: "2026-01-22T12:00:00Z" },
    ],
    tags: ["model-tuning", "false-positives", "recommendation"],
    suggestedTags: ["quick-win", "governance-review"],
    generatedAt: "2026-01-23T09:25:00Z",
    expiresAt: "2026-01-26T09:25:00Z",
  },
];

// ============================================
// RECOMMENDATIONS
// ============================================
export interface Recommendation {
  id: string;
  priority: "urgent" | "high" | "medium" | "low";
  title: string;
  description: string;
  rationale: string;
  estimatedImpact: string;
  effort: "low" | "medium" | "high";
  relatedGoals: string[];
  suggestedAction: string;
  deadline?: string;
  owner?: string;
  status: "new" | "viewed" | "accepted" | "dismissed";
  createdAt: string;
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "rec-1",
    priority: "urgent",
    title: "Resolve EHR Integration Data Gap",
    description: "S1 blocker on nursing handoff accuracy has been open for 9 days — blocking SBAR completeness improvement",
    rationale: "Handoff accuracy is the only Red KR in the program. Each day of delay impacts patient safety metrics and the ICU expansion timeline.",
    estimatedImpact: "Unblocks handoff accuracy improvement from 88% toward 95% target",
    effort: "low",
    relatedGoals: ["goal-outcomes"],
    suggestedAction: "Schedule 15-min integration review with Nursing Informatics and EHR team",
    deadline: "2026-01-24T17:00:00Z",
    owner: "Nursing Informatics",
    status: "new",
    createdAt: "2026-01-23T08:00:00Z",
  },
  {
    id: "rec-2",
    priority: "urgent",
    title: "Review Drug Interaction Checker v2 Model",
    description: "False-positive rate at 8.2% — governance review Thursday. Model retraining recommended before quarterly audit.",
    rationale: "Highest-impact contributor to remaining alert fatigue. Reducing FP rate saves clinician time and boosts trust.",
    estimatedImpact: "Estimated 8 min saved per pharmacist per shift; improved compliance score",
    effort: "medium",
    relatedGoals: ["goal-safety", "goal-compliance"],
    suggestedAction: "Attend governance review Thursday and approve model retraining sprint",
    deadline: "2026-01-26T17:00:00Z",
    owner: "Pharmacy AI Lead",
    status: "new",
    createdAt: "2026-01-23T08:00:00Z",
  },
  {
    id: "rec-3",
    priority: "high",
    title: "Schedule Clinical Outcomes Deep-Dive",
    description: "Only program goal showing Red health status — handoff accuracy needs intervention",
    rationale: "Understanding root causes essential for course correction. ICU expansion contingent on improved handoff quality.",
    estimatedImpact: "Early intervention could recover 60% of gap to 95% target",
    effort: "medium",
    relatedGoals: ["goal-outcomes"],
    suggestedAction: "Block 60 minutes with Nursing Informatics and quality team",
    owner: "VP Clinical Operations",
    status: "new",
    createdAt: "2026-01-23T08:00:00Z",
  },
  {
    id: "rec-4",
    priority: "medium",
    title: "Highlight Alert Fatigue Reduction Results",
    description: "Pharmacy alert override rate dropped from 32% to 18% — strongest momentum in the program",
    rationale: "Sharing wins builds organizational support for AI expansion. This is the most compelling ROI story right now.",
    estimatedImpact: "Increased stakeholder buy-in for ED and ICU expansion proposals",
    effort: "low",
    relatedGoals: ["goal-safety", "goal-expansion"],
    suggestedAction: "Include in next all-hands; send recognition to pharmacy AI team",
    owner: "VP Clinical Operations",
    status: "new",
    createdAt: "2026-01-23T08:00:00Z",
  },
];

// ============================================
// ACTIVITY & NOTIFICATIONS
// ============================================
export interface Activity {
  id: string;
  type: "metric_update" | "decision" | "signal" | "comment" | "status_change";
  title: string;
  description: string;
  actor: string;
  actorAvatar?: string;
  relatedEntity?: {
    type: "goal" | "kr" | "signal" | "decision";
    id: string;
    name: string;
  };
  timestamp: string;
  isRead: boolean;
}

export const RECENT_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    type: "metric_update",
    title: "Alert Override Rate Updated",
    description: "Override rate improved to 18% (-3pp from last week)",
    actor: "System",
    relatedEntity: { type: "kr", id: "kr-alert-override", name: "Alert Override Rate" },
    timestamp: "2026-01-23T08:00:00Z",
    isRead: false,
  },
  {
    id: "act-2",
    type: "status_change",
    title: "KR Status Changed",
    description: "Clinician Satisfaction moved from Red to Amber after latest survey results",
    actor: "System",
    relatedEntity: { type: "kr", id: "kr-clinician-nps", name: "Clinician Satisfaction (NPS)" },
    timestamp: "2026-01-23T07:45:00Z",
    isRead: false,
  },
  {
    id: "act-3",
    type: "signal",
    title: "New S1 Signal",
    description: "EHR integration data gap blocking nursing handoff accuracy improvement",
    actor: "Risk Monitor",
    relatedEntity: { type: "signal", id: "sig-1", name: "EHR integration data gap" },
    timestamp: "2026-01-22T14:30:00Z",
    isRead: true,
  },
  {
    id: "act-4",
    type: "comment",
    title: "Nursing Lead Commented",
    description: "Nursing Informatics lead commented on ICU expansion readiness",
    actor: "Nursing Informatics",
    relatedEntity: { type: "kr", id: "kr-handoff-accuracy", name: "Handoff Accuracy Score" },
    timestamp: "2026-01-22T11:15:00Z",
    isRead: true,
  },
  {
    id: "act-5",
    type: "decision",
    title: "Decision Logged",
    description: "Approved Drug Interaction Checker v2 governance review for Thursday",
    actor: "VP Clinical Operations",
    relatedEntity: { type: "decision", id: "dec-1", name: "ICU AI Expansion" },
    timestamp: "2026-01-21T16:00:00Z",
    isRead: true,
  },
];

// ============================================
// DECISIONS LOG
// ============================================
export interface Decision {
  id: string;
  title: string;
  description: string;
  type: "scale" | "pivot" | "invest" | "divest" | "unblock" | "defer";
  status: "open" | "approved" | "rejected" | "deferred";
  decidedBy?: string;
  decidedAt?: string;
  relatedGoals: string[];
  relatedKRs: string[];
  context: string;
  options: { label: string; description: string }[];
  selectedOption?: string;
  rationale?: string;
  createdAt: string;
  createdBy: string;
}

export const DECISIONS: Decision[] = [
  {
    id: "dec-1",
    title: "Expand AI Handoff Generator to ICU",
    description: "Decide whether to expand the nursing SBAR handoff generator from Med/Surg to the ICU",
    type: "scale",
    status: "open",
    relatedGoals: ["goal-outcomes", "goal-expansion"],
    relatedKRs: ["kr-handoff-accuracy"],
    context: "Med/Surg pilot showing 88% SBAR completeness (up from 71% baseline). ICU has more complex patients but higher handoff error rates. Integration testing completed. Investment: $180K for ICU customization.",
    options: [
      { label: "Expand Now", description: "Deploy to ICU this quarter" },
      { label: "Wait for 95%", description: "Reach Med/Surg accuracy target first" },
      { label: "Defer", description: "Prioritize fixing EHR data gap instead" },
    ],
    createdAt: "2026-01-20T10:00:00Z",
    createdBy: "VP Clinical Operations",
  },
  {
    id: "dec-2",
    title: "Unblock EHR Medication Reconciliation Feed",
    description: "Expedited approval for transfer medication reconciliation data needed for SBAR accuracy",
    type: "unblock",
    status: "open",
    relatedGoals: ["goal-outcomes"],
    relatedKRs: ["kr-handoff-accuracy"],
    context: "SBAR generator missing medication reconciliation data from transfers — identified 9 days ago. Security review completed, awaiting final sign-off from EHR team. Blocking handoff accuracy improvement.",
    options: [
      { label: "Approve", description: "Grant immediate data access" },
      { label: "Conditional", description: "Approve with additional PHI safeguards" },
      { label: "Escalate", description: "Escalate to CISO for expedited review" },
    ],
    createdAt: "2026-01-14T10:00:00Z",
    createdBy: "Nursing Informatics Lead",
  },
];

// ============================================
// SPRINT & TIME CONTEXT
// ============================================
export interface SprintInfo {
  name: string;
  quarter: string;
  year: number;
  startDate: string;
  endDate: string;
  weekNumber: number;
  totalWeeks: number;
  daysRemaining: number;
}

export const CURRENT_SPRINT: SprintInfo = {
  name: "Sprint 4",
  quarter: "Q1",
  year: 2026,
  startDate: "2026-01-26",
  endDate: "2026-02-08",
  weekNumber: 4,
  totalWeeks: 13,
  daysRemaining: 75,
};

// ============================================
// CHAT MESSAGES (for AI chatbot)
// ============================================
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: AISource[];
  relatedInsights?: string[];
}

export const SAMPLE_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "chat-1",
    role: "assistant",
    content: "Good morning! The clinical AI program is performing well with 92% overall attainment. Alert fatigue reduction improved +2.3% this week. Would you like me to highlight anything specific?",
    timestamp: "2026-01-23T08:00:00Z",
    sources: [
      { id: "src-1", name: "Clinical AI Program Analytics", type: "database", confidence: 0.95, lastUpdated: "2026-01-23T08:00:00Z" },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
export function getGoalById(id: string): Goal | undefined {
  return GOALS.find(g => g.id === id);
}

export function getKRById(id: string): KeyResult | undefined {
  for (const goal of GOALS) {
    const kr = goal.krs.find(k => k.id === id);
    if (kr) return kr;
  }
  return undefined;
}

export function getGoalForKR(krId: string): Goal | undefined {
  return GOALS.find(g => g.krs.some(k => k.id === krId));
}

export function getAllKRs(): KeyResult[] {
  return GOALS.flatMap(g => g.krs);
}

export function getInsightsByGoal(goalId: string): AIInsight[] {
  return AI_INSIGHTS.filter(i => i.relatedGoals.includes(goalId));
}

export function getRecommendationsByPriority(priority?: Recommendation["priority"]): Recommendation[] {
  if (!priority) return RECOMMENDATIONS;
  return RECOMMENDATIONS.filter(r => r.priority === priority);
}

export function getUnreadActivities(): Activity[] {
  return RECENT_ACTIVITIES.filter(a => !a.isRead);
}

export function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(2)}`;
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function getHealthColor(state: "green" | "amber" | "red"): string {
  const colors = {
    green: "var(--health-green)",
    amber: "var(--health-amber)",
    red: "var(--health-red)",
  };
  return colors[state];
}

// ============================================
// AI QUICK PROMPTS (for AI Chat Panel)
// ============================================
export const AI_QUICK_PROMPTS = [
  "How is the clinical AI program performing?",
  "What needs my attention?",
  "Show me top safety risks",
  "Any alert fatigue improvements?",
  "What decisions are pending?",
  "Show me adoption metrics",
  "How are nursing handoffs tracking?",
  "What are the urgent recommendations?",
];

// ============================================
// REPORTS DATA
// ============================================
export interface Report {
  id: string;
  title: string;
  description: string;
  type: "auto-generated" | "on-demand" | "scheduled";
  frequency: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "On-demand";
  lastGenerated: string;
  status: "ready" | "generating" | "scheduled";
  pages: number;
}

export const REPORTS: Report[] = [
  {
    id: "report-1",
    title: "Weekly Clinical AI Program Summary",
    description: "AI-generated overview of program performance, safety metrics, adoption rates, and items needing attention",
    type: "auto-generated",
    frequency: "Weekly",
    lastGenerated: "2026-01-23T06:00:00Z",
    status: "ready",
    pages: 3,
  },
  {
    id: "report-2",
    title: "Q1 2026 Clinical AI Progress Report",
    description: "Quarterly deep-dive into clinical AI program goals, KR attainment, and department expansion status",
    type: "auto-generated",
    frequency: "Quarterly",
    lastGenerated: "2026-01-20T09:00:00Z",
    status: "ready",
    pages: 12,
  },
  {
    id: "report-3",
    title: "Patient Safety & Alert Quality Analysis",
    description: "Focused analysis on alert fatigue reduction, catch rates, and safety incident trends",
    type: "on-demand",
    frequency: "On-demand",
    lastGenerated: "2026-01-18T14:00:00Z",
    status: "ready",
    pages: 8,
  },
  {
    id: "report-4",
    title: "Board Presentation — Clinical AI ROI",
    description: "Executive summary of clinical AI program outcomes, cost avoidance, and expansion roadmap for board review",
    type: "scheduled",
    frequency: "Monthly",
    lastGenerated: "2026-01-15T10:00:00Z",
    status: "ready",
    pages: 15,
  },
];

// ============================================
// DATA SOURCES (for Settings page)
// ============================================
export interface DataSource {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "syncing" | "error";
  lastSync: string;
  type: "database" | "api" | "survey" | "report";
}

export const DATA_SOURCES: DataSource[] = [
  { id: "ds-1", name: "Clinical AI Program Analytics", status: "connected", lastSync: "2 min ago", type: "database" },
  { id: "ds-2", name: "Clinician Survey Platform", status: "connected", lastSync: "15 min ago", type: "survey" },
  { id: "ds-3", name: "Patient Safety Monitoring", status: "connected", lastSync: "1 hour ago", type: "database" },
  { id: "ds-4", name: "Financial Impact Model", status: "connected", lastSync: "30 min ago", type: "report" },
  { id: "ds-5", name: "Governance Audit Platform", status: "connected", lastSync: "45 min ago", type: "database" },
  { id: "ds-6", name: "Pharmacy Alert Analytics", status: "connected", lastSync: "15 min ago", type: "database" },
  { id: "ds-7", name: "Usage Analytics Platform", status: "connected", lastSync: "10 min ago", type: "api" },
];

// ============================================
// ALERTS SUMMARY (for Notifications Popover)
// ============================================
export interface AlertSummary {
  s1Count: number;
  s2Count: number;
  s3Count: number;
  totalUnread: number;
  topAlerts: {
    id: string;
    severity: "S1" | "S2" | "S3";
    title: string;
    timeAgo: string;
    goalIcon: string;
  }[];
}

export function getAlertSummary(): AlertSummary {
  const allSignals = GOALS.flatMap((goal) =>
    goal.krs.flatMap((kr) =>
      kr.signals.map((signal) => ({
        ...signal,
        goalIcon: goal.icon,
      }))
    )
  );

  const s1Signals = allSignals.filter((s) => s.severity === "S1");
  const s2Signals = allSignals.filter((s) => s.severity === "S2");
  const s3Signals = allSignals.filter((s) => s.severity === "S3");
  
  const unreadActivities = RECENT_ACTIVITIES.filter((a) => !a.isRead);

  // Get top 3 most recent/urgent alerts
  const topAlerts = [...s1Signals, ...s2Signals, ...s3Signals]
    .slice(0, 3)
    .map((signal) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(signal.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        id: signal.id,
        severity: signal.severity as "S1" | "S2" | "S3",
        title: signal.title,
        timeAgo: daysSince === 0 ? "Today" : `${daysSince}d ago`,
        goalIcon: signal.goalIcon,
      };
    });

  return {
    s1Count: s1Signals.length,
    s2Count: s2Signals.length,
    s3Count: s3Signals.length,
    totalUnread: unreadActivities.length + allSignals.filter((s) => s.status === "open").length,
    topAlerts,
  };
}

// ============================================
// DATA TIMESTAMPS
// ============================================
export const DATA_FRESHNESS = {
  portfolioSummary: "2026-01-23T09:00:00Z",
  goals: "2026-01-23T08:00:00Z",
  aiInsights: "2026-01-23T09:25:00Z",
  recommendations: "2026-01-23T08:00:00Z",
  activities: "2026-01-23T08:00:00Z",
};

export function getDataFreshnessLabel(timestamp: string): string {
  const now = new Date();
  const dataTime = new Date(timestamp);
  const diffMinutes = Math.floor((now.getTime() - dataTime.getTime()) / 60000);
  
  if (diffMinutes < 5) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return `${Math.floor(diffMinutes / 1440)}d ago`;
}
