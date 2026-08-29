import { useInfiniteQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { listTasks } from '@/features/tasks/api/task.api.ts'
import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import { isBoardColumnEnabled, toBoardColumnParams } from '@/features/tasks/model/pagination.ts'
import type { TaskListParams } from '@/features/tasks/model/types.ts'
import type { TaskStatus } from '@/shared/types/task-ui.ts'

export function useColumnTasks(status: TaskStatus, listParams: TaskListParams) {
  const enabled = isBoardColumnEnabled(listParams, status)
  const params = useMemo(() => toBoardColumnParams(listParams, status), [listParams, status])

  const query = useInfiniteQuery({
    queryKey: taskKeys.list(params),
    queryFn: ({ pageParam, signal }) => listTasks({ ...params, page: pageParam }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.meta
      if (totalPages === 0 || page >= totalPages) {
        return undefined
      }

      return page + 1
    },
    enabled,
  })

  // Disabled columns keep their last cache; hide it so status filters apply immediately.
  if (enabled) {
    return query
  }

  return {
    ...query,
    data: undefined,
    hasNextPage: false,
    isFetchingNextPage: false,
  }
}
