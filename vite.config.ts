import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
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
export default defineConfig({
  plugins: [srcAliasPlugin(), react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: `${srcDir.replaceAll('\\', '/')}/`,
      },
    ],
  },
})
