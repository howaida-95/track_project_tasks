import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import BoardView from '@/features/tasks/views/BoardView.tsx'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('App board route', () => {
  it('renders the board heading', async () => {
    localStorage.clear()
    replaceTaskStore([makeTask({ title: 'Smoke test task', status: 'todo' })])

    renderWithProviders(<BoardView />, {
      router: { initialEntries: ['/tasks'] },
    })

    expect(screen.getByRole('heading', { name: 'Task Board' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Smoke test task')).toBeInTheDocument()
    })
  })
})
