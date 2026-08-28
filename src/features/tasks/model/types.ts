import type { TaskId } from '@/shared/types/branded.ts'
import type { TaskPriority, TaskStatus } from '@/shared/types/task-ui.ts'

export type Task = {
  id: TaskId
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  createdAt: string
  updatedAt: string
  tags: string[]
}

export type CreateTaskInput = {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string | null
  tags?: string[]
}

export type UpdateTaskInput = Partial<CreateTaskInput>

export type TaskSortField = 'createdAt' | 'dueDate' | 'priority' | 'title' | 'updatedAt'

export type SortOrder = 'asc' | 'desc'

export type TaskFilters = {
  q?: string
  status?: TaskStatus[]
  priority?: TaskPriority[]
  from?: string
  to?: string
}

export type PaginationParams = {
  page?: number
  limit?: number
  sort?: TaskSortField
  order?: SortOrder
}

export type TaskListParams = TaskFilters & PaginationParams

export type PaginatedTasks = {
  data: Task[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ApiProblem = {
  message: string
  status: number
  details?: Record<string, string[]>
}
