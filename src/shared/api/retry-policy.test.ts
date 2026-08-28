import { describe, expect, it } from 'vitest'

import { ApiContractError, ApiError, NetworkError, TimeoutError } from '@/shared/api/errors.ts'
import { DEFAULT_QUERY_RETRY, getRetryDelay, shouldRetryQuery } from '@/shared/api/retry-policy.ts'

describe('retry-policy', () => {
  it('retries network and timeout errors up to the default limit', () => {
    expect(shouldRetryQuery(0, new NetworkError())).toBe(true)
    expect(shouldRetryQuery(1, new TimeoutError())).toBe(true)
    expect(shouldRetryQuery(DEFAULT_QUERY_RETRY, new NetworkError())).toBe(false)
  })

  it('retries 5xx API errors but not 4xx', () => {
    const serverError = new ApiError(500, { status: 500, message: 'Server error' })
    const clientError = new ApiError(404, { status: 404, message: 'Not found' })

    expect(shouldRetryQuery(0, serverError)).toBe(true)
    expect(shouldRetryQuery(0, clientError)).toBe(false)
  })

  it('never retries contract errors', () => {
    const contractError = new ApiContractError('invalid payload', [])

    expect(shouldRetryQuery(0, contractError)).toBe(false)
  })

  it('uses exponential backoff with an upper bound', () => {
    expect(getRetryDelay(0)).toBeGreaterThanOrEqual(1000)
    expect(getRetryDelay(0)).toBeLessThan(2000)
    expect(getRetryDelay(10)).toBeLessThanOrEqual(30_000)
  })
})
