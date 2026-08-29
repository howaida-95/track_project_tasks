import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store/rootReducer.ts'

const selectUiState = (state: RootState) => state.ui

export const selectSidebarOpen = createSelector(selectUiState, (ui) => ui.sidebarOpen)
