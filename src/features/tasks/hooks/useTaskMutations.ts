import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  applyTaskPatchInLists,
  removeTaskFromLists,
  replaceTaskInLists,
  type ListSnapshot,
} from '@/features/tasks/api/task-list-cache.ts'
import { createTask, deleteTask, moveTask, updateTask } from '@/features/tasks/api/task.api.ts'
import { taskKeys } from '@/features/tasks/api/task.keys.ts'
import { toCreateTaskInput, type TaskFormValues } from '@/features/tasks/model/schemas.ts'
import type { MoveTaskInput, UpdateTaskInput } from '@/features/tasks/model/types.ts'
import type { TaskId } from '@/shared/types/branded.ts'
import { reportError } from '@/shared/lib/logger.ts'

export function useTaskMutations() {
  const queryClient = useQueryClient()

  const createTaskMutation = useMutation({
    mutationFn: (values: TaskFormValues) => createTask(toCreateTaskInput(values)),
    onSuccess: () => {
      toast.success('Task created')
      void queryClient.invalidateQueries({ queryKey: taskKeys.all })
    },
    onError: (error) => {
      reportError(error, { mutation: 'createTask' })
      toast.error('Failed to create task')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, input }: { taskId: TaskId; input: UpdateTaskInput }) =>
      updateTask(taskId, input),
    onMutate: async ({ taskId, input }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      const snapshots: ListSnapshot = queryClient.getQueriesData({
        queryKey: taskKeys.lists(),
      })

      applyTaskPatchInLists(queryClient, taskId, input)

      return { snapshots }
    },
    onError: (error, variables, context) => {
      reportError(error, { mutation: 'updateTask', taskId: variables.taskId })
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
      const snapshots: ListSnapshot = queryClient.getQueriesData({
        queryKey: taskKeys.lists(),
      })

      applyTaskPatchInLists(queryClient, taskId, input)
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() })

      return { snapshots }
    },
    onError: (error, variables, context) => {
      reportError(error, { mutation: 'moveTask', taskId: variables.taskId })
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

      const snapshots: ListSnapshot = queryClient.getQueriesData({
        queryKey: taskKeys.lists(),
      })

      removeTaskFromLists(queryClient, taskId)

      return { snapshots, taskId }
    },
    onError: (error, taskId, context) => {
      reportError(error, { mutation: 'deleteTask', taskId })
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
