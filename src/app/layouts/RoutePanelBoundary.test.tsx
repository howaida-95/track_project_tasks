import { fireEvent, screen, waitFor } from '@testing-library/react'
import { onlineManager } from '@tanstack/react-query'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { RoutePanelBoundary } from '@/app/layouts/RoutePanelBoundary.tsx'
import { OfflineBanner } from '@/shared/components/OfflineBanner.tsx'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

function BrokenPanel({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Panel render failed')
  }

  return <p>Panel recovered</p>
}

describe('RoutePanelBoundary', () => {
  it('renders a fallback and recovers when retried', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    function Harness() {
      const [shouldThrow, setShouldThrow] = useState(true)

      return (
        <>
          <button type="button" onClick={() => setShouldThrow(false)}>
            Heal panel
          </button>
          <RoutePanelBoundary>
            <BrokenPanel shouldThrow={shouldThrow} />
          </RoutePanelBoundary>
        </>
      )
    }

    renderWithProviders(<Harness />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Panel render failed')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Heal panel' }))
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.getByText('Panel recovered')).toBeInTheDocument()

    consoleError.mockRestore()
  })
})

describe('OfflineBanner', () => {
  it('shows a banner while offline and hides it when back online', async () => {
    onlineManager.setOnline(false)

    renderWithProviders(<OfflineBanner />)

    expect(
      screen.getByText('You are offline. Changes will resume when your connection returns.'),
    ).toBeInTheDocument()

    onlineManager.setOnline(true)

    await waitFor(() => {
      expect(
        screen.queryByText('You are offline. Changes will resume when your connection returns.'),
      ).not.toBeInTheDocument()
    })
  })
})
