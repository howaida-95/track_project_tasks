import type { Task } from '@/features/tasks/model/types.ts'
import { createTaskId, type TaskId } from '@/shared/types/branded.ts'
import type { TaskPriority, TaskStatus } from '@/shared/types/task-ui.ts'

type MakeTaskOverrides = Partial<Omit<Task, 'id'>> & { id?: TaskId }

export function makeTask(overrides: MakeTaskOverrides = {}): Task {
  const now = new Date().toISOString()

  return {
    id: overrides.id ?? createTaskId(),
    title: overrides.title ?? 'Sample task',
    description: overrides.description ?? 'Task description for tests.',
    status: overrides.status ?? 'todo',
    priority: overrides.priority ?? 'medium',
    dueDate: overrides.dueDate ?? null,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
    tags: overrides.tags ?? ['test'],
    position: overrides.position ?? 0,
  }
}

export type { TaskStatus, TaskPriority }
