import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'

import { resetTaskStore } from '@/mocks/db/task-repository.ts'
import { server } from '@/mocks/server.ts'

class ResizeObserverStub implements ResizeObserver {
  readonly callback: ResizeObserverCallback

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }

  observe(target: Element): void {
    this.callback(
      [
        {
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        } as ResizeObserverEntry,
      ],
      this,
    )
  }

  unobserve(): void {}

  disconnect(): void {}
}

Object.defineProperties(HTMLElement.prototype, {
  clientHeight: {
    configurable: true,
    get() {
      return 800
    },
  },
  clientWidth: {
    configurable: true,
    get() {
      return 1024
    },
  },
  offsetHeight: {
    configurable: true,
    get() {
      return 800
    },
  },
  offsetWidth: {
    configurable: true,
    get() {
      return 1024
    },
  },
})

HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
  return {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    width: this.clientWidth,
    height: this.clientHeight,
    bottom: this.clientHeight,
    right: this.clientWidth,
    toJSON() {
      return {}
    },
  } as DOMRect
}

globalThis.ResizeObserver = ResizeObserverStub

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
