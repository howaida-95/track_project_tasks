import { createBrowserRouter, Navigate } from 'react-router-dom'

import RootLayout from '@/app/layouts/RootLayout.tsx'
import NotFound from '@/app/layouts/NotFound.tsx'
import { paths } from '@/app/routes/paths.ts'
import BoardPlaceholder from '@/features/tasks/views/BoardPlaceholder.tsx'
import ListPlaceholder from '@/features/tasks/views/ListPlaceholder.tsx'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={paths.board} replace />,
      },
      {
        path: paths.board,
        element: <BoardPlaceholder />,
      },
      {
        path: paths.list,
        element: <ListPlaceholder />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
