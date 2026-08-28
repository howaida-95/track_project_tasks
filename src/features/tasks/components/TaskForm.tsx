import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  TaskFormSchema,
  taskToFormValues,
  toTaskFormValues,
  type TaskFormValues,
} from '@/features/tasks/model/schemas.ts'
import type { Task } from '@/features/tasks/model/types.ts'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '@/shared/types/task-ui.ts'

type TaskFormProps = {
  task?: Task
  formDefaults?: Partial<TaskFormValues>
  submitLabel?: string
  isSubmitting?: boolean
  onSubmit: (values: TaskFormValues) => void | Promise<void>
}

export function TaskForm({
  task,
  formDefaults,
  submitLabel = 'Save task',
  isSubmitting = false,
  onSubmit,
}: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(TaskFormSchema),
    defaultValues: task ? taskToFormValues(task) : toTaskFormValues(formDefaults),
  })

  const status = useWatch({ control, name: 'status' })
  const priority = useWatch({ control, name: 'priority' })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="task-title">Title</Label>
        <Input
          id="task-title"
          aria-invalid={errors.title ? true : undefined}
          aria-describedby={errors.title ? 'task-title-error' : undefined}
          {...register('title')}
        />
        {errors.title ? (
          <p id="task-title-error" className="text-sm text-destructive">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-description">Description</Label>
        <Textarea id="task-description" rows={4} {...register('description')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <Select
            value={status ?? 'todo'}
            onValueChange={(value) => setValue('status', value as TaskFormValues['status'])}
          >
            <SelectTrigger id="task-status" className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {TASK_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {TASK_STATUS_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-priority">Priority</Label>
          <Select
            value={priority ?? 'medium'}
            onValueChange={(value) => setValue('priority', value as TaskFormValues['priority'])}
          >
            <SelectTrigger id="task-priority" className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {TASK_PRIORITIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {TASK_PRIORITY_LABELS[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-due-date">Due date</Label>
        <Input id="task-due-date" type="date" {...register('dueDate')} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}
