/**
 * API Endpoints
 * Centralized endpoint definitions for the ClinicalOS API
 */

export const API_ENDPOINTS = {
  // User endpoints
  user: {
    profile: '/user/profile',
    preferences: '/user/preferences',
  },

  // Portfolio endpoints
  portfolios: {
    list: '/portfolios',
    byId: (id: string) => `/portfolios/${id}`,
    metrics: (id: string) => `/portfolios/${id}/metrics`,
  },

  // Dashboard endpoints
  dashboard: {
    summary: '/dashboard/summary',
    widgets: '/dashboard/widgets',
    notifications: '/dashboard/notifications',
  },

  // Notifications endpoints
  notifications: {
    send: '/notifications/send',
  },

  // Feedback endpoints
  feedback: {
    submit: '/feedback/submit',
    list: '/feedback/list',
  },

  // Health check
  health: '/health',
} as const;

export default API_ENDPOINTS;

