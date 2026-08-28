import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '@/features/tasks/api/task.api.ts'
import { serializeTaskListParams } from '@/features/tasks/api/task-params.ts'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { server } from '@/mocks/server.ts'
import { axiosClient } from '@/shared/api/axiosClient.ts'
import { ApiContractError, ApiError } from '@/shared/api/errors.ts'
import { makeTask } from '@/test/factories/make-task.ts'

describe('task.api', () => {
  beforeEach(() => {
    localStorage.clear()
    replaceTaskStore([
      makeTask({ title: 'API alpha', status: 'todo' }),
      makeTask({ title: 'API beta', status: 'in_progress' }),
    ])
  })

  it('lists tasks with multi-value filters', async () => {
    const result = await listTasks({
      q: 'alpha',
      status: ['todo'],
      page: 1,
      limit: 10,
    })

    expect(result.meta.total).toBe(1)
    expect(result.data[0]?.title).toBe('API alpha')
  })

  it('gets, creates, updates, and deletes a task', async () => {
    const created = await createTask({
      title: 'Created through axios',
      status: 'todo',
      priority: 'medium',
    })

    const fetched = await getTask(created.id)
    expect(fetched.title).toBe('Created through axios')

    const updated = await updateTask(created.id, { status: 'done' })
    expect(updated.status).toBe('done')

    await deleteTask(created.id)

    await expect(getTask(created.id)).rejects.toBeInstanceOf(ApiError)
  })

  it('maps API failures to ApiError', async () => {
    await expect(axiosClient.get('/tasks', { params: { forceError: 500 } })).rejects.toBeInstanceOf(
      ApiError,
    )
  })

  it('throws ApiContractError for invalid payloads', async () => {
    const task = makeTask({ title: 'Broken payload source' })
    replaceTaskStore([task])

    server.use(
      http.get(`${import.meta.env.VITE_API_BASE_URL ?? '/api'}/tasks/:taskId`, () =>
        HttpResponse.json({
          id: task.id,
          title: '',
          description: '',
          status: 'todo',
          priority: 'medium',
          dueDate: null,
          createdAt: 'not-a-datetime',
          updatedAt: 'not-a-datetime',
          tags: [],
        }),
      ),
    )

    await expect(getTask(task.id)).rejects.toBeInstanceOf(ApiContractError)
  })

  it('serializes repeated filter params', () => {
    const serialized = serializeTaskListParams({
      status: ['todo', 'done'],
      priority: ['high'],
      page: 2,
    })

    expect(serialized).toContain('page=2')
    expect(serialized).toContain('status=todo')
    expect(serialized).toContain('status=done')
    expect(serialized).toContain('priority=high')
  })

  it('forwards abort signals to axios', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(listTasks({}, { signal: controller.signal })).rejects.toThrow()
  })
})
