import { useQuery } from '@tanstack/react-query'

import { listTasks } from '@/features/tasks/api/task.api.ts'
import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import type { TaskListParams } from '@/features/tasks/model/types.ts'

export function useTasks(params: TaskListParams = {}) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: ({ signal }) => listTasks(params, { signal }),
  })
}
