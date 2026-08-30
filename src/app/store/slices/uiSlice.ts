import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type UiState = {
  sidebarOpen: boolean
}

export const uiInitialState: UiState = {
  sidebarOpen: true,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: uiInitialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const uiReducer = uiSlice.reducer

export const { setSidebarOpen, toggleSidebar } = uiSlice.actions

export { uiSlice }
