import { z } from 'zod'

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
})

export const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  dueDate: z.string().date().nullable().optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).optional(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial()

export const TaskFiltersSchema = z.object({
  q: z.string().trim().optional(),
  status: z.array(z.enum(TASK_STATUSES)).optional(),
  priority: z.array(z.enum(TASK_PRIORITIES)).optional(),
  from: z.string().date().optional(),
  to: z.string().date().optional(),
})

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(['createdAt', 'dueDate', 'priority', 'title', 'updatedAt']).default('createdAt'),
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
