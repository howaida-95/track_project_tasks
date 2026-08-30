import { describe, expect, it } from 'vitest'

import {
  setSidebarOpen,
  toggleSidebar,
  uiInitialState,
  uiReducer,
} from '@/app/store/slices/uiSlice.ts'

describe('uiSlice', () => {
  it('toggles sidebar visibility', () => {
    const closed = uiReducer(uiInitialState, setSidebarOpen(false))
    const reopened = uiReducer(closed, toggleSidebar())

    expect(closed.sidebarOpen).toBe(false)
    expect(reopened.sidebarOpen).toBe(true)
  })
})
