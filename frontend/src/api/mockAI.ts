/**
 * Mock AI API Layer
 * Simulates backend AI responses for personalization features
 */

export interface AISource {
  id: string;
  title: string;
  type: "data" | "report" | "metric" | "document" | "analysis";
  confidence: number;
  lastUpdated: string;
  url?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  impact: "high" | "medium" | "low";
  trend: "up" | "down" | "stable";
  relevance: number; // 0-100
  personalReason: string;
  sources: AISource[];
  generatedAt: string;
}

export interface AIExecutiveSummary {
  headline: string;
  needleMovement: "positive" | "negative" | "neutral";
  weekOverWeekChange: number;
  topWins: string[];
  topRisks: string[];
  keyDecisions: string[];
  generatedAt: string;
}

export interface AIPersonalizedBriefing {
  greeting: string;
  executiveSummary: AIExecutiveSummary;
  insights: AIInsight[];
  recommendedActions: {
    action: string;
    priority: "urgent" | "high" | "medium";
    rationale: string;
  }[];
  watchItems: {
    metric: string;
    status: "improving" | "declining" | "stable";
    delta: string;
  }[];
}

export interface VoiceQueryResponse {
  query: string;
  title: string;
  executiveSummary: string;
  relevanceToYou: string;
  whyItMatters: string;
  keyFindings: {
    finding: string;
    impact: "high" | "medium" | "low";
    trend: "up" | "down" | "stable";
  }[];
  dataPoints: {
    label: string;
    value: string;
    change: string;
    context: string;
  }[];
  sources: AISource[];
  relatedMetrics: string[];
  recommendedFollowUp: string[];
  generatedAt: string;
}

// Simulated delay for realistic API feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get personalized AI briefing for the current user
 */
export async function getPersonalizedBriefing(_userId: string): Promise<AIPersonalizedBriefing> {
  await delay(800 + Math.random() * 400);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return {
    greeting: `${greeting}, Chief`,
    executiveSummary: {
      headline: "The needle moved +2.3% this week — driven by Member Experience gains",
      needleMovement: "positive",
      weekOverWeekChange: 2.3,
      topWins: [
        "Digital issue resolution rate hit 50% milestone (↑4pp)",
        "Customer NPS improved to 58 (↑4 points)",
        "AI MAU exceeded 7,200 users (↑5.9%)",
      ],
      topRisks: [
        "Risk-adjusted TCC PMPM still above target ($348.50 vs $345.00)",
        "Risk actions implementation lagging at 52% (target: 70%)",
        "Clinical portfolio showing Red health status",
      ],
      keyDecisions: [
        "Scale decision pending: Denial prevention pilot",
        "Unblock needed: Data feed approval for Trend variance KR",
        "Capacity reallocation: Clinical → Ops recommended",
      ],
      generatedAt: new Date().toISOString(),
    },
    insights: [
      {
        id: "insight-1",
        title: "Member Experience is your strongest performer",
        summary: "Across all 6 strategic goals, Customer Experience Excellence shows the healthiest trajectory with 97% average attainment.",
        impact: "high",
        trend: "up",
        relevance: 95,
        personalReason: "As Chief, member experience directly impacts renewal rates and your Q1 board presentation metrics.",
        sources: [
          { id: "s1", title: "Customer NPS Survey Data", type: "data", confidence: 0.94, lastUpdated: "2026-01-20T12:00:00Z" },
          { id: "s2", title: "Digital Resolution Analytics", type: "metric", confidence: 0.91, lastUpdated: "2026-01-20T12:00:00Z" },
        ],
        generatedAt: new Date().toISOString(),
      },
      {
        id: "insight-2",
        title: "Clinical Excellence requires immediate attention",
        summary: "Risk-adjusted TCC PMPM is 1% above target. Current trajectory suggests Q1 target may be missed without intervention.",
        impact: "high",
        trend: "down",
        relevance: 88,
        personalReason: "This KR directly impacts the $30M margin growth target you committed to in the October board meeting.",
        sources: [
          { id: "s3", title: "Clinical Data - TCC PMPM Analysis", type: "analysis", confidence: 0.87, lastUpdated: "2026-01-18T12:00:00Z" },
          { id: "s4", title: "HCC Risk Adjustment Model", type: "document", confidence: 0.92, lastUpdated: "2026-01-15T12:00:00Z" },
        ],
        generatedAt: new Date().toISOString(),
      },
      {
        id: "insight-3",
        title: "AI adoption is accelerating faster than planned",
        summary: "AI MAU reached 7,200 (96% to target) with 3 months remaining. Consider raising the EOY target.",
        impact: "medium",
        trend: "up",
        relevance: 82,
        personalReason: "AI adoption metrics are a key differentiator in your competitive positioning narrative for analysts.",
        sources: [
          { id: "s5", title: "AI Product Analytics", type: "data", confidence: 0.96, lastUpdated: "2026-01-20T12:00:00Z" },
          { id: "s6", title: "User Engagement Report", type: "report", confidence: 0.89, lastUpdated: "2026-01-19T12:00:00Z" },
        ],
        generatedAt: new Date().toISOString(),
      },
    ],
    recommendedActions: [
      {
        action: "Review Denial Prevention Pilot scale decision",
        priority: "urgent",
        rationale: "Pilot showing 5.8% improvement in denial rate with high confidence. Scale window optimal before Q2.",
      },
      {
        action: "Approve data feed for Trend Variance KR",
        priority: "urgent",
        rationale: "S1 blocker aging 9 days. Clinical portfolio health blocked on this approval.",
      },
      {
        action: "Schedule Clinical portfolio deep-dive",
        priority: "high",
        rationale: "Only goal area showing Red health. May need resource reallocation or target adjustment.",
      },
    ],
    watchItems: [
      { metric: "Customer NPS", status: "improving", delta: "+4 pts WoW" },
      { metric: "Digital Resolution Rate", status: "improving", delta: "+4pp WoW" },
      { metric: "Risk-adjusted TCC PMPM", status: "stable", delta: "-$3.70 WoW" },
      { metric: "Gold Assets Coverage", status: "improving", delta: "+4pp WoW" },
      { metric: "Risk Actions Implemented", status: "declining", delta: "-2pp WoW" },
    ],
  };
}

