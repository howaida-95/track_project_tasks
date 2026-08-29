import { memo, useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { TaskActionButtons } from '@/shared/components/TaskActionButtons.tsx'
import type { Task } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import { LIST_ROW_ESTIMATE_PX, VIRTUAL_OVERSCAN } from '@/shared/lib/virtual.ts'

type TaskListTableProps = {
  tasks: Task[]
  onEdit: (taskId: TaskId) => void
  onDelete: (taskId: TaskId) => void
}

const TaskListRow = memo(function TaskListRow({
  task,
  onEdit,
  onDelete,
}: {
  task: Task
  onEdit: (taskId: TaskId) => void
  onDelete: (taskId: TaskId) => void
}) {
  return (
    <>
      <td className="px-4 py-3">
        <div className="font-medium">{task.title}</div>
        {task.description ? (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{task.description}</p>
        ) : null}
      </td>
      <td className="px-4 py-3 capitalize">{task.status.replace('_', ' ')}</td>
      <td className="px-4 py-3 capitalize">{task.priority}</td>
      <td className="px-4 py-3 text-muted-foreground">{task.dueDate ?? '—'}</td>
      <td className="px-4 py-3">
        <TaskActionButtons taskId={task.id} onEdit={onEdit} onDelete={onDelete} />
      </td>
    </>
  )
})

export function TaskListTable({ tasks, onEdit, onDelete }: TaskListTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  // TanStack Virtual's API is not compiler-memoizable; skip that lint for this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => LIST_ROW_ESTIMATE_PX,
    overscan: VIRTUAL_OVERSCAN,
    getItemKey: (index) => tasks[index]?.id ?? index,
  })

  const virtualRows = virtualizer.getVirtualItems()
  const paddingTop = virtualRows[0]?.start ?? 0
  const lastRow = virtualRows[virtualRows.length - 1]
  const paddingBottom = lastRow ? virtualizer.getTotalSize() - lastRow.end : 0

  return (
    <div
      ref={scrollRef}
      data-virtualized-list
      className="min-h-0 flex-1 overflow-auto rounded-card border border-border [-webkit-overflow-scrolling:touch]"
    >
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <caption className="sr-only">Tasks matching the current filters</caption>
        <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
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
          {paddingTop > 0 ? (
            <tr aria-hidden="true">
              <td colSpan={5} style={{ height: paddingTop, padding: 0, border: 0 }} />
            </tr>
          ) : null}
          {virtualRows.map((virtualRow) => {
            const task = tasks[virtualRow.index]
            if (!task) {
              return null
            }

            return (
              <tr
                key={task.id}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="border-b border-border/70"
              >
                <TaskListRow task={task} onEdit={onEdit} onDelete={onDelete} />
              </tr>
            )
          })}
          {paddingBottom > 0 ? (
            <tr aria-hidden="true">
              <td colSpan={5} style={{ height: paddingBottom, padding: 0, border: 0 }} />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}
