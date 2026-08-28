import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { TaskStatus } from '@/shared/types/task-ui.ts'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ViewDensity = 'comfortable' | 'compact'

export type UiState = {
  theme: ThemeMode
  density: ViewDensity
  sidebarOpen: boolean
  collapsedColumns: TaskStatus[]
}

export const uiInitialState: UiState = {
  theme: 'system',
  density: 'comfortable',
  sidebarOpen: true,
  collapsedColumns: [],
}

export type PersistedUiPreferences = Pick<UiState, 'theme' | 'density' | 'collapsedColumns'>

export const UI_PREFERENCES_STORAGE_KEY = 'tw-ui-preferences-v1'

const uiSlice = createSlice({
  name: 'ui',
  initialState: uiInitialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload
    },
    setDensity(state, action: PayloadAction<ViewDensity>) {
      state.density = action.payload
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    toggleColumnCollapsed(state, action: PayloadAction<TaskStatus>) {
      const status = action.payload
      const index = state.collapsedColumns.indexOf(status)

      if (index === -1) {
        state.collapsedColumns.push(status)
        return
      }

      state.collapsedColumns.splice(index, 1)
    },
    setCollapsedColumns(state, action: PayloadAction<TaskStatus[]>) {
      state.collapsedColumns = action.payload
    },
  },
})

export const uiReducer = uiSlice.reducer

export const {
  setTheme,
  setDensity,
  setSidebarOpen,
  toggleSidebar,
  toggleColumnCollapsed,
  setCollapsedColumns,
} = uiSlice.actions

export { uiSlice }
