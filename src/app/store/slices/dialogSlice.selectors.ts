import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store/rootReducer.ts'

export const selectDialogState = (state: RootState) => state.dialog

export const selectIsDialogOpen = createSelector(
  selectDialogState,
  (dialog) => dialog.kind !== 'closed',
)

export const selectDialogKind = createSelector(selectDialogState, (dialog) => dialog.kind)

export const selectCreateDialogStatus = createSelector(selectDialogState, (dialog) => {
  if (dialog.kind !== 'create') {
    return null
  }

  return dialog.status
})

export const selectEditDialogTaskId = createSelector(selectDialogState, (dialog) => {
  if (dialog.kind !== 'edit') {
    return null
  }

  return dialog.taskId
})

export const selectDeleteDialogTaskId = createSelector(selectDialogState, (dialog) => {
  if (dialog.kind !== 'delete') {
    return null
  }

  return dialog.taskId
})
