import type { TaskListParams } from '@/features/tasks/model/types.ts'
import type { TaskStatus } from '@/shared/types/task-ui.ts'

export const DEFAULT_PAGE_SIZE = 25
export const MAX_PAGE_SIZE = 1200
export const BOARD_COLUMN_PAGE_SIZE = DEFAULT_PAGE_SIZE

export function isBoardColumnEnabled(listParams: TaskListParams, status: TaskStatus): boolean {
  return !listParams.status?.length || listParams.status.includes(status)
}

export function toBoardColumnParams(
  listParams: TaskListParams,
  status: TaskStatus,
): TaskListParams {
  const params: TaskListParams = {
    status: [status],
    sort: 'position',
    order: 'asc',
    limit: BOARD_COLUMN_PAGE_SIZE,
  }

  if (listParams.q) {
    params.q = listParams.q
  }

  if (listParams.priority?.length) {
    params.priority = [...listParams.priority]
  }

  if (listParams.from) {
    params.from = listParams.from
  }

  if (listParams.to) {
    params.to = listParams.to
  }

  return params
}
