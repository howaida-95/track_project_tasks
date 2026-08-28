import type { ZodType } from 'zod'

import { ApiContractError } from '@/shared/api/errors.ts'
import { reportError } from '@/shared/lib/logger.ts'

export function parseResponse<T>(schema: ZodType<T>, data: unknown, scope: string): T {
  const result = schema.safeParse(data)

  if (result.success) {
    return result.data
  }

  const error = new ApiContractError(
    `${scope} response failed schema validation`,
    result.error.issues,
    data,
  )
  reportError(error, { scope })
  throw error
}
