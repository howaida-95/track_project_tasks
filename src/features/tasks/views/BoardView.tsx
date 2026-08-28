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
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
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

      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && (data?.data.length ?? 0) === 0}
        error={error}
        onRetry={() => {
          void refetch()
        }}
      >
        <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          {TASK_STATUSES.map((status) => (
            <section
              key={status}
              aria-labelledby={`column-${status}`}
              className="rounded-card border border-border bg-muted/20 p-3"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
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
              <div className="space-y-3">
                {tasksByStatus[status].map((task) => (
                  <TaskCard key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-3 w-full"
                onClick={() => openCreate(status)}
              >
                Add task
              </Button>
            </section>
          ))}
        </div>
      </QueryState>

      <TaskDialogsHost />
    </div>
  )
}

export default BoardView
