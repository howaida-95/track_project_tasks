import { Suspense } from 'react'

import { RouteFallback } from '@/app/routes/RouteFallback.tsx'
import { LazyAnalyticsView } from '@/app/routes/lazy-routes.ts'

export function AnalyticsLayout() {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
      <header className="mb-4 shrink-0 space-y-1 sm:mb-5">
        <p className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:block">
          Workspace
        </p>
        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Analytics
        </h1>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/50 p-2 shadow-sm backdrop-blur-sm sm:p-3 xl:p-4">
        <Suspense fallback={<RouteFallback />}>
          <LazyAnalyticsView />
        </Suspense>
      </div>
    </div>
  )
}

export default AnalyticsLayout
