import type { ReactNode } from 'react'

import { Inbox } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <section
      className="flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-card px-6 py-12 text-center shadow-card"
      aria-labelledby="empty-state-title"
    >
      <Inbox className="mb-4 size-10 text-muted-foreground" aria-hidden="true" />
      <h2 id="empty-state-title" className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  )
}
