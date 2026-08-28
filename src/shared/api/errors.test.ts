import axios from 'axios'
import { describe, expect, it } from 'vitest'

import { ApiContractError, ApiError, NetworkError, TimeoutError } from '@/shared/api/errors.ts'
import { mapAxiosError } from '@/shared/api/map-axios-error.ts'
import { parseProblem } from '@/shared/api/parse-problem.ts'

describe('parseProblem', () => {
  it('parses a valid API problem payload', () => {
    expect(parseProblem({ message: 'Not found', status: 404 }, 404)).toEqual({
      message: 'Not found',
      status: 404,
    })
  })

  it('falls back when payload is unknown', () => {
    expect(parseProblem(null, 500)).toEqual({
      message: 'Request failed',
      status: 500,
    })
  })
})

describe('mapAxiosError', () => {
  it('maps timeout errors', () => {
    const axiosError = new axios.AxiosError('timeout', 'ECONNABORTED')
    const mapped = mapAxiosError(axiosError)

    expect(mapped).toBeInstanceOf(TimeoutError)
  })

  it('maps network errors', () => {
    const axiosError = new axios.AxiosError('network')
    const mapped = mapAxiosError(axiosError)

    expect(mapped).toBeInstanceOf(NetworkError)
  })

  it('maps HTTP errors to ApiError', () => {
    const axiosError = new axios.AxiosError('bad request', undefined, undefined, undefined, {
      status: 400,
      statusText: 'Bad Request',
      data: { message: 'Validation failed', status: 400 },
      headers: {},
      config: { headers: new axios.AxiosHeaders() },
    })

    const mapped = mapAxiosError(axiosError)

    expect(mapped).toBeInstanceOf(ApiError)
    expect((mapped as ApiError).status).toBe(400)
  })

  it('preserves cancellation errors', () => {
    const cancelError = new axios.CanceledError('cancelled')
    const mapped = mapAxiosError(cancelError)

    expect(mapped).toBe(cancelError)
  })
})

describe('ApiContractError', () => {
  it('stores schema issues', () => {
    const error = new ApiContractError('invalid payload', [
      { code: 'custom', message: 'bad field', path: ['title'] },
    ])

    expect(error.name).toBe('ApiContractError')
    expect(error.issues).toHaveLength(1)
  })
})
