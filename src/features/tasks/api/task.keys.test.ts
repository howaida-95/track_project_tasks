import { describe, expect, it } from 'vitest'

import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import { toTaskId } from '@/shared/types/branded.ts'
import type { TaskStatus } from '@/shared/types/task-ui.ts'

describe('taskKeys', () => {
  it('builds stable list and detail keys', () => {
    const filters = { q: 'auth', status: ['todo'] as TaskStatus[], page: 1 }
    const taskId = toTaskId('11111111-1111-4111-8111-111111111111')

    expect(taskKeys.all).toEqual(['tasks'])
    expect(taskKeys.list(filters)).toEqual(['tasks', 'list', filters])
    expect(taskKeys.stats()).toEqual(['tasks', 'stats'])
    expect(taskKeys.detail(taskId)).toEqual(['tasks', 'detail', taskId])
  })
})
