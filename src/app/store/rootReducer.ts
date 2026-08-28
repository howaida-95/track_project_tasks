import { combineReducers } from '@reduxjs/toolkit'

import { dialogReducer } from '@/app/store/slices/dialogSlice.ts'
import { uiReducer } from '@/app/store/slices/uiSlice.ts'

export const rootReducer = combineReducers({
  ui: uiReducer,
  dialog: dialogReducer,
})

export type RootState = ReturnType<typeof rootReducer>
