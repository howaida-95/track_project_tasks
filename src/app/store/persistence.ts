import type { PersistedUiPreferences } from '@/app/store/slices/uiSlice.ts'
import { UI_PREFERENCES_STORAGE_KEY } from '@/app/store/slices/uiSlice.ts'

export function loadPersistedUiPreferences(): PersistedUiPreferences | null {
  if (typeof localStorage === 'undefined') {
    return null
  }

  const raw = localStorage.getItem(UI_PREFERENCES_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedUiPreferences>

    if (parsed.theme !== 'light' && parsed.theme !== 'dark' && parsed.theme !== 'system') {
      return null
    }

    if (parsed.density !== 'comfortable' && parsed.density !== 'compact') {
      return null
    }

    if (!Array.isArray(parsed.collapsedColumns)) {
      return null
    }

    return {
      theme: parsed.theme,
      density: parsed.density,
      collapsedColumns: parsed.collapsedColumns,
    }
  } catch {
    return null
  }
}

export function savePersistedUiPreferences(preferences: PersistedUiPreferences): void {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(UI_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}
