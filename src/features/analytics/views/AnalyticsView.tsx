import { useTaskSummary } from '@/features/analytics/hooks/useTaskSummary.ts'
import { countShare, emptyTaskStats } from '@/features/analytics/model/summarize-tasks.ts'
import { QueryState } from '@/shared/components/query-state.tsx'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from '@/shared/types/task-ui.ts'
import { cn } from '@/lib/utils'

const STATUS_BAR_CLASS: Record<TaskStatus, string> = {
  todo: 'bg-status-todo',
  in_progress: 'bg-status-in-progress',
  in_review: 'bg-status-in-review',
  done: 'bg-status-done',
}

const PRIORITY_BAR_CLASS: Record<TaskPriority, string> = {
  low: 'bg-priority-low',
  medium: 'bg-priority-medium',
  high: 'bg-priority-high',
  urgent: 'bg-priority-urgent',
}

export function AnalyticsView() {
  const { data, isLoading, isError, error, refetch } = useTaskSummary()
  const summary = data ?? emptyTaskStats()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <QueryState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && summary.total === 0}
        error={error}
        onRetry={() => {
          void refetch()
        }}
        emptyFallback={
          <p className="text-sm text-muted-foreground">No tasks yet. Create one to see counts.</p>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-card border border-border/80 bg-card p-4 shadow-card sm:col-span-2 xl:col-span-1">
            <h2 className="text-sm font-medium text-muted-foreground">Total tasks</h2>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {summary.total}
            </p>
          </article>

          <CountCard
            title="By status"
            items={TASK_STATUSES.map((status) => ({
              key: status,
              label: TASK_STATUS_LABELS[status],
              count: summary.byStatus[status],
              barClassName: STATUS_BAR_CLASS[status],
            }))}
            total={summary.total}
          />

          <CountCard
            title="By priority"
            items={TASK_PRIORITIES.map((priority) => ({
              key: priority,
              label: TASK_PRIORITY_LABELS[priority],
              count: summary.byPriority[priority],
              barClassName: PRIORITY_BAR_CLASS[priority],
            }))}
            total={summary.total}
          />
        </div>
      </QueryState>
    </div>
  )
}

type CountItem = {
  key: string
  label: string
  count: number
  barClassName: string
}

function CountCard({ title, items, total }: { title: string; items: CountItem[]; total: number }) {
  return (
    <section className="rounded-card border border-border/80 bg-card p-4 shadow-card">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => {
          const share = countShare(item.count, total)

          return (
            <li key={item.key} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate">{item.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {item.count}
                  <span className="sr-only"> tasks, {share} percent</span>
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-muted"
                role="meter"
                aria-label={item.label}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={share}
              >
                <div
                  className={cn('h-full rounded-full', item.barClassName)}
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default AnalyticsView
