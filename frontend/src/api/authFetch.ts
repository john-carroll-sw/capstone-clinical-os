import { env } from '@config/env';
import { oktaAuth } from '@auth/oktaConfig';

type HeadersInput = HeadersInit | undefined;

async function buildAuthHeaders(): Promise<Record<string, string>> {
  if (env.auth.bypassAuth) {
    return { 'X-Dev-Mode': 'true' };
  }

  try {
    const tokens = await oktaAuth.tokenManager.getTokens();
    const accessToken = tokens?.accessToken?.accessToken;
    if (accessToken) {
      return { Authorization: `Bearer ${accessToken}` };
    }
  } catch (error) {
    console.error('Error attaching auth token:', error);
  }

  return {};
}

function mergeHeaders(base: HeadersInput, additions: Record<string, string>): Headers {
  const merged = new Headers(base);
  Object.entries(additions).forEach(([key, value]) => {
    if (!merged.has(key)) {
      merged.set(key, value);
    }
  });
  return merged;
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const authHeaders = await buildAuthHeaders();
  const headers = mergeHeaders(init.headers, authHeaders);
  return fetch(input, { ...init, headers });
}

export default fetchWithAuth;
