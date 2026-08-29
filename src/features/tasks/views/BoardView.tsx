import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useCallback, useMemo, useRef, useState } from 'react'

import {
  BOARD_DND_INSTRUCTIONS_ID,
  BOARD_SCREEN_READER_INSTRUCTIONS,
  boardKeyboardCoordinates,
  createBoardAnnouncements,
  createBoardCollisionDetection,
  findBoardContainer,
  getBoardMoveTarget,
  getTaskIdsByStatus,
  isTaskStatus,
  toBoardTaskId,
  type BoardMoveOrigin,
} from '@/features/tasks/board/board-dnd.ts'
import { BoardColumn } from '@/features/tasks/components/BoardColumn.tsx'
import { TaskCard } from '@/features/tasks/components/TaskCard.tsx'
import { useTaskFilters } from '@/features/tasks/filters/useTaskFilters.ts'
import { useColumnTasks } from '@/features/tasks/hooks/useColumnTasks.ts'
import { useTaskDialogActions } from '@/features/tasks/hooks/useTaskDialogActions.ts'
import { useTaskMutations } from '@/features/tasks/hooks/useTaskMutations.ts'
import { isBoardColumnEnabled } from '@/features/tasks/model/pagination.ts'
import { emptyTasksByStatus } from '@/features/tasks/model/task.rules.ts'
import type { TasksByStatus } from '@/features/tasks/model/task.rules.ts'
import type { Task } from '@/features/tasks/model/types.ts'
import { QueryState } from '@/shared/components/query-state.tsx'
import { TASK_STATUSES } from '@/shared/types/task-ui.ts'

function findTask(columns: TasksByStatus, id: UniqueIdentifier): Task | undefined {
  const container = findBoardContainer(id, columns)
  if (!container) {
    return undefined
  }

  return columns[container].find((task) => task.id === String(id))
}

