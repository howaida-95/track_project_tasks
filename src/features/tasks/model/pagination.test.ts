import { describe, expect, it } from 'vitest'

import { PaginationSchema } from '@/features/tasks/model/schemas.ts'
import {
  BOARD_COLUMN_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  isBoardColumnEnabled,
  toBoardColumnParams,
} from '@/features/tasks/model/pagination.ts'

describe('pagination limits', () => {
  it('keeps numbered list and board column pages at 25 while allowing the API max', () => {
    expect(BOARD_COLUMN_PAGE_SIZE).toBe(DEFAULT_PAGE_SIZE)
    expect(PaginationSchema.parse({ limit: BOARD_COLUMN_PAGE_SIZE }).limit).toBe(25)
    expect(PaginationSchema.parse({ limit: MAX_PAGE_SIZE }).limit).toBe(MAX_PAGE_SIZE)
  })

  it('builds per-column board params so URL page/sort do not split a column', () => {
    expect(
      toBoardColumnParams(
        {
          page: 4,
          limit: 25,
          sort: 'title',
          order: 'desc',
          q: 'auth',
          priority: ['high'],
        },
        'todo',
      ),
    ).toEqual({
      status: ['todo'],
      sort: 'position',
      order: 'asc',
      limit: BOARD_COLUMN_PAGE_SIZE,
      q: 'auth',
      priority: ['high'],
    })
  })

  it('disables columns excluded by the status filter', () => {
    expect(isBoardColumnEnabled({ status: ['todo'] }, 'todo')).toBe(true)
    expect(isBoardColumnEnabled({ status: ['todo'] }, 'done')).toBe(false)
    expect(isBoardColumnEnabled({}, 'done')).toBe(true)
  })
})
