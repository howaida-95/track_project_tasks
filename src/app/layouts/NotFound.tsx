import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { paths } from '@/app/routes/paths.ts'

export function NotFound() {
  return (
    <section
      className="flex flex-col items-center py-16 text-center"
      aria-labelledby="not-found-title"
    >
      <h1 id="not-found-title" className="text-3xl font-bold">
        Page not found
      </h1>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist or was moved.
      </p>
      <Button asChild className="mt-6">
        <Link to={paths.tasks}>Back to tasks</Link>
      </Button>
    </section>
  )
}

export default NotFound
