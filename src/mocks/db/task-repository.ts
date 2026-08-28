import { CreateTaskSchema, UpdateTaskSchema } from '@/features/tasks/model/schemas.ts'
import { queryTasks } from '@/features/tasks/model/task.rules.ts'
import type {
  CreateTaskInput,
  PaginatedTasks,
  Task,
  TaskListParams,
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

  withTasks(storage, (tasks) =>
    tasks.map((task) => {
      if (task.id !== id) {
        return task
      }

      const nextTask: Task = {
        id: task.id,
        title: payload.title ?? task.title,
        description: payload.description ?? task.description,
        status: payload.status ?? task.status,
        priority: payload.priority ?? task.priority,
        dueDate: payload.dueDate === undefined ? task.dueDate : payload.dueDate,
        tags: payload.tags ?? task.tags,
        createdAt: task.createdAt,
        updatedAt: new Date().toISOString(),
      }

      updated = nextTask
      return nextTask
    }),
  )

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

export { resetTaskStore, replaceTaskStore, readTaskStore }
