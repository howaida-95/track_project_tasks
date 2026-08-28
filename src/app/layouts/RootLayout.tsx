import { NavLink, Outlet } from 'react-router-dom'

import { paths } from '@/app/routes/paths.ts'
import { cn } from '@/lib/utils'

const navItems = [
  { to: paths.board, label: 'Board' },
  { to: paths.list, label: 'List' },
] as const

export function RootLayout() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

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

      <nav className="border-b border-border bg-background" aria-label="Primary navigation">
        <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'inline-flex h-10 items-center border-b-2 px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-brand-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-6"
      >
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
