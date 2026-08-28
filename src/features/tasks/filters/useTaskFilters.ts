import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
  buildTaskSearchParams,
  getDefaultTaskListParams,
  mergeTaskListParams,
  parseTaskListParams,
  type TaskView,
} from '@/features/tasks/filters/parse-task-filters.ts'
import { parseTaskView } from '@/features/tasks/filters/task-view.ts'
import type { TaskListParams } from '@/features/tasks/model/types.ts'

export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const listParams = useMemo(() => parseTaskListParams(searchParams), [searchParams])
  const view = useMemo(() => parseTaskView(searchParams), [searchParams])

  const setListParams = useCallback(
    (patch: Partial<TaskListParams>) => {
      const next = mergeTaskListParams(listParams, patch)
      setSearchParams(buildTaskSearchParams(next, view), { replace: true })
    },
    [listParams, setSearchParams, view],
  )

  const setView = useCallback(
    (nextView: TaskView) => {
      setSearchParams(buildTaskSearchParams(listParams, nextView), { replace: true })
    },
    [listParams, setSearchParams],
  )

  const resetFilters = useCallback(() => {
    setSearchParams(buildTaskSearchParams(getDefaultTaskListParams(), view), { replace: true })
  }, [setSearchParams, view])

  return {
    listParams,
    view,
    setListParams,
    setView,
    resetFilters,
  }
}
