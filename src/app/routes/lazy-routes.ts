import { lazy } from 'react'

export const LazyListView = lazy(async () => {
  const module = await import('@/features/tasks/views/ListView.tsx')
  return { default: module.ListView }
})
