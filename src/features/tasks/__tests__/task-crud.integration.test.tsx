import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import BoardLayout from '@/app/layouts/BoardLayout.tsx'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'
import { createTaskId } from '@/shared/types/branded.ts'

describe('task CRUD integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('creates a task from the board', async () => {
    replaceTaskStore([])

    const user = userEvent.setup()

    renderWithProviders(<BoardLayout />, {
      router: { initialEntries: ['/tasks'] },
    })

    await user.click(screen.getByRole('button', { name: 'New task' }))
    const dialog = await screen.findByRole('dialog', { name: 'Create task' }, { timeout: 5000 })

    await user.type(within(dialog).getByLabelText('Title'), 'Created from integration test')
    await user.click(within(dialog).getByRole('button', { name: 'Create task' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Create task' })).not.toBeInTheDocument()
    })

    expect(await screen.findByText('Created from integration test')).toBeInTheDocument()
  })

  it('edits a task from the board', async () => {
    const taskId = createTaskId()
    replaceTaskStore([
      makeTask({ id: taskId, title: 'Editable task', status: 'todo', position: 0 }),
    ])

    const user = userEvent.setup()

    renderWithProviders(<BoardLayout />, {
      router: { initialEntries: ['/tasks'] },
    })

    expect(await screen.findByText('Editable task')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(await screen.findByRole('dialog', { name: 'Edit task' })).toBeInTheDocument()

    const titleField = screen.getByLabelText('Title')
    await user.clear(titleField)
    await user.type(titleField, 'Updated task title')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Edit task' })).not.toBeInTheDocument()
    })

    expect(await screen.findByText('Updated task title')).toBeInTheDocument()
    expect(screen.queryByText('Editable task')).not.toBeInTheDocument()
  })

  it('deletes a task from the board', async () => {
    const taskId = createTaskId()
    replaceTaskStore([
      makeTask({ id: taskId, title: 'Deletable task', status: 'todo', position: 0 }),
    ])

    const user = userEvent.setup()

    renderWithProviders(<BoardLayout />, {
      router: { initialEntries: ['/tasks'] },
    })

    expect(await screen.findByText('Deletable task')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByRole('alertdialog')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.queryByText('Deletable task')).not.toBeInTheDocument()
    })
  })
})
