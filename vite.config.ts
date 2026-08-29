import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, type Plugin } from 'vite'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

/**
 * Vite 8 / Rolldown can skip `resolve.alias` during import-analysis.
 * Resolve `@/` in a pre plugin so TSX and CSS both map to `src/`.
 */
function srcAliasPlugin(): Plugin {
  return {
    name: 'src-alias',
    enforce: 'pre',
    resolveId(id) {
      if (!id.startsWith('@/')) {
        return undefined
      }

      return path.resolve(srcDir, id.slice(2))
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    srcAliasPlugin(),
    react(),
    tailwindcss(),
    mode === 'analyze'
      ? visualizer({
          filename: 'dist/stats.html',
          gzipSize: true,
          brotliSize: true,
          template: 'treemap',
        })
      : undefined,
  ].filter((plugin): plugin is Plugin => Boolean(plugin)),
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${srcDir.replaceAll('\\', '/')}/`,
      },
    ],
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'dnd-kit',
              test: /node_modules[\\/]@dnd-kit[\\/]/,
              priority: 30,
            },
            {
              name: 'react-virtual',
              test: /node_modules[\\/]@tanstack[\\/]react-virtual[\\/]/,
              priority: 30,
            },
            {
              name: 'react-hook-form',
              test: /node_modules[\\/](react-hook-form|@hookform)[\\/]/,
              priority: 30,
            },
          ],
        },
      },
    },
  },
}))
