const DEFAULT_API_BASE_URL = '/api'

/**
 * Resolves the API base path for axios and MSW.
 * Empty / whitespace env values fall back to `/api` (Vercel often sets blank vars).
 */
export function getApiBaseUrl(
  rawValue: string | undefined = import.meta.env.VITE_API_BASE_URL,
): string {
  if (typeof rawValue !== 'string') {
    return DEFAULT_API_BASE_URL
  }

  const trimmed = rawValue.trim().replace(/\/+$/, '')
  return trimmed === '' ? DEFAULT_API_BASE_URL : trimmed
}
