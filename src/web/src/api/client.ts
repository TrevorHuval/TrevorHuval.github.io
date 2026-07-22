/**
 * The whole API client. Paths are always relative — in development the Vite
 * proxy forwards `/api` to the .NET app, so the frontend is single-origin in
 * dev exactly as it is in production. Never introduce an absolute API URL.
 */

/** A failed request, carrying the status code so callers can distinguish a 404
 * from the API being down. */
export class ApiError extends Error {
  // Assigned in the body rather than declared as a parameter property, which
  // `erasableSyntaxOnly` disallows.
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' } })

  if (!response.ok) {
    throw new ApiError(`Request to ${path} failed with ${response.status}.`, response.status)
  }

  return (await response.json()) as T
}

/** Turns anything thrown by {@link fetchJson} into a sentence worth showing a
 * visitor. Aborts are filtered out by the caller, not here. */
export function describeError(cause: unknown): string {
  if (cause instanceof ApiError) {
    return cause.status >= 500
      ? 'The server had a problem answering that.'
      : 'That content could not be found.'
  }

  return 'Could not reach the server. Check your connection and try again.'
}
