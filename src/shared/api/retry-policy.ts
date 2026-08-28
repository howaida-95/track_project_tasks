import { ApiContractError, ApiError, isRetryableApiError } from '@/shared/api/errors.ts'

export const DEFAULT_QUERY_RETRY = 3

const MAX_RETRY_DELAY_MS = 30_000
const BASE_RETRY_DELAY_MS = 1_000

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= DEFAULT_QUERY_RETRY) {
    return false
  }

  if (error instanceof ApiContractError) {
    return false
  }

  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false
  }

  return isRetryableApiError(error)
}

export function getRetryDelay(attemptIndex: number): number {
  const exponentialDelay = BASE_RETRY_DELAY_MS * 2 ** attemptIndex
  const jitter = Math.random() * 300

  return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY_MS)
}
