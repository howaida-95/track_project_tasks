import { describe, expect, it } from 'vitest'

import {
  setCollapsedColumns,
  setDensity,
  setSidebarOpen,
  setTheme,
  toggleColumnCollapsed,
  toggleSidebar,
  uiInitialState,
  uiReducer,
} from '@/app/store/slices/uiSlice.ts'

describe('uiSlice', () => {
  it('updates theme and density', () => {
    let state = uiReducer(uiInitialState, setTheme('dark'))
    state = uiReducer(state, setDensity('compact'))

    expect(state.theme).toBe('dark')
    expect(state.density).toBe('compact')
  })

  it('toggles sidebar visibility', () => {
    const closed = uiReducer(uiInitialState, setSidebarOpen(false))
    const reopened = uiReducer(closed, toggleSidebar())

    expect(closed.sidebarOpen).toBe(false)
    expect(reopened.sidebarOpen).toBe(true)
  })

  it('toggles collapsed kanban columns', () => {
    const collapsed = uiReducer(uiInitialState, toggleColumnCollapsed('done'))
    const expanded = uiReducer(collapsed, toggleColumnCollapsed('done'))

    expect(collapsed.collapsedColumns).toEqual(['done'])
    expect(expanded.collapsedColumns).toEqual([])
  })

  it('replaces collapsed columns', () => {
    const state = uiReducer(uiInitialState, setCollapsedColumns(['todo', 'in_review']))

    expect(state.collapsedColumns).toEqual(['todo', 'in_review'])
  })
})
