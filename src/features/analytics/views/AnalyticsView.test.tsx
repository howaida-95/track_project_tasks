import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AnalyticsView } from '@/features/analytics/views/AnalyticsView.tsx'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('AnalyticsView', () => {
  it('renders status and priority counts from the task catalog', async () => {
    localStorage.clear()
    replaceTaskStore([
      makeTask({ title: 'Todo urgent', status: 'todo', priority: 'urgent' }),
      makeTask({ title: 'Done high', status: 'done', priority: 'high' }),
    ])

    renderWithProviders(<AnalyticsView />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Total tasks' })).toBeInTheDocument()
    })

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'By status' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'By priority' })).toBeInTheDocument()
    expect(screen.getByRole('meter', { name: 'To Do' })).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByRole('meter', { name: 'Done' })).toHaveAttribute('aria-valuenow', '50')
    expect(screen.getByRole('meter', { name: 'Urgent' })).toHaveAttribute('aria-valuenow', '50')
  })
})
