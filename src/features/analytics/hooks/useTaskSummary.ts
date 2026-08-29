import { useQuery } from '@tanstack/react-query'

import { getTaskStats } from '@/features/tasks/api/task.api.ts'
import { taskKeys } from '@/features/tasks/api/task.keys.ts'

export function useTaskSummary() {
  return useQuery({
    queryKey: taskKeys.stats(),
    queryFn: ({ signal }) => getTaskStats({ signal }),
  })
}
