import { cva, type VariantProps } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'
import { TASK_STATUS_LABELS, type TaskStatus } from '@/shared/types/task-ui.ts'
import { cn } from '@/lib/utils'

const taskStatusBadgeVariants = cva('border-transparent font-medium', {
  variants: {
    status: {
      todo: 'bg-status-todo/20 text-foreground',
      in_progress: 'bg-status-in-progress/20 text-foreground',
      in_review: 'bg-status-in-review/20 text-foreground',
      done: 'bg-status-done/20 text-foreground',
    },
  },
  defaultVariants: {
    status: 'todo',
  },
})

type TaskStatusBadgeProps = {
  status: TaskStatus
  className?: string
} & VariantProps<typeof taskStatusBadgeVariants>

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(taskStatusBadgeVariants({ status }), className)}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  )
}
