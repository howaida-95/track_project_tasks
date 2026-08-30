import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store/store.ts'
import {
  selectCreateDialogStatus,
  selectDialogKind,
  selectIsDialogOpen,
} from '@/app/store/slices/dialogSlice.selectors.ts'
import { selectSidebarOpen } from '@/app/store/slices/uiSlice.selectors.ts'
import { openCreateDialog } from '@/app/store/slices/dialogSlice.ts'
import { toggleSidebar } from '@/app/store/slices/uiSlice.ts'

describe('ui selectors', () => {
  it('selects sidebar open state', () => {
    const store = createAppStore()

    expect(selectSidebarOpen(store.getState())).toBe(true)

    store.dispatch(toggleSidebar())

    expect(selectSidebarOpen(store.getState())).toBe(false)
  })
})

describe('dialog selectors', () => {
  it('derives dialog open state and create payload', () => {
    const store = createAppStore()
    store.dispatch(openCreateDialog({ status: 'in_progress' }))

    const state = store.getState()

    expect(selectIsDialogOpen(state)).toBe(true)
    expect(selectDialogKind(state)).toBe('create')
    expect(selectCreateDialogStatus(state)).toBe('in_progress')
  })
})
