import type { GitHubRepo, Project } from '../content/types'
import { formatRelative } from '../lib/dates'
import { ArrowUpRightIcon, ForkIcon, GitHubIcon, StarIcon } from './Icons'
import { Chip } from './Ui'

export type ProjectWithRepo = Project & { repo: GitHubRepo | null }

/**
 * One project, at the same weight as the other three.
 *
 * There is no lead card and no "featured" badge: these four are peers, and a
 * badge worn by most of them says nothing. Each card owes the reader the same
 * three things in the same order — what it is, what it is built with, and where
 * the source lives.
 *
 * The frame number is the site's contact-sheet motif applied here, and it is
 * the only piece of that motif on this page which does not depend on GitHub
 * answering: a rate-limited visitor loses the pushed-at stamp and would
 * otherwise see a page with no trace of the signature on it.
 */
export default function ProjectCard({
  project,
  index,
}: {
  project: ProjectWithRepo
  index: number
}) {
  const { repo } = project

  return (
    <article className="glass project-card group flex flex-col rounded-card transition-[transform,box-shadow] duration-200 ease-out-quint hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift-high)]">
      <header className="flex flex-col gap-2">
        <p className="gutter-date">{String(index + 1).padStart(2, '0')}</p>
        <h2 className="project-title font-semibold text-ink">{project.name}</h2>
        <p className="text-sm text-ink-muted">{project.summary}</p>
      </header>

      {project.description && <p className="text-sm text-ink-soft">{project.description}</p>}

      {project.tech.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <li key={tech}>
              <Chip>{tech}</Chip>
            </li>
          ))}
        </ul>
      )}

      {/* Pinned to the bottom so all four cards agree on where their links sit,
          however long the prose above runs. Repo stats appear only when a slug
          actually matched: absent GitHub data collapses the row rather than
          showing a line of zeroes. */}
      <footer className="mt-auto flex flex-col gap-3 border-t border-hairline pt-4">
        {repo && (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Language</dt>
                <span aria-hidden="true" className="size-2 rounded-full bg-accent" />
                <dd className="text-meta text-ink-muted">{repo.language}</dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Stars</dt>
              <StarIcon className="size-3.5 text-ink-faint" />
              <dd className="numeric text-meta text-ink-muted">{repo.stars}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Forks</dt>
              <ForkIcon className="size-3.5 text-ink-faint" />
              <dd className="numeric text-meta text-ink-muted">{repo.forks}</dd>
            </div>
            {repo.pushedAt && (
              <div className="ml-auto">
                <dt className="sr-only">Last pushed</dt>
                <dd className="gutter-date">Pushed {formatRelative(repo.pushedAt)}</dd>
              </div>
            )}
          </dl>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {project.liveUrl && (
            <CardLink href={project.liveUrl}>
              <ArrowUpRightIcon className="size-4" />
              Visit site
            </CardLink>
          )}
          {/* Built from the curated slug rather than the fetched repo, so the
              link survives GitHub being unreachable. */}
          {project.repoSlug && (
            <CardLink href={repo?.htmlUrl ?? `https://github.com/${project.repoSlug}`}>
              <GitHubIcon className="size-4" />
              Source
            </CardLink>
          )}
        </div>
      </footer>
    </article>
  )
}

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-meta font-medium text-ink-muted transition-colors duration-200 ease-out-quint hover:text-accent"
    >
      {children}
    </a>
  )
}
