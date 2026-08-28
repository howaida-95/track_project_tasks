import { useEffect, useState } from 'react'
import { SlidersHorizontalIcon } from 'lucide-react'

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
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-2">
      <div className="space-y-2">
        <Label htmlFor="task-search">Search</Label>
        <Input
          id="task-search"
          type="search"
          placeholder="Search title, description, or tags"
          value={searchInput}
          onChange={(event) => {
            onSearchInputChange(event.target.value)
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-sort">Sort by</Label>
        <Select
          value={listParams.sort ?? 'createdAt'}
          onValueChange={(value) => {
            setListParams({ sort: value as TaskSortField })
          }}
        >
          <SelectTrigger id="task-sort" className="w-full">
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
        <Label htmlFor="task-order">Order</Label>
        <Select
          value={listParams.order ?? 'desc'}
          onValueChange={(value) => {
            setListParams({ order: value as 'asc' | 'desc' })
          }}
        >
          <SelectTrigger id="task-order" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Status</p>
        <div className="flex flex-wrap gap-2">
          {TASK_STATUSES.map((status) => {
            const isActive = listParams.status?.includes(status) ?? false

            return (
              <Button
                key={status}
                type="button"
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                aria-pressed={isActive}
                onClick={() => {
                  setListParams({
                    status: toggleValue(listParams.status, status as TaskStatus),
                  })
                }}
              >
                {TASK_STATUS_LABELS[status]}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Priority</p>
        <div className="flex flex-wrap gap-2">
          {TASK_PRIORITIES.map((priority) => {
            const isActive = listParams.priority?.includes(priority) ?? false

            return (
              <Button
                key={priority}
                type="button"
                size="sm"
                variant={isActive ? 'default' : 'outline'}
                aria-pressed={isActive}
                className={cn(!isActive && 'bg-background')}
                onClick={() => {
                  setListParams({
                    priority: toggleValue(listParams.priority, priority as TaskPriority),
                  })
                }}
              >
                {TASK_PRIORITY_LABELS[priority]}
              </Button>
            )
          })}
        </div>
      </div>

      {hasActiveFilters ? (
        <SheetFooter className="px-0">
          <Button type="button" variant="outline" onClick={onClear}>
            Clear all filters
          </Button>
        </SheetFooter>
      ) : null}
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
            className="relative gap-2"
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

        <SheetContent side="right" aria-describedby="filter-drawer-description">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription id="filter-drawer-description">
              Search and refine tasks. Changes apply immediately.
            </SheetDescription>
          </SheetHeader>

          <FilterDrawerContent
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onClear={() => {
              handleResetFilters()
              setOpen(false)
            }}
          />
        </SheetContent>
      </Sheet>
    </section>
  )
}

export default FilterBar
