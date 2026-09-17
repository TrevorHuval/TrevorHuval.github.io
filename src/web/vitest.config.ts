import { defineConfig } from 'vitest/config'

/**
 * Deliberately separate from `vite.config.ts`. The only tests here are the
 * content and token contrast checks, which assert on plain data — they need
 * neither React, Tailwind, nor the build-time HTML plugins, and running them
 * would just be a slower way to get the same answer.
 */
export default defineConfig({
  test: {
    environment: 'node',
    css: { include: /index\.css/ },
    include: ['src/**/*.test.ts'],
  },
})
