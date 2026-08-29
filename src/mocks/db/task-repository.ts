import { CreateTaskSchema, UpdateTaskSchema } from '@/features/tasks/model/schemas.ts'
import {
  moveTaskInList,
  nextPositionForStatus,
  queryTasks,
  summarizeTasks,
} from '@/features/tasks/model/task.rules.ts'
import type {
  CreateTaskInput,
  PaginatedTasks,
  Task,
  TaskListParams,
  TaskStats,
  UpdateTaskInput,
} from '@/features/tasks/model/types.ts'
import {
  readTaskStore,
  replaceTaskStore,
  resetTaskStore,
  writeTaskStore,
  type TaskStoreSnapshot,
} from '@/mocks/db/task-store.ts'
import { createTaskId, type TaskId } from '@/shared/types/branded.ts'

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function withTasks(storage: StorageLike, updater: (tasks: Task[]) => Task[]): TaskStoreSnapshot {
  const snapshot = readTaskStore(storage as Storage)
  const nextTasks = updater(snapshot.tasks)
  const nextSnapshot = { ...snapshot, tasks: nextTasks }
  writeTaskStore(nextSnapshot, storage as Storage)
  return nextSnapshot
}

export function listStoredTasks(
  params: TaskListParams,
  storage: StorageLike = localStorage,
): PaginatedTasks {
  const snapshot = readTaskStore(storage as Storage)
  return queryTasks(snapshot.tasks, params)
}

export function getStoredTask(id: TaskId, storage: StorageLike = localStorage): Task | null {
  const snapshot = readTaskStore(storage as Storage)
  return snapshot.tasks.find((task) => task.id === id) ?? null
}

export function createStoredTask(
  input: CreateTaskInput,
  storage: StorageLike = localStorage,
): Task {
  const payload = CreateTaskSchema.parse(input)
  const now = new Date().toISOString()
  const snapshot = readTaskStore(storage as Storage)
  const position = payload.position ?? nextPositionForStatus(snapshot.tasks, payload.status)

  const task: Task = {
    id: createTaskId(),
    title: payload.title,
    description: payload.description ?? '',
    status: payload.status,
    priority: payload.priority,
    dueDate: payload.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
    tags: payload.tags ?? [],
    position,
  }

  withTasks(storage, (tasks) => [task, ...tasks])
  return task
}

export function updateStoredTask(
  id: TaskId,
  input: UpdateTaskInput,
  storage: StorageLike = localStorage,
): Task | null {
  const payload = UpdateTaskSchema.parse(input)
  let updated: Task | null = null

  withTasks(storage, (tasks) => {
    const current = tasks.find((task) => task.id === id)

    if (!current) {
      return tasks
    }

    const patched: Task = {
      id: current.id,
      title: payload.title ?? current.title,
      description: payload.description ?? current.description,
      status: payload.status ?? current.status,
      priority: payload.priority ?? current.priority,
      dueDate: payload.dueDate === undefined ? current.dueDate : payload.dueDate,
      tags: payload.tags ?? current.tags,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
      position: current.position,
    }

    const statusChanged = patched.status !== current.status
    const positionChanged = payload.position !== undefined && payload.position !== current.position

    if (!statusChanged && !positionChanged) {
      updated = patched
      return tasks.map((task) => (task.id === id ? patched : task))
    }

    const toIndex =
      payload.position ??
      (statusChanged ? nextPositionForStatus(tasks, patched.status) : current.position)
    const moved = moveTaskInList(tasks, id, patched.status, toIndex)

    return moved.map((task) => {
      if (task.id !== id) {
        return task
      }

      const nextTask: Task = {
        ...patched,
        status: task.status,
        position: task.position,
      }
      updated = nextTask
      return nextTask
    })
  })

  return updated
}

export function deleteStoredTask(id: TaskId, storage: StorageLike = localStorage): boolean {
  let removed = false

  withTasks(storage, (tasks) => {
    const nextTasks = tasks.filter((task) => {
      if (task.id === id) {
        removed = true
        return false
      }

      return true
    })

    return nextTasks
  })

  return removed
}

export function getStoredTaskCount(storage: StorageLike = localStorage): number {
  return readTaskStore(storage as Storage).tasks.length
}

export function getStoredTaskStats(storage: StorageLike = localStorage): TaskStats {
  return summarizeTasks(readTaskStore(storage as Storage).tasks)
}

export { resetTaskStore, replaceTaskStore, readTaskStore }
