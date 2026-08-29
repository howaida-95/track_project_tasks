import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Toaster } from 'sonner'
import { beforeEach, describe, expect, it } from 'vitest'

import BoardLayout from '@/app/layouts/BoardLayout.tsx'
import { server } from '@/mocks/server.ts'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'
import { createTaskId } from '@/shared/types/branded.ts'

describe('task mutation failures', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('rolls back a failed edit and keeps the dialog open for retry', async () => {
    const taskId = createTaskId()
    replaceTaskStore([
      makeTask({ id: taskId, title: 'Rollback edit task', status: 'todo', position: 0 }),
    ])

    server.use(
      http.patch(`${import.meta.env.VITE_API_BASE_URL ?? '/api'}/tasks/:taskId`, () =>
        HttpResponse.json({ status: 500, message: 'Forced server error' }, { status: 500 }),
      ),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <>
        <BoardLayout />
        <Toaster />
      </>,
      {
        router: { initialEntries: ['/tasks'] },
      },
    )

    expect(await screen.findByText('Rollback edit task')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(await screen.findByRole('dialog', { name: 'Edit task' })).toBeInTheDocument()

    const titleField = screen.getByLabelText('Title')
    await user.clear(titleField)
    await user.type(titleField, 'Should not persist')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to update task')).toBeInTheDocument()
    })

    expect(screen.getByText('Rollback edit task')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeInTheDocument()
  })

  it('rolls back a failed delete and offers retry', async () => {
    const taskId = createTaskId()
    replaceTaskStore([
      makeTask({ id: taskId, title: 'Rollback delete task', status: 'todo', position: 0 }),
    ])

    server.use(
      http.delete(`${import.meta.env.VITE_API_BASE_URL ?? '/api'}/tasks/:taskId`, () =>
        HttpResponse.json({ status: 500, message: 'Forced server error' }, { status: 500 }),
      ),
    )

    const user = userEvent.setup()

    renderWithProviders(
      <>
        <BoardLayout />
        <Toaster />
      </>,
      {
        router: { initialEntries: ['/tasks'] },
      },
    )

    expect(await screen.findByText('Rollback delete task')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.getByText('Failed to delete task')).toBeInTheDocument()
    })

    expect(screen.getByText('Rollback delete task')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Retry' }).length).toBeGreaterThan(0)
  })
})
