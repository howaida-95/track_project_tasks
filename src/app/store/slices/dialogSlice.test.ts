import { describe, expect, it } from 'vitest'

import {
  closeDialog,
  dialogInitialState,
  dialogReducer,
  openCreateDialog,
  openDeleteDialog,
  openEditDialog,
} from '@/app/store/slices/dialogSlice.ts'
import { toTaskId } from '@/shared/types/branded.ts'

describe('dialogSlice', () => {
  const taskId = toTaskId('11111111-1111-4111-8111-111111111111')

  it('opens and closes create dialog', () => {
    const open = dialogReducer(dialogInitialState, openCreateDialog({ status: 'todo' }))
    const closed = dialogReducer(open, closeDialog())

    expect(open).toEqual({ kind: 'create', status: 'todo' })
    expect(closed).toEqual({ kind: 'closed' })
  })

  it('opens edit and delete dialogs with task ids', () => {
    const edit = dialogReducer(dialogInitialState, openEditDialog({ taskId }))
    const del = dialogReducer(dialogInitialState, openDeleteDialog({ taskId }))

    expect(edit).toEqual({ kind: 'edit', taskId })
    expect(del).toEqual({ kind: 'delete', taskId })
  })

  it('replaces the active dialog when opening a new one', () => {
    const edit = dialogReducer(
      dialogReducer(dialogInitialState, openCreateDialog({ status: 'todo' })),
      openEditDialog({ taskId }),
    )

    expect(edit).toEqual({ kind: 'edit', taskId })
  })
})
