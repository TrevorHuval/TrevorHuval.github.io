import { useCallback, useEffect, useState } from 'react'
import { describeError, fetchJson } from './client'
import type { GitHubRepo, Photo, Profile, Project, Resume, SkillGroup } from './types'

export interface AsyncState<T> {
  data: T | null
  error: string | null
  loading: boolean
  /** Re-runs the request. Wired to the retry button on the error state. */
  reload: () => void
}

/**
 * One fetch, tied to the component's lifetime. `path` is a string, so the
 * effect dependency is stable without any memoisation at the call site.
 *
 * There is no query library here on purpose: the site makes at most two
 * requests per page and never mutates anything.
 */
export function useApi<T>(path: string): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  const reload = useCallback(() => {
    setAttempt((previous) => previous + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    setLoading(true)
    setError(null)

    fetchJson<T>(path, controller.signal)
      .then((result) => {
        setData(result)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        // An abort means the component went away or a reload superseded this
        // request; either way there is nobody left to show an error to.
        if (controller.signal.aborted) return

        setError(describeError(cause))
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
  }, [path, attempt])

  return { data, error, loading, reload }
}

export const useProfile = () => useApi<Profile>('/api/profile')
export const useResume = () => useApi<Resume>('/api/resume')
export const useSkills = () => useApi<SkillGroup[]>('/api/skills')
export const useProjects = () => useApi<Project[]>('/api/projects')
export const usePhotos = () => useApi<Photo[]>('/api/photos')
export const useGitHubRepos = () => useApi<GitHubRepo[]>('/api/github/repos')
