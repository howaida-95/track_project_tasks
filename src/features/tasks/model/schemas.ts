import { z } from 'zod'

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/features/tasks/model/pagination.ts'
import type { CreateTaskInput, Task } from '@/features/tasks/model/types.ts'
import { toTaskId } from '@/shared/types/branded.ts'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/shared/types/task-ui.ts'

export const TaskIdSchema = z.string().uuid().transform(toTaskId)

export const TaskSchema = z.object({
  id: TaskIdSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.string().date().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tags: z.array(z.string().min(1).max(40)).max(10),
  position: z.number().int().nonnegative(),
})

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.string().date().nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).optional(),
  position: z.number().int().nonnegative().optional(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial()

export const MoveTaskSchema = z.object({
  status: z.enum(TASK_STATUSES),
  position: z.number().int().nonnegative(),
})

export const TaskFiltersSchema = z.object({
  q: z.string().trim().optional(),
  status: z.array(z.enum(TASK_STATUSES)).optional(),
  priority: z.array(z.enum(TASK_PRIORITIES)).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  sort: z
    .enum(['createdAt', 'dueDate', 'position', 'priority', 'title', 'updatedAt'])
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const TaskListParamsSchema = TaskFiltersSchema.merge(PaginationSchema)

export const PaginatedTasksSchema = z.object({
  data: z.array(TaskSchema),
  meta: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
  }),
})

export const ApiProblemSchema = z.object({
  message: z.string(),
  status: z.number().int(),
  details: z.record(z.array(z.string())).optional(),
})

export const TaskFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().max(5000),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.union([z.string().date(), z.literal('')]),
})

export type TaskFormValues = z.infer<typeof TaskFormSchema>

/** Empty / missing form dates become null for the API. */
function toNullableDueDate(value: string | null | undefined): string | null {
  if (value == null) {
    return null
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export function toCreateTaskInput(values: TaskFormValues): CreateTaskInput {
  return {
    title: values.title,
    description: values.description,
    status: values.status,
    priority: values.priority,
    dueDate: toNullableDueDate(values.dueDate),
  }
}

export function toTaskFormValues(overrides: Partial<TaskFormValues> = {}): TaskFormValues {
  return {
    title: overrides.title ?? '',
    description: overrides.description ?? '',
    status: overrides.status ?? 'todo',
    priority: overrides.priority ?? 'medium',
    dueDate: toNullableDueDate(overrides.dueDate) ?? '',
  }
}

export function taskToFormValues(task: Task): TaskFormValues {
  return toTaskFormValues({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: toNullableDueDate(task.dueDate) ?? '',
  })
}
