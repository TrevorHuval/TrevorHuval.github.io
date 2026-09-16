import { Link } from 'react-router-dom'
import { ArrowUpRightIcon } from './Icons'

/**
 * The handful of shapes that repeat across every page. They exist so the
 * spacing, radii and type tiers are decided once — a page that needs a
 * different heading rhythm is a page that has drifted.
 */

/** A page-level band. `Section` owns the vertical rhythm between blocks so no
 * page has to guess at a margin. */
export function Section({
  id,
  eyebrow,
  title,
  children,
  className = '',
}: {
  id?: string
  eyebrow?: string
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`content-section ${className}`}>
      {(eyebrow ?? title) && (
        <header className="flex flex-col gap-1.5">
          {eyebrow && (
            /* Same mono, tracked, faint treatment as the date gutter — section
               labels and date stamps read as one family of margin notes. */
            <p className="font-mono text-caption tracking-[0.14em] text-ink-faint uppercase">
              {eyebrow}
            </p>
          )}
          {title && <h2 className="text-2xl font-semibold text-ink">{title}</h2>}
        </header>
      )}
      {children}
    </section>
  )
}

/** A tech tag. Deliberately borderless — a grid of outlined pills turns into a
 * fence, and these are metadata, not controls. */
export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-inset px-2 py-1 text-caption font-medium text-ink-muted">
      {children}
    </span>
  )
}

type ActionProps = {
  children: React.ReactNode
  /** `primary` is the one call to action per view; everything else is `quiet`. */
  variant?: 'primary' | 'quiet'
  className?: string
} & (
  | { to: string; href?: never; external?: never; download?: never }
  | { href: string; to?: never; external?: boolean; download?: boolean }
)

const ACTION_BASE = 'action'

const ACTION_VARIANTS = {
  primary: 'action-primary',
  quiet: 'action-quiet',
} as const

/**
 * Shared action geometry is defined by the control tokens in index.css.
 * Pass `to` for an in-app route (client-side navigation) or `href` for anything
 * that leaves the app.
 */
export function ActionLink({ children, variant = 'quiet', className = '', ...rest }: ActionProps) {
  const classes = `${ACTION_BASE} ${ACTION_VARIANTS[variant]} ${className}`

  if (rest.to !== undefined) {
    return (
      <Link to={rest.to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <a
      href={rest.href}
      {...(rest.external ? { target: '_blank', rel: 'noreferrer' } : {})}
      {...(rest.download ? { download: '' } : {})}
      className={classes}
    >
      {children}
      {rest.external && <ArrowUpRightIcon className="size-4 opacity-60" />}
    </a>
  )
}
