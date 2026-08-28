import type { TaskListParams } from '@/features/tasks/model/types.ts'

type SerializedListParams = Record<string, string | number>

export function buildListParams(params: TaskListParams): SerializedListParams {
  const query: SerializedListParams = {}

  if (params.q !== undefined) {
    query.q = params.q
  }

  if (params.from !== undefined) {
    query.from = params.from
  }

  if (params.to !== undefined) {
    query.to = params.to
  }

  if (params.page !== undefined) {
    query.page = params.page
  }

  if (params.limit !== undefined) {
    query.limit = params.limit
  }

  if (params.sort !== undefined) {
    query.sort = params.sort
  }

  if (params.order !== undefined) {
    query.order = params.order
  }

  return query
}

export function serializeTaskListParams(params: TaskListParams): string {
  const search = new URLSearchParams()

  const scalarParams = buildListParams(params)

  for (const [key, value] of Object.entries(scalarParams)) {
    search.set(key, String(value))
  }

  params.status?.forEach((status) => {
    search.append('status', status)
  })

  params.priority?.forEach((priority) => {
    search.append('priority', priority)
  })

  return search.toString()
}
