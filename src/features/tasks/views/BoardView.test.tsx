import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Toaster } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import BoardView from '@/features/tasks/views/BoardView.tsx'
import { server } from '@/mocks/server.ts'
import { replaceTaskStore } from '@/mocks/db/task-store.ts'
import { makeTask } from '@/test/factories/make-task.ts'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

const COLUMN_ORDER = ['todo', 'in_progress', 'in_review', 'done'] as const
const COLUMN_WIDTH = 280
const COLUMN_GAP = 16
const CARD_HEIGHT = 96

function mockBoardLayout() {
  HTMLElement.prototype.scrollIntoView = vi.fn()
  HTMLElement.prototype.scrollTo = vi.fn()
  HTMLElement.prototype.scrollBy = vi.fn()

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const column = this.closest('[data-column-status]')
    const status =
      this.getAttribute('data-column-status') ?? column?.getAttribute('data-column-status')
    const columnIndex = COLUMN_ORDER.findIndex((value) => value === status)
    const x = Math.max(0, columnIndex) * (COLUMN_WIDTH + COLUMN_GAP)
    const y = 0
    const width = COLUMN_WIDTH
    const height = this.hasAttribute('data-column-status') ? 640 : CARD_HEIGHT - 12
    const top = this.hasAttribute('data-column-status')
      ? y
      : 72 + Number(this.getAttribute('data-card-index') ?? 0) * CARD_HEIGHT

    return {
      x,
      y: top,
      width,
      height,
      top,
      left: x,
      right: x + width,
      bottom: top + height,
      toJSON() {
        return {}
      },
    } as DOMRect
  })
}

function column(name: string) {
  return screen.getByRole('region', { name })
}

async function keyboardDragRight(handle: HTMLElement) {
  handle.focus()
  fireEvent.keyDown(handle, { key: ' ', code: 'Space' })

  await waitFor(() => {
    expect(handle).toHaveAttribute('aria-pressed', 'true')
  })

  await new Promise((resolve) => {
    setTimeout(resolve, 0)
  })

  fireEvent.keyDown(handle.ownerDocument, { key: 'ArrowRight', code: 'ArrowRight' })
  fireEvent.keyDown(handle.ownerDocument, { key: ' ', code: 'Space' })
}

describe('BoardView', () => {
  beforeEach(() => {
    localStorage.clear()
    mockBoardLayout()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders tasks from the mock API', async () => {
    replaceTaskStore([
      makeTask({ title: 'Board task alpha', status: 'todo', position: 0 }),
      makeTask({ title: 'Board task beta', status: 'done', position: 0 }),
    ])

    renderWithProviders(<BoardView />, {
      router: { initialEntries: ['/tasks'] },
    })

    expect(screen.getByRole('heading', { name: 'Task Board' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Board task alpha')).toBeInTheDocument()
      expect(screen.getByText('Board task beta')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Move Board task alpha' })).toBeInTheDocument()
  })

  it('moves a task between columns with the keyboard', async () => {
    replaceTaskStore([
      makeTask({ title: 'Board task alpha', status: 'todo', position: 0 }),
      makeTask({ title: 'Board task beta', status: 'in_progress', position: 0 }),
    ])

    renderWithProviders(<BoardView />, {
      router: { initialEntries: ['/tasks'] },
    })

    const handle = await screen.findByRole('button', { name: 'Move Board task alpha' })
    await keyboardDragRight(handle)

    await waitFor(() => {
      expect(within(column('In Progress')).getByText('Board task alpha')).toBeInTheDocument()
    })

    expect(within(column('To Do')).queryByText('Board task alpha')).not.toBeInTheDocument()
  })

  it('rolls back an optimistic move and offers retry', async () => {
    replaceTaskStore([
      makeTask({ title: 'Board task alpha', status: 'todo', position: 0 }),
      makeTask({ title: 'Board task beta', status: 'in_progress', position: 0 }),
    ])

    server.use(
      http.patch(`${import.meta.env.VITE_API_BASE_URL ?? '/api'}/tasks/:taskId`, () =>
        HttpResponse.json({ status: 500, message: 'Forced server error' }, { status: 500 }),
      ),
    )

    renderWithProviders(
      <>
        <BoardView />
        <Toaster />
      </>,
      {
        router: { initialEntries: ['/tasks'] },
      },
    )

    const handle = await screen.findByRole('button', { name: 'Move Board task alpha' })
    await keyboardDragRight(handle)

    await waitFor(() => {
      expect(screen.getByText('Failed to move task')).toBeInTheDocument()
    })

    expect(within(column('To Do')).getByText('Board task alpha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })
})
