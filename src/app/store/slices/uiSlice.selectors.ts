import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store/rootReducer.ts'
import type { TaskStatus } from '@/shared/types/task-ui.ts'

const selectUiState = (state: RootState) => state.ui

export const selectTheme = createSelector(selectUiState, (ui) => ui.theme)

export const selectDensity = createSelector(selectUiState, (ui) => ui.density)

export const selectSidebarOpen = createSelector(selectUiState, (ui) => ui.sidebarOpen)

export const selectCollapsedColumns = createSelector(selectUiState, (ui) => ui.collapsedColumns)

export const selectIsColumnCollapsed = (status: TaskStatus) =>
  createSelector(selectCollapsedColumns, (columns) => columns.includes(status))

export const selectPersistedUiPreferences = createSelector(selectUiState, (ui) => ({
  theme: ui.theme,
  density: ui.density,
  collapsedColumns: ui.collapsedColumns,
}))
