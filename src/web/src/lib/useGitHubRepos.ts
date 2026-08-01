import { useEffect, useState } from 'react'
import { profile } from '../content'
import type { GitHubRepo } from '../content/types'

/**
 * The only network request this site makes.
 *
 * With no backend there is nowhere to cache a GitHub response or hide a token,
 * so this calls api.github.com straight from the browser, unauthenticated. That
 * costs the visitor one of their 60 requests per hour, per IP — shared with
 * every other site doing the same thing, which is why a 403 here is a normal
 * outcome rather than an exceptional one.
 *
 * So this hook has no error state on purpose. Repo stats are decoration on top
 * of content that is already on the page; when GitHub says no, the cards simply
 * render without a stats row. Nothing here is ever allowed to surface an error
 * panel or block a paint.
 */

/** The account comes from the profile's own GitHub link, so there is one source
 * for the username rather than a constant that can drift from it. */
const USERNAME = profile.links.gitHub.replace(/\/+$/, '').split('/').pop() ?? ''

const ENDPOINT = `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`

const CACHE_KEY = 'github-repos-v1'
const CACHE_TTL_MS = 60 * 60 * 1000

/** Only the fields the cards use. GitHub sends about a hundred more. */
interface ApiRepo {
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  pushed_at: string | null
  topics?: string[]
}

interface CacheEntry {
  at: number
  repos: GitHubRepo[]
}

export function useGitHubRepos(): GitHubRepo[] {
  const [repos, setRepos] = useState<GitHubRepo[]>(readCache)

  useEffect(() => {
    if (USERNAME === '' || repos.length > 0) return

    const controller = new AbortController()

    fetch(ENDPOINT, {
      signal: controller.signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((response) => (response.ok ? (response.json() as Promise<ApiRepo[]>) : null))
      .then((body) => {
        if (body === null) return

        const mapped = body.map(toRepo)
        writeCache(mapped)
        setRepos(mapped)
      })
      .catch(() => {
        // Offline, rate-limited, blocked by an extension — all the same to the
        // page, which is already rendered and complete without this.
      })

    return () => {
      controller.abort()
    }
    // A cache hit means `repos` is already populated on the first render and
    // the guard above returns before any fetch. The one re-run this dependency
    // causes — after a successful fetch — hits the same guard.
  }, [repos.length])

  return repos
}

function toRepo(repo: ApiRepo): GitHubRepo {
  return {
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    htmlUrl: repo.html_url,
    language: repo.language,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    pushedAt: repo.pushed_at,
    topics: repo.topics ?? [],
  }
}

/**
 * `sessionStorage`, not `localStorage`: a stale star count for the length of one
 * visit is fine, but keeping it for weeks is not, and this way the cache cannot
 * outlive the tab. Any failure to read or write it is ignored — private-mode
 * browsers throw on access, and a cache is never worth breaking a page over.
 */
function readCache(): GitHubRepo[] {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (raw === null) return []

    const entry = JSON.parse(raw) as CacheEntry
    return Date.now() - entry.at < CACHE_TTL_MS ? entry.repos : []
  } catch {
    return []
  }
}

function writeCache(repos: GitHubRepo[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), repos } satisfies CacheEntry))
  } catch {
    // Full or unavailable. The page does not care.
  }
}
