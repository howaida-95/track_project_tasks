import type { InfiniteData, QueryClient, QueryKey } from '@tanstack/react-query'

import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import { BOARD_COLUMN_PAGE_SIZE } from '@/features/tasks/model/pagination.ts'
import {
  moveTaskInList,
  nextPositionForStatus,
  sortTasks,
} from '@/features/tasks/model/task.rules.ts'
import type {
  PaginatedTasks,
  Task,
  TaskListParams,
  UpdateTaskInput,
} from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import type { TaskStatus } from '@/shared/types/task-ui.ts'

export type CachedTaskList = PaginatedTasks | InfiniteData<PaginatedTasks>

export type ListSnapshot = Array<[readonly unknown[], CachedTaskList | undefined]>

export function isInfiniteTaskList(data: unknown): data is InfiniteData<PaginatedTasks> {
  return Boolean(
    data &&
    typeof data === 'object' &&
    'pages' in data &&
    Array.isArray((data as InfiniteData<PaginatedTasks>).pages),
  )
}

export function flattenTaskListData(data: CachedTaskList): Task[] {
  if (isInfiniteTaskList(data)) {
    return data.pages.flatMap((page) => page.data)
  }

  return data.data
}

export function replaceTaskListData(current: CachedTaskList, nextTasks: Task[]): CachedTaskList {
  if (isInfiniteTaskList(current)) {
    const limit = current.pages[0]?.meta.limit ?? BOARD_COLUMN_PAGE_SIZE
    const pages = current.pages.map((page, index) => {
      const start = index * limit
      const isLast = index === current.pages.length - 1

      return {
        ...page,
        data: isLast ? nextTasks.slice(start) : nextTasks.slice(start, start + limit),
      }
    })

    return { ...current, pages }
  }

  return {
    ...current,
    data: nextTasks,
  }
}

function listParamsFromKey(queryKey: QueryKey): TaskListParams {
  const params = queryKey[2]
  if (params && typeof params === 'object') {
    return params as TaskListParams
  }

  return {}
}

function columnStatusFromParams(params: TaskListParams): TaskStatus | undefined {
  if (params.status?.length === 1) {
    return params.status[0]
  }

  return undefined
}

function findTaskInCaches(queryClient: QueryClient, taskId: TaskId): Task | undefined {
  const entries = queryClient.getQueriesData<CachedTaskList>({ queryKey: taskKeys.lists() })

  for (const [, data] of entries) {
    if (!data) {
      continue
    }

    const match = flattenTaskListData(data).find((task) => task.id === taskId)
    if (match) {
      return match
    }
  }

  return undefined
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return items
  }

  const next = [...items]
  const [removed] = next.splice(fromIndex, 1)

  if (removed === undefined) {
    return items
  }

  next.splice(toIndex, 0, removed)
  return next
}

function reindexColumn(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.map((task, index) => {
    if (task.status === status && task.position === index) {
      return task
    }

    return {
      ...task,
      status,
      position: index,
    }
  })
}

function applyFieldPatch(task: Task, patch: UpdateTaskInput): Task {
  return {
    ...task,
    ...patch,
    description: patch.description ?? task.description,
    dueDate: patch.dueDate === undefined ? task.dueDate : patch.dueDate,
    status: task.status,
    position: task.position,
  }
}

function applyPatchToTasks(
  tasks: Task[],
  taskId: TaskId,
  patch: UpdateTaskInput,
  columnStatus: TaskStatus | undefined,
  sourceTask: Task | undefined,
): Task[] {
  const existing = tasks.find((task) => task.id === taskId)
  const nextStatus = patch.status ?? existing?.status ?? sourceTask?.status

  if (columnStatus) {
    if (existing && nextStatus && nextStatus !== columnStatus) {
      return reindexColumn(
        tasks.filter((task) => task.id !== taskId),
        columnStatus,
      )
    }

    if (!existing && nextStatus === columnStatus && sourceTask) {
      const toIndex = Math.max(0, Math.min(patch.position ?? tasks.length, tasks.length))
      const inserted: Task = {
        ...sourceTask,
        ...patch,
        description: patch.description ?? sourceTask.description,
        dueDate: patch.dueDate === undefined ? sourceTask.dueDate : patch.dueDate,
        status: columnStatus,
        position: toIndex,
      }

      return reindexColumn(
        [...tasks.slice(0, toIndex), inserted, ...tasks.slice(toIndex)],
        columnStatus,
      )
    }

    if (existing && nextStatus === columnStatus && patch.position !== undefined) {
      const fromIndex = tasks.findIndex((task) => task.id === taskId)
      const toIndex = Math.max(0, Math.min(patch.position, tasks.length - 1))
      const moved = reindexColumn(moveItem(tasks, fromIndex, toIndex), columnStatus)

      return moved.map((task) => (task.id === taskId ? applyFieldPatch(task, patch) : task))
    }

    if (existing) {
      return tasks.map((task) => (task.id === taskId ? applyFieldPatch(task, patch) : task))
    }

    return tasks
  }

  if (!existing) {
    return tasks
  }

  const statusChanged = Boolean(nextStatus && nextStatus !== existing.status)
  const positionChanged = patch.position !== undefined && patch.position !== existing.position
  const toIndex =
    patch.position ??
    (statusChanged && nextStatus ? nextPositionForStatus(tasks, nextStatus) : existing.position)

  const moved =
    nextStatus && (statusChanged || positionChanged)
      ? moveTaskInList(tasks, taskId, nextStatus, toIndex)
      : tasks

  return moved.map((task) => (task.id === taskId ? applyFieldPatch(task, patch) : task))
}

