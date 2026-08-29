import { Outlet } from 'react-router-dom'

import { RoutePanelBoundary } from '@/app/layouts/RoutePanelBoundary.tsx'
import { OfflineBanner } from '@/shared/components/OfflineBanner.tsx'

export function RootLayout() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <OfflineBanner />

      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span
              className="flex size-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white"
              aria-hidden="true"
            >
              TW
            </span>
            <p className="text-sm font-semibold">Task Workspace</p>
          </div>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-4 py-6 sm:px-6"
      >
        <RoutePanelBoundary>
          <Outlet />
        </RoutePanelBoundary>
      </main>
    </div>
  )
}

export default RootLayout
