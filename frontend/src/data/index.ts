/**
 * Data Layer Index
 * 
 * CENTRALIZED MOCK DATA
 * All mock data is now in mockData.ts
 * When ready to connect to real APIs, update imports from this file.
 */

// Re-export everything from the centralized mock data
export * from './mockData';

// Feedback questions for stakeholder feedback collection
export * from './feedbackQuestions';

// Legacy exports for backward compatibility (will be removed)
export { goals } from './goals';
export { metricConfigs } from './metricConfigs';
export { mockSnapshots, getAllMetrics, getMetricById } from './mockMetricData';
export {
  getAllGoalsWithMetrics,
  getGoalWithMetrics,
  getPortfolioSummary as getLegacyPortfolioSummary,
} from './goalMetrics';
