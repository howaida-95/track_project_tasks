import { LayoutGridIcon, PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks.ts'
import { selectSidebarOpen } from '@/app/store/slices/uiSlice.selectors.ts'
import { toggleSidebar } from '@/app/store/slices/uiSlice.ts'
import { paths } from '@/app/routes/paths.ts'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type AppSidebarProps = {
  className?: string
  onNavigate?: () => void
  /** Mobile drawer always shows labels; desktop respects collapsed state. */
  forceExpanded?: boolean
}

const NAV_ITEMS = [
  {
    to: paths.tasks,
    label: 'Tasks',
    icon: LayoutGridIcon,
    end: true,
  },
] as const

export function AppSidebar({ className, onNavigate, forceExpanded = false }: AppSidebarProps) {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector(selectSidebarOpen)
  const isExpanded = forceExpanded || sidebarOpen

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        isExpanded ? 'w-56' : 'w-[4.25rem]',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-sidebar-border',
          isExpanded ? 'justify-between px-3' : 'justify-center px-2',
        )}
      >
        <div className={cn('flex min-w-0 items-center gap-2.5', !isExpanded && 'justify-center')}>
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground shadow-sm"
            aria-hidden="true"
          >
            TW
          </span>
          {isExpanded ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Task Workspace</p>
              <p className="truncate text-xs text-muted-foreground">Kanban & list views</p>
            </div>
          ) : null}
        </div>
        {isExpanded && !forceExpanded ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Collapse sidebar"
            className="shrink-0 text-muted-foreground"
            onClick={() => dispatch(toggleSidebar())}
          >
            <PanelLeftCloseIcon className="size-4" />
          </Button>
        ) : null}
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-1 p-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isExpanded ? 'justify-start' : 'justify-center px-2',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {isExpanded ? <span>{label}</span> : <span className="sr-only">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {!isExpanded && !forceExpanded ? (
        <div className="border-t border-sidebar-border p-2">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Expand sidebar"
            className="mx-auto text-muted-foreground"
            onClick={() => dispatch(toggleSidebar())}
          >
            <PanelLeftOpenIcon className="size-4" />
          </Button>
        </div>
      ) : null}
    </aside>
  )
}
