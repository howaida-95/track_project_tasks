import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'

import { createAppStore } from '@/app/store/store.ts'

function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

type ExtendedRenderOptions = Omit<RenderOptions, 'wrapper'> & {
  store?: ReturnType<typeof createAppStore>
  queryClient?: QueryClient
  router?: MemoryRouterProps
}

export function renderWithProviders(
  ui: ReactElement,
  {
    store = createAppStore(),
    queryClient = createTestQueryClient(),
    router,
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    const content = (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    )

    if (router) {
      return <MemoryRouter {...router}>{content}</MemoryRouter>
    }

    return content
  }

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  }
}

export { createAppStore as createTestStore, createTestQueryClient }
