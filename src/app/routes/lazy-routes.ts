import { lazy } from 'react'

export const LazyBoardView = lazy(async () => {
  const module = await import('@/features/tasks/views/BoardView.tsx')
  return { default: module.BoardView }
})

export const LazyListView = lazy(async () => {
  const module = await import('@/features/tasks/views/ListView.tsx')
  return { default: module.ListView }
})

export const LazyTaskDialogsHost = lazy(async () => {
  const module = await import('@/features/tasks/components/TaskDialogsHost.tsx')
  return { default: module.TaskDialogsHost }
})
