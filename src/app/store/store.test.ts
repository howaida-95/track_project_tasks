import { describe, expect, it } from 'vitest'

import { loadPersistedUiPreferences, savePersistedUiPreferences } from '@/app/store/persistence.ts'
import { UI_PREFERENCES_STORAGE_KEY } from '@/app/store/slices/uiSlice.ts'
import { createAppStore } from '@/app/store/store.ts'
import { setTheme } from '@/app/store/slices/uiSlice.ts'
import {
  selectCreateDialogStatus,
  selectDialogKind,
  selectIsDialogOpen,
} from '@/app/store/slices/dialogSlice.selectors.ts'
import {
  selectDensity,
  selectIsColumnCollapsed,
  selectTheme,
} from '@/app/store/slices/uiSlice.selectors.ts'
import { openCreateDialog } from '@/app/store/slices/dialogSlice.ts'

describe('ui selectors', () => {
  it('selects theme and column collapse state', () => {
    const store = createAppStore()
    store.dispatch(setTheme('dark'))

    const state = store.getState()

    expect(selectTheme(state)).toBe('dark')
    expect(selectIsColumnCollapsed('todo')(state)).toBe(false)
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

describe('ui preference persistence', () => {
  it('loads and saves whitelisted preferences', () => {
    localStorage.clear()

    savePersistedUiPreferences({
      theme: 'dark',
      density: 'compact',
      collapsedColumns: ['done'],
    })

    expect(loadPersistedUiPreferences()).toEqual({
      theme: 'dark',
      density: 'compact',
      collapsedColumns: ['done'],
    })
  })

  it('persists theme changes through listener middleware', () => {
    localStorage.clear()

    const store = createAppStore()
    store.dispatch(setTheme('dark'))

    expect(JSON.parse(localStorage.getItem(UI_PREFERENCES_STORAGE_KEY) ?? '{}')).toEqual({
      theme: 'dark',
      density: 'comfortable',
      collapsedColumns: [],
    })
  })

  it('hydrates persisted preferences when creating the store', () => {
    localStorage.clear()
    savePersistedUiPreferences({
      theme: 'light',
      density: 'compact',
      collapsedColumns: ['in_review'],
    })

    const store = createAppStore()

    expect(selectTheme(store.getState())).toBe('light')
    expect(selectDensity(store.getState())).toBe('compact')
  })
})
