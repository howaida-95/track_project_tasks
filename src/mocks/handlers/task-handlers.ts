import { http, HttpResponse } from 'msw'
import { ZodError } from 'zod'

import { TaskListParamsSchema } from '@/features/tasks/model/schemas.ts'
import type {
  ApiProblem,
  CreateTaskInput,
  TaskListParams,
  UpdateTaskInput,
} from '@/features/tasks/model/types.ts'
import {
  createStoredTask,
  deleteStoredTask,
  getStoredTask,
  getStoredTaskStats,
  listStoredTasks,
  updateStoredTask,
} from '@/mocks/db/task-repository.ts'
import { getApiBaseUrl } from '@/shared/api/api-base-url.ts'
import { toTaskId } from '@/shared/types/branded.ts'

const API_BASE = getApiBaseUrl()

function problem(status: number, message: string, details?: Record<string, string[]>): ApiProblem {
  return details ? { status, message, details } : { status, message }
}

function validationProblem(error: ZodError): ApiProblem {
  const details = error.flatten().fieldErrors as Record<string, string[]>

  return {
    status: 400,
    message: 'Validation failed',
    details,
  }
}

function readPathParam(value: string | readonly string[] | undefined): string | null {
  if (typeof value === 'string') {
    return value
  }

  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return null
}

function parseListParams(request: Request): TaskListParams {
  const url = new URL(request.url)
  const status = url.searchParams.getAll('status')
  const priority = url.searchParams.getAll('priority')
  const parsed = TaskListParamsSchema.parse({
    q: url.searchParams.get('q') ?? undefined,
    status: status.length > 0 ? status : undefined,
    priority: priority.length > 0 ? priority : undefined,
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    page: url.searchParams.get('page') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    sort: url.searchParams.get('sort') ?? undefined,
    order: url.searchParams.get('order') ?? undefined,
  })

  const params: TaskListParams = {
    page: parsed.page,
    limit: parsed.limit,
    sort: parsed.sort,
    order: parsed.order,
  }

  if (parsed.q !== undefined) {
    params.q = parsed.q
  }

  if (parsed.status !== undefined) {
    params.status = parsed.status
  }

  if (parsed.priority !== undefined) {
    params.priority = parsed.priority
  }

  if (parsed.from !== undefined) {
    params.from = parsed.from
  }

  if (parsed.to !== undefined) {
    params.to = parsed.to
  }

  return params
}

export const taskHandlers = [
  http.get(`${API_BASE}/tasks/stats`, () => {
    return HttpResponse.json(getStoredTaskStats())
  }),

  http.get(`${API_BASE}/tasks`, ({ request }) => {
    const params = parseListParams(request)
    return HttpResponse.json(listStoredTasks(params))
  }),

  http.get(`${API_BASE}/tasks/:taskId`, ({ params }) => {
    const taskId = readPathParam(params.taskId)

    if (!taskId) {
      return HttpResponse.json(problem(400, 'Task id is required'), { status: 400 })
    }

    const task = getStoredTask(toTaskId(taskId))

    if (!task) {
      return HttpResponse.json(problem(404, `Task ${taskId} was not found`), { status: 404 })
    }

    return HttpResponse.json(task)
  }),

  http.post(`${API_BASE}/tasks`, async ({ request }) => {
    try {
      const body = (await request.json()) as CreateTaskInput
      const created = createStoredTask(body)
      return HttpResponse.json(created, { status: 201 })
    } catch (error) {
      if (error instanceof ZodError) {
        return HttpResponse.json(validationProblem(error), { status: 400 })
      }

      throw error
    }
  }),

  http.patch(`${API_BASE}/tasks/:taskId`, async ({ request, params }) => {
    const taskId = readPathParam(params.taskId)

    if (!taskId) {
      return HttpResponse.json(problem(400, 'Task id is required'), { status: 400 })
    }

    try {
      const body = (await request.json()) as UpdateTaskInput
      const updated = updateStoredTask(toTaskId(taskId), body)

      if (!updated) {
        return HttpResponse.json(problem(404, `Task ${taskId} was not found`), { status: 404 })
      }

      return HttpResponse.json(updated)
    } catch (error) {
      if (error instanceof ZodError) {
        return HttpResponse.json(validationProblem(error), { status: 400 })
      }

      throw error
    }
  }),

  http.delete(`${API_BASE}/tasks/:taskId`, ({ params }) => {
    const taskId = readPathParam(params.taskId)

    if (!taskId) {
      return HttpResponse.json(problem(400, 'Task id is required'), { status: 400 })
    }

    const deleted = deleteStoredTask(toTaskId(taskId))

    if (!deleted) {
      return HttpResponse.json(problem(404, `Task ${taskId} was not found`), { status: 404 })
    }

    return new HttpResponse(null, { status: 204 })
  }),
]
