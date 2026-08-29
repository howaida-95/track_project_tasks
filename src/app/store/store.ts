import { configureStore, type EnhancedStore } from '@reduxjs/toolkit'

import { rootReducer, type RootState } from '@/app/store/rootReducer.ts'

export function createAppStore(): EnhancedStore {
  return configureStore({
    reducer: rootReducer,
  })
}

export const store = createAppStore()

export type { RootState }
export type AppDispatch = typeof store.dispatch
