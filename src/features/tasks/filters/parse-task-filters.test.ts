import { describe, expect, it } from 'vitest'

import {
  buildTaskSearchParams,
  getDefaultTaskListParams,
  mergeTaskListParams,
  parseTaskListParams,
  serializeTaskListParams,
} from '@/features/tasks/filters/parse-task-filters.ts'
import { parseTaskView } from '@/features/tasks/filters/task-view.ts'
import type { TaskListParams } from '@/features/tasks/model/types.ts'

describe('parseTaskListParams', () => {
  it('returns defaults for an empty query string', () => {
    const defaults = parseTaskListParams(new URLSearchParams())
    expect(parseTaskListParams(new URLSearchParams())).toEqual(defaults)
  })

  it('parses filters, sort, and pagination from the URL', () => {
    const params = new URLSearchParams([
      ['q', 'auth'],
      ['status', 'todo'],
      ['status', 'done'],
      ['priority', 'high'],
      ['sort', 'title'],
      ['order', 'asc'],
      ['page', '2'],
      ['limit', '25'],
    ])

    expect(parseTaskListParams(params)).toEqual({
      q: 'auth',
      status: ['todo', 'done'],
      priority: ['high'],
      sort: 'title',
      order: 'asc',
      page: 2,
      limit: 25,
    })
  })

  it('falls back to defaults when values are invalid', () => {
    const params = new URLSearchParams([
      ['page', '0'],
      ['sort', 'not-a-field'],
    ])

    expect(parseTaskListParams(params)).toEqual(parseTaskListParams(new URLSearchParams()))
  })
})

describe('serializeTaskListParams', () => {
  it('omits default pagination and sort values', () => {
    const search = serializeTaskListParams(parseTaskListParams(new URLSearchParams()))

    expect(search.toString()).toBe('')
  })

  it('round-trips parsed params', () => {
    const original: TaskListParams = {
      q: 'kanban',
      status: ['in_progress'],
      priority: ['urgent'],
      sort: 'dueDate',
      order: 'asc',
      page: 3,
      limit: 20,
    }

    const roundTrip = parseTaskListParams(serializeTaskListParams(original))

    expect(roundTrip).toEqual(original)
  })
})

describe('mergeTaskListParams', () => {
  it('resets page when filters change', () => {
    const current = parseTaskListParams(new URLSearchParams('page=4'))
    const next = mergeTaskListParams(current, { q: 'deploy' })

    expect(next.page).toBe(1)
    expect(next.q).toBe('deploy')
  })

  it('clears empty filter arrays', () => {
    const current = parseTaskListParams(new URLSearchParams('status=todo'))
    const next = mergeTaskListParams(current, { status: [] })

    expect(next.status).toBeUndefined()
  })

  it('exposes defaults for a full reset', () => {
    const customized = parseTaskListParams(
      new URLSearchParams('q=test&sort=title&order=asc&status=todo'),
    )
    const reset = getDefaultTaskListParams()

    expect(customized.q).toBe('test')
    expect(customized.sort).toBe('title')
    expect(reset).toEqual(parseTaskListParams(new URLSearchParams()))
    expect(serializeTaskListParams(reset).toString()).toBe('')
  })

  it('preserves list view in the URL', () => {
    const search = buildTaskSearchParams(
      {
        page: 1,
        limit: 25,
        sort: 'createdAt',
        order: 'desc',
      },
      'list',
    )

    expect(search.get('view')).toBe('list')
    expect(parseTaskView(search)).toBe('list')
  })
})
