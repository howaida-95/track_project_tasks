import { useState } from 'react'

import { useAppSelector } from '@/app/store/hooks.ts'
import { selectIsDialogOpen } from '@/app/store/slices/dialogSlice.selectors.ts'
import { TaskDialogsHost } from '@/features/tasks/components/TaskDialogsHost.tsx'

export function TaskDialogsGate() {
  const isDialogOpen = useAppSelector(selectIsDialogOpen)
  const [shouldLoad, setShouldLoad] = useState(isDialogOpen)

  if (isDialogOpen && !shouldLoad) {
    setShouldLoad(true)
  }

  if (!shouldLoad) {
    return null
  }

  return <TaskDialogsHost />
}
