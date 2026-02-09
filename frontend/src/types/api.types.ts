/**
 * API Type Definitions
 * Common types for API requests and responses
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'executive' | 'viewer';
  avatarUrl?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  dashboardLayout?: string;
  notifications: {
    email: boolean;
    inApp: boolean;
  };
}

export interface DashboardSummary {
  totalPortfolios: number;
  activeProjects: number;
  pendingActions: number;
  lastUpdated: string;
}

