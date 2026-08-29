import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { QueryState } from '@/shared/components/query-state.tsx'

describe('QueryState', () => {
  it('renders the default loading skeleton', () => {
    render(
      <QueryState isLoading isError={false} isEmpty={false}>
        <p>Loaded content</p>
      </QueryState>,
    )

    expect(screen.getByLabelText('Loading content')).toBeInTheDocument()
    expect(screen.queryByText('Loaded content')).not.toBeInTheDocument()
  })

  it('renders a custom loading fallback', () => {
    render(
      <QueryState
        isLoading
        isError={false}
        isEmpty={false}
        loadingFallback={<p>Custom loading</p>}
      >
        <p>Loaded content</p>
      </QueryState>,
    )

    expect(screen.getByText('Custom loading')).toBeInTheDocument()
  })

  it('renders the default error state and retries', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup()

    render(
      <QueryState
        isLoading={false}
        isError
        isEmpty={false}
        error={new Error('Network unavailable')}
        onRetry={onRetry}
      >
        <p>Loaded content</p>
      </QueryState>,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Network unavailable')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders the default empty state', () => {
    render(
      <QueryState isLoading={false} isError={false} isEmpty>
        <p>Loaded content</p>
      </QueryState>,
    )

    expect(screen.getByText('No results')).toBeInTheDocument()
    expect(screen.getByText('Try adjusting your filters or create a new task.')).toBeInTheDocument()
  })

  it('renders children when data is ready', () => {
    render(
      <QueryState isLoading={false} isError={false} isEmpty={false}>
        <p>Loaded content</p>
      </QueryState>,
    )

    expect(screen.getByText('Loaded content')).toBeInTheDocument()
  })
})
