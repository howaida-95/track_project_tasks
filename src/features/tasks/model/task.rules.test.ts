import { describe, expect, it } from 'vitest'

import { PaginatedTasksSchema, TaskSchema } from '@/features/tasks/model/schemas.ts'
import {
  filterTasks,
  groupTasksByStatus,
  moveTaskInList,
  paginateTasks,
  queryTasks,
  sortTasks,
} from '@/features/tasks/model/task.rules.ts'
import { makeTask } from '@/test/factories/make-task.ts'

describe('task.rules', () => {
  const tasks = [
    makeTask({
      title: 'Alpha deploy',
      status: 'todo',
      priority: 'low',
      dueDate: '2026-01-10',
      createdAt: '2026-01-01T10:00:00.000Z',
    }),
    makeTask({
      title: 'Beta review',
      status: 'in_progress',
      priority: 'high',
      dueDate: '2026-02-01',
      createdAt: '2026-01-02T10:00:00.000Z',
    }),
    makeTask({
      title: 'Gamma docs',
      status: 'done',
      priority: 'medium',
      dueDate: null,
      createdAt: '2026-01-03T10:00:00.000Z',
      tags: ['docs'],
    }),
  ]

  it('filters by query, status, and due date range', () => {
    const filtered = filterTasks(tasks, {
      q: 'beta',
      status: ['in_progress'],
      from: '2026-01-15',
      to: '2026-02-15',
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.title).toBe('Beta review')
  })

  it('sorts by priority descending', () => {
    const sorted = sortTasks(tasks, 'priority', 'desc')
    expect(sorted.map((task) => task.priority)).toEqual(['high', 'medium', 'low'])
  })

  it('moves a task between columns and reindexes positions', () => {
    const alpha = tasks[0]
    const beta = tasks[1]
    const gamma = tasks[2]

    expect(alpha).toBeDefined()
    expect(beta).toBeDefined()
    expect(gamma).toBeDefined()

    if (!alpha || !beta || !gamma) {
      return
    }

    const moved = moveTaskInList(
      [
        makeTask({ ...alpha, position: 0 }),
        makeTask({ ...beta, position: 0 }),
        makeTask({ ...gamma, position: 0 }),
      ],
      alpha.id,
      'done',
      0,
    )

    const grouped = groupTasksByStatus(moved)
    expect(grouped.todo).toHaveLength(0)
    expect(grouped.done.map((task) => task.title)).toEqual(['Alpha deploy', 'Gamma docs'])
    expect(grouped.done.map((task) => task.position)).toEqual([0, 1])
  })

  it('paginates results', () => {
    const page = paginateTasks(tasks, { page: 2, limit: 1 })

    expect(page.meta).toEqual({
      total: 3,
      page: 2,
      limit: 1,
      totalPages: 3,
    })
    expect(page.data).toHaveLength(1)
  })

  it('queries with filter, sort, and pagination together', () => {
    const result = queryTasks(tasks, {
      q: 'a',
      sort: 'title',
      order: 'asc',
      page: 1,
      limit: 2,
    })

    PaginatedTasksSchema.parse(result)
    expect(result.data.map((task) => task.title)).toEqual(['Alpha deploy', 'Beta review'])
  })

  it('filters by priority and excludes tasks without due dates in a range', () => {
    const filtered = filterTasks(tasks, {
      priority: ['medium'],
    })

    expect(filtered.map((task) => task.title)).toEqual(['Gamma docs'])

    const withoutDueDates = filterTasks(tasks, {
      from: '2026-01-01',
      to: '2026-12-31',
    })

    expect(withoutDueDates.map((task) => task.title)).toEqual(['Alpha deploy', 'Beta review'])
  })

  it('sorts by due date, title, position, and updatedAt', () => {
    expect(sortTasks(tasks, 'dueDate', 'asc').map((task) => task.title)).toEqual([
      'Alpha deploy',
      'Beta review',
      'Gamma docs',
    ])

    expect(sortTasks(tasks, 'title', 'asc').map((task) => task.title)).toEqual([
      'Alpha deploy',
      'Beta review',
      'Gamma docs',
    ])

    const byUpdatedAt = [
      makeTask({ title: 'Oldest', updatedAt: '2026-01-01T00:00:00.000Z' }),
      makeTask({ title: 'Middle', updatedAt: '2026-01-02T00:00:00.000Z' }),
      makeTask({ title: 'Newest', updatedAt: '2026-01-03T00:00:00.000Z' }),
    ]

    expect(sortTasks(byUpdatedAt, 'updatedAt', 'desc').map((task) => task.title)).toEqual([
      'Newest',
      'Middle',
      'Oldest',
    ])

    const positioned = [
      makeTask({
        title: 'First',
        status: 'todo',
        position: 0,
        createdAt: '2026-01-02T00:00:00.000Z',
      }),
      makeTask({
        title: 'Second',
        status: 'todo',
        position: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
      }),
    ]

    expect(sortTasks(positioned, 'position', 'asc').map((task) => task.title)).toEqual([
      'First',
      'Second',
    ])
  })

  it('returns the original list when a move target is missing', () => {
    const alpha = tasks[0]
    expect(alpha).toBeDefined()
    if (!alpha) {
      return
    }

    expect(moveTaskInList(tasks, 'missing-task-id' as typeof alpha.id, 'done', 0)).toEqual(tasks)
  })

  it('moves a task within the same column', () => {
    const first = makeTask({ title: 'First', status: 'todo', position: 0 })
    const second = makeTask({ title: 'Second', status: 'todo', position: 1 })
    const third = makeTask({ title: 'Third', status: 'todo', position: 2 })

    const moved = moveTaskInList([first, second, third], third.id, 'todo', 0)
    const grouped = groupTasksByStatus(moved)

    expect(grouped.todo.map((task) => task.title)).toEqual(['Third', 'First', 'Second'])
  })
})

describe('TaskSchema', () => {
  it('accepts a valid task shape', () => {
    TaskSchema.parse(makeTask())
  })
})
