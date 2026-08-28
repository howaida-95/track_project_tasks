import { cva, type VariantProps } from 'class-variance-authority'

import { Badge } from '@/components/ui/badge'
import { TASK_PRIORITY_LABELS, type TaskPriority } from '@/shared/types/task-ui.ts'
import { cn } from '@/lib/utils'

const taskPriorityBadgeVariants = cva('border-transparent font-medium', {
  variants: {
    priority: {
      low: 'bg-priority-low/20 text-foreground',
      medium: 'bg-priority-medium/20 text-foreground',
      high: 'bg-priority-high/20 text-foreground',
      urgent: 'bg-priority-urgent/20 text-foreground',
    },
  },
  defaultVariants: {
    priority: 'medium',
  },
})

type TaskPriorityBadgeProps = {
  priority: TaskPriority
  className?: string
} & VariantProps<typeof taskPriorityBadgeVariants>

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  return (
    <Badge variant="outline" className={cn(taskPriorityBadgeVariants({ priority }), className)}>
      {TASK_PRIORITY_LABELS[priority]}
    </Badge>
  )
}
