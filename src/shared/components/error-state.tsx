import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ErrorStateProps = {
  title: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <section
      className="flex flex-col items-center justify-center rounded-card border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
      role="alert"
      aria-labelledby="error-state-title"
    >
      <AlertCircle className="mb-4 size-10 text-destructive" aria-hidden="true" />
      <h2 id="error-state-title" className="text-lg font-semibold text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-6" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </section>
  )
}
