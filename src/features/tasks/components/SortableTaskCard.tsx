import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVerticalIcon } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { BOARD_DND_INSTRUCTIONS_ID } from '@/features/tasks/board/board-dnd.ts'
import { TaskCard } from '@/features/tasks/components/TaskCard.tsx'
import type { Task } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import { cn } from '@/lib/utils'

type SortableTaskCardProps = {
  task: Task
  onEdit: (taskId: TaskId) => void
  onDelete: (taskId: TaskId) => void
}

export function SortableTaskCard({ task, onEdit, onDelete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    animateLayoutChanges: () => false,
  })

  return (
    <div
      ref={setNodeRef}
      data-task-id={task.id}
      data-card-index={task.position}
      className={cn(
        isDragging && 'rounded-card bg-foreground/10 ring-1 ring-inset ring-foreground/10',
      )}
      style={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
      }}
    >
      <div className={cn(isDragging && 'invisible')}>
        <TaskCard
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          dragHandle={
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'size-8 shrink-0 cursor-grab touch-none active:cursor-grabbing',
              )}
              {...attributes}
              {...listeners}
              ref={setActivatorNodeRef}
              aria-label={`Move ${task.title}`}
              aria-describedby={BOARD_DND_INSTRUCTIONS_ID}
            >
              <GripVerticalIcon className="size-4" />
            </button>
          }
        />
      </div>
    </div>
  )
}
