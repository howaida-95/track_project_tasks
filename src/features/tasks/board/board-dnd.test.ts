import { describe, expect, it } from 'vitest'

import {
  createBoardAnnouncements,
  findBoardContainer,
  getBoardMoveTarget,
  isTaskStatus,
} from '@/features/tasks/board/board-dnd.ts'
import { emptyTasksByStatus } from '@/features/tasks/model/task.rules.ts'
import { makeTask } from '@/test/factories/make-task.ts'

describe('board-dnd helpers', () => {
  const columns = {
    ...emptyTasksByStatus(),
    todo: [makeTask({ title: 'Alpha', status: 'todo', position: 0 })],
    in_progress: [makeTask({ title: 'Beta', status: 'in_progress', position: 0 })],
  }

  it('identifies column ids and task containers', () => {
    expect(isTaskStatus('todo')).toBe(true)
    expect(isTaskStatus('not-a-status')).toBe(false)
    expect(findBoardContainer('in_review', columns)).toBe('in_review')
    expect(findBoardContainer(columns.todo[0]?.id ?? '', columns)).toBe('todo')
  })

  it('persists a cross-column drop even after the card was moved in dragOver', () => {
    const alpha = columns.todo[0]
    const beta = columns.in_progress[0]
    expect(alpha).toBeDefined()
    expect(beta).toBeDefined()
    if (!alpha || !beta) {
      return
    }

    const afterDragOver = {
      ...emptyTasksByStatus(),
      todo: [],
      in_progress: [
        { ...alpha, status: 'in_progress' as const, position: 0 },
        { ...beta, position: 1 },
      ],
    }

    expect(
      getBoardMoveTarget(alpha.id, beta.id, afterDragOver, { status: 'todo', index: 0 }),
    ).toEqual({ status: 'in_progress', position: 0 })
    expect(
      getBoardMoveTarget(alpha.id, 'in_progress', afterDragOver, { status: 'todo', index: 0 }),
    ).toEqual({ status: 'in_progress', position: 0 })
  })

  it('announces pickup and drop targets', () => {
    const taskId = columns.todo[0]?.id
    expect(taskId).toBeDefined()
    if (!taskId) {
      return
    }

    const announcements = createBoardAnnouncements(columns)
    expect(announcements.onDragStart({ active: { id: taskId } } as never)).toContain('Alpha')
    expect(
      announcements.onDragEnd({
        active: { id: taskId },
        over: { id: 'in_progress' },
      } as never),
    ).toContain('In Progress')
  })
})
