import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { TaskListPagination } from '@/features/tasks/components/TaskListPagination.tsx'
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
      <header className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">Task List</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Filtered table view synced with the board via URL query params.
        </p>
      </header>

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && (data?.data.length ?? 0) === 0}
        error={error}
        onRetry={() => {
          void refetch()
        }}
      >
        <div className="min-h-0 flex-1 overflow-auto rounded-card border border-border">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Tasks matching the current filters</caption>
            <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
              <tr className="border-b border-border text-left">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Priority
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Due
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((task) => (
                <tr key={task.id} className="border-b border-border/70">
                  <td className="px-4 py-3">
                    <div className="font-medium">{task.title}</div>
                    {task.description ? (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {task.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 capitalize">{task.status.replace('_', ' ')}</td>
                  <td className="px-4 py-3 capitalize">{task.priority}</td>
                  <td className="px-4 py-3 text-muted-foreground">{task.dueDate ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(task.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
