import { Skeleton } from '@/components/ui/skeleton.tsx'

export function RouteFallback() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  )
}
