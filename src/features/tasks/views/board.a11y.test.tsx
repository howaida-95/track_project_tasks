import { screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it } from 'vitest'

import BoardView from '@/features/tasks/views/BoardView.tsx'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('BoardView accessibility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('has no detectable accessibility violations once tasks are loaded', async () => {
    replaceTaskStore([
      makeTask({ title: 'Accessible board task', status: 'todo', position: 0 }),
      makeTask({ title: 'Done board task', status: 'done', position: 0 }),
    ])

    const { container } = renderWithProviders(<BoardView />, {
      router: { initialEntries: ['/tasks'] },
    })

    await waitFor(() => {
      expect(screen.getByText('Accessible board task')).toBeInTheDocument()
    })

    expect(await axe(container)).toHaveNoViolations()
  })
})
