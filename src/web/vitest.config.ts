import { defineConfig } from 'vitest/config'

/**
 * Deliberately separate from `vite.config.ts`. The only tests here are the
 * content lint, which reads JSON and asserts on plain objects — it needs
 * neither React, Tailwind, nor the build-time HTML plugins, and running them
 * would just be a slower way to get the same answer.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
