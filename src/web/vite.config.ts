import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { siteMeta } from './scripts/site-meta.ts'

const here = (relative: string) => fileURLToPath(new URL(relative, import.meta.url))

/**
 * `src/Api/wwwroot` is build output and gitignored, but the empty directory
 * itself is tracked through a `.gitkeep` — and `emptyOutDir` would take it out
 * with everything else, leaving a deletion staged in git after every build.
 * Read before the build empties the directory, written back after.
 */
const keepOutDirTracked = (outDir: string): Plugin => {
  let contents = ''

  return {
    name: 'keep-outdir-tracked',
    configResolved() {
      contents = readFileSync(`${outDir}/.gitkeep`, 'utf8')
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: '.gitkeep', source: contents })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    siteMeta({ dataDir: here('../Api/Data'), publicDir: here('public') }),
    keepOutDirTracked(here('../Api/wwwroot')),
  ],
  build: {
    // Straight into the API's web root: in production one process serves both
    // the API and the app, so `dotnet publish` needs to find the built site
    // already in place. Emptied first, or a renamed chunk leaves an orphan.
    outDir: here('../Api/wwwroot'),
    emptyOutDir: true,
    // The photographs are the heavy part of this payload by an order of
    // magnitude; a source map per chunk on top of them earns nothing.
    sourcemap: false,
  },
  server: {
    port: 5173,
    // In development the API runs separately on the port from
    // src/Api/Properties/launchSettings.json. Proxying keeps the app on a
    // single origin, so fetch('/api/...') works the same in dev and prod.
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
