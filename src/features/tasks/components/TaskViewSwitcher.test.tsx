import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import BoardLayout from '@/app/layouts/BoardLayout.tsx'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('TaskViewSwitcher', () => {
  it('switches between board and list on the same route', async () => {
    localStorage.clear()
    replaceTaskStore([makeTask({ title: 'Switchable task', status: 'todo' })])

    const user = userEvent.setup()

    renderWithProviders(<BoardLayout />, {
      router: { initialEntries: ['/tasks'] },
    })

    expect(await screen.findByRole('heading', { name: 'Task Board' })).toBeInTheDocument()
    expect(await screen.findByText('Switchable task', {}, { timeout: 5000 })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'List view' }))

    expect(await screen.findByRole('heading', { name: 'Task List' })).toBeInTheDocument()
    expect(await screen.findByText('Switchable task')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Board view' }))

    expect(await screen.findByRole('heading', { name: 'Task Board' })).toBeInTheDocument()
  })

  it('keeps the create action available in both views', async () => {
    localStorage.clear()
    replaceTaskStore([makeTask({ title: 'Creatable task', status: 'todo' })])

    const user = userEvent.setup()

    renderWithProviders(<BoardLayout />, {
      router: { initialEntries: ['/tasks'] },
    })

    expect(screen.getByRole('button', { name: 'New task' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'List view' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Task List' })).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'New task' })).toBeInTheDocument()
  })

  it('loads the create dialog on demand', async () => {
    localStorage.clear()
    replaceTaskStore([makeTask({ title: 'Dialog seed', status: 'todo' })])

    const user = userEvent.setup()

    renderWithProviders(<BoardLayout />, {
      router: { initialEntries: ['/tasks'] },
    })

    expect(screen.queryByRole('dialog', { name: 'Create task' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'New task' }))

    expect(await screen.findByRole('dialog', { name: 'Create task' })).toBeInTheDocument()
  })
})
