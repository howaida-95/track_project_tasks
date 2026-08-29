import type { FallbackProps } from 'react-error-boundary'

import { ErrorState } from '@/shared/components/error-state.tsx'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const description =
    error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'

  return (
    <ErrorState
      title="Something went wrong"
      description={description}
      onRetry={resetErrorBoundary}
    />
  )
}
