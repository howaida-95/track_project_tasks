import { beforeEach, describe, expect, it } from 'vitest'

import {
  createStoredTask,
  deleteStoredTask,
  getStoredTask,
  getStoredTaskCount,
  getStoredTaskStats,
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
    replaceTaskStore([])

    const created = createStoredTask({
      title: 'New task',
      status: 'todo',
      priority: 'medium',
    })

    expect(getStoredTask(created.id)?.title).toBe('New task')

    const updated = updateStoredTask(created.id, { status: 'done' })
    expect(updated?.status).toBe('done')
    expect(updated?.position).toBe(0)

    expect(deleteStoredTask(created.id)).toBe(true)
    expect(getStoredTask(created.id)).toBeNull()
  })

  it('reindexes column positions when a task is moved', () => {
    replaceTaskStore([
      makeTask({ title: 'Todo first', status: 'todo', position: 0 }),
      makeTask({ title: 'Todo second', status: 'todo', position: 1 }),
      makeTask({ title: 'Doing now', status: 'in_progress', position: 0 }),
    ])

    const first = listStoredTasks({ status: ['todo'], sort: 'position', order: 'asc' }).data[0]
    const moved = first ? updateStoredTask(first.id, { status: 'in_progress', position: 0 }) : null

    expect(moved?.status).toBe('in_progress')
    expect(moved?.position).toBe(0)
    expect(
      listStoredTasks({ status: ['in_progress'], sort: 'position', order: 'asc' }).data.map(
        (task) => task.title,
      ),
    ).toEqual(['Todo first', 'Doing now'])
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

  it('aggregates catalog statistics', () => {
    replaceTaskStore([
      makeTask({ title: 'Auth flow', status: 'todo', priority: 'high' }),
      makeTask({ title: 'Board polish', status: 'done', priority: 'low' }),
    ])

    expect(getStoredTaskStats()).toEqual({
      total: 2,
      byStatus: { todo: 1, in_progress: 0, in_review: 0, done: 1 },
      byPriority: { low: 1, medium: 0, high: 1, urgent: 0 },
    })
  })
})
