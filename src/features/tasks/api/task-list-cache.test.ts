import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import {
  applyTaskPatchInLists,
  flattenTaskListData,
  removeTaskFromLists,
  replaceTaskInLists,
  uniqueTasksById,
  type CachedTaskList,
} from '@/features/tasks/api/task-list-cache.ts'
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
      queryClient.getQueryData<CachedTaskList>(taskKeys.list(toBoardColumnParams({}, 'todo')))!,
    )
    const inProgress = flattenTaskListData(
      queryClient.getQueryData<CachedTaskList>(
        taskKeys.list(toBoardColumnParams({}, 'in_progress')),
      )!,
    )

    expect(todo.map((task) => task.title)).toEqual(['Stay'])
    expect(inProgress.map((task) => task.title)).toEqual(['Move me', 'Already there'])
    expect(todo[0]?.position).toBe(0)
    expect(inProgress[0]?.position).toBe(0)
    expect(inProgress[1]?.position).toBe(1)
  })

  it('flattens paginated list data', () => {
    const tasks = [makeTask({ title: 'Paged task' })]
    const paginated: PaginatedTasks = {
      data: tasks,
      meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
    }

    expect(flattenTaskListData(paginated)).toEqual(tasks)
  })

  it('replaces a task in paginated list caches', () => {
    const queryClient = new QueryClient()
    const original = makeTask({ title: 'Before edit', status: 'todo', position: 0 })
    const updated = { ...original, title: 'After edit' }
    const paginated: PaginatedTasks = {
      data: [original],
      meta: { total: 1, page: 1, limit: 25, totalPages: 1 },
    }

    queryClient.setQueryData(taskKeys.list({}), paginated)
    replaceTaskInLists(queryClient, original.id, updated)

    const cached = queryClient.getQueryData<PaginatedTasks>(taskKeys.list({}))
    expect(cached?.data[0]?.title).toBe('After edit')
  })

  it('removes a task from list caches and updates totals', () => {
    const queryClient = new QueryClient()
    const keep = makeTask({ title: 'Keep me', status: 'todo', position: 0 })
    const remove = makeTask({ title: 'Remove me', status: 'todo', position: 1 })

    queryClient.setQueryData(
      taskKeys.list(toBoardColumnParams({}, 'todo')),
      infiniteList([keep, remove], 2),
    )

    removeTaskFromLists(queryClient, remove.id)

    const cached = queryClient.getQueryData<CachedTaskList>(
      taskKeys.list(toBoardColumnParams({}, 'todo')),
    )

    expect(cached).toBeDefined()
    const titles = flattenTaskListData(cached!).map((task) => task.title)

    expect(titles).toEqual(['Keep me'])
    expect(flattenTaskListData(cached!).length).toBe(1)
  })

  it('dedupes overlapping infinite pages when flattening', () => {
    const shared = makeTask({ title: 'Shared', status: 'todo', position: 0 })
    const onlyFirst = makeTask({ title: 'First only', status: 'todo', position: 1 })
    const onlySecond = makeTask({ title: 'Second only', status: 'todo', position: 2 })

    const data = {
      pages: [
        {
          data: [shared, onlyFirst],
          meta: { total: 3, page: 1, limit: 2, totalPages: 2 },
        },
        {
          data: [shared, onlySecond],
          meta: { total: 3, page: 2, limit: 2, totalPages: 2 },
        },
      ],
      pageParams: [1, 2],
    }

    expect(uniqueTasksById([shared, shared, onlyFirst]).map((task) => task.title)).toEqual([
      'Shared',
      'First only',
    ])
    expect(flattenTaskListData(data).map((task) => task.title)).toEqual([
      'Shared',
      'First only',
      'Second only',
    ])
  })
})
