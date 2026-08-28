import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import BoardView from '@/features/tasks/views/BoardView.tsx'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('BoardView', () => {
  it('renders tasks from the mock API', async () => {
    localStorage.clear()
    replaceTaskStore([
      makeTask({ title: 'Board task alpha', status: 'todo' }),
      makeTask({ title: 'Board task beta', status: 'done' }),
    ])

    renderWithProviders(<BoardView />)

    expect(screen.getByRole('heading', { name: 'Task Board' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Board task alpha')).toBeInTheDocument()
      expect(screen.getByText('Board task beta')).toBeInTheDocument()
    })
  })
})
