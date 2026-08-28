export type TaskView = 'board' | 'list'

export function parseTaskView(searchParams: URLSearchParams): TaskView {
  return searchParams.get('view') === 'list' ? 'list' : 'board'
}

export function serializeTaskView(view: TaskView): 'list' | null {
  return view === 'list' ? 'list' : null
}
