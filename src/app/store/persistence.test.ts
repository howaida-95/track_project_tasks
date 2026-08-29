import { describe, expect, it } from 'vitest'

import {
  loadPersistedUiPreferences,
  savePersistedUiPreferences,
} from '@/app/store/persistence.ts'
import { UI_PREFERENCES_STORAGE_KEY } from '@/app/store/slices/uiSlice.ts'

describe('ui preference persistence', () => {
  it('returns null when nothing is stored', () => {
    localStorage.removeItem(UI_PREFERENCES_STORAGE_KEY)

    expect(loadPersistedUiPreferences()).toBeNull()
  })

  it('loads valid persisted preferences', () => {
    localStorage.setItem(
      UI_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: 'dark',
        density: 'compact',
        collapsedColumns: ['done'],
      }),
    )

    expect(loadPersistedUiPreferences()).toEqual({
      theme: 'dark',
      density: 'compact',
      collapsedColumns: ['done'],
    })
  })

  it('rejects invalid persisted payloads', () => {
    localStorage.setItem(
      UI_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: 'neon',
        density: 'compact',
        collapsedColumns: [],
      }),
    )

    expect(loadPersistedUiPreferences()).toBeNull()
  })

  it('rejects malformed json', () => {
    localStorage.setItem(UI_PREFERENCES_STORAGE_KEY, '{not-json')

    expect(loadPersistedUiPreferences()).toBeNull()
  })

  it('persists preferences to localStorage', () => {
    savePersistedUiPreferences({
      theme: 'light',
      density: 'comfortable',
      collapsedColumns: ['in_review'],
    })

    expect(JSON.parse(localStorage.getItem(UI_PREFERENCES_STORAGE_KEY) ?? '{}')).toEqual({
      theme: 'light',
      density: 'comfortable',
      collapsedColumns: ['in_review'],
    })
  })

  it('rejects invalid density values', () => {
    localStorage.setItem(
      UI_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: 'light',
        density: 'spacious',
        collapsedColumns: [],
      }),
    )

    expect(loadPersistedUiPreferences()).toBeNull()
  })

  it('rejects non-array collapsed columns', () => {
    localStorage.setItem(
      UI_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        theme: 'light',
        density: 'comfortable',
        collapsedColumns: 'done',
      }),
    )

    expect(loadPersistedUiPreferences()).toBeNull()
  })
})
