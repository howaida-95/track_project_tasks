import axios from 'axios'

import { ApiError, NetworkError, TimeoutError } from '@/shared/api/errors.ts'
import { parseProblem } from '@/shared/api/parse-problem.ts'

export function mapAxiosError(error: unknown): Error {
  if (axios.isCancel(error)) {
    return error instanceof Error ? error : new Error('Request cancelled')
  }

  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error('Unknown request error')
  }

  if (error.code === 'ECONNABORTED') {
    return new TimeoutError(undefined, error)
  }

  if (!error.response) {
    return new NetworkError(undefined, error)
  }

  return new ApiError(
    error.response.status,
    parseProblem(error.response.data, error.response.status),
    error,
  )
}
