import { configureStore, type EnhancedStore } from '@reduxjs/toolkit'

const stubReducer = (state: Record<string, never> = {}) => state

export function createAppStore(): EnhancedStore {
  return configureStore({
    reducer: {
      _stub: stubReducer,
    },
  })
}

export const store = createAppStore()

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
