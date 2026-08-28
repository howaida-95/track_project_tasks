import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetTaskStore } from '@/mocks/db/task-repository.ts'
import { server } from '@/mocks/server.ts'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
  resetTaskStore()
})

afterAll(() => {
  server.close()
})
