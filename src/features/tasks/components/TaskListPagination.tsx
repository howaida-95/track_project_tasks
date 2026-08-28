import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getPaginationItems } from '@/shared/lib/pagination.ts'

type TaskListPaginationProps = {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function TaskListPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: TaskListPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const pageItems = getPaginationItems(currentPage, totalPages)

  return (
    <div className="mt-4 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages} ({totalItems} tasks)
      </p>

      <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => {
            onPageChange(currentPage - 1)
          }}
        >
          Previous
        </Button>

        {pageItems.map((item, index) =>
          item === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              size="sm"
              variant={item === currentPage ? 'default' : 'outline'}
              aria-label={`Page ${item}`}
              aria-current={item === currentPage ? 'page' : undefined}
              className={cn('min-w-8 px-2')}
              onClick={() => {
                onPageChange(item)
              }}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => {
            onPageChange(currentPage + 1)
          }}
        >
          Next
        </Button>
      </nav>
    </div>
  )
}
