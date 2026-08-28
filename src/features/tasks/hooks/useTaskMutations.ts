import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { createTask, deleteTask, updateTask } from '@/features/tasks/api/task.api.ts'
import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import { toCreateTaskInput, type TaskFormValues } from '@/features/tasks/model/schemas.ts'
import type { PaginatedTasks, UpdateTaskInput } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'

type ListSnapshot = Array<[readonly unknown[], PaginatedTasks | undefined]>

function patchTaskInLists(
  queryClient: ReturnType<typeof useQueryClient>,
  taskId: TaskId,
  patch: UpdateTaskInput,
) {
  queryClient.setQueriesData<PaginatedTasks>({ queryKey: taskKeys.lists() }, (current) => {
    if (!current) {
      return current
    }

    return {
      ...current,
      data: current.data.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...patch,
              description: patch.description ?? task.description,
              dueDate: patch.dueDate === undefined ? task.dueDate : patch.dueDate,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
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

      patchTaskInLists(queryClient, taskId, input)

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
    onSuccess: () => {
      toast.success('Task updated')
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) })
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
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
  }
}
