import { AlertIcon } from './Icons'

/**
 * The three states every fetch on this site can be in. They are components
 * rather than inline markup so a failure looks identical on all four pages —
 * an error that looks different each time reads as a broken app.
 */

/** A shimmering placeholder sized to the content it stands in for, so nothing
 * jumps when the real thing arrives. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-inset ${className}`}
      style={{ animationDuration: '1.6s' }}
    />
  )
}

export function LoadingPanel({ label, lines = 3 }: { label: string; lines?: number }) {
  return (
    <div role="status" aria-live="polite" className="glass rounded-panel p-6">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="flex flex-col gap-3">
        <Skeleton className="h-3.5 w-32" />
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton key={index} className={index === lines - 1 ? 'h-3.5 w-2/3' : 'h-3.5 w-full'} />
        ))}
      </div>
    </div>
  )
}

export function ErrorPanel({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="glass flex flex-col items-start gap-3 rounded-panel p-6">
      <span className="flex items-center gap-2 text-ink">
        <AlertIcon className="size-[1.15rem] text-ember" />
        <span className="text-sm font-semibold">Something went wrong</span>
      </span>
      <p className="text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 flex h-9 items-center rounded-full border border-hairline-strong px-4 text-meta font-medium text-ink transition-[background-color,transform] duration-200 ease-out-quint hover:bg-inset active:scale-[0.97]"
        >
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyPanel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="glass flex flex-col items-center gap-1.5 rounded-panel px-6 py-14 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-ink-soft">{hint}</p>}
    </div>
  )
}
