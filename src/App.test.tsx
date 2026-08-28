import { describe, expect, it } from 'vitest'

import BoardPlaceholder from '@/features/tasks/views/BoardPlaceholder.tsx'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('BoardPlaceholder', () => {
  it('renders the board heading', () => {
    const { getByRole } = renderWithProviders(<BoardPlaceholder />)

    expect(getByRole('heading', { name: 'Task Board' })).toBeInTheDocument()
  })
})
