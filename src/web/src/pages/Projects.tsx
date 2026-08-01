import { useMemo } from 'react'
import { projects } from '../content'
import type { GitHubRepo } from '../content/types'
import ProjectCard, { type ProjectWithRepo } from '../components/ProjectCard'
import { useGitHubRepos } from '../lib/useGitHubRepos'
import { usePageMeta } from '../lib/usePageMeta'

/**
 * Four projects, curated and equally weighted.
 *
 * The list is content Trevor controls and is on the page from the first paint.
 * Repo stats are an enrichment layer fetched from the browser, and
 * {@link useGitHubRepos} hands back an empty list rather than an error when
 * GitHub is unreachable or has rate-limited the visitor — so the grid is
 * complete either way, just with one row of metadata missing.
 *
 * There is deliberately no list of the account's other repositories here. This
 * page is the work Trevor chose to show; a dump of every repo he has ever
 * pushed is a different thing, and GitHub already hosts it.
 */
export default function Projects() {
  usePageMeta({
    title: 'Projects',
    description: 'Selected projects, with live repository stats where the source is public.',
  })

  const repos = useGitHubRepos()

  const curated = useMemo(() => mergeProjectsWithRepos(repos), [repos])

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-4 pt-6">
        <p className="gutter-date">Projects</p>
        <h1 className="text-3xl font-semibold text-ink">Things I've built</h1>
        <p className="max-w-[60ch] text-lg text-ink-muted">
          Side projects, built end to end — each one an excuse to take an idea further than a
          tutorial would.
        </p>
      </header>

      {/* An even two-up: the four are peers, and a card that spanned the grid
          would leave the fourth stranded at half width on a row of its own. */}
      <div className="grid gap-5 md:grid-cols-2">
        {curated.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </div>
  )
}

/**
 * Hangs live repo data off each curated project, matching `repoSlug` against
 * `fullName`. The comparison is case-insensitive because GitHub treats owner and
 * repo names that way, and a slug typed with different casing should still
 * match.
 */
function mergeProjectsWithRepos(repos: GitHubRepo[]): ProjectWithRepo[] {
  const bySlug = new Map(repos.map((repo) => [repo.fullName.toLowerCase(), repo]))

  return projects.map((project) => ({
    ...project,
    repo: project.repoSlug === null ? null : (bySlug.get(project.repoSlug.toLowerCase()) ?? null),
  }))
}
