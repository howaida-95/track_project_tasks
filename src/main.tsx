import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import AppProviders from '@/app/providers/AppProviders.tsx'

import './styles/index.css'

async function enableMocking(): Promise<void> {
  // Default on so Vercel works without paid env vars; set VITE_ENABLE_MOCKS=false to disable.
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') {
    return
  }

  const { startMockWorker } = await import('@/mocks/browser.ts')
  await startMockWorker()
}

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders />
    </StrictMode>,
  )
})
