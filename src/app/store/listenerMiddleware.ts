import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'

import { savePersistedUiPreferences } from '@/app/store/persistence.ts'
import type { RootState } from '@/app/store/rootReducer.ts'
import { selectPersistedUiPreferences } from '@/app/store/slices/uiSlice.selectors.ts'
import {
  setCollapsedColumns,
  setDensity,
  setTheme,
  toggleColumnCollapsed,
} from '@/app/store/slices/uiSlice.ts'

export const listenerMiddleware = createListenerMiddleware()

listenerMiddleware.startListening({
  matcher: isAnyOf(setTheme, setDensity, setCollapsedColumns, toggleColumnCollapsed),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as RootState
    savePersistedUiPreferences(selectPersistedUiPreferences(state))
  },
})
