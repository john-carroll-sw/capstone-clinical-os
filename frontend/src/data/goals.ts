/**
 * Strategic Goals Configuration
 * Groups KRs by organizational objectives
 */

import type { Goal } from "@/types/goals";

export const goals: Goal[] = [
  {
    id: "customer_experience",
    name: "Customer Experience Excellence",
    description: "Deliver exceptional member and provider experiences through digital innovation and responsive service",
    owner: "Chief Experience Officer",
    target_period: "EOY_2026",
    metric_ids: [
      "customer_nps",
      "digital_issue_resolution_rate",
      "transparency_trust",
    ],
    color: "#2f9e72", // emerald
    icon: "goal",
  },
  {
    id: "growth_engagement",
    name: "Growth & Engagement",
    description: "Scale user engagement and adoption across all platforms and AI-powered products",
    owner: "Chief Growth Officer",
    target_period: "EOY_2026",
    metric_ids: [
      "mau",
      "ai_mau",
    ],
    color: "#007a8a", // teal
    icon: "trend_up",
  },
  {
    id: "financial_performance",
    name: "Financial Performance",
    description: "Drive revenue growth and operational efficiency through AI and strategic partnerships",
    owner: "Chief Financial Officer",
    target_period: "EOY_2026",
    metric_ids: [
      "revenue_growth_disruptive_ai",
      "opex_reduction_margin_growth",
      "data_partner_gp_growth",
    ],
    color: "#003087", // navy
    icon: "money",
  },
  {
    id: "clinical_excellence",
    name: "Clinical Excellence",
    description: "Improve health outcomes and reduce total cost of care through advanced analytics",
    owner: "Chief Medical Officer",
    target_period: "EOY_2026",
    metric_ids: [
      "risk_adjusted_tcc_pmpm",
    ],
    color: "#d26b7c", // rose
    icon: "assessment",
  },
  {
    id: "data_ai_foundation",
    name: "Data & AI Foundation",
    description: "Build world-class data infrastructure and AI capabilities with governance excellence",
    owner: "Chief Data & Analytics Officer",
    target_period: "EOY_2026",
    metric_ids: [
      "gold_assets_coverage",
      "anomaly_detection_sla",
    ],
    color: "#6c5aa8", // purple
    icon: "ai",
  },
  {
    id: "enterprise_trust",
    name: "Enterprise Trust & Risk",
    description: "Strengthen client relationships and proactive risk management across the ecosystem",
    owner: "Chief Risk Officer",
    target_period: "EOY_2026",
    metric_ids: [
      "client_nps",
      "risk_actions_implemented",
    ],
    color: "#e0a73f", // amber
    icon: "security",
  },
];

export function getGoalById(id: string): Goal | undefined {
  return goals.find((goal) => goal.id === id);
}
