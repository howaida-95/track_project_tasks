import { EmptyState } from '@/shared/components/empty-state.tsx'

export function ListPlaceholder() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Task List</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Virtualized list view — coming in filters-routing branch.
        </p>
      </header>
      <EmptyState
        title="List view not built yet"
        description="The virtualized table will appear here after task CRUD and filters are implemented."
      />
    </div>
  )
}

export default ListPlaceholder
