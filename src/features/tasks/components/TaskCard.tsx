import { memo } from 'react'

import { Button } from '@/components/ui/button'
import { TaskPriorityBadge } from '@/shared/components/badges/task-priority-badge.tsx'
import { TaskStatusBadge } from '@/shared/components/badges/task-status-badge.tsx'
import type { Task } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'

type TaskCardProps = {
  task: Task
  onEdit: (taskId: TaskId) => void
  onDelete: (taskId: TaskId) => void
}

export const TaskCard = memo(function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  return (
    <article className="rounded-card border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h3 className="truncate text-sm font-semibold">{task.title}</h3>
          {task.description ? (
            <p className="line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
          </div>
          {task.dueDate ? (
            <p className="text-xs text-muted-foreground">Due {task.dueDate}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onEdit(task.id)}>
          Edit
        </Button>
        <Button type="button" size="sm" variant="destructive" onClick={() => onDelete(task.id)}>
          Delete
        </Button>
      </div>
    </article>
  )
})
