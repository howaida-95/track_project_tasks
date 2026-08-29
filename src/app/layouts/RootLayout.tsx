import { useState } from 'react'
import { MenuIcon } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/app/layouts/AppSidebar.tsx'
import { RoutePanelBoundary } from '@/app/layouts/RoutePanelBoundary.tsx'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
import { OfflineBanner } from '@/shared/components/OfflineBanner.tsx'

export function RootLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <OfflineBanner />

      <div className="flex min-h-0 flex-1">
        <div className="hidden xl:flex">
          <AppSidebar />
        </div>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-72 max-w-[85vw] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
              <SheetDescription>App sections and views</SheetDescription>
            </SheetHeader>
            <AppSidebar
              className="w-full border-0"
              forceExpanded
              onNavigate={() => setMobileNavOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-sm xl:hidden">
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
            >
              <MenuIcon className="size-4" />
            </Button>
            <p className="truncate text-sm font-semibold">Task Workspace</p>
          </header>

          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[color-mix(in_oklch,var(--background),var(--muted)_35%)] p-3 sm:p-4 xl:p-6"
          >
            <RoutePanelBoundary>
              <Outlet />
            </RoutePanelBoundary>
          </main>
        </div>
      </div>
    </div>
  )
}

export default RootLayout
