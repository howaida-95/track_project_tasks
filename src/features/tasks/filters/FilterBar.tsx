import { useEffect, useState } from 'react'
import { ArrowUpDownIcon, SearchIcon, SlidersHorizontalIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge.tsx'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet.tsx'
import { cn } from '@/lib/utils'
import { useTaskFilters } from '@/features/tasks/filters/useTaskFilters.ts'
import type { TaskListParams } from '@/features/tasks/model/types.ts'
import type { TaskSortField } from '@/features/tasks/model/types.ts'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue.ts'
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type TaskPriority,
  type TaskStatus,
} from '@/shared/types/task-ui.ts'

const SORT_OPTIONS: Array<{ value: TaskSortField; label: string }> = [
  { value: 'createdAt', label: 'Created' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'position', label: 'Board order' },
]

function toggleValue<T extends string>(values: T[] | undefined, value: T): T[] {
  const current = values ?? []

  if (current.includes(value)) {
    return current.filter((item) => item !== value)
  }

  return [...current, value]
}

function countActiveFilters(listParams: TaskListParams): number {
  let count = 0

  if (listParams.q) {
    count += 1
  }

  if (listParams.status?.length) {
    count += listParams.status.length
  }

  if (listParams.priority?.length) {
    count += listParams.priority.length
  }

  if (listParams.from) {
    count += 1
  }

  if (listParams.to) {
    count += 1
  }

  if (listParams.sort && listParams.sort !== 'createdAt') {
    count += 1
  }

  if (listParams.order && listParams.order !== 'desc') {
    count += 1
  }

  return count
}

function FilterChip({
  label,
  isActive,
  onClick,
}: {
  label: string
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={isActive ? 'default' : 'outline'}
      aria-pressed={isActive}
      className={cn(
        'h-8 rounded-full px-3 text-xs font-medium shadow-none',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'border-border/80 bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
      onClick={onClick}
    >
      {label}
    </Button>
  )
}

type FilterDrawerContentProps = {
  searchInput: string
  onSearchInputChange: (value: string) => void
  onClear: () => void
}

function FilterDrawerContent({
  searchInput,
  onSearchInputChange,
  onClear,
}: FilterDrawerContentProps) {
  const { listParams, setListParams } = useTaskFilters()
  const hasActiveFilters = countActiveFilters(listParams) > 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-1 py-1">
        <section className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="task-search" className="text-xs font-medium tracking-wide">
              Search
            </Label>
            <p className="text-xs text-muted-foreground">Match title, description, or tags.</p>
          </div>
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="task-search"
              type="search"
              placeholder="Search tasks"
              value={searchInput}
              className="h-9 bg-background/80 pl-8 shadow-sm"
              onChange={(event) => {
                onSearchInputChange(event.target.value)
              }}
            />
          </div>
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide">Status</p>
            <p className="text-xs text-muted-foreground">Show only selected columns.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TASK_STATUSES.map((status) => {
              const isActive = listParams.status?.includes(status) ?? false

              return (
                <FilterChip
                  key={status}
                  label={TASK_STATUS_LABELS[status]}
                  isActive={isActive}
                  onClick={() => {
                    setListParams({
                      status: toggleValue(listParams.status, status as TaskStatus),
                    })
                  }}
                />
              )
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide">Priority</p>
            <p className="text-xs text-muted-foreground">Narrow by urgency.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TASK_PRIORITIES.map((priority) => {
              const isActive = listParams.priority?.includes(priority) ?? false

              return (
                <FilterChip
                  key={priority}
                  label={TASK_PRIORITY_LABELS[priority]}
                  isActive={isActive}
                  onClick={() => {
                    setListParams({
                      priority: toggleValue(listParams.priority, priority as TaskPriority),
                    })
                  }}
                />
              )
            })}
          </div>
        </section>

        <section className="space-y-3 rounded-xl border border-border/70 bg-muted/30 p-3">
          <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
            <ArrowUpDownIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
            Sort
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-sort" className="text-xs text-muted-foreground">
                Sort by
              </Label>
              <Select
                value={listParams.sort ?? 'createdAt'}
                onValueChange={(value) => {
                  setListParams({ sort: value as TaskSortField })
                }}
              >
                <SelectTrigger id="task-sort" className="h-9 w-full bg-background shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-order" className="text-xs text-muted-foreground">
                Order
              </Label>
              <Select
                value={listParams.order ?? 'desc'}
                onValueChange={(value) => {
                  setListParams({ order: value as 'asc' | 'desc' })
                }}
              >
                <SelectTrigger id="task-order" className="h-9 w-full bg-background shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
      </div>

      <SheetFooter className="mt-4 border-t border-border/70 px-0 pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!hasActiveFilters}
          onClick={onClear}
        >
          Clear all filters
        </Button>
      </SheetFooter>
    </div>
  )
}

export function FilterBar() {
  const { listParams, setListParams, resetFilters } = useTaskFilters()
  const [open, setOpen] = useState(false)
  const urlQuery = listParams.q ?? ''
  const [searchInput, setSearchInput] = useState(urlQuery)
  const debouncedSearch = useDebouncedValue(searchInput, 300)

  useEffect(() => {
    const normalized = debouncedSearch.trim()

    if (normalized === urlQuery) {
      return
    }

    setListParams(normalized ? { q: normalized } : { q: '' })
  }, [debouncedSearch, urlQuery, setListParams])

  const handleResetFilters = () => {
    setSearchInput('')
    resetFilters()
  }

  const activeFilterCount = countActiveFilters(listParams)

  return (
    <section aria-label="Task filters" className="shrink-0">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            aria-label={
              activeFilterCount > 0 ? `Open filters, ${activeFilterCount} active` : 'Open filters'
            }
            className="relative gap-2 bg-background shadow-sm"
          >
            <SlidersHorizontalIcon className="size-4" />
            Filters
            {activeFilterCount > 0 ? (
              <Badge variant="default" className="min-w-5 justify-center px-1.5">
                {activeFilterCount}
              </Badge>
            ) : null}
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          aria-describedby="filter-drawer-description"
          className="w-full max-w-sm gap-0 bg-popover p-0 sm:max-w-md"
        >
          <SheetHeader className="border-b border-border/70 bg-muted/40 px-5 py-4">
            <div className="flex items-start gap-3 pr-8">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
              </span>
              <div className="space-y-1">
                <SheetTitle className="text-lg font-semibold tracking-tight">Filters</SheetTitle>
                <SheetDescription id="filter-drawer-description">
                  Search and refine tasks. Changes apply immediately.
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col px-5 py-5">
            <FilterDrawerContent
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
              onClear={() => {
                handleResetFilters()
                setOpen(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default FilterBar
