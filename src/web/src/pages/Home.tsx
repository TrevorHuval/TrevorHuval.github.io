import { useEffect, useState } from 'react'

interface HealthStatus {
  status: string
  timestamp: string
}

/**
 * Placeholder home page. It exists to prove the dev plumbing end to end: the
 * request below goes to the Vite dev server, which proxies /api to the .NET
 * app. The real pages are built in a later session.
 */
export default function Home() {
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/api/health')
      .then((response) => {
        if (!response.ok) throw new Error(`API returned ${response.status}`)
        return response.json() as Promise<HealthStatus>
      })
      .then((data) => {
        if (!cancelled) setHealth(data)
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : String(cause))
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Trevor Huval</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Personal site — scaffold in place, content coming soon.
      </p>
      <p data-testid="health" className="font-mono text-sm">
        {error !== null && <span>API unreachable: {error}</span>}
        {error === null && health === null && <span>Checking API…</span>}
        {health !== null && (
          <span>
            API health: {health.status} ({health.timestamp})
          </span>
        )}
      </p>
    </main>
  )
}
