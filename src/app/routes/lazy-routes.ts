import { lazy } from 'react'

export const LazyBoardView = lazy(async () => {
  const module = await import('@/features/tasks/views/BoardView.tsx')
  return { default: module.BoardView }
})

export const LazyListView = lazy(async () => {
  const module = await import('@/features/tasks/views/ListView.tsx')
  return { default: module.ListView }
})

export const LazyAnalyticsView = lazy(async () => {
  const module = await import('@/features/analytics/views/AnalyticsView.tsx')
  return { default: module.AnalyticsView }
})
