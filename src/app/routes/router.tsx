import { createBrowserRouter } from 'react-router-dom'

import App from '@/App.tsx'
import { paths } from '@/app/routes/paths.ts'

export const router = createBrowserRouter([
  {
    path: paths.home,
    element: <App />,
  },
])
