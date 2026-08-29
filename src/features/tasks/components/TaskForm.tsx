import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon } from 'lucide-react'
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
  createTaskFormSchema,
  taskToFormValues,
  toTaskFormValues,
  type TaskFormValues,
} from '@/features/tasks/model/schemas.ts'
import type { Task } from '@/features/tasks/model/types.ts'
import { toLocalDateString } from '@/shared/lib/local-date.ts'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '@/shared/types/task-ui.ts'
import { cn } from '@/lib/utils'

type TaskFormProps = {
  task?: Task
  formDefaults?: Partial<TaskFormValues>
  submitLabel?: string
  isSubmitting?: boolean
  onSubmit: (values: TaskFormValues) => void | Promise<void>
}

const fieldClassName = 'h-9 bg-background/80 shadow-sm placeholder:text-muted-foreground/80'

export function TaskForm({
  task,
  formDefaults,
  submitLabel = 'Save task',
  isSubmitting = false,
  onSubmit,
}: TaskFormProps) {
  const formSchema = createTaskFormSchema(task?.dueDate)
  const earliestDueDate = toLocalDateString()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: task ? taskToFormValues(task) : toTaskFormValues(formDefaults),
  })

  const status = useWatch({ control, name: 'status' })
  const priority = useWatch({ control, name: 'priority' })

  return (
    <form className="flex flex-col gap-0" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-5 px-1 pb-1">
        <div className="space-y-2">
          <Label htmlFor="task-title" className="text-xs font-medium tracking-wide text-foreground">
            Title
          </Label>
          <Input
            id="task-title"
            placeholder="What needs to be done?"
            className={fieldClassName}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            {...register('title')}
          />
          {errors.title ? (
            <p id="task-title-error" className="text-xs text-destructive">
              {errors.title.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="task-description"
            className="text-xs font-medium tracking-wide text-foreground"
          >
            Description
          </Label>
          <Textarea
            id="task-description"
            rows={4}
            placeholder="Add context, notes, or acceptance criteria"
            className="min-h-24 bg-background/80 shadow-sm placeholder:text-muted-foreground/80"
            {...register('description')}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="task-status"
              className="text-xs font-medium tracking-wide text-foreground"
            >
              Status
            </Label>
            <Select
              value={status ?? 'todo'}
              onValueChange={(value) => setValue('status', value as TaskFormValues['status'])}
            >
              <SelectTrigger id="task-status" className={cn('w-full', fieldClassName)}>
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
            <Label
              htmlFor="task-priority"
              className="text-xs font-medium tracking-wide text-foreground"
            >
              Priority
            </Label>
            <Select
              value={priority ?? 'medium'}
              onValueChange={(value) => setValue('priority', value as TaskFormValues['priority'])}
            >
              <SelectTrigger id="task-priority" className={cn('w-full', fieldClassName)}>
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
          <Label
            htmlFor="task-due-date"
            className="text-xs font-medium tracking-wide text-foreground"
          >
            Due date
          </Label>
          <div className="relative">
            <CalendarIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="task-due-date"
              type="date"
              min={earliestDueDate}
              className={cn(fieldClassName, 'pl-8')}
              aria-invalid={errors.dueDate ? true : undefined}
              aria-describedby={errors.dueDate ? 'task-due-date-error' : undefined}
              {...register('dueDate')}
            />
          </div>
          {errors.dueDate ? (
            <p id="task-due-date-error" className="text-xs text-destructive">
              {errors.dueDate.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-border/70 pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-28 shadow-sm">
          {isSubmitting ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
