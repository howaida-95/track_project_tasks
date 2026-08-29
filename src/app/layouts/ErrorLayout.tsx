import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { useEffect } from 'react'

import { ErrorState } from '@/shared/components/error-state.tsx'
import { reportError } from '@/shared/lib/logger.ts'

function getRouteErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return error.statusText || `Request failed with status ${error.status}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred. Please try again.'
}

export function ErrorLayout() {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    reportError(error, { boundary: 'router' })
  }, [error])

  return (
    <ErrorState
      title="Something went wrong"
      description={getRouteErrorMessage(error)}
      onRetry={() => {
        navigate(0)
      }}
    />
  )
}

export default ErrorLayout
