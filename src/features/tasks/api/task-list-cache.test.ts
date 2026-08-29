import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import { applyTaskPatchInLists, flattenTaskListData } from '@/features/tasks/api/task-list-cache.ts'
import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import { toBoardColumnParams } from '@/features/tasks/model/pagination.ts'
import type { PaginatedTasks, Task } from '@/features/tasks/model/types.ts'
import { makeTask } from '@/test/factories/make-task.ts'

function infiniteList(
  tasks: Task[],
  total = tasks.length,
): {
  pages: PaginatedTasks[]
  pageParams: number[]
} {
  return {
    pages: [
      {
        data: tasks,
        meta: { total, page: 1, limit: 25, totalPages: Math.ceil(total / 25) || 0 },
      },
    ],
    pageParams: [1],
  }
}

describe('task list cache', () => {
  it('moves a task between infinite column queries without dropping order', () => {
    const queryClient = new QueryClient()
    const moving = makeTask({ title: 'Move me', status: 'todo', position: 0 })
    const staying = makeTask({ title: 'Stay', status: 'todo', position: 1 })
    const dest = makeTask({ title: 'Already there', status: 'in_progress', position: 0 })

    queryClient.setQueryData(
      taskKeys.list(toBoardColumnParams({}, 'todo')),
      infiniteList([moving, staying], 2),
    )
    queryClient.setQueryData(
      taskKeys.list(toBoardColumnParams({}, 'in_progress')),
      infiniteList([dest], 1),
    )

    applyTaskPatchInLists(queryClient, moving.id, { status: 'in_progress', position: 0 })

    const todo = flattenTaskListData(
      queryClient.getQueryData(taskKeys.list(toBoardColumnParams({}, 'todo')))!,
    )
    const inProgress = flattenTaskListData(
      queryClient.getQueryData(taskKeys.list(toBoardColumnParams({}, 'in_progress')))!,
    )

    expect(todo.map((task) => task.title)).toEqual(['Stay'])
    expect(inProgress.map((task) => task.title)).toEqual(['Move me', 'Already there'])
    expect(todo[0]?.position).toBe(0)
    expect(inProgress[0]?.position).toBe(0)
    expect(inProgress[1]?.position).toBe(1)
  })
})
