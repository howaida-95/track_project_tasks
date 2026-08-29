import { DEFAULT_PAGE_SIZE } from '@/features/tasks/model/pagination.ts'
import type {
  PaginatedTasks,
  PaginationParams,
  Task,
  TaskFilters,
  TaskListParams,
  TaskSortField,
  TaskStats,
} from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from '@/shared/types/task-ui.ts'

export type TasksByStatus = Record<TaskStatus, Task[]>

const PRIORITY_RANK: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
}

function compareStrings(a: string, b: string, order: 'asc' | 'desc'): number {
  const result = a.localeCompare(b, undefined, { sensitivity: 'base' })
  return order === 'asc' ? result : -result
}

function compareNullableDates(a: string | null, b: string | null, order: 'asc' | 'desc'): number {
  if (a === null && b === null) {
    return 0
  }

  if (a === null) {
    return order === 'asc' ? 1 : -1
  }

  if (b === null) {
    return order === 'asc' ? -1 : 1
  }

  const result = a.localeCompare(b)
  return order === 'asc' ? result : -result
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const query = filters.q?.trim().toLowerCase()

  return tasks.filter((task) => {
    if (query) {
      const haystack = `${task.title} ${task.description} ${task.tags.join(' ')}`.toLowerCase()
      if (!haystack.includes(query)) {
        return false
      }
    }

    if (filters.status?.length && !filters.status.includes(task.status)) {
      return false
    }

    if (filters.priority?.length && !filters.priority.includes(task.priority)) {
      return false
    }

    if (filters.from || filters.to) {
      if (!task.dueDate) {
        return false
      }

      if (filters.from && task.dueDate < filters.from) {
        return false
      }

      if (filters.to && task.dueDate > filters.to) {
        return false
      }
    }

    return true
  })
}

export function sortTasks(
  tasks: Task[],
  sort: TaskSortField = 'createdAt',
  order: 'asc' | 'desc' = 'desc',
): Task[] {
  const sorted = [...tasks]

  sorted.sort((left, right) => {
    switch (sort) {
      case 'title':
        return compareStrings(left.title, right.title, order)
      case 'dueDate':
        return compareNullableDates(left.dueDate, right.dueDate, order)
      case 'priority':
        return order === 'asc'
          ? PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority]
          : PRIORITY_RANK[right.priority] - PRIORITY_RANK[left.priority]
      case 'updatedAt':
        return compareStrings(left.updatedAt, right.updatedAt, order)
      case 'position': {
        const byPosition =
          order === 'asc' ? left.position - right.position : right.position - left.position
        if (byPosition !== 0) {
          return byPosition
        }
        return compareStrings(left.createdAt, right.createdAt, 'asc')
      }
      case 'createdAt':
      default:
        return compareStrings(left.createdAt, right.createdAt, order)
    }
  })

  return sorted
}

export function paginateTasks(
  tasks: Task[],
  { page = 1, limit = DEFAULT_PAGE_SIZE }: PaginationParams,
): PaginatedTasks {
  const total = tasks.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)
  const safePage = totalPages === 0 ? 1 : Math.min(page, totalPages)
  const start = (safePage - 1) * limit

  return {
    data: tasks.slice(start, start + limit),
    meta: {
      total,
      page: safePage,
      limit,
      totalPages,
    },
  }
}

export function queryTasks(tasks: Task[], params: TaskListParams): PaginatedTasks {
  const filtered = filterTasks(tasks, params)
  const sorted = sortTasks(filtered, params.sort, params.order)
  return paginateTasks(sorted, params)
}

export function emptyTasksByStatus(): TasksByStatus {
  return {
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
  }
}

function emptyCountRecord<T extends string>(keys: readonly T[]): Record<T, number> {
  return Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>
}

export function summarizeTasks(tasks: Task[]): TaskStats {
  const byStatus = emptyCountRecord(TASK_STATUSES)
  const byPriority = emptyCountRecord(TASK_PRIORITIES)

  for (const task of tasks) {
    byStatus[task.status] += 1
    byPriority[task.priority] += 1
  }

  return {
    total: tasks.length,
    byStatus,
    byPriority,
  }
}

export function groupTasksByStatus(tasks: Task[]): TasksByStatus {
  const groups = emptyTasksByStatus()

  for (const task of tasks) {
    groups[task.status].push(task)
  }

  for (const status of TASK_STATUSES) {
    groups[status] = sortTasks(groups[status], 'position', 'asc')
  }

  return groups
}

export function nextPositionForStatus(tasks: Task[], status: TaskStatus): number {
  return tasks.reduce((maxPosition, task) => {
    if (task.status !== status) {
      return maxPosition
    }

    return Math.max(maxPosition, task.position + 1)
  }, 0)
}

function reindexColumn(column: Task[], status: TaskStatus): Task[] {
  return column.map((task, index) => {
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

export function moveTaskInList(
  tasks: Task[],
  taskId: TaskId,
  toStatus: TaskStatus,
  toIndex: number,
): Task[] {
  const task = tasks.find((candidate) => candidate.id === taskId)

  if (!task) {
    return tasks
  }

  const groups = groupTasksByStatus(tasks)
  const fromStatus = task.status
  const fromColumn = groups[fromStatus].filter((candidate) => candidate.id !== taskId)
  const destinationColumn = fromStatus === toStatus ? fromColumn : groups[toStatus]
  const clampedIndex = Math.max(0, Math.min(toIndex, destinationColumn.length))
  const nextDestination = [
    ...destinationColumn.slice(0, clampedIndex),
    task,
    ...destinationColumn.slice(clampedIndex),
  ]

  const nextGroups: TasksByStatus = {
    ...groups,
    [fromStatus]:
      fromStatus === toStatus
        ? reindexColumn(nextDestination, toStatus)
        : reindexColumn(fromColumn, fromStatus),
    [toStatus]: reindexColumn(nextDestination, toStatus),
  }

  const updatedById = new Map<TaskId, Task>()

  for (const status of TASK_STATUSES) {
    for (const columnTask of nextGroups[status]) {
      updatedById.set(columnTask.id, columnTask)
    }
  }

  return tasks.map((candidate) => updatedById.get(candidate.id) ?? candidate)
}
