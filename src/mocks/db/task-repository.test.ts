import { beforeEach, describe, expect, it } from 'vitest'

import {
  createStoredTask,
  deleteStoredTask,
  getStoredTask,
  getStoredTaskCount,
  listStoredTasks,
  resetTaskStore,
  updateStoredTask,
} from '@/mocks/db/task-repository.ts'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { SEED_TASK_COUNT } from '@/mocks/seed/generate-tasks.ts'
import { makeTask } from '@/test/factories/make-task.ts'

describe('task repository', () => {
  beforeEach(() => {
    localStorage.clear()
    resetTaskStore()
  })

  it('seeds the store with 1200 tasks on first read', () => {
    expect(getStoredTaskCount()).toBe(SEED_TASK_COUNT)
  })

  it('creates, updates, and deletes tasks', () => {
    const created = createStoredTask({
      title: 'New task',
      status: 'todo',
      priority: 'medium',
    })

    expect(getStoredTask(created.id)?.title).toBe('New task')

    const updated = updateStoredTask(created.id, { status: 'done' })
    expect(updated?.status).toBe('done')

    expect(deleteStoredTask(created.id)).toBe(true)
    expect(getStoredTask(created.id)).toBeNull()
  })

  it('lists tasks with filters and pagination', () => {
    replaceTaskStore([
      makeTask({ title: 'Auth flow', status: 'todo', priority: 'high' }),
      makeTask({ title: 'Board polish', status: 'done', priority: 'low' }),
    ])

    const result = listStoredTasks({
      q: 'auth',
      status: ['todo'],
      page: 1,
      limit: 10,
    })

    expect(result.meta.total).toBe(1)
    expect(result.data[0]?.title).toBe('Auth flow')
  })
})
