import { describe, expect, it } from 'vitest'

import {
  createTaskFormSchema,
  TaskFormSchema,
  toCreateTaskInput,
} from '@/features/tasks/model/schemas.ts'
import { toLocalDateString } from '@/shared/lib/local-date.ts'

const validFields = {
  title: 'New task',
  description: 'Details',
  status: 'todo' as const,
  priority: 'high' as const,
}

function shiftLocalDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return toLocalDateString(date)
}

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

  it('accepts an empty due date', () => {
    expect(TaskFormSchema.safeParse({ ...validFields, dueDate: '' }).success).toBe(true)
  })

  it('accepts today and future due dates', () => {
    expect(TaskFormSchema.safeParse({ ...validFields, dueDate: toLocalDateString() }).success).toBe(
      true,
    )
    expect(TaskFormSchema.safeParse({ ...validFields, dueDate: shiftLocalDate(1) }).success).toBe(
      true,
    )
  })

  it('rejects a due date in the past', () => {
    const result = TaskFormSchema.safeParse({ ...validFields, dueDate: shiftLocalDate(-1) })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Due date must be today or later')
    }
  })

  it('allows keeping an existing overdue due date when editing', () => {
    const overdue = '2020-01-01'
    const schema = createTaskFormSchema(overdue)

    expect(schema.safeParse({ ...validFields, dueDate: overdue }).success).toBe(true)
    expect(schema.safeParse({ ...validFields, dueDate: '2020-01-02' }).success).toBe(false)
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
