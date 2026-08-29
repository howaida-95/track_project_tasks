import { Suspense, useState } from 'react'

import { LazyTaskDialogsHost } from '@/app/routes/lazy-routes.ts'
import { RouteFallback } from '@/app/routes/RouteFallback.tsx'
import { useAppSelector } from '@/app/store/hooks.ts'
import { selectIsDialogOpen } from '@/app/store/slices/dialogSlice.selectors.ts'

export function TaskDialogsGate() {
  const isDialogOpen = useAppSelector(selectIsDialogOpen)
  const [shouldLoad, setShouldLoad] = useState(isDialogOpen)

  if (isDialogOpen && !shouldLoad) {
    setShouldLoad(true)
  }

  if (!shouldLoad) {
    return null
  }

  return (
    <Suspense fallback={<RouteFallback />}>
      <LazyTaskDialogsHost />
    </Suspense>
  )
}
