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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <TaskForm
          key={task?.id ?? `create-${formDefaults?.status ?? 'todo'}`}
          submitLabel={mode === 'create' ? 'Create task' : 'Save changes'}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          {...(task ? { task } : {})}
          {...(formDefaults ? { formDefaults } : {})}
        />
      </DialogContent>
    </Dialog>
  )
}
