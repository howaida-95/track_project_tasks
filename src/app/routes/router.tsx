import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import AnalyticsLayout from '@/app/layouts/AnalyticsLayout.tsx'
import BoardLayout from '@/app/layouts/BoardLayout.tsx'
import ErrorLayout from '@/app/layouts/ErrorLayout.tsx'
import RootLayout from '@/app/layouts/RootLayout.tsx'
import NotFound from '@/app/layouts/NotFound.tsx'
import { LegacyTasksRedirect } from '@/app/routes/LegacyTasksRedirect.tsx'
import { RouteFallback } from '@/app/routes/RouteFallback.tsx'
import { paths } from '@/app/routes/paths.ts'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={paths.tasks} replace />,
      },
      {
        path: paths.tasks,
        errorElement: <ErrorLayout />,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <BoardLayout />
          </Suspense>
        ),
      },
      {
        path: paths.analytics,
        errorElement: <ErrorLayout />,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <AnalyticsLayout />
          </Suspense>
        ),
      },
      {
        path: '/board',
        element: <LegacyTasksRedirect />,
      },
      {
        path: '/list',
        element: <LegacyTasksRedirect view="list" />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
