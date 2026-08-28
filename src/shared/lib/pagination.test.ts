import { describe, expect, it } from 'vitest'

import { getPaginationItems } from '@/shared/lib/pagination.ts'

describe('getPaginationItems', () => {
  it('returns all pages when the total is small', () => {
    expect(getPaginationItems(2, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('inserts ellipsis for large page counts', () => {
    expect(getPaginationItems(5, 10)).toEqual([1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
  })

  it('returns an empty list for a single page', () => {
    expect(getPaginationItems(1, 1)).toEqual([])
  })
})
