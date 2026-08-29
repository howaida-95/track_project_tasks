import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${srcDir.replaceAll('\\', '/')}/`,
      },
    ],
  },
  test: {
    environment: 'jsdom',
    pool: 'threads',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/features/**/*.{ts,tsx}',
        'src/app/store/**/*.{ts,tsx}',
        'src/shared/lib/**/*.{ts,tsx}',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/mocks/**',
        'src/components/ui/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 72,
        statements: 80,
      },
    },
  },
})
