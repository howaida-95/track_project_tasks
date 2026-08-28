import { PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TaskDialogsHost } from '@/features/tasks/components/TaskDialogsHost.tsx'
import { TaskViewSwitcher } from '@/features/tasks/components/TaskViewSwitcher.tsx'
import { FilterBar } from '@/features/tasks/filters/FilterBar.tsx'
import { useTaskDialogActions } from '@/features/tasks/hooks/useTaskDialogActions.ts'
import TasksView from '@/features/tasks/views/TasksView.tsx'

export function BoardLayout() {
  const { openCreate } = useTaskDialogActions()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <TaskViewSwitcher />
        <div className="flex items-center gap-2">
          <Button type="button" className="gap-2" onClick={() => openCreate('todo')}>
            <PlusIcon className="size-4" />
            New task
          </Button>
          <FilterBar />
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <TasksView />
      </div>

      <TaskDialogsHost />
    </div>
  )
}

export default BoardLayout
