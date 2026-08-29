import { describe, expect, it } from 'vitest'

import { TaskFormSchema, toCreateTaskInput } from '@/features/tasks/model/schemas.ts'

describe('TaskFormSchema', () => {
  it('validates required title', () => {
    const result = TaskFormSchema.safeParse({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
    })

    expect(result.success).toBe(false)
  })

  it('maps empty due date to null for create input', () => {
    expect(
      toCreateTaskInput({
        title: 'New task',
        description: 'Details',
        status: 'todo',
        priority: 'high',
        dueDate: '',
      }),
    ).toEqual({
      title: 'New task',
      description: 'Details',
      status: 'todo',
      priority: 'high',
      dueDate: null,
    })
  })

  it('maps whitespace-only due date to null', () => {
    expect(
      toCreateTaskInput({
        title: 'New task',
        description: 'Details',
        status: 'todo',
        priority: 'high',
        dueDate: '   ',
      }).dueDate,
    ).toBeNull()
  })
})
