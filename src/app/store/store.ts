import { configureStore, type EnhancedStore } from '@reduxjs/toolkit'

import { listenerMiddleware } from '@/app/store/listenerMiddleware.ts'
import { loadPersistedUiPreferences } from '@/app/store/persistence.ts'
import { rootReducer, type RootState } from '@/app/store/rootReducer.ts'
import { uiInitialState } from '@/app/store/slices/uiSlice.ts'

function buildPreloadedState(): Partial<RootState> {
  const persisted = loadPersistedUiPreferences()

  if (!persisted) {
    return {}
  }

  return {
    ui: {
      ...uiInitialState,
      ...persisted,
    },
  }
}

export function createAppStore(): EnhancedStore {
  return configureStore({
    reducer: rootReducer,
    preloadedState: buildPreloadedState(),
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  })
}

export const store = createAppStore()

export type { RootState }
export type AppDispatch = typeof store.dispatch
