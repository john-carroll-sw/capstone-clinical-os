/**
 * Environment configuration for ClinicalOS
 * All environment variables are validated and typed here
 */

export type Environment = 'local' | 'dev' | 'test' | 'prod';

interface EnvConfig {
  api: {
    baseUrl: string;
  };
  app: {
    env: Environment;
    isLocal: boolean;
    isDev: boolean;
    isProd: boolean;
  };
  auth: {
    /** Set to true to enable authentication */
    enabled: boolean;
    /** Alias for backwards compatibility */
    bypassAuth: boolean;
  };
}

function getEnvVar(key: string, fallback?: string): string {
  const value = import.meta.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getBoolEnvVar(key: string, fallback: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined || value === '' || value === null) return fallback;
  // Handle both boolean and string values (YAML can pass either)
  if (typeof value === 'boolean') return value;
  // Convert to string and check for truthy values
  const strValue = String(value).toLowerCase().trim();
  return strValue === 'true' || strValue === '1' || strValue === 'yes' || strValue === 'on';
}

function getEnvironment(): Environment {
  const envValue = import.meta.env.VITE_ENVIRONMENT || import.meta.env.VITE_APP_ENV || 'local';
  const validEnvs: Environment[] = ['local', 'dev', 'test', 'prod'];
  
  if (validEnvs.includes(envValue as Environment)) {
    return envValue as Environment;
  }
  
  // Map common aliases
  if (envValue === 'development') return 'local';
  if (envValue === 'production') return 'prod';
  if (envValue === 'staging') return 'test';
  
  console.warn(`Unknown environment "${envValue}", defaulting to "local"`);
  return 'local';
}

const environment = getEnvironment();
const authEnabled = getBoolEnvVar('VITE_AUTH_ENABLED', false);

export const env: EnvConfig = {
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8000/api/v1'),
  },
  app: {
    env: environment,
    isLocal: environment === 'local',
    isDev: environment === 'dev' || environment === 'local',
    isProd: environment === 'prod',
  },
  auth: {
    // Auth is DISABLED by default (set VITE_AUTH_ENABLED=true to enable auth)
    enabled: authEnabled,
    // Backwards compatibility alias
    bypassAuth: !authEnabled,
  },
};

export default env;
