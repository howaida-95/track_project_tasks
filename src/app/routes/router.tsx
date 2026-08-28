import { Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import BoardLayout from '@/app/layouts/BoardLayout.tsx'
import RootLayout from '@/app/layouts/RootLayout.tsx'
import NotFound from '@/app/layouts/NotFound.tsx'
import { LegacyTasksRedirect } from '@/app/routes/LegacyTasksRedirect.tsx'
import { RouteFallback } from '@/app/routes/RouteFallback.tsx'
import { paths } from '@/app/routes/paths.ts'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={paths.tasks} replace />,
      },
      {
        path: paths.tasks,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <BoardLayout />
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
