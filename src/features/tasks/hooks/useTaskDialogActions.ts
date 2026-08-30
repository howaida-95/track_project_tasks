import { useAppDispatch } from '@/app/store/hooks.ts'
import {
  openCreateDialog,
  openDeleteDialog,
  openEditDialog,
} from '@/app/store/slices/dialogSlice.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import type { TaskStatus } from '@/shared/types/task-ui.ts'

export function useTaskDialogActions() {
  const dispatch = useAppDispatch()

  return {
    openCreate: (status: TaskStatus = 'todo') => dispatch(openCreateDialog({ status })),
    openEdit: (taskId: TaskId) => dispatch(openEditDialog({ taskId })),
    openDelete: (taskId: TaskId) => dispatch(openDeleteDialog({ taskId })),
  }
}
