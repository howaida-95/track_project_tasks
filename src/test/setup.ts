import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetTaskStore } from '@/mocks/db/task-repository.ts'
import { server } from '@/mocks/server.ts'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Vitest runs without `globals`, so RTL's automatic cleanup is not registered.
afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
  resetTaskStore()
})

afterAll(() => {
  server.close()
})
