import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TaskDialogsGate } from '@/features/tasks/components/TaskDialogsGate.tsx'
import { TaskViewSwitcher } from '@/features/tasks/components/TaskViewSwitcher.tsx'
import { FilterBar } from '@/features/tasks/filters/FilterBar.tsx'
import { useTaskFilters } from '@/features/tasks/filters/useTaskFilters.ts'
import { useTaskDialogActions } from '@/features/tasks/hooks/useTaskDialogActions.ts'
import TasksView from '@/features/tasks/views/TasksView.tsx'

export function BoardLayout() {
  const { openCreate } = useTaskDialogActions()
  const { view } = useTaskFilters()

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
      <header className="mb-4 flex shrink-0 flex-col gap-3 sm:mb-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:block">
            Workspace
          </p>
          <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {view === 'board' ? 'Task Board' : 'Task List'}
          </h1>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <TaskViewSwitcher />
          <Button type="button" className="gap-2 shadow-sm" onClick={() => openCreate('todo')}>
            <PlusIcon className="size-4" />
            New task
          </Button>
          <FilterBar />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/50 p-2 shadow-sm backdrop-blur-sm sm:p-3 xl:p-4">
        <TasksView />
      </div>

      <TaskDialogsGate />
    </div>
  )
}

export default BoardLayout
