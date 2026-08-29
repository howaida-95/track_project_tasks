import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Toaster } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FilterBar } from '@/features/tasks/filters/FilterBar.tsx'
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

    expect(await screen.findByRole('region', { name: 'To Do' })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Board task alpha')).toBeInTheDocument()
      expect(screen.getByText('Board task beta')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: 'Move Board task alpha' })).toBeInTheDocument()
  })

  it('applies a status filter immediately without a refresh', async () => {
    replaceTaskStore([
      makeTask({ title: 'Keep on board', status: 'todo', position: 0 }),
      makeTask({ title: 'Hide from board', status: 'done', position: 0 }),
    ])

    const user = userEvent.setup()

    renderWithProviders(
      <>
        <FilterBar />
        <BoardView />
      </>,
      {
        router: { initialEntries: ['/tasks'] },
      },
    )

    await waitFor(() => {
      expect(screen.getByText('Keep on board')).toBeInTheDocument()
      expect(screen.getByText('Hide from board')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /open filters/i }))
    await user.click(screen.getByRole('button', { name: 'To Do' }))

    await waitFor(() => {
      expect(screen.queryByText('Hide from board')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Keep on board')).toBeInTheDocument()
  })

  it('sorts cards within a column from URL sort and order params', async () => {
    replaceTaskStore([
      makeTask({ title: 'Zebra card', status: 'todo', position: 0 }),
      makeTask({ title: 'Alpha card', status: 'todo', position: 1 }),
    ])

    renderWithProviders(<BoardView />, {
      router: { initialEntries: ['/tasks?sort=title&order=asc'] },
    })

    const todo = await screen.findByRole('region', { name: 'To Do' })

    await waitFor(() => {
      const titles = within(todo)
        .getAllByRole('heading', { level: 3 })
        .map((heading) => heading.textContent)

      expect(titles[0]).toBe('Alpha card')
      expect(titles[1]).toBe('Zebra card')
    })
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

  it('virtualizes long columns so off-screen cards are not mounted', async () => {
    replaceTaskStore(
      Array.from({ length: 30 }, (_, index) =>
        makeTask({
          title: `Column card ${index + 1}`,
          status: 'todo',
          position: index,
        }),
      ),
    )

    renderWithProviders(<BoardView />, {
      router: { initialEntries: ['/tasks'] },
    })

    await waitFor(() => {
      expect(screen.getByText('Column card 1')).toBeInTheDocument()
    })

    expect(screen.queryByText('Column card 30')).not.toBeInTheDocument()
    expect(document.querySelector('[data-virtualized-column="todo"]')).toBeInTheDocument()
  })

  it('loads board columns in pages instead of fetching the whole column at once', async () => {
    replaceTaskStore(
      Array.from({ length: 60 }, (_, index) =>
        makeTask({
          title: `Paged card ${index + 1}`,
          status: 'todo',
          position: index,
        }),
      ),
    )

    renderWithProviders(<BoardView />, {
      router: { initialEntries: ['/tasks'] },
    })

    await waitFor(() => {
      expect(screen.getByText('Paged card 1')).toBeInTheDocument()
    })

    expect(within(column('To Do')).getByText('25 / 60')).toBeInTheDocument()
    expect(screen.queryByText('Paged card 26')).not.toBeInTheDocument()

    const scroller = document.querySelector('[data-virtualized-column="todo"]')
    expect(scroller).toBeInstanceOf(HTMLElement)

    if (!(scroller instanceof HTMLElement)) {
      throw new Error('Expected a virtualized todo column')
    }

    await waitFor(() => {
      scroller.scrollTop = 20_000
      fireEvent.scroll(scroller)
      expect(screen.getByText('Paged card 26')).toBeInTheDocument()
    })
  })
})
