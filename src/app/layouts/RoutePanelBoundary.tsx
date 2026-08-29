import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { ErrorFallback } from '@/shared/components/error-fallback.tsx'
import { reportError } from '@/shared/lib/logger.ts'

type RoutePanelBoundaryProps = {
  children: ReactNode
}

export function RoutePanelBoundary({ children }: RoutePanelBoundaryProps) {
  const { reset } = useQueryErrorResetBoundary()

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={reset}
      onError={(error, info) => {
        reportError(error, { componentStack: info.componentStack, boundary: 'route-panel' })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
