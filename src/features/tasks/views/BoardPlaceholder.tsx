import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TaskPriorityBadge } from '@/shared/components/badges/task-priority-badge.tsx'
import { TaskStatusBadge } from '@/shared/components/badges/task-status-badge.tsx'
import { ConfirmDialog } from '@/shared/components/confirm-dialog.tsx'
import { QueryState } from '@/shared/components/query-state.tsx'
import { TASK_PRIORITIES, TASK_STATUSES } from '@/shared/types/task-ui.ts'

export function BoardPlaceholder() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [demoView, setDemoView] = useState<'success' | 'loading' | 'error' | 'empty'>('success')

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Task Board</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Design system foundation — badges, dialogs, and query states.
        </p>
      </header>

      <section aria-labelledby="badges-heading" className="space-y-3">
        <h2
          id="badges-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Status & priority badges
        </h2>
        <div className="flex flex-wrap gap-2">
          {TASK_STATUSES.map((status) => (
            <TaskStatusBadge key={status} status={status} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {TASK_PRIORITIES.map((priority) => (
            <TaskPriorityBadge key={priority} priority={priority} />
          ))}
        </div>
      </section>

      <section aria-labelledby="dialogs-heading" className="flex flex-wrap gap-3">
        <h2 id="dialogs-heading" className="sr-only">
          Dialog examples
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create task</DialogTitle>
              <DialogDescription>
                Task form will be wired in the CRUD feature branch.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Button type="button" variant="destructive" onClick={() => setConfirmOpen(true)}>
          Delete task
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this task?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={() => setConfirmOpen(false)}
        />
      </section>

      <section aria-labelledby="query-state-heading" className="space-y-3">
        <h2
          id="query-state-heading"
          className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Query state
        </h2>
        <div className="flex flex-wrap gap-2">
          {(['success', 'loading', 'error', 'empty'] as const).map((view) => (
            <Button
              key={view}
              type="button"
              size="sm"
              variant={demoView === view ? 'default' : 'outline'}
              onClick={() => setDemoView(view)}
            >
              {view}
            </Button>
          ))}
        </div>
        <QueryState
          isLoading={demoView === 'loading'}
          isError={demoView === 'error'}
          isEmpty={demoView === 'empty'}
          error={demoView === 'error' ? new Error('Failed to load tasks') : null}
          onRetry={() => setDemoView('success')}
        >
          <p className="rounded-card border border-border bg-card p-4 text-sm shadow-card">
            Task list will render here once the mock API is connected.
          </p>
        </QueryState>
      </section>
    </div>
  )
}

export default BoardPlaceholder
