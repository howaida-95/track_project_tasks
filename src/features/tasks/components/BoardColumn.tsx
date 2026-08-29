import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { SortableTaskCard } from '@/features/tasks/components/SortableTaskCard.tsx'
import type { Task } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import { TASK_STATUS_LABELS, type TaskStatus } from '@/shared/types/task-ui.ts'
import { cn } from '@/lib/utils'

type BoardColumnProps = {
  status: TaskStatus
  tasks: Task[]
  isDropTarget?: boolean
  onEdit: (taskId: TaskId) => void
  onDelete: (taskId: TaskId) => void
  onAdd: () => void
}

export function BoardColumn({
  status,
  tasks,
  isDropTarget = false,
  onEdit,
  onDelete,
  onAdd,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const itemIds = useMemo(() => tasks.map((task) => task.id), [tasks])
  const showDropHighlight = isDropTarget || isOver

  return (
    <section
      ref={setNodeRef}
      data-column-status={status}
      data-drop-target={showDropHighlight ? 'true' : undefined}
      aria-labelledby={`column-${status}`}
      className={cn(
        'flex h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden rounded-card border p-3 transition-colors md:w-auto md:min-w-0 md:flex-1',
        showDropHighlight
          ? 'border-ring/60 bg-accent/70 shadow-inner'
          : 'border-border bg-muted/20',
      )}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <h2
          id={`column-${status}`}
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {TASK_STATUS_LABELS[status]}
        </h2>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>

      <SortableContext id={status} items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          role="list"
          aria-labelledby={`column-${status}`}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md pr-1 transition-colors',
            showDropHighlight && 'bg-foreground/5',
          )}
        >
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} role="listitem">
                <SortableTaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
              </div>
            ))}
          </div>
        </div>
      </SortableContext>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3 w-full shrink-0"
        onClick={onAdd}
      >
        Add task
      </Button>
    </section>
  )
}
