import type { AxiosRequestConfig } from 'axios'

import { MoveTaskSchema, PaginatedTasksSchema, TaskSchema } from '@/features/tasks/model/schemas.ts'
import type {
  CreateTaskInput,
  MoveTaskInput,
  PaginatedTasks,
  Task,
  TaskListParams,
  UpdateTaskInput,
} from '@/features/tasks/model/types.ts'
import { buildListParams, serializeTaskListParams } from '@/features/tasks/api/task-params.ts'
import { axiosClient } from '@/shared/api/axiosClient.ts'
import { parseResponse } from '@/shared/api/parse-response.ts'
import type { TaskId } from '@/shared/types/branded.ts'

const TASKS_PATH = '/tasks'

type RequestOptions = {
  signal?: AbortSignal
}

function withRequestOptions(options: RequestOptions): Pick<AxiosRequestConfig, 'signal'> {
  if (options.signal !== undefined) {
    return { signal: options.signal }
  }

  return {}
}

export async function listTasks(
  params: TaskListParams = {},
  options: RequestOptions = {},
): Promise<PaginatedTasks> {
  const response = await axiosClient.get<unknown>(TASKS_PATH, {
    params: buildListParams(params),
    paramsSerializer: () => serializeTaskListParams(params),
    ...withRequestOptions(options),
  })

  return parseResponse(PaginatedTasksSchema, response.data, 'listTasks') as PaginatedTasks
}

export async function getTask(taskId: TaskId, options: RequestOptions = {}): Promise<Task> {
  const response = await axiosClient.get<unknown>(`${TASKS_PATH}/${taskId}`, {
    ...withRequestOptions(options),
  })

  return parseResponse(TaskSchema, response.data, 'getTask') as Task
}

export async function createTask(
  input: CreateTaskInput,
  options: RequestOptions = {},
): Promise<Task> {
  const response = await axiosClient.post<unknown>(TASKS_PATH, input, {
    ...withRequestOptions(options),
  })

  return parseResponse(TaskSchema, response.data, 'createTask') as Task
}

export async function updateTask(
  taskId: TaskId,
  input: UpdateTaskInput,
  options: RequestOptions = {},
): Promise<Task> {
  const response = await axiosClient.patch<unknown>(`${TASKS_PATH}/${taskId}`, input, {
    ...withRequestOptions(options),
  })

  return parseResponse(TaskSchema, response.data, 'updateTask') as Task
}

export async function moveTask(
  taskId: TaskId,
  input: MoveTaskInput,
  options: RequestOptions = {},
): Promise<Task> {
  const payload = MoveTaskSchema.parse(input)
  const response = await axiosClient.patch<unknown>(`${TASKS_PATH}/${taskId}`, payload, {
    ...withRequestOptions(options),
  })

  return parseResponse(TaskSchema, response.data, 'moveTask') as Task
}

export async function deleteTask(taskId: TaskId, options: RequestOptions = {}): Promise<void> {
  await axiosClient.delete(`${TASKS_PATH}/${taskId}`, {
    ...withRequestOptions(options),
  })
}
