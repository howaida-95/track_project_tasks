import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { FilterBar } from '@/features/tasks/filters/FilterBar.tsx'
import ListView from '@/features/tasks/views/ListView.tsx'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('ListView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders tasks and respects URL filters', async () => {
    replaceTaskStore([
      makeTask({ title: 'Visible task', status: 'todo' }),
      makeTask({ title: 'Hidden task', status: 'done' }),
    ])

    renderWithProviders(<ListView />, {
      router: { initialEntries: ['/tasks?status=todo'] },
    })

    await waitFor(() => {
      expect(screen.getByText('Visible task')).toBeInTheDocument()
    })

    expect(screen.queryByText('Hidden task')).not.toBeInTheDocument()
  })

  it('writes debounced search queries to the URL', async () => {
    replaceTaskStore([makeTask({ title: 'Auth flow task', status: 'todo' })])

    const user = userEvent.setup()

    renderWithProviders(
      <>
        <FilterBar />
        <ListView />
      </>,
      {
        router: { initialEntries: ['/tasks?view=list'] },
      },
    )

    await user.click(screen.getByRole('button', { name: /open filters/i }))
    await user.type(screen.getByLabelText('Search'), 'auth')

    await waitFor(() => {
      expect(screen.getByText('Auth flow task')).toBeInTheDocument()
    })
  })

  it('shows numbered pagination controls', async () => {
    const now = Date.now()
    replaceTaskStore(
      Array.from({ length: 12 }, (_, index) =>
        makeTask({
          title: `Paginated task ${index + 1}`,
          status: 'todo',
          createdAt: new Date(now - index * 60_000).toISOString(),
          updatedAt: new Date(now - index * 60_000).toISOString(),
        }),
      ),
    )

    const user = userEvent.setup()

    renderWithProviders(<ListView />, {
      router: { initialEntries: ['/tasks?view=list&limit=5'] },
    })

    await waitFor(() => {
      expect(screen.getByText('Paginated task 1')).toBeInTheDocument()
    })

    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Page 2' }))

    await waitFor(() => {
      expect(screen.getByText('Paginated task 6')).toBeInTheDocument()
    })
  })
})
