import { useCallback } from 'react'

import { useAppDispatch, useAppSelector } from '@/app/store/hooks.ts'
import {
  selectCreateDialogStatus,
  selectDeleteDialogTaskId,
  selectDialogState,
  selectEditDialogTaskId,
} from '@/app/store/slices/dialogSlice.selectors.ts'
import { closeDialog } from '@/app/store/slices/dialogSlice.ts'
import { TaskDialog } from '@/features/tasks/components/TaskDialog.tsx'
import { useTask } from '@/features/tasks/hooks/useTask.ts'
import { useTaskMutations } from '@/features/tasks/hooks/useTaskMutations.ts'
import { toCreateTaskInput, type TaskFormValues } from '@/features/tasks/model/schemas.ts'
import { ConfirmDialog } from '@/shared/components/confirm-dialog.tsx'

export function TaskDialogsHost() {
  const dispatch = useAppDispatch()
  const dialog = useAppSelector(selectDialogState)
  const createStatus = useAppSelector(selectCreateDialogStatus)
  const editTaskId = useAppSelector(selectEditDialogTaskId)
  const deleteTaskId = useAppSelector(selectDeleteDialogTaskId)

  const { data: editTask, isLoading: isEditTaskLoading } = useTask(editTaskId)
  const { createTaskMutation, updateTaskMutation, deleteTaskMutation } = useTaskMutations()

  const handleCreateOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        dispatch(closeDialog())
      }
    },
    [dispatch],
  )

  const handleEditOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        dispatch(closeDialog())
      }
    },
    [dispatch],
  )

  const handleDeleteOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        dispatch(closeDialog())
      }
    },
    [dispatch],
  )

  const handleCreateSubmit = useCallback(
    async (values: TaskFormValues) => {
      try {
        await createTaskMutation.mutateAsync(values)
        dispatch(closeDialog())
      } catch {
        // Toast handled in mutation onError; keep the dialog open for retry.
      }
    },
    [createTaskMutation, dispatch],
  )

  const handleEditSubmit = useCallback(
    async (values: TaskFormValues) => {
      if (!editTaskId) {
        return
      }

      try {
        await updateTaskMutation.mutateAsync({
          taskId: editTaskId,
          input: toCreateTaskInput(values),
        })
        dispatch(closeDialog())
      } catch {
        // Toast + rollback handled in mutation onError; keep the dialog open.
      }
    },
    [dispatch, editTaskId, updateTaskMutation],
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTaskId) {
      return
    }

    try {
      await deleteTaskMutation.mutateAsync(deleteTaskId)
      dispatch(closeDialog())
    } catch {
      // Toast + rollback handled in mutation onError; keep the confirm dialog open.
    }
  }, [deleteTaskId, deleteTaskMutation, dispatch])

  const createFormDefaults = createStatus ? { status: createStatus } : undefined

  return (
    <>
      <TaskDialog
        open={dialog.kind === 'create'}
        mode="create"
        isSubmitting={createTaskMutation.isPending}
        onOpenChange={handleCreateOpenChange}
        onSubmit={handleCreateSubmit}
        {...(createFormDefaults ? { formDefaults: createFormDefaults } : {})}
      />

      {editTask ? (
        <TaskDialog
          open={dialog.kind === 'edit' && !isEditTaskLoading}
          mode="edit"
          task={editTask}
          isSubmitting={updateTaskMutation.isPending}
          onOpenChange={handleEditOpenChange}
          onSubmit={handleEditSubmit}
        />
      ) : null}

      <ConfirmDialog
        open={dialog.kind === 'delete'}
        title="Delete this task?"
        description="This action cannot be undone."
        confirmLabel={deleteTaskMutation.isPending ? 'Deleting…' : 'Delete'}
        onOpenChange={handleDeleteOpenChange}
        onConfirm={() => {
          void handleDeleteConfirm()
        }}
      />
    </>
  )
}

export default TaskDialogsHost
