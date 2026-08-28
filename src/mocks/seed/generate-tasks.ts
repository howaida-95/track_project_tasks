import type { Task } from '@/features/tasks/model/types.ts'
import { createTaskId } from '@/shared/types/branded.ts'
import { type TaskPriority, type TaskStatus } from '@/shared/types/task-ui.ts'

export const SEED_TASK_COUNT = 1200
export const SEED_VERSION = 1 as const

const TITLE_PREFIXES = [
  'Implement',
  'Review',
  'Fix',
  'Design',
  'Document',
  'Refactor',
  'Test',
  'Deploy',
  'Investigate',
  'Optimize',
] as const

const TITLE_SUBJECTS = [
  'auth flow',
  'kanban board',
  'filter bar',
  'task dialog',
  'API layer',
  'error boundary',
  'virtual list',
  'drag-and-drop',
  'URL sync',
  'analytics panel',
  'toast notifications',
  'loading skeletons',
  'accessibility pass',
  'CI pipeline',
  'README polish',
] as const

const TAG_POOL = [
  'frontend',
  'backend',
  'ux',
  'a11y',
  'perf',
  'bug',
  'feature',
  'docs',
  'refactor',
  'release',
] as const

function mulberry32(seed: number): () => number {
  let state = seed

  return () => {
    state += 0x6d2b79f5
    let t = Math.imul(state ^ (state >>> 15), state | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), state | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(random: () => number, values: readonly T[]): T {
  const index = Math.floor(random() * values.length)
  return values[index]!
}

function pickMany<T>(random: () => number, values: readonly T[], max: number): T[] {
  const count = Math.floor(random() * max) + 1
  const chosen = new Set<T>()

  while (chosen.size < count) {
    chosen.add(pick(random, values))
  }

  return [...chosen]
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function weightedStatus(random: () => number): TaskStatus {
  const roll = random()

  if (roll < 0.35) {
    return 'todo'
  }

  if (roll < 0.6) {
    return 'in_progress'
  }

  if (roll < 0.8) {
    return 'in_review'
  }

  return 'done'
}

function weightedPriority(random: () => number): TaskPriority {
  const roll = random()

  if (roll < 0.35) {
    return 'low'
  }

  if (roll < 0.65) {
    return 'medium'
  }

  if (roll < 0.9) {
    return 'high'
  }

  return 'urgent'
}

export function generateSeedTasks(count = SEED_TASK_COUNT, seed = 42): Task[] {
  const random = mulberry32(seed)
  const now = Date.now()

  return Array.from({ length: count }, (_, index) => {
    const createdOffsetDays = Math.floor(random() * 120)
    const createdAt = new Date(now - createdOffsetDays * 86_400_000)
    const updatedAt = new Date(createdAt.getTime() + Math.floor(random() * 14) * 86_400_000)
    const hasDueDate = random() > 0.15
    const dueOffsetDays = Math.floor(random() * 90) - 30
    const dueDate = hasDueDate ? toDateString(new Date(now + dueOffsetDays * 86_400_000)) : null

    const title = `${pick(random, TITLE_PREFIXES)} ${pick(random, TITLE_SUBJECTS)} #${index + 1}`

    return {
      id: createTaskId(),
      title,
      description: `Seeded task ${index + 1} for local development and demo filtering.`,
      status: weightedStatus(random),
      priority: weightedPriority(random),
      dueDate,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
      tags: pickMany(random, TAG_POOL, 3),
    }
  })
}
