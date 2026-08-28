export const paths = {
  home: '/',
  tasks: '/tasks',
  analytics: '/analytics',
  taskDetail: (taskId: string) => `/tasks/${taskId}` as const,
} as const