/**
 * Process a voice query and return AI-generated insights
 */
export async function processVoiceQuery(query: string, _userId: string): Promise<VoiceQueryResponse> {
  await delay(1200 + Math.random() * 600);

  // Simulate different responses based on query keywords
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("needle") || lowerQuery.includes("week") || lowerQuery.includes("progress")) {
    return generateNeedleMovementResponse(query);
  } else if (lowerQuery.includes("risk") || lowerQuery.includes("concern") || lowerQuery.includes("problem")) {
    return generateRiskResponse(query);
  } else if (lowerQuery.includes("win") || lowerQuery.includes("success") || lowerQuery.includes("good")) {
    return generateWinsResponse(query);
  } else if (lowerQuery.includes("clinical") || lowerQuery.includes("medical") || lowerQuery.includes("health")) {
    return generateClinicalResponse(query);
  } else if (lowerQuery.includes("customer") || lowerQuery.includes("member") || lowerQuery.includes("nps")) {
    return generateCustomerResponse(query);
  } else if (lowerQuery.includes("financial") || lowerQuery.includes("revenue") || lowerQuery.includes("margin")) {
    return generateFinancialResponse(query);
  } else {
    return generateGenericResponse(query);
  }
}

function generateNeedleMovementResponse(query: string): VoiceQueryResponse {
  return {
    query,
    title: "Weekly Portfolio Performance Analysis",
    executiveSummary: "The needle moved +2.3% this week. Your portfolio is trending positively with 8 of 13 KRs showing improvement. Member Experience and Growth & Engagement are leading the charge, while Clinical Excellence remains the primary area requiring attention.",
    relevanceToYou: "As Chief, this weekly movement directly impacts your Q1 commitments to the board. The current trajectory suggests you'll hit 4 of 6 strategic goals on target, with Clinical Excellence and Enterprise Trust requiring intervention.",
    whyItMatters: "Week-over-week momentum is the leading indicator of quarterly success. Three consecutive weeks of positive movement historically correlates with 87% probability of hitting quarterly targets. You're currently at 2 weeks positive.",
    keyFindings: [
      { finding: "Member Experience KRs showing strongest momentum (+8.7% composite)", impact: "high", trend: "up" },
      { finding: "AI adoption metrics exceeding pace requirements by 15%", impact: "high", trend: "up" },
      { finding: "Clinical TCC PMPM improving but still 1% above target", impact: "high", trend: "up" },
      { finding: "Risk actions implementation declining (-2pp)", impact: "medium", trend: "down" },
    ],
    dataPoints: [
      { label: "Portfolio Health Score", value: "72/100", change: "+3 WoW", context: "Composite of all 13 KRs weighted by strategic priority" },
      { label: "KRs On Track", value: "8 of 13", change: "+1 WoW", context: "Green or Amber status with positive trajectory" },
      { label: "Average Attainment", value: "89%", change: "+2.3% WoW", context: "Weighted average across all active KRs" },
      { label: "Open Decisions", value: "8", change: "+2 WoW", context: "Pending decisions requiring executive input" },
    ],
    sources: [
      { id: "s1", title: "Portfolio Analytics Engine", type: "data", confidence: 0.94, lastUpdated: "2026-01-20T09:00:00Z" },
      { id: "s2", title: "KR Attainment Calculator", type: "metric", confidence: 0.96, lastUpdated: "2026-01-20T09:00:00Z" },
      { id: "s3", title: "Historical Trend Analysis", type: "analysis", confidence: 0.88, lastUpdated: "2026-01-20T09:00:00Z" },
    ],
    relatedMetrics: ["Customer NPS", "Digital Issue Resolution", "AI MAU", "Risk-adjusted TCC PMPM"],
    recommendedFollowUp: [
      "What's driving the Clinical portfolio decline?",
      "Show me the top 3 wins this week",
      "What decisions need my attention today?",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateRiskResponse(query: string): VoiceQueryResponse {
  return {
    query,
    title: "Current Risk Landscape Analysis",
    executiveSummary: "You have 3 critical risks requiring attention this week. The Clinical portfolio shows systemic issues with 2 KRs in Red status. Additionally, there's an aging S1 blocker on the Trend Variance KR that's been open for 9 days.",
    relevanceToYou: "These risks directly threaten your Q1 targets. The Clinical issues specifically impact the $30M margin growth commitment made in October's board meeting.",
    whyItMatters: "Unaddressed risks compound weekly. The current risk profile suggests a 23% probability of missing Q1 targets if no intervention occurs in the next 5 business days.",
    keyFindings: [
      { finding: "S1 Blocker: Data feed approval blocking Clinical KR", impact: "high", trend: "stable" },
      { finding: "Risk-adjusted TCC PMPM 1% above target threshold", impact: "high", trend: "up" },
      { finding: "Risk actions implementation at 52% vs 70% target", impact: "medium", trend: "down" },
      { finding: "Cohort selection bias risk in Denial Prevention pilot", impact: "medium", trend: "stable" },
    ],
    dataPoints: [
      { label: "S1 Signals", value: "2", change: "No change", context: "Critical blockers requiring immediate resolution" },
      { label: "S2 Signals", value: "6", change: "+1 WoW", context: "High priority items with 5-day SLA" },
      { label: "Risk Score", value: "68/100", change: "-4 WoW", context: "Lower is better; 80+ is healthy" },
      { label: "Overdue Items", value: "3", change: "+2 WoW", context: "Past SLA items requiring escalation" },
    ],
    sources: [
      { id: "s1", title: "Risk Management Platform", type: "data", confidence: 0.92, lastUpdated: "2026-01-19T18:00:00Z" },
      { id: "s2", title: "Signal Queue Analytics", type: "metric", confidence: 0.95, lastUpdated: "2026-01-20T08:00:00Z" },
      { id: "s3", title: "Clinical Portfolio Risk Assessment", type: "analysis", confidence: 0.87, lastUpdated: "2026-01-18T12:00:00Z" },
    ],
    relatedMetrics: ["Risk Actions Implemented", "Risk-adjusted TCC PMPM", "Signal Aging"],
    recommendedFollowUp: [
      "What's blocking the data feed approval?",
      "Show me the Clinical portfolio deep dive",
      "What's the impact if TCC PMPM misses target?",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateWinsResponse(query: string): VoiceQueryResponse {
  return {
    query,
    title: "This Week's Key Wins & Successes",
    executiveSummary: "5 significant wins this week, led by Customer Experience Excellence achieving 97% attainment. The Digital Issue Resolution Rate hit the 50% milestone, and AI MAU is now at 96% of EOY target with 11 months remaining.",
    relevanceToYou: "These wins strengthen your position for the Q1 board presentation. The member experience improvements directly support the customer retention narrative you've been building.",
    whyItMatters: "Recognizing wins maintains team momentum and provides proof points for continued investment. These metrics are also leading indicators of financial performance 2-3 quarters out.",
    keyFindings: [
      { finding: "Digital Issue Resolution Rate reached 50% milestone", impact: "high", trend: "up" },
      { finding: "Customer NPS improved 4 points to 58 (target: 60)", impact: "high", trend: "up" },
      { finding: "AI MAU at 7,200 — 96% to EOY target already", impact: "high", trend: "up" },
      { finding: "Gold Assets Coverage at 96% compliance", impact: "medium", trend: "up" },
    ],
    dataPoints: [
      { label: "Green KRs", value: "5", change: "+1 WoW", context: "KRs exceeding or meeting targets" },
      { label: "Wins Logged", value: "5", change: "+3 WoW", context: "Significant positive outcomes this period" },
      { label: "Team Morale Index", value: "78/100", change: "+5 WoW", context: "Derived from pulse surveys and activity" },
      { label: "Initiative Success Rate", value: "67%", change: "+8% WoW", context: "Initiatives meeting stage-gate criteria" },
    ],
    sources: [
      { id: "s1", title: "Performance Analytics", type: "data", confidence: 0.95, lastUpdated: "2026-01-20T09:00:00Z" },
      { id: "s2", title: "Survey Response Data", type: "data", confidence: 0.91, lastUpdated: "2026-01-20T12:00:00Z" },
      { id: "s3", title: "Initiative Tracker", type: "metric", confidence: 0.93, lastUpdated: "2026-01-19T17:00:00Z" },
    ],
    relatedMetrics: ["Customer NPS", "Digital Issue Resolution", "AI MAU", "Gold Assets Coverage"],
    recommendedFollowUp: [
      "How can we accelerate AI MAU further?",
      "What's driving the NPS improvement?",
      "Which team should be recognized?",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateClinicalResponse(query: string): VoiceQueryResponse {
  return {
    query,
    title: "Clinical Excellence Deep Dive",
    executiveSummary: "Clinical Excellence is currently your most challenged strategic goal with Red health status. The Risk-adjusted TCC PMPM stands at $348.50 against a target of $345.00. While showing improvement (-$3.70 WoW), the pace is insufficient to hit EOY targets.",
    relevanceToYou: "The Clinical portfolio directly impacts the $30M margin growth target. As the sole KR in this goal area, TCC PMPM performance has outsized impact on your executive scorecard.",
    whyItMatters: "Healthcare cost trends are the #1 driver of enterprise profitability. A 1% improvement in TCC PMPM translates to approximately $12M in annual savings.",
    keyFindings: [
      { finding: "TCC PMPM at $348.50 — 1% above $345 target", impact: "high", trend: "up" },
      { finding: "HCC risk adjustment accuracy improved to 94%", impact: "medium", trend: "up" },
      { finding: "Specialty cost trends declining faster than expected", impact: "high", trend: "up" },
      { finding: "Prior auth turnaround time still above benchmark", impact: "medium", trend: "stable" },
    ],
    dataPoints: [
      { label: "Current TCC PMPM", value: "$348.50", change: "-$3.70 WoW", context: "Risk-adjusted total cost of care per member" },
      { label: "Target TCC PMPM", value: "$345.00", change: "EOY 2026", context: "Requires 1% additional reduction" },
      { label: "Pace to Target", value: "0.78x", change: "-0.05 WoW", context: "Need 1.0x or higher to hit target" },
      { label: "Sample Size", value: "1,250", change: "+50 WoW", context: "Member months in calculation" },
    ],
    sources: [
      { id: "s1", title: "Clinical Data Warehouse", type: "data", confidence: 0.91, lastUpdated: "2026-01-18T12:00:00Z" },
      { id: "s2", title: "HCC Risk Model v3.2", type: "analysis", confidence: 0.92, lastUpdated: "2026-01-15T12:00:00Z" },
      { id: "s3", title: "Cost Trend Analysis", type: "report", confidence: 0.88, lastUpdated: "2026-01-17T09:00:00Z" },
    ],
    relatedMetrics: ["Risk-adjusted TCC PMPM", "Prior Auth Turnaround", "Specialty Cost Trend"],
    recommendedFollowUp: [
      "What interventions would accelerate TCC improvement?",
      "Show me the specialty cost breakdown",
      "How does this compare to industry benchmarks?",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateCustomerResponse(query: string): VoiceQueryResponse {
  return {
    query,
    title: "Customer Experience Excellence Analysis",
    executiveSummary: "Customer Experience is your strongest strategic goal with 97% average attainment across 3 KRs. Customer NPS reached 58 (2 points from target), Digital Issue Resolution hit 50%, and Transparency Trust is at 77%.",
    relevanceToYou: "Strong customer metrics support your renewal rate targets and provide ammunition for the competitive positioning narrative in analyst calls.",
    whyItMatters: "Customer experience metrics are leading indicators of retention and growth. Each point of NPS improvement correlates with 0.3% improvement in customer lifetime value.",
    keyFindings: [
      { finding: "Customer NPS at 58 — only 2 points from 60 target", impact: "high", trend: "up" },
      { finding: "Digital Issue Resolution reached 50% milestone", impact: "high", trend: "up" },
      { finding: "Transparency Trust at 77% — 3pp from target", impact: "medium", trend: "up" },
      { finding: "Member satisfaction trending above industry benchmark", impact: "medium", trend: "up" },
    ],
    dataPoints: [
      { label: "Customer NPS", value: "58", change: "+4 WoW", context: "Target: 60 by EOY 2026" },
      { label: "Digital Resolution", value: "50%", change: "+4pp WoW", context: "Target: 80% by EOY 2026" },
      { label: "Trust Score", value: "77%", change: "+3pp WoW", context: "Target: 80% by EOY 2026" },
      { label: "Goal Attainment", value: "97%", change: "+2% WoW", context: "Weighted average across CX KRs" },
    ],
    sources: [
      { id: "s1", title: "NPS Survey Platform", type: "data", confidence: 0.94, lastUpdated: "2026-01-20T12:00:00Z" },
      { id: "s2", title: "Service Telemetry", type: "metric", confidence: 0.96, lastUpdated: "2026-01-20T09:00:00Z" },
      { id: "s3", title: "Trust Survey Results", type: "data", confidence: 0.89, lastUpdated: "2026-01-13T12:00:00Z" },
    ],
    relatedMetrics: ["Customer NPS", "Digital Issue Resolution", "Transparency Trust", "MAU"],
    recommendedFollowUp: [
      "What's driving the NPS improvement?",
      "How does this compare to competitors?",
      "Which segments are showing strongest growth?",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateFinancialResponse(query: string): VoiceQueryResponse {
  return {
    query,
    title: "Financial Performance Overview",
    executiveSummary: "Financial Performance goal shows Amber health with 92% attainment. Revenue from Disruptive AI is at $46M (92% to $50M target), OpEx reduction at $28.5M (95% to target), and Data Partnership GP at $19.2M (96% to target).",
    relevanceToYou: "These metrics directly feed into the P&L you own. The AI revenue line is especially important for the growth narrative in your investor communications.",
    whyItMatters: "Financial KRs are the ultimate scorecard. The current trajectory suggests you'll slightly exceed OpEx targets but may need to accelerate AI revenue to hit the full portfolio target.",
    keyFindings: [
      { finding: "AI Revenue at $46M — 92% to $50M target", impact: "high", trend: "up" },
      { finding: "OpEx Reduction at $28.5M — 95% to target", impact: "high", trend: "up" },
      { finding: "Partnership GP at $19.2M — 96% to target", impact: "medium", trend: "up" },
      { finding: "Overall financial health trending toward Amber→Green", impact: "high", trend: "up" },
    ],
    dataPoints: [
      { label: "AI Revenue", value: "$46M", change: "+$4M WoW", context: "Target: $50M by EOY 2026" },
      { label: "OpEx Savings", value: "$28.5M", change: "+$2.5M WoW", context: "Target: $30M by EOY 2026" },
      { label: "Partnership GP", value: "$19.2M", change: "+$1.1M WoW", context: "Target: $20M by EOY 2026" },
      { label: "Goal Attainment", value: "92%", change: "+3% WoW", context: "Weighted average across Financial KRs" },
    ],
    sources: [
      { id: "s1", title: "Finance Revenue Attribution", type: "data", confidence: 0.93, lastUpdated: "2026-01-19T17:00:00Z" },
      { id: "s2", title: "Cost Savings Tracker", type: "metric", confidence: 0.95, lastUpdated: "2026-01-19T17:00:00Z" },
      { id: "s3", title: "Partnership Finance Report", type: "report", confidence: 0.91, lastUpdated: "2026-01-19T17:00:00Z" },
    ],
    relatedMetrics: ["Revenue Growth AI", "OpEx Reduction", "Partnership GP", "Margin Growth"],
    recommendedFollowUp: [
      "What's the AI revenue pipeline look like?",
      "Which OpEx initiatives are driving savings?",
      "How are partnership renewals tracking?",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function generateGenericResponse(query: string): VoiceQueryResponse {
  return {
    query,
    title: "Executive Intelligence Response",
    executiveSummary: `Based on your question "${query}", here's what the data shows: Your portfolio is performing at 89% overall attainment with positive week-over-week momentum. 8 of 13 KRs are on track, with Customer Experience leading and Clinical Excellence requiring attention.`,
    relevanceToYou: "As the executive owner of this portfolio, these metrics directly impact your quarterly commitments and board reporting responsibilities.",
    whyItMatters: "Understanding the full portfolio picture enables better resource allocation decisions and helps prioritize where your attention will have the highest impact.",
    keyFindings: [
      { finding: "Overall portfolio health is Amber with positive trend", impact: "high", trend: "up" },
      { finding: "8 of 13 KRs showing positive week-over-week movement", impact: "high", trend: "up" },
      { finding: "2 strategic goals at Green, 3 at Amber, 1 at Red", impact: "medium", trend: "stable" },
      { finding: "8 decisions pending executive input", impact: "medium", trend: "up" },
    ],
    dataPoints: [
      { label: "Portfolio Score", value: "72/100", change: "+3 WoW", context: "Composite health across all goals" },
      { label: "Attainment", value: "89%", change: "+2.3% WoW", context: "Average progress to targets" },
      { label: "On Track KRs", value: "8/13", change: "+1 WoW", context: "Green or improving Amber" },
      { label: "Open Signals", value: "8", change: "+2 WoW", context: "Items requiring attention" },
    ],
    sources: [
      { id: "s1", title: "Portfolio Analytics Engine", type: "data", confidence: 0.94, lastUpdated: new Date().toISOString() },
      { id: "s2", title: "KR Status Aggregator", type: "metric", confidence: 0.96, lastUpdated: new Date().toISOString() },
    ],
    relatedMetrics: ["All Strategic Goals", "KR Health Distribution", "Decision Queue"],
    recommendedFollowUp: [
      "Did the needle move this week?",
      "What are the top risks right now?",
      "Show me this week's wins",
    ],
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Mock user authentication/signup
 */
export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  preferences: {
    voiceEnabled: boolean;
    notificationsEnabled: boolean;
    briefingTime: string;
  };
}

export async function mockLogin(email: string, _password: string): Promise<MockUser> {
  await delay(500);
  return {
    id: "user-chief-001",
    email,
    name: "Chief Executive",
    role: "C-Suite",
    preferences: {
      voiceEnabled: true,
      notificationsEnabled: true,
      briefingTime: "08:00",
    },
  };
}

export async function mockSignup(email: string, name: string, _password: string): Promise<MockUser> {
  await delay(800);
  return {
    id: `user-${Date.now()}`,
    email,
    name,
    role: "Executive",
    preferences: {
      voiceEnabled: true,
      notificationsEnabled: true,
      briefingTime: "08:00",
    },
  };
}

export async function getCurrentUser(): Promise<MockUser | null> {
  await delay(200);
  // Simulate logged-in user
  return {
    id: "user-chief-001",
    email: "chief@company.com",
    name: "Chief Executive",
    role: "C-Suite",
    preferences: {
      voiceEnabled: true,
      notificationsEnabled: true,
      briefingTime: "08:00",
    },
  };
}
