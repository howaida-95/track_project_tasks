import { screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it } from 'vitest'

import ListView from '@/features/tasks/views/ListView.tsx'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('ListView accessibility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('has no detectable accessibility violations once tasks are loaded', async () => {
    replaceTaskStore([
      makeTask({ title: 'Accessible list task', status: 'todo' }),
      makeTask({ title: 'Hidden list task', status: 'done' }),
    ])

    const { container } = renderWithProviders(<ListView />, {
      router: { initialEntries: ['/tasks?view=list'] },
    })

    await waitFor(() => {
      expect(screen.getByText('Accessible list task')).toBeInTheDocument()
    })

    expect(await axe(container)).toHaveNoViolations()
  })
})
