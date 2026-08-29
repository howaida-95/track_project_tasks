import { describe, expect, it } from 'vitest'

import {
  countShare,
  emptyTaskStats,
  summarizeTasks,
} from '@/features/analytics/model/summarize-tasks.ts'
import { makeTask } from '@/test/factories/make-task.ts'

describe('summarizeTasks', () => {
  it('counts tasks by status and priority', () => {
    const summary = summarizeTasks([
      makeTask({ status: 'todo', priority: 'low' }),
      makeTask({ status: 'todo', priority: 'urgent' }),
      makeTask({ status: 'done', priority: 'high' }),
    ])

    expect(summary.total).toBe(3)
    expect(summary.byStatus.todo).toBe(2)
    expect(summary.byStatus.done).toBe(1)
    expect(summary.byStatus.in_progress).toBe(0)
    expect(summary.byPriority.low).toBe(1)
    expect(summary.byPriority.urgent).toBe(1)
    expect(summary.byPriority.high).toBe(1)
    expect(summary.byPriority.medium).toBe(0)
  })

  it('returns zeros for an empty catalog', () => {
    expect(emptyTaskStats()).toEqual({
      total: 0,
      byStatus: { todo: 0, in_progress: 0, in_review: 0, done: 0 },
      byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
    })
  })
})

describe('countShare', () => {
  it('returns zero when the denominator is empty', () => {
    expect(countShare(4, 0)).toBe(0)
  })

  it('rounds the percentage of a count', () => {
    expect(countShare(1, 3)).toBe(33)
    expect(countShare(2, 3)).toBe(67)
  })
})
