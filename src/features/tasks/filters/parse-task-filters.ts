import { DEFAULT_PAGE_SIZE } from '@/features/tasks/model/pagination.ts'
import { TaskListParamsSchema } from '@/features/tasks/model/schemas.ts'
import type { TaskListParams } from '@/features/tasks/model/types.ts'
import { serializeTaskView, type TaskView } from '@/features/tasks/filters/task-view.ts'

export type { TaskView }

const DEFAULT_LIST_PARAMS = TaskListParamsSchema.parse({})

export function getDefaultTaskListParams(): TaskListParams {
  return toTaskListParams(DEFAULT_LIST_PARAMS)
}

type ParsedListParams = ReturnType<typeof TaskListParamsSchema.parse>

function toTaskListParams(data: ParsedListParams): TaskListParams {
  const params: TaskListParams = {
    page: data.page,
    limit: data.limit,
    sort: data.sort,
    order: data.order,
  }

  if (data.q) {
    params.q = data.q
  }

  if (data.status?.length) {
    params.status = [...data.status]
  }

  if (data.priority?.length) {
    params.priority = [...data.priority]
  }

  if (data.from) {
    params.from = data.from
  }

  if (data.to) {
    params.to = data.to
  }

  return params
}

export function parseTaskListParams(searchParams: URLSearchParams): TaskListParams {
  const status = searchParams.getAll('status')
  const priority = searchParams.getAll('priority')

  const raw = {
    q: searchParams.get('q') ?? undefined,
    status: status.length > 0 ? status : undefined,
    priority: priority.length > 0 ? priority : undefined,
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    limit: searchParams.get('limit') ?? undefined,
    sort: searchParams.get('sort') ?? undefined,
    order: searchParams.get('order') ?? undefined,
  }

  const parsed = TaskListParamsSchema.safeParse(raw)

  if (parsed.success) {
    return toTaskListParams(parsed.data)
  }

  return toTaskListParams(DEFAULT_LIST_PARAMS)
}

export function serializeTaskListParams(params: TaskListParams): URLSearchParams {
  const search = new URLSearchParams()

  if (params.q) {
    search.set('q', params.q)
  }

  params.status?.forEach((status) => {
    search.append('status', status)
  })

  params.priority?.forEach((priority) => {
    search.append('priority', priority)
  })

  if (params.from) {
    search.set('from', params.from)
  }

  if (params.to) {
    search.set('to', params.to)
  }

  if (params.page !== undefined && params.page !== 1) {
    search.set('page', String(params.page))
  }

  if (params.limit !== undefined && params.limit !== DEFAULT_LIST_PARAMS.limit) {
    search.set('limit', String(params.limit))
  }

  if (params.sort !== undefined && params.sort !== DEFAULT_LIST_PARAMS.sort) {
    search.set('sort', params.sort)
  }

  if (params.order !== undefined && params.order !== DEFAULT_LIST_PARAMS.order) {
    search.set('order', params.order)
  }

  return search
}

export function buildTaskSearchParams(
  listParams: TaskListParams,
  view: TaskView = 'board',
): URLSearchParams {
  const search = serializeTaskListParams(listParams)
  const serializedView = serializeTaskView(view)

  if (serializedView) {
    search.set('view', serializedView)
  }

  return search
}

export function mergeTaskListParams(
  current: TaskListParams,
  patch: Partial<TaskListParams>,
): TaskListParams {
  const merged: TaskListParams = {
    page: patch.page ?? current.page ?? 1,
    limit: patch.limit ?? current.limit ?? DEFAULT_PAGE_SIZE,
    sort: patch.sort ?? current.sort ?? 'createdAt',
    order: patch.order ?? current.order ?? 'desc',
  }

  if ('q' in patch) {
    const trimmed = patch.q?.trim()
    if (trimmed) {
      merged.q = trimmed
    }
  } else if (current.q) {
    merged.q = current.q
  }

  if ('status' in patch) {
    if (patch.status && patch.status.length > 0) {
      merged.status = [...patch.status]
    }
  } else if (current.status) {
    merged.status = [...current.status]
  }

  if ('priority' in patch) {
    if (patch.priority && patch.priority.length > 0) {
      merged.priority = [...patch.priority]
    }
  } else if (current.priority) {
    merged.priority = [...current.priority]
  }

  if ('from' in patch) {
    if (patch.from) {
      merged.from = patch.from
    }
  } else if (current.from) {
    merged.from = current.from
  }

  if ('to' in patch) {
    if (patch.to) {
      merged.to = patch.to
    }
  } else if (current.to) {
    merged.to = current.to
  }

  const filterKeys = ['q', 'status', 'priority', 'from', 'to'] as const
  const filtersChanged = filterKeys.some((key) => key in patch)

  if (filtersChanged && !('page' in patch)) {
    merged.page = 1
  }

  return toTaskListParams(TaskListParamsSchema.parse(merged))
}
