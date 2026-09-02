import { PencilIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { TaskId } from '@/shared/types/branded.ts'
import { cn } from '@/lib/utils'

type TaskActionButtonsProps = {
  taskId: TaskId
  onEdit: (taskId: TaskId) => void
  onDelete: (taskId: TaskId) => void
  className?: string
}

export function TaskActionButtons({ taskId, onEdit, onDelete, className }: TaskActionButtonsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Edit"
        className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onEdit(taskId)}
      >
        <PencilIcon className="size-3.5" />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Delete"
        className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={() => onDelete(taskId)}
      >
        <Trash2Icon className="size-3.5" />
      </Button>
    </div>
  )
}
