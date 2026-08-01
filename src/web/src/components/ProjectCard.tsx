import type { GitHubRepo, Project } from '../content/types'
import { formatRelative } from '../lib/dates'
import { ArrowUpRightIcon, ForkIcon, GitHubIcon, StarIcon } from './Icons'
import { Chip } from './Ui'

export type ProjectWithRepo = Project & { repo: GitHubRepo | null }

/**
 * A curated project, optionally wearing live repo stats.
 *
 * `lead` is the first featured project: it spans the grid and steps the type up
 * a tier so the eye lands somewhere on arrival instead of scanning a wall of
 * identical cards.
 */
export default function ProjectCard({
  project,
  lead = false,
}: {
  project: ProjectWithRepo
  lead?: boolean
}) {
  const { repo } = project
  const primaryHref = project.liveUrl ?? repo?.htmlUrl ?? null

  return (
    <article
      className={`glass group flex flex-col rounded-card transition-[transform,box-shadow] duration-200 ease-out-quint hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift-high)] ${
        lead ? 'gap-5 p-7 md:col-span-2' : 'gap-4 p-6'
      }`}
    >
      <header className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className={`font-semibold text-ink ${lead ? 'text-xl' : 'text-lg'}`}>
            {project.name}
          </h3>
          {project.featured && (
            <span className="mt-0.5 shrink-0 rounded-full bg-ember-soft px-2.5 py-1 font-mono text-caption tracking-[0.1em] text-ember uppercase">
              Featured
            </span>
          )}
        </div>

        <p className={`text-ink-muted ${lead ? 'text-base' : 'text-sm'}`}>{project.summary}</p>
      </header>

      {lead && project.description && (
        <p className="text-sm text-ink-soft">{project.description}</p>
      )}

      {project.tech.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {project.tech.map((tech) => (
            <li key={tech}>
              <Chip>{tech}</Chip>
            </li>
          ))}
        </ul>
      )}

      {/* Live repo stats, only when a slug actually matched. Absent GitHub data
          collapses the row rather than showing zeroes. */}
      {repo && (
        <dl className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-hairline pt-4">
          {repo.language && (
            <div className="flex items-center gap-1.5">
              <dt className="sr-only">Language</dt>
              <span aria-hidden="true" className="size-2 rounded-full bg-ember" />
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

      {(primaryHref ?? repo) && (
        <footer className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
          {project.liveUrl && (
            <CardLink href={project.liveUrl}>
              <ArrowUpRightIcon className="size-4" />
              Visit site
            </CardLink>
          )}
          {repo && (
            <CardLink href={repo.htmlUrl}>
              <GitHubIcon className="size-4" />
              Source
            </CardLink>
          )}
        </footer>
      )}
    </article>
  )
}

function CardLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 text-meta font-medium text-ink-muted transition-colors duration-200 ease-out-quint hover:text-ember"
    >
      {children}
    </a>
  )
}
