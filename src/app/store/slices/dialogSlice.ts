import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { TaskStatus } from '@/shared/types/task-ui.ts'
import type { TaskId } from '@/shared/types/branded.ts'

export type DialogState =
  | { kind: 'closed' }
  | { kind: 'create'; status: TaskStatus }
  | { kind: 'edit'; taskId: TaskId }
  | { kind: 'delete'; taskId: TaskId }

export const dialogInitialState: DialogState = { kind: 'closed' }

const dialogSlice = createSlice({
  name: 'dialog',
  initialState: { kind: 'closed' } as DialogState,
  reducers: {
    openCreateDialog: (_state, action: PayloadAction<{ status: TaskStatus }>): DialogState => ({
      kind: 'create',
      status: action.payload.status,
    }),
    openEditDialog: (_state, action: PayloadAction<{ taskId: TaskId }>): DialogState => ({
      kind: 'edit',
      taskId: action.payload.taskId,
    }),
    openDeleteDialog: (_state, action: PayloadAction<{ taskId: TaskId }>): DialogState => ({
      kind: 'delete',
      taskId: action.payload.taskId,
    }),
    closeDialog: (): DialogState => dialogInitialState,
  },
})

export const dialogReducer = dialogSlice.reducer

export const { openCreateDialog, openEditDialog, openDeleteDialog, closeDialog } =
  dialogSlice.actions

export { dialogSlice }
