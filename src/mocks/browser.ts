import { setupWorker } from 'msw/browser'

import { handlers } from '@/mocks/handlers/index.ts'

export const worker = setupWorker(...handlers)

export async function startMockWorker(): Promise<void> {
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') {
    return
  }

  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  })
}
