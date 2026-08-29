import { afterEach, describe, expect, it, vi } from 'vitest'

import { reportError } from '@/shared/lib/logger.ts'

describe('reportError', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('logs errors with context in development', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const error = new Error('Task save failed')

    reportError(error, { mutation: 'updateTask', taskId: 'task-1' })

    expect(errorSpy).toHaveBeenCalledWith('[error]', error, {
      mutation: 'updateTask',
      taskId: 'task-1',
    })
  })

  it('logs errors without context in development', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const error = new Error('Unexpected failure')

    reportError(error)

    expect(errorSpy).toHaveBeenCalledWith('[error]', error)
  })
})
