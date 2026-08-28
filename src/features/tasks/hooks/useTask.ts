import { useQuery } from '@tanstack/react-query'

import { getTask } from '@/features/tasks/api/task.api.ts'
import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import type { TaskId } from '@/shared/types/branded.ts'

export function useTask(taskId: TaskId | null) {
  return useQuery({
    queryKey: taskId ? taskKeys.detail(taskId) : taskKeys.details(),
    queryFn: ({ signal }) => {
      if (!taskId) {
        throw new Error('Task id is required')
      }

      return getTask(taskId, { signal })
    },
    enabled: taskId !== null,
  })
}