function adjustMetaTotal(current: CachedTaskList, delta: number): CachedTaskList {
  if (delta === 0) {
    return current
  }

  if (isInfiniteTaskList(current)) {
    return {
      ...current,
      pages: current.pages.map((page) => ({
        ...page,
        meta: {
          ...page.meta,
          total: Math.max(0, page.meta.total + delta),
        },
      })),
    }
  }

  return {
    ...current,
    meta: {
      ...current.meta,
      total: Math.max(0, current.meta.total + delta),
    },
  }
}

function writeListCache(
  queryClient: QueryClient,
  key: QueryKey,
  current: CachedTaskList,
  nextTasks: Task[],
) {
  const delta = nextTasks.length - flattenTaskListData(current).length
  queryClient.setQueryData(key, adjustMetaTotal(replaceTaskListData(current, nextTasks), delta))
}

export function applyTaskPatchInLists(
  queryClient: QueryClient,
  taskId: TaskId,
  patch: UpdateTaskInput,
) {
  const sourceTask = findTaskInCaches(queryClient, taskId)
  const entries = queryClient.getQueriesData<CachedTaskList>({ queryKey: taskKeys.lists() })

  for (const [key, current] of entries) {
    if (!current) {
      continue
    }

    const params = listParamsFromKey(key)
    const nextTasks = applyPatchToTasks(
      flattenTaskListData(current),
      taskId,
      patch,
      columnStatusFromParams(params),
      sourceTask,
    )

    writeListCache(queryClient, key, current, nextTasks)
  }
}

export function replaceTaskInLists(queryClient: QueryClient, taskId: TaskId, updatedTask: Task) {
  const entries = queryClient.getQueriesData<CachedTaskList>({ queryKey: taskKeys.lists() })

  for (const [key, current] of entries) {
    if (!current) {
      continue
    }

    const params = listParamsFromKey(key)
    const columnStatus = columnStatusFromParams(params)
    const tasks = flattenTaskListData(current)
    const index = tasks.findIndex((task) => task.id === taskId)

    if (index >= 0) {
      if (columnStatus && updatedTask.status !== columnStatus) {
        writeListCache(
          queryClient,
          key,
          current,
          reindexColumn(
            tasks.filter((task) => task.id !== taskId),
            columnStatus,
          ),
        )
        continue
      }

      const next = [...tasks]
      next[index] = updatedTask
      writeListCache(
        queryClient,
        key,
        current,
        columnStatus ? sortTasks(next, 'position', 'asc') : next,
      )
      continue
    }

    if (columnStatus === updatedTask.status) {
      const toIndex = Math.max(0, Math.min(updatedTask.position, tasks.length))
      writeListCache(queryClient, key, current, [
        ...tasks.slice(0, toIndex),
        updatedTask,
        ...tasks.slice(toIndex),
      ])
    }
  }
}

export function removeTaskFromLists(queryClient: QueryClient, taskId: TaskId) {
  const entries = queryClient.getQueriesData<CachedTaskList>({ queryKey: taskKeys.lists() })

  for (const [key, current] of entries) {
    if (!current) {
      continue
    }

    const params = listParamsFromKey(key)
    const columnStatus = columnStatusFromParams(params)
    const nextTasks = flattenTaskListData(current).filter((task) => task.id !== taskId)

    writeListCache(
      queryClient,
      key,
      current,
      columnStatus ? reindexColumn(nextTasks, columnStatus) : nextTasks,
    )
  }
}
