import { LayoutGridIcon, ListIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useTaskFilters } from '@/features/tasks/filters/useTaskFilters.ts'
import type { TaskView } from '@/features/tasks/filters/task-view.ts'
import { cn } from '@/lib/utils'

const VIEW_OPTIONS: Array<{ value: TaskView; label: string; icon: typeof LayoutGridIcon }> = [
  { value: 'board', label: 'Board view', icon: LayoutGridIcon },
  { value: 'list', label: 'List view', icon: ListIcon },
]

export function TaskViewSwitcher() {
  const { view, setView } = useTaskFilters()

  return (
    <div
      role="group"
      aria-label="Task view"
      className="inline-flex rounded-lg border border-border/70 bg-muted/50 p-1 shadow-sm"
    >
      {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => {
        const isActive = view === value

        return (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={isActive ? 'default' : 'ghost'}
            aria-pressed={isActive}
            aria-label={label}
            className={cn('gap-2', !isActive && 'text-muted-foreground')}
            onClick={() => {
              setView(value)
            }}
          >
            <Icon className="size-4" />
            <span className="sr-only xl:not-sr-only">{value === 'board' ? 'Board' : 'List'}</span>
          </Button>
        )
      })}
    </div>
  )
}

export default TaskViewSwitcher
