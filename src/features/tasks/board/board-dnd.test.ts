import { describe, expect, it } from 'vitest'

import {
  boardKeyboardCoordinates,
  createBoardAnnouncements,
  createBoardCollisionDetection,
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

  it('returns null when a same-column move would not change position', () => {
    const alpha = columns.todo[0]
    expect(alpha).toBeDefined()
    if (!alpha) {
      return
    }

    expect(getBoardMoveTarget(alpha.id, alpha.id, columns, { status: 'todo', index: 0 })).toBeNull()
  })

  it('announces drag over and cancel states', () => {
    const taskId = columns.todo[0]?.id
    expect(taskId).toBeDefined()
    if (!taskId) {
      return
    }

    const announcements = createBoardAnnouncements(columns)

    expect(
      announcements.onDragOver({
        active: { id: taskId },
        over: { id: 'in_progress' },
      } as never),
    ).toContain('In Progress')

    expect(announcements.onDragCancel({ active: { id: taskId } } as never)).toContain('cancelled')
    expect(announcements.onDragEnd({ active: { id: taskId }, over: null } as never)).toContain(
      'dropped',
    )
  })

  it('moves keyboard focus horizontally between columns', () => {
    const coordinates = boardKeyboardCoordinates(
      { code: 'ArrowRight' } as KeyboardEvent,
      {
        currentCoordinates: { x: 10, y: 10 },
        context: {
          droppableRects: new Map([
            ['todo', { left: 0, right: 280, top: 0, bottom: 640 } as DOMRect],
            ['in_progress', { left: 296, right: 576, top: 0, bottom: 640 } as DOMRect],
          ]),
        },
      } as never,
    )

    expect(coordinates).toEqual({ x: 296, y: 0 })
  })

  it('falls back to the last known collision target', () => {
    const lastOverId = { current: 'todo' as const }
    const recentlyMovedToNewContainer = { current: false }
    const detect = createBoardCollisionDetection({
      getItemIds: () => ({
        todo: [],
        in_progress: [],
        in_review: [],
        done: [],
      }),
      getActiveId: () => 'missing-task',
      lastOverId,
      recentlyMovedToNewContainer,
    })

    const collisions = detect({
      droppableContainers: [],
      pointerCoordinates: null,
    } as never)

    expect(collisions).toEqual([{ id: 'todo' }])
  })
})
