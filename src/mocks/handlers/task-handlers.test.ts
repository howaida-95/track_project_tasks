import { beforeEach, describe, expect, it } from 'vitest'

import { PaginatedTasksSchema, TaskSchema } from '@/features/tasks/model/schemas.ts'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

describe('task handlers', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceTaskStore([
      makeTask({ title: 'Handler alpha', status: 'todo' }),
      makeTask({ title: 'Handler beta', status: 'in_progress' }),
    ])
  })

  it('lists tasks through MSW', async () => {
    const response = await fetch(`${API_BASE}/tasks?q=alpha`)
    expect(response.status).toBe(200)

    const body = PaginatedTasksSchema.parse(await response.json())
    expect(body.meta.total).toBe(1)
    expect(body.data[0]?.title).toBe('Handler alpha')
  })

  it('creates and fetches a task', async () => {
    const createResponse = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Created via MSW',
        status: 'todo',
        priority: 'low',
      }),
    })

    expect(createResponse.status).toBe(201)
    const created = TaskSchema.parse(await createResponse.json())

    const getResponse = await fetch(`${API_BASE}/tasks/${created.id}`)
    expect(getResponse.status).toBe(200)
    expect(TaskSchema.parse(await getResponse.json()).title).toBe('Created via MSW')
  })

  it('supports forced error query param', async () => {
    const response = await fetch(`${API_BASE}/tasks?forceError=500`)
    expect(response.status).toBe(500)
  })

  it('exposes dedicated forced error route', async () => {
    const response = await fetch(`${API_BASE}/tasks/__error/503`)
    expect(response.status).toBe(503)
  })
})
