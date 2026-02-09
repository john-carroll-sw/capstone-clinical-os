export { axiosInstance } from './axiosInstance';
export { API_ENDPOINTS } from './endpoints';
export { fetchWithAuth } from './authFetch';

// Mock AI API
export {
  getPersonalizedBriefing,
  processVoiceQuery,
  mockLogin,
  mockSignup,
  getCurrentUser,
} from './mockAI';
export type {
  AISource,
  AIInsight,
  AIExecutiveSummary,
  AIPersonalizedBriefing,
  VoiceQueryResponse,
  MockUser,
} from './mockAI';
