import { useCallback } from 'react'

import { TaskListPagination } from '@/features/tasks/components/TaskListPagination.tsx'
import { TaskListTable } from '@/features/tasks/components/TaskListTable.tsx'
import { useTaskDialogActions } from '@/features/tasks/hooks/useTaskDialogActions.ts'
import { useTasks } from '@/features/tasks/hooks/useTasks.ts'
import { useTaskFilters } from '@/features/tasks/filters/useTaskFilters.ts'
import { QueryState } from '@/shared/components/query-state.tsx'

export function ListView() {
  const { openEdit, openDelete } = useTaskDialogActions()
  const { listParams, setListParams } = useTaskFilters()
  const { data, isLoading, isError, error, refetch } = useTasks(listParams)

  const handleEdit = useCallback(
    (taskId: Parameters<typeof openEdit>[0]) => {
      openEdit(taskId)
    },
    [openEdit],
  )

  const handleDelete = useCallback(
    (taskId: Parameters<typeof openDelete>[0]) => {
      openDelete(taskId)
    },
    [openDelete],
  )

  const totalPages = data?.meta.totalPages ?? 0
  const currentPage = data?.meta.page ?? listParams.page ?? 1

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && (data?.data.length ?? 0) === 0}
        error={error}
        onRetry={() => {
          void refetch()
        }}
      >
        <TaskListTable tasks={data?.data ?? []} onEdit={handleEdit} onDelete={handleDelete} />

        <TaskListPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={data?.meta.total ?? 0}
          onPageChange={(page) => {
            setListParams({ page })
          }}
        />
      </QueryState>
    </div>
  )
}

export default ListView
