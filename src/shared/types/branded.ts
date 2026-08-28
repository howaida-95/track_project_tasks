declare const taskIdBrand: unique symbol

/** Branded id so task ids are not confused with other string ids. */
export type TaskId = string & { readonly [taskIdBrand]: typeof taskIdBrand }

export function toTaskId(value: string): TaskId {
  return value as TaskId
}

export function createTaskId(): TaskId {
  return toTaskId(crypto.randomUUID())
}
