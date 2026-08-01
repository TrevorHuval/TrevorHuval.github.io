import { useMemo } from 'react'
import { projects } from '../content'
import type { GitHubRepo } from '../content/types'
import ProjectCard, { type ProjectWithRepo } from '../components/ProjectCard'
import { ArrowUpRightIcon, ForkIcon, StarIcon } from '../components/Icons'
import { Section } from '../components/Ui'
import { formatRelative } from '../lib/dates'
import { useGitHubRepos } from '../lib/useGitHubRepos'
import { usePageMeta } from '../lib/usePageMeta'

/**
 * Curated projects first, live GitHub second.
 *
 * The curated list is content Trevor controls and is on the page from the first
 * paint. Repo stats are an enrichment layer fetched from the browser, and
 * {@link useGitHubRepos} hands back an empty list rather than an error when
 * GitHub is unreachable or has rate-limited the visitor.
 */
export default function Projects() {
  usePageMeta({
    title: 'Projects',
    description: 'Selected projects, with live repository stats where the source is public.',
  })

  const repos = useGitHubRepos()

  const { curated, remaining } = useMemo(() => mergeProjectsWithRepos(repos), [repos])

  const [lead, ...rest] = curated

  return (
    <div className="flex flex-col gap-16">
      <header className="flex flex-col gap-4 pt-6">
        <p className="gutter-date">Projects</p>
        <h1 className="text-3xl font-semibold text-ink">Things I've built</h1>
        <p className="max-w-[60ch] text-lg text-ink-muted">
          A few projects worth writing about, with live repository stats where the source is
          public.
        </p>
      </header>

      {/* The lead card spans both columns and steps its type up a tier, so the
          grid has a clear entry point instead of reading as a wall. */}
      <div className="grid gap-5 md:grid-cols-2">
        <ProjectCard key={lead.id} project={lead} lead />
        {rest.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {remaining.length > 0 && (
        <Section eyebrow="Open source" title="More on GitHub">
          <ul className="glass divide-y divide-hairline overflow-hidden rounded-panel">
            {remaining.map((repo) => (
              <li key={repo.fullName}>
                <a
                  href={repo.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col gap-2 p-5 transition-colors duration-200 ease-out-quint hover:bg-inset sm:flex-row sm:items-center sm:gap-6"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-meta font-semibold text-ink">
                      {repo.name}
                      <ArrowUpRightIcon className="size-3.5 text-ink-faint transition-colors duration-200 ease-out-quint group-hover:text-ember" />
                    </p>
                    {repo.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{repo.description}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    {repo.language && (
                      <span className="flex items-center gap-1.5 text-meta text-ink-muted">
                        <span aria-hidden="true" className="size-2 rounded-full bg-ember" />
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-meta text-ink-muted">
                      <StarIcon className="size-3.5 text-ink-faint" />
                      <span className="numeric">{repo.stars}</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-meta text-ink-muted">
                      <ForkIcon className="size-3.5 text-ink-faint" />
                      <span className="numeric">{repo.forks}</span>
                    </span>
                    {repo.pushedAt && (
                      <span className="gutter-date hidden w-28 text-right sm:block">
                        {formatRelative(repo.pushedAt)}
                      </span>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}

/**
 * Joins curated projects to repos on `repoSlug` === `fullName`, and returns the
 * repos that found no curated home so they can be listed separately.
 *
 * The comparison is case-insensitive because GitHub treats owner and repo names
 * that way, and a slug typed with different casing should still match.
 */
function mergeProjectsWithRepos(repos: GitHubRepo[]): {
  curated: ProjectWithRepo[]
  remaining: GitHubRepo[]
} {
  const bySlug = new Map(repos.map((repo) => [repo.fullName.toLowerCase(), repo]))
  const claimed = new Set<string>()

  const curated = projects.map((project) => {
    const key = project.repoSlug?.toLowerCase() ?? null
    const repo = key === null ? null : (bySlug.get(key) ?? null)

    if (repo) claimed.add(repo.fullName.toLowerCase())

    return { ...project, repo }
  })

  const remaining = repos.filter((repo) => !claimed.has(repo.fullName.toLowerCase()))

  return { curated, remaining }
}
