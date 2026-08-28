import { ApiProblemSchema } from '@/features/tasks/model/schemas.ts'
import type { ApiProblem } from '@/features/tasks/model/types.ts'

export function parseProblem(data: unknown, status: number): ApiProblem {
  const parsed = ApiProblemSchema.safeParse(data)

  if (parsed.success) {
    const problem = parsed.data

    if (problem.details !== undefined) {
      return {
        status: problem.status,
        message: problem.message,
        details: problem.details,
      }
    }

    return {
      status: problem.status,
      message: problem.message,
    }
  }

  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message: unknown }).message

    if (typeof message === 'string') {
      return { status, message }
    }
  }

  return {
    status,
    message: 'Request failed',
  }
}
