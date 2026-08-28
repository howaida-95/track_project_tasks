import { describe, expect, it } from 'vitest'

import App from '@/App.tsx'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('App', () => {
  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(<App />)

    expect(getByText('APP')).toBeInTheDocument()
  })
})
