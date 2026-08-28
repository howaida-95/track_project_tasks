import { Navigate, useLocation } from 'react-router-dom'

import { paths } from '@/app/routes/paths.ts'
import {
  buildTaskSearchParams,
  parseTaskListParams,
} from '@/features/tasks/filters/parse-task-filters.ts'
import type { TaskView } from '@/features/tasks/filters/task-view.ts'

type LegacyTasksRedirectProps = {
  view?: TaskView
}

export function LegacyTasksRedirect({ view }: LegacyTasksRedirectProps) {
  const location = useLocation()
  const listParams = parseTaskListParams(new URLSearchParams(location.search))

  return (
    <Navigate
      to={{
        pathname: paths.tasks,
        search: buildTaskSearchParams(listParams, view ?? 'board').toString(),
      }}
      replace
    />
  )
}
