import { Suspense } from 'react'

import { RouteFallback } from '@/app/routes/RouteFallback.tsx'
import { LazyBoardView, LazyListView } from '@/app/routes/lazy-routes.ts'
import { useTaskFilters } from '@/features/tasks/filters/useTaskFilters.ts'

export function TasksView() {
  const { view } = useTaskFilters()
  const View = view === 'list' ? LazyListView : LazyBoardView

  return (
    <Suspense fallback={<RouteFallback />}>
      <View />
    </Suspense>
  )
}

export default TasksView
