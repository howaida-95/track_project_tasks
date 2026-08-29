import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import ListView from '@/features/tasks/views/ListView.tsx'
import { server } from '@/mocks/server.ts'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('ListView query errors', () => {
  it('shows an error state and refetches when retried', async () => {
    localStorage.clear()
    replaceTaskStore([makeTask({ title: 'Recoverable task', status: 'todo' })])

    let shouldFail = true

    server.use(
      http.get(`${import.meta.env.VITE_API_BASE_URL ?? '/api'}/tasks`, () => {
        if (shouldFail) {
          return HttpResponse.json({ status: 500, message: 'Forced server error' }, { status: 500 })
        }

        return HttpResponse.json({
          data: [makeTask({ title: 'Recoverable task', status: 'todo' })],
          meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
        })
      }),
    )

    renderWithProviders(<ListView />, {
      router: { initialEntries: ['/tasks?view=list'] },
    })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    shouldFail = false

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    })

    screen.getByRole('button', { name: 'Try again' }).click()

    await waitFor(() => {
      expect(screen.getByText('Recoverable task')).toBeInTheDocument()
    })
  })
})
