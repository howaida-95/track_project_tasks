import { screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'

import { TaskDialog } from '@/features/tasks/components/TaskDialog.tsx'
import { renderWithProviders } from '@/test/renderWithProviders.tsx'

describe('TaskDialog accessibility', () => {
  it('has no detectable accessibility violations in create mode', async () => {
    const { container } = renderWithProviders(
      <TaskDialog
        open
        mode="create"
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        formDefaults={{ status: 'todo' }}
      />,
    )

    expect(await screen.findByRole('dialog', { name: 'Create task' })).toBeInTheDocument()

    expect(await axe(container)).toHaveNoViolations()
  })
})
