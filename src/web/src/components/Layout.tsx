import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AmbientBackground from './AmbientBackground'
import Nav from './Nav'
import { GitHubIcon, LinkedInIcon } from './Icons'
import { profile } from '../content'

/**
 * The shell every route renders into. The measure is capped at 68rem: wide
 * enough for a three-up project grid, narrow enough that a résumé bullet never
 * runs past a comfortable line length.
 *
 * Top padding clears the floating nav pill; the Photos page overrides the
 * horizontal padding for its own full-bleed grid.
 */
export default function Layout() {
  useScrollToTopOnNavigate()

  return (
    <div className="flex min-h-screen flex-col">
      <AmbientBackground />
      <SkipLink />
      <Nav links={profile.links} quickLinks={profile.quickLinks} />

      {/* tabIndex -1 so the skip link actually lands focus here rather than
          only moving the scroll position. */}
      <main
        id="content"
        tabIndex={-1}
        className="mx-auto w-full max-w-[68rem] flex-1 px-5 pt-28 pb-24 sm:px-8"
      >
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

/**
 * A client-side route change does not reset the scroll position the way a real
 * navigation does, so without this you land halfway down the next page.
 * `instant` rather than smooth: the browser's own back/forward feel is instant,
 * and animating it makes navigation feel laggy.
 */
function useScrollToTopOnNavigate() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
}

/**
 * The first stop on a keyboard tab through the site. It parks off-screen rather
 * than being display:none, so it stays focusable; landing focus drops it into
 * place as the same glass pill the nav is made of.
 *
 * Keyed to `:focus` rather than `:focus-visible`: parked off-screen it can only
 * ever be reached by keyboard, and the one keyboard affordance on the page is
 * not worth betting on a heuristic.
 */
function SkipLink() {
  return (
    <a
      href="#content"
      className="glass-high fixed top-4 left-4 z-50 -translate-y-24 rounded-full px-5 py-2.5 text-meta font-medium text-ink transition-transform duration-200 ease-out-quint focus:translate-y-0"
    >
      Skip to content
    </a>
  )
}

function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mx-auto w-full max-w-[68rem] px-5 pb-10 sm:px-8">
      <div className="flex flex-col items-center gap-5 border-t border-hairline pt-8 sm:flex-row sm:justify-between">
        <p className="numeric text-meta text-ink-soft">
          © {year} {profile.name}
        </p>

        <ul className="flex items-center gap-1">
          <FooterLink href={profile.links.gitHub} label="GitHub">
            <GitHubIcon className="size-[1.05rem]" />
          </FooterLink>
          <FooterLink href={profile.links.linkedIn} label="LinkedIn">
            <LinkedInIcon className="size-[1.05rem]" />
          </FooterLink>
        </ul>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <li>
      <a
        href={href}
        aria-label={label}
        target="_blank"
        rel="me noreferrer"
        className="flex size-10 items-center justify-center rounded-full text-ink-soft transition-[color,background-color] duration-200 ease-out-quint hover:bg-inset hover:text-ink active:scale-[0.97]"
      >
        {children}
      </a>
    </li>
  )
}
