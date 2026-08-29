import { PencilIcon, PlusIcon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskForm } from '@/features/tasks/components/TaskForm.tsx'
import type { TaskFormValues } from '@/features/tasks/model/schemas.ts'
import type { Task } from '@/features/tasks/model/types.ts'

type TaskDialogProps = {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task
  formDefaults?: Partial<TaskFormValues>
  isSubmitting?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: TaskFormValues) => void | Promise<void>
}

export function TaskDialog({
  open,
  mode,
  task,
  formDefaults,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: TaskDialogProps) {
  const title = mode === 'create' ? 'Create task' : 'Edit task'
  const description =
    mode === 'create'
      ? 'Add a new task to the workspace.'
      : 'Update task details and save your changes.'
  const Icon = mode === 'create' ? PlusIcon : PencilIcon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[min(90dvh,40rem)] max-w-lg gap-0 overflow-y-auto p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border/70 bg-muted/40 px-5 py-4">
          <div className="flex items-start gap-3 pr-8">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="px-5 py-5">
          <TaskForm
            key={task?.id ?? `create-${formDefaults?.status ?? 'todo'}`}
            submitLabel={mode === 'create' ? 'Create task' : 'Save changes'}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            {...(task ? { task } : {})}
            {...(formDefaults ? { formDefaults } : {})}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
