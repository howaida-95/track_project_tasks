import { Suspense } from 'react'

import { RouteFallback } from '@/app/routes/RouteFallback.tsx'
import { LazyListView } from '@/app/routes/lazy-routes.ts'
import { useTaskFilters } from '@/features/tasks/filters/useTaskFilters.ts'
import BoardView from '@/features/tasks/views/BoardView.tsx'

export function TasksView() {
  const { view } = useTaskFilters()

  if (view === 'list') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <LazyListView />
      </Suspense>
    )
  }

  return <BoardView />
}

export default TasksView
