import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AppErrorBoundary } from '@/app/providers/AppErrorBoundary.tsx'
import { router } from '@/app/routes/router.tsx'
import { store } from '@/app/store/store.ts'
import { getRetryDelay, shouldRetryQuery } from '@/shared/api/retry-policy.ts'

type AppProvidersProps = {
  children?: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: shouldRetryQuery,
            retryDelay: getRetryDelay,
          },
          mutations: {
            networkMode: 'offlineFirst',
          },
        },
      }),
  )

  const content = children ?? <RouterProvider router={router} />

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <QueryErrorResetBoundary>
          <AppErrorBoundary>
            {content}
            <Toaster richColors closeButton />
          </AppErrorBoundary>
        </QueryErrorResetBoundary>
      </QueryClientProvider>
    </Provider>
  )
}

export default AppProviders
