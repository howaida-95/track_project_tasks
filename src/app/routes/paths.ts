export const paths = {
  home: '/',
  board: '/board',
  list: '/list',
  analytics: '/analytics',
  taskDetail: (taskId: string) => `/board/tasks/${taskId}` as const,
} as const
