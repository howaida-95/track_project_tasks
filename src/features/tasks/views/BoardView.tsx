import { useCallback, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { TaskDialogsHost } from '@/features/tasks/components/TaskDialogsHost.tsx'
import { useTaskDialogActions } from '@/features/tasks/hooks/useTaskDialogActions.ts'
import { TaskCard } from '@/features/tasks/components/TaskCard.tsx'
import { useTasks } from '@/features/tasks/hooks/useTasks.ts'
import type { Task } from '@/features/tasks/model/types.ts'
import { QueryState } from '@/shared/components/query-state.tsx'
import { TASK_STATUSES, TASK_STATUS_LABELS, type TaskStatus } from '@/shared/types/task-ui.ts'

const BOARD_QUERY = {
  page: 1,
  limit: 100,
  sort: 'updatedAt' as const,
  order: 'desc' as const,
}

function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  return TASK_STATUSES.reduce(
    (groups, status) => {
      groups[status] = tasks.filter((task) => task.status === status)
      return groups
    },
    {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    } as Record<TaskStatus, Task[]>,
  )
}

export function BoardView() {
  const { openCreate, openEdit, openDelete } = useTaskDialogActions()
  const { data, isLoading, isError, error, refetch } = useTasks(BOARD_QUERY)

  const tasksByStatus = useMemo(() => groupTasksByStatus(data?.data ?? []), [data?.data])

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

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col overflow-hidden">
      <header className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Task Board</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and delete tasks against the mock API.
          </p>
        </div>
        <Button type="button" onClick={() => openCreate('todo')}>
          New task
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <QueryState
          isLoading={isLoading}
          isError={isError}
          isEmpty={!isLoading && !isError && (data?.data.length ?? 0) === 0}
          error={error}
          onRetry={() => {
            void refetch()
          }}
        >
          <div className="flex h-full min-h-0 flex-1 gap-4 overflow-x-auto overflow-y-hidden xl:overflow-x-hidden">
            {TASK_STATUSES.map((status) => (
              <section
                key={status}
                aria-labelledby={`column-${status}`}
                className="flex h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden rounded-card border border-border bg-muted/20 p-3 md:w-auto md:min-w-0 md:flex-1"
              >
                <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
                  <h2
                    id={`column-${status}`}
                    className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {TASK_STATUS_LABELS[status]}
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {tasksByStatus[status].length}
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
                  <div className="space-y-3">
                    {tasksByStatus[status].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full shrink-0"
                  onClick={() => openCreate(status)}
                >
                  Add task
                </Button>
              </section>
            ))}
          </div>
        </QueryState>
      </div>

      <TaskDialogsHost />
    </div>
  )
}

export default BoardView
