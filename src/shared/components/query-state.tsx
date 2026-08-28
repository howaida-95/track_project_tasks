import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/shared/components/empty-state.tsx'
import { ErrorState } from '@/shared/components/error-state.tsx'

type QueryStateProps = {
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  error?: Error | null
  onRetry?: () => void
  loadingFallback?: ReactNode
  errorFallback?: ReactNode
  emptyFallback?: ReactNode
  children: ReactNode
}

export function QueryState({
  isLoading,
  isError,
  isEmpty,
  error,
  onRetry,
  loadingFallback,
  errorFallback,
  emptyFallback,
  children,
}: QueryStateProps) {
  if (isLoading) {
    return loadingFallback ?? <DefaultLoadingSkeleton />
  }

  if (isError) {
    return (
      errorFallback ?? (
        <ErrorState
          title="Something went wrong"
          description={error?.message ?? 'An unexpected error occurred.'}
          {...(onRetry ? { onRetry } : {})}
        />
      )
    )
  }

  if (isEmpty) {
    return (
      emptyFallback ?? (
        <EmptyState
          title="No results"
          description="Try adjusting your filters or create a new task."
        />
      )
    )
  }

  return children
}

function DefaultLoadingSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading content">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
