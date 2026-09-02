import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useMemo, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { SortableTaskCard } from '@/features/tasks/components/SortableTaskCard.tsx'
import type { Task } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import {
  BOARD_CARD_ESTIMATE_PX,
  BOARD_CARD_GAP_PX,
  VIRTUAL_OVERSCAN,
} from '@/shared/lib/virtual.ts'
import { TASK_STATUS_LABELS, type TaskStatus } from '@/shared/types/task-ui.ts'
import { cn } from '@/lib/utils'

type BoardColumnProps = {
  status: TaskStatus
  tasks: Task[]
  totalCount?: number
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  isDropTarget?: boolean
  onLoadMore?: () => unknown
  onEdit: (taskId: TaskId) => void
  onDelete: (taskId: TaskId) => void
  onAdd: () => void
}

export function BoardColumn({
  status,
  tasks,
  totalCount,
  hasNextPage = false,
  isFetchingNextPage = false,
  isDropTarget = false,
  onLoadMore,
  onEdit,
  onDelete,
  onAdd,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const scrollRef = useRef<HTMLDivElement>(null)
  const itemIds = useMemo(() => tasks.map((task) => task.id), [tasks])
  const showDropHighlight = isDropTarget || isOver
  const countLabel =
    totalCount != null && totalCount !== tasks.length
      ? `${tasks.length} / ${totalCount}`
      : String(totalCount ?? tasks.length)

  // TanStack Virtual's API is not compiler-memoizable; skip that lint for this hook.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => BOARD_CARD_ESTIMATE_PX,
    overscan: VIRTUAL_OVERSCAN,
    gap: BOARD_CARD_GAP_PX,
    getItemKey: (index) => tasks[index]?.id ?? index,
  })

  const lastVirtualIndex = virtualizer.getVirtualItems().at(-1)?.index

  useEffect(() => {
    if (
      lastVirtualIndex == null ||
      !hasNextPage ||
      isFetchingNextPage ||
      !onLoadMore ||
      lastVirtualIndex < tasks.length - 5
    ) {
      return
    }

    onLoadMore()
  }, [hasNextPage, isFetchingNextPage, lastVirtualIndex, onLoadMore, tasks.length])

  return (
    <section
      ref={setNodeRef}
      data-column-status={status}
      data-drop-target={showDropHighlight ? 'true' : undefined}
      aria-labelledby={`column-${status}`}
      className={cn(
        'flex h-full min-h-0 w-[min(18rem,85vw)] shrink-0 flex-col overflow-hidden rounded-card border p-3 transition-colors xl:w-auto xl:min-w-64 xl:flex-1',
        showDropHighlight
          ? 'border-ring/60 bg-accent/70 shadow-inner'
          : 'border-border bg-muted/20',
      )}
    >
      <div className="mb-3 flex shrink-0 items-center justify-between gap-2">
        <h2
          id={`column-${status}`}
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {TASK_STATUS_LABELS[status]}
        </h2>
        <span className="text-xs tabular-nums text-muted-foreground">{countLabel}</span>
      </div>

      <SortableContext id={status} items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          ref={scrollRef}
          role="list"
          aria-labelledby={`column-${status}`}
          data-virtualized-column={status}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-md pr-1 transition-colors',
            showDropHighlight && 'bg-foreground/5',
          )}
        >
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const task = tasks[virtualItem.index]
              if (!task) {
                return null
              }

              return (
                <div
                  key={task.id}
                  role="listitem"
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  className="absolute left-0 w-full"
                  style={{ top: virtualItem.start }}
                >
                  <SortableTaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
                </div>
              )
            })}
          </div>
          {isFetchingNextPage ? (
            <p className="py-2 text-center text-xs text-muted-foreground">Loading more…</p>
          ) : null}
        </div>
      </SortableContext>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3 w-full shrink-0"
        onClick={onAdd}
      >
        Add task
      </Button>
    </section>
  )
}