export function BoardView() {
  const { openCreate, openEdit, openDelete } = useTaskDialogActions()
  const { moveTaskMutation } = useTaskMutations()
  const { listParams } = useTaskFilters()
  const todoQuery = useColumnTasks('todo', listParams)
  const inProgressQuery = useColumnTasks('in_progress', listParams)
  const inReviewQuery = useColumnTasks('in_review', listParams)
  const doneQuery = useColumnTasks('done', listParams)
  const columnQueries = {
    todo: todoQuery,
    in_progress: inProgressQuery,
    in_review: inReviewQuery,
    done: doneQuery,
  }

  const enabledStatuses = TASK_STATUSES.filter((status) => isBoardColumnEnabled(listParams, status))
  const isLoading = enabledStatuses.some((status) => columnQueries[status].isLoading)
  const isError = enabledStatuses.some((status) => columnQueries[status].isError)
  const error = enabledStatuses
    .map((status) => columnQueries[status].error)
    .find((queryError): queryError is Error => queryError instanceof Error)

  const tasksByStatus = useMemo(
    () => ({
      todo: todoQuery.data?.pages.flatMap((page) => page.data) ?? [],
      in_progress: inProgressQuery.data?.pages.flatMap((page) => page.data) ?? [],
      in_review: inReviewQuery.data?.pages.flatMap((page) => page.data) ?? [],
      done: doneQuery.data?.pages.flatMap((page) => page.data) ?? [],
    }),
    [doneQuery.data, inProgressQuery.data, inReviewQuery.data, todoQuery.data],
  )
  const isEmpty =
    !isLoading && !isError && enabledStatuses.every((status) => tasksByStatus[status].length === 0)
  const [draggingColumns, setDraggingColumns] = useState<TasksByStatus | null>(null)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const columns = draggingColumns ?? tasksByStatus
  const columnsRef = useRef(columns)
  const originRef = useRef<BoardMoveOrigin | null>(null)
  const lastOverId = useRef<UniqueIdentifier | null>(null)
  const recentlyMovedToNewContainer = useRef(false)
  const activeIdRef = useRef<UniqueIdentifier | null>(null)

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    return createBoardCollisionDetection({
      getItemIds: () => getTaskIdsByStatus(columnsRef.current),
      getActiveId: () => activeIdRef.current,
      lastOverId,
      recentlyMovedToNewContainer,
    })(args)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: boardKeyboardCoordinates,
    }),
  )

  const announcements = useMemo(() => createBoardAnnouncements(columns), [columns])
  const activeTask = activeId ? findTask(columns, activeId) : undefined
  const dropStatus = activeId ? findBoardContainer(activeId, columns) : undefined

  const handleEdit = useCallback(
    (taskId: Parameters<typeof openEdit>[0]) => {
      openEdit(taskId)
    },
    [openEdit],
  )

  const handleDelete = useCallback(
    (taskId: Parameters<typeof openDelete>[0]) => {
      openDelete(taskId)
    },
    [openDelete],
  )

  const persistMove = useCallback(
    (taskId: UniqueIdentifier, status: Task['status'], position: number) => {
      moveTaskMutation.mutate(
        {
          taskId: toBoardTaskId(taskId),
          input: { status, position },
        },
        {
          onSettled: () => {
            if (activeIdRef.current === null) {
              setDraggingColumns(null)
            }
          },
        },
      )
    },
    [moveTaskMutation],
  )

  const handleDragStart = useCallback(
    ({ active }: DragStartEvent) => {
      const originStatus = findBoardContainer(active.id, tasksByStatus)
      const originIndex = originStatus
        ? tasksByStatus[originStatus].findIndex((task) => task.id === String(active.id))
        : -1

      originRef.current =
        originStatus && originIndex >= 0 ? { status: originStatus, index: originIndex } : null
      lastOverId.current = null
      recentlyMovedToNewContainer.current = false
      columnsRef.current = tasksByStatus
      activeIdRef.current = active.id
      setDraggingColumns(tasksByStatus)
      setActiveId(active.id)
    },
    [tasksByStatus],
  )

  const handleDragOver = useCallback(({ active, over }: DragOverEvent) => {
    if (!over) {
      return
    }

    setDraggingColumns((current) => {
      const base = current ?? columnsRef.current
      const from = findBoardContainer(active.id, base)
      const to = findBoardContainer(over.id, base)

      if (!from || !to || from === to) {
        return current
      }

      const moving = base[from].find((task) => task.id === String(active.id))
      if (!moving) {
        return current
      }

      const fromColumn = base[from].filter((task) => task.id !== moving.id)
      const overIndex = base[to].findIndex((task) => task.id === String(over.id))
      const insertAt = isTaskStatus(over.id) || overIndex < 0 ? base[to].length : overIndex
      const toColumn = [
        ...base[to].slice(0, insertAt),
        { ...moving, status: to },
        ...base[to].slice(insertAt),
      ]

      const next = {
        ...base,
        [from]: fromColumn,
        [to]: toColumn,
      }
      columnsRef.current = next
      recentlyMovedToNewContainer.current = true
      requestAnimationFrame(() => {
        recentlyMovedToNewContainer.current = false
      })
      return next
    })
  }, [])

  const handleDragCancel = useCallback(() => {
    originRef.current = null
    activeIdRef.current = null
    lastOverId.current = null
    setActiveId(null)
    setDraggingColumns(null)
  }, [])

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      const origin = originRef.current
      const current = columnsRef.current

      originRef.current = null
      lastOverId.current = null
      activeIdRef.current = null
      setActiveId(null)

      if (!origin || !over) {
        setDraggingColumns(null)
        return
      }

      const target = getBoardMoveTarget(active.id, over.id, current, origin)
      if (!target) {
        setDraggingColumns(null)
        return
      }

      if (origin.status === target.status) {
        const fromIndex = current[target.status].findIndex((task) => task.id === String(active.id))

        if (fromIndex >= 0 && fromIndex !== target.position) {
          const next = {
            ...current,
            [target.status]: arrayMove(current[target.status], fromIndex, target.position),
          }
          columnsRef.current = next
          setDraggingColumns(next)
        }
      }

      persistMove(active.id, target.status, target.position)
    },
    [persistMove],
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <p id={BOARD_DND_INSTRUCTIONS_ID} className="sr-only">
        {BOARD_SCREEN_READER_INSTRUCTIONS.draggable}
      </p>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          error={error ?? null}
          onRetry={() => {
            enabledStatuses.forEach((status) => {
              void columnQueries[status].refetch()
            })
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
            accessibility={{
              announcements,
              screenReaderInstructions: BOARD_SCREEN_READER_INSTRUCTIONS,
            }}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex h-full min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-1 sm:gap-4 xl:overflow-x-hidden">
              {TASK_STATUSES.map((status) => {
                const query = columnQueries[status]
                const loaded = columns[status] ?? emptyTasksByStatus()[status]
                const totalCount = query.data?.pages[0]?.meta.total ?? loaded.length

                return (
                  <BoardColumn
                    key={status}
                    status={status}
                    tasks={loaded}
                    totalCount={totalCount}
                    hasNextPage={query.hasNextPage}
                    isFetchingNextPage={query.isFetchingNextPage}
                    isDropTarget={dropStatus === status}
                    onLoadMore={query.fetchNextPage}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAdd={() => openCreate(status)}
                  />
                )
              })}
            </div>

            <DragOverlay dropAnimation={null}>
              {activeTask ? (
                <div className="rotate-2 cursor-grabbing shadow-lg">
                  <TaskCard task={activeTask} onEdit={handleEdit} onDelete={handleDelete} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </QueryState>
      </div>
    </div>
  )
}

export default BoardView
