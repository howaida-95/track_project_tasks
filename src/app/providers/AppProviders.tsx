import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'

import { router } from '@/app/routes/router.tsx'
import { store } from '@/app/store/store.ts'

type AppProvidersProps = {
  children?: ReactNode
}

/**
 * Application provider shell.
 * Error boundaries and theme wiring land in feat/design-system.
 */
export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
          },
        },
      }),
  )

  const content = children ?? <RouterProvider router={router} />

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        {content}
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </Provider>
  )
}

export default AppProviders
