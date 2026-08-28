import type { TaskListParams } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params: TaskListParams = {}) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (taskId: TaskId) => [...taskKeys.details(), taskId] as const,
}
