import { summarizeTasks } from '@/features/tasks/model/task.rules.ts'
import type { TaskStats } from '@/features/tasks/model/types.ts'

export function emptyTaskStats(): TaskStats {
  return summarizeTasks([])
}

export function countShare(count: number, total: number): number {
  if (total <= 0) {
    return 0
  }

  return Math.round((count / total) * 100)
}

export { summarizeTasks }
