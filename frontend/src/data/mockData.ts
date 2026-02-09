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
  dataSource: "Portfolio Analytics Engine v2.4",
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
    id: "goal-cx",
    name: "Customer Experience Excellence",
    description: "Deliver exceptional member and provider experiences through digital innovation and responsive service",
    icon: "goal",
    owner: "Chief Experience Officer",
    ownerEmail: "cxo@example.com",
    targetPeriod: "EOY 2026",
    healthState: "green",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-nps",
        name: "Customer NPS",
        description: "Net Promoter Score measuring customer loyalty and satisfaction",
        current: 58,
        target: 60,
        baseline: 45,
        unit: "points",
        format: "score",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.97,
        trend: "up",
        delta: "+4 WoW",
        confidence: "high",
        lastUpdated: "2026-01-23T08:00:00Z",
        dataSource: "NPS Survey Platform (Medallia)",
        signals: [],
      },
      {
        id: "kr-resolution",
        name: "Digital Issue Resolution Rate",
        description: "Percentage of customer issues resolved through digital channels without human intervention",
        current: 50,
        target: 80,
        baseline: 35,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "amber",
        attainment: 0.63,
        trend: "up",
        delta: "+4pp WoW",
        confidence: "high",
        lastUpdated: "2026-01-23T08:00:00Z",
        dataSource: "Service Analytics Platform",
        signals: [],
      },
      {
        id: "kr-trust",
        name: "Transparency Trust Score",
        description: "Member trust score based on pricing and benefits transparency",
        current: 77,
        target: 80,
        baseline: 65,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.96,
        trend: "up",
        delta: "+3pp WoW",
        confidence: "medium",
        lastUpdated: "2026-01-20T12:00:00Z",
        dataSource: "Trust Survey Platform",
        signals: [],
      },
    ],
  },
  {
    id: "goal-clinical",
    name: "Clinical Excellence",
    description: "Improve health outcomes through evidence-based care and proactive health management",
    icon: "assessment",
    owner: "Chief Medical Officer",
    ownerEmail: "cmo@example.com",
    targetPeriod: "EOY 2026",
    healthState: "red",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-tcc",
        name: "Risk-adjusted TCC PMPM",
        description: "Total cost of care per member per month, adjusted for risk",
        current: 348.50,
        target: 345.00,
        baseline: 365.00,
        unit: "$",
        format: "currency",
        direction: "lower_is_better",
        healthState: "red",
        attainment: 0.83,
        trend: "up",
        delta: "-$3.70 WoW",
        confidence: "high",
        lastUpdated: "2026-01-18T12:00:00Z",
        dataSource: "Clinical Data Warehouse",
        signals: [
          {
            id: "sig-1",
            type: "blocker",
            severity: "S1",
            title: "Data feed approval pending",
            description: "Trend variance analysis blocked on data feed approval from IT",
            createdAt: "2026-01-14T10:00:00Z",
            dueDate: "2026-01-24T17:00:00Z",
            owner: "IT Data Team",
            status: "open",
          },
        ],
      },
    ],
  },
  {
    id: "goal-growth",
    name: "Growth & Market Expansion",
    description: "Accelerate sustainable growth through market expansion and product innovation",
    icon: "trend_up",
    owner: "Chief Growth Officer",
    ownerEmail: "cgo@example.com",
    targetPeriod: "EOY 2026",
    healthState: "green",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-ai-mau",
        name: "AI Product MAU",
        description: "Monthly active users of AI-powered products and features",
        current: 7200,
        target: 7500,
        baseline: 4500,
        unit: "users",
        format: "number",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.96,
        trend: "up",
        delta: "+5.9% WoW",
        confidence: "high",
        lastUpdated: "2026-01-23T06:00:00Z",
        dataSource: "Product Analytics (Amplitude)",
        signals: [],
      },
      {
        id: "kr-market-share",
        name: "Medicare Market Share",
        description: "Market share in Medicare Advantage segment",
        current: 12.4,
        target: 14.0,
        baseline: 11.0,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "amber",
        attainment: 0.89,
        trend: "up",
        delta: "+0.3pp WoW",
        confidence: "medium",
        lastUpdated: "2026-01-20T12:00:00Z",
        dataSource: "CMS Market Data",
        signals: [],
      },
    ],
  },
  {
    id: "goal-financial",
    name: "Financial Performance",
    description: "Drive sustainable financial growth and operational efficiency",
    icon: "money",
    owner: "Chief Financial Officer",
    ownerEmail: "cfo@example.com",
    targetPeriod: "EOY 2026",
    healthState: "amber",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-ai-revenue",
        name: "Revenue from AI Products",
        description: "Revenue generated from disruptive AI-powered products",
        current: 46000000,
        target: 50000000,
        baseline: 25000000,
        unit: "$",
        format: "currency",
        direction: "higher_is_better",
        healthState: "amber",
        attainment: 0.92,
        trend: "up",
        delta: "+$4M WoW",
        confidence: "high",
        lastUpdated: "2026-01-19T17:00:00Z",
        dataSource: "Finance Revenue Attribution",
        signals: [],
      },
      {
        id: "kr-opex",
        name: "OpEx Reduction",
        description: "Operational expense reduction from efficiency initiatives",
        current: 28500000,
        target: 30000000,
        baseline: 0,
        unit: "$",
        format: "currency",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.95,
        trend: "up",
        delta: "+$2.5M WoW",
        confidence: "high",
        lastUpdated: "2026-01-19T17:00:00Z",
        dataSource: "Cost Savings Tracker",
        signals: [],
      },
      {
        id: "kr-partnership",
        name: "Data Partnership GP",
        description: "Gross profit from data partnership initiatives",
        current: 19200000,
        target: 20000000,
        baseline: 12000000,
        unit: "$",
        format: "currency",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.96,
        trend: "up",
        delta: "+$1.1M WoW",
        confidence: "high",
        lastUpdated: "2026-01-19T17:00:00Z",
        dataSource: "Partnership Finance Report",
        signals: [],
      },
    ],
  },
  {
    id: "goal-enterprise",
    name: "Enterprise Trust & Compliance",
    description: "Maintain highest standards of governance, security, and regulatory compliance",
    icon: "security",
    owner: "Chief Compliance Officer",
    ownerEmail: "cco@example.com",
    targetPeriod: "EOY 2026",
    healthState: "green",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-gold-assets",
        name: "Gold Assets Coverage",
        description: "Percentage of critical data assets meeting gold standard compliance",
        current: 96,
        target: 100,
        baseline: 82,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.96,
        trend: "up",
        delta: "+4pp WoW",
        confidence: "high",
        lastUpdated: "2026-01-22T12:00:00Z",
        dataSource: "Data Governance Platform",
        signals: [],
      },
      {
        id: "kr-risk-actions",
        name: "Risk Actions Implemented",
        description: "Percentage of identified risk mitigation actions implemented",
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
            description: "Team bandwidth limiting pace of risk action implementation",
            createdAt: "2026-01-18T14:00:00Z",
            owner: "Risk Team Lead",
            status: "in_progress",
          },
        ],
      },
    ],
  },
  {
    id: "goal-talent",
    name: "Talent & Culture",
    description: "Build world-class talent and foster an innovative, inclusive culture",
    icon: "goal",
    owner: "Chief People Officer",
    ownerEmail: "cpo@example.com",
    targetPeriod: "EOY 2026",
    healthState: "green",
    createdAt: "2025-10-01T00:00:00Z",
    updatedAt: "2026-01-23T08:00:00Z",
    krs: [
      {
        id: "kr-engagement",
        name: "Employee Engagement Score",
        description: "Overall employee engagement from pulse surveys",
        current: 78,
        target: 80,
        baseline: 72,
        unit: "points",
        format: "score",
        direction: "higher_is_better",
        healthState: "green",
        attainment: 0.98,
        trend: "up",
        delta: "+2 WoW",
        confidence: "high",
        lastUpdated: "2026-01-20T12:00:00Z",
        dataSource: "Workday Peakon",
        signals: [],
      },
      {
        id: "kr-ai-literacy",
        name: "AI Literacy Certification",
        description: "Percentage of employees completing AI literacy training",
        current: 68,
        target: 85,
        baseline: 25,
        unit: "%",
        format: "percentage",
        direction: "higher_is_better",
        healthState: "amber",
        attainment: 0.80,
        trend: "up",
        delta: "+5pp WoW",
        confidence: "high",
        lastUpdated: "2026-01-22T12:00:00Z",
        dataSource: "Learning Platform (Degreed)",
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
    title: "Portfolio Performance Summary",
    summary: "Your portfolio is performing at 92% average attainment with 8 of 13 KRs on track. The needle moved +2.3% this week.",
    soWhat: "You're on pace to hit 5 of 6 strategic goals. Focus attention on Clinical Excellence which is the only goal at risk.",
    impact: "high",
    trend: "positive",
    relevanceScore: 98,
    relatedGoals: ["goal-cx", "goal-clinical", "goal-growth"],
    relatedKRs: ["kr-nps", "kr-tcc", "kr-ai-mau"],
    sources: [
      { id: "src-1", name: "Portfolio Analytics Engine", type: "database", confidence: 0.95, lastUpdated: "2026-01-23T09:00:00Z" },
      { id: "src-2", name: "KR Status Calculator", type: "model", confidence: 0.92, lastUpdated: "2026-01-23T09:00:00Z" },
    ],
    tags: ["portfolio", "weekly-review", "executive-summary"],
    suggestedTags: ["q1-2026", "strategic-goals"],
    generatedAt: "2026-01-23T09:05:00Z",
    expiresAt: "2026-01-24T09:05:00Z",
  },
  {
    id: "insight-2",
    type: "trend",
    title: "Customer NPS Momentum",
    summary: "Customer NPS has improved 4 points week-over-week, reaching 58. This is the fastest improvement rate in 6 months.",
    soWhat: "At this pace, you'll hit the 60-point target 3 weeks ahead of schedule. Consider raising the target or reallocating CX resources.",
    impact: "high",
    trend: "positive",
    relevanceScore: 92,
    relatedGoals: ["goal-cx"],
    relatedKRs: ["kr-nps"],
    sources: [
      { id: "src-3", name: "Medallia NPS Platform", type: "survey", confidence: 0.94, lastUpdated: "2026-01-23T08:00:00Z" },
    ],
    tags: ["customer-experience", "nps", "trending-up"],
    suggestedTags: ["accelerating", "target-adjustment"],
    generatedAt: "2026-01-23T09:10:00Z",
    expiresAt: "2026-01-24T09:10:00Z",
  },
  {
    id: "insight-3",
    type: "anomaly",
    title: "Clinical TCC PMPM Alert",
    summary: "Risk-adjusted TCC PMPM remains 1% above target ($348.50 vs $345.00). Improvement pace has slowed compared to last month.",
    soWhat: "This KR directly impacts your $30M margin commitment to the board. Without intervention, you risk missing Q1 targets.",
    impact: "high",
    trend: "negative",
    relevanceScore: 95,
    relatedGoals: ["goal-clinical"],
    relatedKRs: ["kr-tcc"],
    sources: [
      { id: "src-4", name: "Clinical Data Warehouse", type: "database", confidence: 0.91, lastUpdated: "2026-01-18T12:00:00Z" },
      { id: "src-5", name: "HCC Risk Model v3.2", type: "model", confidence: 0.89, lastUpdated: "2026-01-15T12:00:00Z" },
    ],
    tags: ["clinical", "cost", "at-risk", "needs-attention"],
    suggestedTags: ["intervention-needed", "board-commitment"],
    generatedAt: "2026-01-23T09:15:00Z",
    expiresAt: "2026-01-24T09:15:00Z",
  },
  {
    id: "insight-4",
    type: "prediction",
    title: "AI Revenue Forecast",
    summary: "AI product revenue is projected to reach $52M by EOY, exceeding the $50M target by 4%.",
    soWhat: "Strong AI adoption creates opportunity to accelerate investment. Consider expanding AI product roadmap for FY27.",
    impact: "medium",
    trend: "positive",
    relevanceScore: 85,
    relatedGoals: ["goal-financial", "goal-growth"],
    relatedKRs: ["kr-ai-revenue", "kr-ai-mau"],
    sources: [
      { id: "src-6", name: "Revenue Forecasting Model", type: "model", confidence: 0.82, lastUpdated: "2026-01-19T17:00:00Z" },
      { id: "src-7", name: "Product Analytics", type: "api", confidence: 0.94, lastUpdated: "2026-01-23T06:00:00Z" },
    ],
    tags: ["financial", "ai", "forecast", "positive-outlook"],
    suggestedTags: ["investment-opportunity", "fy27-planning"],
    generatedAt: "2026-01-23T09:20:00Z",
    expiresAt: "2026-01-30T09:20:00Z",
  },
  {
    id: "insight-5",
    type: "recommendation",
    title: "Resource Reallocation Opportunity",
    summary: "Customer Experience team has 15% buffer capacity while Risk Actions implementation is resource-constrained.",
    soWhat: "Temporarily shifting 2-3 CX resources to Risk could accelerate implementation from 52% to 65% within 3 weeks.",
    impact: "medium",
    trend: "neutral",
    relevanceScore: 78,
    relatedGoals: ["goal-cx", "goal-enterprise"],
    relatedKRs: ["kr-risk-actions"],
    sources: [
      { id: "src-8", name: "Resource Management System", type: "database", confidence: 0.88, lastUpdated: "2026-01-22T12:00:00Z" },
    ],
    tags: ["resource-optimization", "cross-functional", "recommendation"],
    suggestedTags: ["quick-win", "operational-efficiency"],
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
    title: "Approve Clinical Data Feed",
    description: "S1 blocker on TCC PMPM trend analysis has been open for 9 days",
    rationale: "Clinical portfolio health is blocked on this approval. Each day of delay impacts Q1 trajectory.",
    estimatedImpact: "Unblocks Clinical KR tracking and enables trend analysis",
    effort: "low",
    relatedGoals: ["goal-clinical"],
    suggestedAction: "Schedule 15-min approval meeting with IT Data Team",
    deadline: "2026-01-24T17:00:00Z",
    owner: "IT Data Team",
    status: "new",
    createdAt: "2026-01-23T08:00:00Z",
  },
  {
    id: "rec-2",
    priority: "urgent",
    title: "Review Denial Prevention Pilot Results",
    description: "Pilot showing 5.8% improvement in denial rate, scale decision due this week",
    rationale: "Optimal scale window before Q2. Delaying risks losing momentum and institutional knowledge.",
    estimatedImpact: "Potential $8M annual savings if scaled enterprise-wide",
    effort: "medium",
    relatedGoals: ["goal-clinical", "goal-financial"],
    suggestedAction: "Review pilot report and schedule scale decision meeting",
    deadline: "2026-01-26T17:00:00Z",
    owner: "Chief Medical Officer",
    status: "new",
    createdAt: "2026-01-23T08:00:00Z",
  },
  {
    id: "rec-3",
    priority: "high",
    title: "Schedule Clinical Portfolio Deep-Dive",
    description: "Only strategic goal showing Red health status",
    rationale: "Understanding root causes essential for course correction. Q1 targets at risk without intervention.",
    estimatedImpact: "Early intervention could recover 60% of gap to target",
    effort: "medium",
    relatedGoals: ["goal-clinical"],
    suggestedAction: "Block 90 minutes with CMO and clinical analytics team",
    owner: "Chief Medical Officer",
    status: "new",
    createdAt: "2026-01-23T08:00:00Z",
  },
  {
    id: "rec-4",
    priority: "medium",
    title: "Recognize CX Team Performance",
    description: "Customer Experience metrics showing strongest momentum in portfolio",
    rationale: "Recognition reinforces positive behaviors and maintains momentum. High visibility success story.",
    estimatedImpact: "Sustained team engagement and continued performance",
    effort: "low",
    relatedGoals: ["goal-cx", "goal-talent"],
    suggestedAction: "Send recognition note and consider town hall shoutout",
    owner: "Chief Experience Officer",
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
    title: "Customer NPS Updated",
    description: "NPS score updated to 58 (+4 from last week)",
    actor: "System",
    relatedEntity: { type: "kr", id: "kr-nps", name: "Customer NPS" },
    timestamp: "2026-01-23T08:00:00Z",
    isRead: false,
  },
  {
    id: "act-2",
    type: "status_change",
    title: "KR Status Changed",
    description: "Digital Issue Resolution Rate moved from Red to Amber",
    actor: "System",
    relatedEntity: { type: "kr", id: "kr-resolution", name: "Digital Issue Resolution Rate" },
    timestamp: "2026-01-23T07:45:00Z",
    isRead: false,
  },
  {
    id: "act-3",
    type: "signal",
    title: "New S1 Signal",
    description: "Data feed approval blocker flagged on Clinical portfolio",
    actor: "Risk Monitor",
    relatedEntity: { type: "signal", id: "sig-1", name: "Data feed approval pending" },
    timestamp: "2026-01-22T14:30:00Z",
    isRead: true,
  },
  {
    id: "act-4",
    type: "comment",
    title: "CMO Added Comment",
    description: "Dr. Johnson commented on TCC PMPM improvement plan",
    actor: "Dr. Demo Physician",
    relatedEntity: { type: "kr", id: "kr-tcc", name: "Risk-adjusted TCC PMPM" },
    timestamp: "2026-01-22T11:15:00Z",
    isRead: true,
  },
  {
    id: "act-5",
    type: "decision",
    title: "Decision Logged",
    description: "Approved Q1 resource allocation for AI initiatives",
    actor: "Demo User",
    relatedEntity: { type: "decision", id: "dec-1", name: "AI Resource Allocation" },
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
    title: "Scale Denial Prevention Pilot",
    description: "Decide whether to scale the denial prevention AI pilot to enterprise-wide deployment",
    type: "scale",
    status: "open",
    relatedGoals: ["goal-clinical", "goal-financial"],
    relatedKRs: ["kr-tcc"],
    context: "Pilot has shown 5.8% improvement in denial rate across 3 test regions over 8 weeks. Confidence interval is 95%. Investment required for scale: $2.4M. Projected annual savings: $8M.",
    options: [
      { label: "Scale Now", description: "Full enterprise deployment in Q1" },
      { label: "Expand Pilot", description: "Add 2 more regions before full scale" },
      { label: "Defer", description: "Wait for 12-week pilot data" },
    ],
    createdAt: "2026-01-20T10:00:00Z",
    createdBy: "Chief Medical Officer",
  },
  {
    id: "dec-2",
    title: "Unblock Clinical Data Feed",
    description: "Expedited approval for clinical data feed required for TCC PMPM tracking",
    type: "unblock",
    status: "open",
    relatedGoals: ["goal-clinical"],
    relatedKRs: ["kr-tcc"],
    context: "Data feed has been pending IT approval for 9 days. Security review completed, awaiting final sign-off. Blocking trend analysis and pace calculations.",
    options: [
      { label: "Approve", description: "Grant immediate approval" },
      { label: "Conditional", description: "Approve with additional monitoring" },
      { label: "Escalate", description: "Escalate to CTO for review" },
    ],
    createdAt: "2026-01-14T10:00:00Z",
    createdBy: "IT Data Team Lead",
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
    content: "Good morning, Sarah! Your portfolio is performing well with 92% average attainment. The needle moved +2.3% this week. Would you like me to highlight anything specific?",
    timestamp: "2026-01-23T08:00:00Z",
    sources: [
      { id: "src-1", name: "Portfolio Analytics", type: "database", confidence: 0.95, lastUpdated: "2026-01-23T08:00:00Z" },
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
  "Did the needle move this week?",
  "What needs my attention?",
  "Show me top risks",
  "Summarize customer experience",
  "What decisions are pending?",
  "How is the portfolio performing?",
  "Show me clinical excellence status",
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
    title: "Weekly Executive Summary",
    description: "AI-generated overview of portfolio performance, key wins, and areas needing attention",
    type: "auto-generated",
    frequency: "Weekly",
    lastGenerated: "2026-01-23T06:00:00Z",
    status: "ready",
    pages: 3,
  },
  {
    id: "report-2",
    title: "Q1 2026 Progress Report",
    description: "Quarterly deep-dive into strategic goal progress and KR attainment",
    type: "auto-generated",
    frequency: "Quarterly",
    lastGenerated: "2026-01-20T09:00:00Z",
    status: "ready",
    pages: 12,
  },
  {
    id: "report-3",
    title: "Clinical Excellence Deep Dive",
    description: "Focused analysis on Clinical Excellence goal performance and improvement opportunities",
    type: "on-demand",
    frequency: "On-demand",
    lastGenerated: "2026-01-18T14:00:00Z",
    status: "ready",
    pages: 8,
  },
  {
    id: "report-4",
    title: "Board Presentation Pack",
    description: "Executive summary formatted for board presentation with key metrics and insights",
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
  { id: "ds-1", name: "Portfolio Analytics Engine", status: "connected", lastSync: "2 min ago", type: "database" },
  { id: "ds-2", name: "Medallia NPS Platform", status: "connected", lastSync: "15 min ago", type: "survey" },
  { id: "ds-3", name: "Clinical Data Warehouse", status: "connected", lastSync: "1 hour ago", type: "database" },
  { id: "ds-4", name: "Finance Revenue Attribution", status: "connected", lastSync: "30 min ago", type: "report" },
  { id: "ds-5", name: "Risk Management Platform", status: "connected", lastSync: "45 min ago", type: "database" },
  { id: "ds-6", name: "Workday Peakon", status: "connected", lastSync: "3 hours ago", type: "survey" },
  { id: "ds-7", name: "Product Analytics (Amplitude)", status: "connected", lastSync: "10 min ago", type: "api" },
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
