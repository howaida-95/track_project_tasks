import type {
  Announcements,
  CollisionDetection,
  KeyboardCoordinateGetter,
  ScreenReaderInstructions,
  UniqueIdentifier,
} from '@dnd-kit/core'
import {
  closestCenter,
  getFirstCollision,
  KeyboardCode,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core'
import type { RefObject } from 'react'

import type { TasksByStatus } from '@/features/tasks/model/task.rules.ts'
import { toTaskId, type TaskId } from '@/shared/types/branded.ts'
import { TASK_STATUS_LABELS, TASK_STATUSES, type TaskStatus } from '@/shared/types/task-ui.ts'

export type BoardMoveOrigin = {
  status: TaskStatus
  index: number
}

export const BOARD_DND_INSTRUCTIONS_ID = 'board-dnd-instructions'

export const BOARD_SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = {
  draggable:
    'To pick up a task, press space or enter. Use the arrow keys to move it between columns or within a column. Press space or enter to drop, or escape to cancel.',
}

export function isTaskStatus(value: UniqueIdentifier): value is TaskStatus {
  return TASK_STATUSES.some((status) => status === value)
}

export function findBoardContainer(
  id: UniqueIdentifier,
  columns: TasksByStatus,
): TaskStatus | undefined {
  if (isTaskStatus(id)) {
    return id
  }

  const taskId = String(id)
  return TASK_STATUSES.find((status) => columns[status].some((task) => task.id === taskId))
}

export function toBoardTaskId(id: UniqueIdentifier): TaskId {
  return toTaskId(String(id))
}

export function getTaskIdsByStatus(columns: TasksByStatus): Record<TaskStatus, UniqueIdentifier[]> {
  return {
    todo: columns.todo.map((task) => task.id),
    in_progress: columns.in_progress.map((task) => task.id),
    in_review: columns.in_review.map((task) => task.id),
    done: columns.done.map((task) => task.id),
  }
}

export function getBoardMoveTarget(
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  columns: TasksByStatus,
  origin: BoardMoveOrigin,
): { status: TaskStatus; position: number } | null {
  const destStatus = findBoardContainer(overId, columns)
  if (!destStatus) {
    return null
  }

  const destColumn = columns[destStatus]
  const activeIndex = destColumn.findIndex((task) => task.id === String(activeId))

  if (origin.status !== destStatus) {
    if (activeIndex >= 0) {
      return { status: destStatus, position: activeIndex }
    }

    if (isTaskStatus(overId)) {
      return { status: destStatus, position: destColumn.length }
    }

    const overIndex = destColumn.findIndex((task) => task.id === String(overId))
    return { status: destStatus, position: Math.max(0, overIndex) }
  }

  let position = origin.index

  if (isTaskStatus(overId)) {
    position = Math.max(0, destColumn.length - 1)
  } else if (String(overId) !== String(activeId)) {
    const overIndex = destColumn.findIndex((task) => task.id === String(overId))
    if (overIndex >= 0) {
      position = overIndex
    }
  }

  if (position === origin.index) {
    return null
  }

  return { status: destStatus, position }
}

export function createBoardCollisionDetection(options: {
  getItemIds: () => Record<TaskStatus, UniqueIdentifier[]>
  getActiveId: () => UniqueIdentifier | null
  lastOverId: RefObject<UniqueIdentifier | null>
  recentlyMovedToNewContainer: RefObject<boolean>
}): CollisionDetection {
  return (args) => {
    const pointerCollisions = pointerWithin(args)
    const collisions = pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args)
    let overId = getFirstCollision(collisions, 'id')

    if (overId != null) {
      if (isTaskStatus(overId)) {
        const containerItems = options.getItemIds()[overId]

        if (containerItems.length > 0) {
          const closestItem = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((container) =>
              containerItems.some((itemId) => itemId === container.id),
            ),
          })[0]

          if (closestItem) {
            overId = closestItem.id
          }
        }
      }

      options.lastOverId.current = overId
      return [{ id: overId }]
    }

    if (options.recentlyMovedToNewContainer.current) {
      options.lastOverId.current = options.getActiveId()
    }

    const lastOverId = options.lastOverId.current
    return lastOverId ? [{ id: lastOverId }] : []
  }
}

export const boardKeyboardCoordinates: KeyboardCoordinateGetter = (
  event,
  { context, currentCoordinates },
) => {
  if (event.code === KeyboardCode.Down) {
    return { ...currentCoordinates, y: currentCoordinates.y + 96 }
  }

  if (event.code === KeyboardCode.Up) {
    return { ...currentCoordinates, y: currentCoordinates.y - 96 }
  }

  if (event.code !== KeyboardCode.Right && event.code !== KeyboardCode.Left) {
    return undefined
  }

  const direction = event.code === KeyboardCode.Right ? 1 : -1
  const currentIndex = TASK_STATUSES.findIndex((status) => {
    const rect = context.droppableRects.get(status)
    if (!rect) {
      return false
    }

    return currentCoordinates.x >= rect.left - 1 && currentCoordinates.x <= rect.right + 1
  })
  const nextStatus = TASK_STATUSES[(currentIndex < 0 ? 0 : currentIndex) + direction]
  if (!nextStatus) {
    return undefined
  }

  const nextRect = context.droppableRects.get(nextStatus)
  if (!nextRect) {
    return undefined
  }

  return { x: nextRect.left, y: nextRect.top }
}

export function createBoardAnnouncements(columns: TasksByStatus): Announcements {
  function titleOf(id: UniqueIdentifier): string {
    const container = findBoardContainer(id, columns)
    if (!container) {
      return String(id)
    }

    const task = columns[container].find((item) => item.id === String(id))
    return task?.title ?? String(id)
  }

  return {
    onDragStart({ active }) {
      return `Picked up task ${titleOf(active.id)}.`
    },
    onDragOver({ active, over }) {
      if (!over) {
        return
      }

      const overContainer = findBoardContainer(over.id, columns)
      if (!overContainer) {
        return
      }

      return `Task ${titleOf(active.id)} is over ${TASK_STATUS_LABELS[overContainer]}.`
    },
    onDragEnd({ active, over }) {
      if (!over) {
        return `Task ${titleOf(active.id)} was dropped.`
      }

      const overContainer = findBoardContainer(over.id, columns)
      if (!overContainer) {
        return `Task ${titleOf(active.id)} was dropped.`
      }

      return `Task ${titleOf(active.id)} was dropped in ${TASK_STATUS_LABELS[overContainer]}.`
    },
    onDragCancel({ active }) {
      return `Dragging cancelled. Task ${titleOf(active.id)} was returned to its original position.`
    },
  }
}
