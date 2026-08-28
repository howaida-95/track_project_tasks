import { TaskSchema } from '@/features/tasks/model/schemas.ts'
import type { Task } from '@/features/tasks/model/types.ts'
import { generateSeedTasks, SEED_TASK_COUNT, SEED_VERSION } from '@/mocks/seed/generate-tasks.ts'

export const TASK_STORE_KEY = 'tw-task-store-v1'

type TaskStoreSnapshot = {
  version: typeof SEED_VERSION
  seededAt: string
  tasks: Task[]
}

function parseSnapshot(raw: string | null): TaskStoreSnapshot | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as TaskStoreSnapshot

    if (parsed.version !== SEED_VERSION || !Array.isArray(parsed.tasks)) {
      return null
    }

    parsed.tasks.forEach((task) => {
      TaskSchema.parse(task)
    })

    return parsed
  } catch {
    return null
  }
}

export function createSeedSnapshot(tasks = generateSeedTasks(SEED_TASK_COUNT)): TaskStoreSnapshot {
  return {
    version: SEED_VERSION,
    seededAt: new Date().toISOString(),
    tasks,
  }
}

export function readTaskStore(storage: Storage = localStorage): TaskStoreSnapshot {
  const existing = parseSnapshot(storage.getItem(TASK_STORE_KEY))

  if (existing) {
    return existing
  }

  const seeded = createSeedSnapshot()
  storage.setItem(TASK_STORE_KEY, JSON.stringify(seeded))
  return seeded
}

export function writeTaskStore(snapshot: TaskStoreSnapshot, storage: Storage = localStorage): void {
  storage.setItem(TASK_STORE_KEY, JSON.stringify(snapshot))
}

export function resetTaskStore(storage: Storage = localStorage): TaskStoreSnapshot {
  storage.removeItem(TASK_STORE_KEY)
  return readTaskStore(storage)
}

export function replaceTaskStore(
  tasks: Task[],
  storage: Storage = localStorage,
): TaskStoreSnapshot {
  const snapshot = createSeedSnapshot(tasks)
  writeTaskStore(snapshot, storage)
  return snapshot
}

export type { TaskStoreSnapshot }
