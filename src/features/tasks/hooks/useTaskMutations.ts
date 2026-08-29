import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createTask, deleteTask, moveTask, updateTask } from '@/features/tasks/api/task.api.ts'
import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import { toCreateTaskInput, type TaskFormValues } from '@/features/tasks/model/schemas.ts'
import { moveTaskInList, nextPositionForStatus } from '@/features/tasks/model/task.rules.ts'
import type {
  MoveTaskInput,
  PaginatedTasks,
  Task,
  UpdateTaskInput,
} from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'

type ListSnapshot = Array<[readonly unknown[], PaginatedTasks | undefined]>

function applyTaskPatchInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: TaskId,
  patch: UpdateTaskInput,
) {
  queryClient.setQueriesData<PaginatedTasks>({ queryKey: taskKeys.lists() }, (current) => {
    if (!current) {
      return current
    }

    const existing = current.data.find((task) => task.id === taskId)

    if (!existing) {
      return current
    }

    const nextStatus = patch.status ?? existing.status
    const statusChanged = nextStatus !== existing.status
    const positionChanged = patch.position !== undefined && patch.position !== existing.position
    const toIndex =
      patch.position ??
      (statusChanged ? nextPositionForStatus(current.data, nextStatus) : existing.position)

    const moved =
      statusChanged || positionChanged
        ? moveTaskInList(current.data, taskId, nextStatus, toIndex)
        : current.data

    return {
      ...current,
      data: moved.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...patch,
              description: patch.description ?? task.description,
              dueDate: patch.dueDate === undefined ? task.dueDate : patch.dueDate,
              status: task.status,
              position: task.position,
            }
          : task,
      ),
    }
  })
}

function replaceTaskInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: TaskId,
  updatedTask: Task,
) {
  queryClient.setQueriesData<PaginatedTasks>({ queryKey: taskKeys.lists() }, (current) => {
    if (!current) {
      return current
    }

    return {
      ...current,
      data: current.data.map((task) => (task.id === taskId ? updatedTask : task)),
    }
  })
}

function removeTaskFromLists(queryClient: ReturnType<typeof useQueryClient>, taskId: TaskId) {
  queryClient.setQueriesData<PaginatedTasks>({ queryKey: taskKeys.lists() }, (current) => {
    if (!current) {
      return current
    }

    return {
      ...current,
      data: current.data.filter((task) => task.id !== taskId),
      meta: {
        ...current.meta,
        total: Math.max(0, current.meta.total - 1),
      },
    }
  })
}

export function useTaskMutations() {
  const queryClient = useQueryClient()

  const createTaskMutation = useMutation({
    mutationFn: (values: TaskFormValues) => createTask(toCreateTaskInput(values)),
    onSuccess: () => {
      toast.success('Task created')
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
    onError: () => {
      toast.error('Failed to create task')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, input }: { taskId: TaskId; input: UpdateTaskInput }) =>
      updateTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const snapshots: ListSnapshot = queryClient.getQueriesData<PaginatedTasks>({
        queryKey: taskKeys.lists(),
      })

      applyTaskPatchInLists(queryClient, taskId, input)

      return { snapshots }
    },
    onError: (_error, variables, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })

      toast.error('Failed to update task', {
        action: {
          label: 'Retry',
          onClick: () => {
            updateTaskMutation.mutate(variables)
          },
        },
      })
    },
    onSuccess: (updatedTask, { taskId }) => {
      toast.success('Task updated')
      queryClient.setQueryData(taskKeys.detail(taskId), updatedTask)
      replaceTaskInLists(queryClient, taskId, updatedTask)
    },
  })

  const moveTaskMutation = useMutation({
    mutationFn: ({ taskId, input }: { taskId: TaskId; input: MoveTaskInput }) =>
      moveTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      const snapshots: ListSnapshot = queryClient.getQueriesData<PaginatedTasks>({
        queryKey: taskKeys.lists(),
      })

      applyTaskPatchInLists(queryClient, taskId, input)
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      return { snapshots }
    },
    onError: (_error, variables, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })

      toast.error('Failed to move task', {
        action: {
          label: 'Retry',
          onClick: () => {
            moveTaskMutation.mutate(variables)
          },
        },
      })
    },
    onSuccess: (updatedTask, { taskId }) => {
      queryClient.setQueryData(taskKeys.detail(taskId), updatedTask)
      replaceTaskInLists(queryClient, taskId, updatedTask)
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: TaskId) => deleteTask(taskId),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const snapshots: ListSnapshot = queryClient.getQueriesData<PaginatedTasks>({
        queryKey: taskKeys.lists(),
      })

      removeTaskFromLists(queryClient, taskId)

      return { snapshots, taskId }
    },
    onError: (_error, _taskId, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })

      toast.error('Failed to delete task', {
        action: {
          label: 'Retry',
          onClick: () => {
            if (context?.taskId) {
              deleteTaskMutation.mutate(context.taskId)
            }
          },
        },
      })
    },
    onSuccess: () => {
      toast.success('Task deleted')
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
  })

  return {
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    moveTaskMutation,
  }
}
