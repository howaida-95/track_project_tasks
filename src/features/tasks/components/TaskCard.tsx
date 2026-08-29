import { memo, type CSSProperties, type ReactNode } from 'react'

import { TaskPriorityBadge } from '@/shared/components/badges/task-priority-badge.tsx'
import { TaskStatusBadge } from '@/shared/components/badges/task-status-badge.tsx'
import { TaskActionButtons } from '@/shared/components/TaskActionButtons.tsx'
import type { Task } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import { cn } from '@/lib/utils'

type TaskCardProps = {
  task: Task
  onEdit: (taskId: TaskId) => void
  onDelete: (taskId: TaskId) => void
  dragHandle?: ReactNode
  style?: CSSProperties
  isDragging?: boolean
}

export const TaskCard = memo(function TaskCard({
  task,
  onEdit,
  onDelete,
  dragHandle,
  style,
  isDragging = false,
}: TaskCardProps) {
  return (
    <article
      className={cn(
        'group rounded-card border border-border/80 bg-card p-3.5 shadow-card transition-shadow hover:border-border hover:shadow-md',
        isDragging && 'opacity-60 shadow-lg ring-2 ring-primary/20',
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold leading-snug text-foreground">
              {task.title}
            </h3>
            <TaskActionButtons
              taskId={task.id}
              onEdit={onEdit}
              onDelete={onDelete}
              className="-mr-1 -mt-1 shrink-0 opacity-100 xl:opacity-0 xl:transition-opacity xl:group-hover:opacity-100 xl:focus-within:opacity-100"
            />
          </div>
          {task.description ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {task.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-1.5">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
          {task.dueDate ? (
            <p className="text-xs text-muted-foreground">Due {task.dueDate}</p>
          ) : null}
        </div>
        {dragHandle}
      </div>
    </article>
  )
})
