import type { AxiosError } from 'axios'
import type { ZodIssue } from 'zod'

import type { ApiProblem } from '@/features/tasks/model/types.ts'

export class ApiError extends Error {
  readonly name = 'ApiError'
  readonly status: number
  readonly problem: ApiProblem
  readonly cause?: AxiosError

  constructor(status: number, problem: ApiProblem, cause?: AxiosError) {
    super(problem.message)
    this.status = status
    this.problem = problem

    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export class NetworkError extends Error {
  readonly name = 'NetworkError'
  readonly cause?: AxiosError

  constructor(message = 'Network request failed', cause?: AxiosError) {
    super(message)

    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export class TimeoutError extends Error {
  readonly name = 'TimeoutError'
  readonly cause?: AxiosError

  constructor(message = 'Request timed out', cause?: AxiosError) {
    super(message)

    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export class ApiContractError extends Error {
  readonly name = 'ApiContractError'
  readonly issues: ZodIssue[]
  readonly cause?: unknown

  constructor(message: string, issues: ZodIssue[], cause?: unknown) {
    super(message)
    this.issues = issues

    if (cause !== undefined) {
      this.cause = cause
    }
  }
}

export function isRetryableApiError(error: unknown): boolean {
  if (error instanceof NetworkError || error instanceof TimeoutError) {
    return true
  }

  if (error instanceof ApiError) {
    return error.status >= 500
  }

  return false
}
