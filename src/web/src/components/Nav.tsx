import { NavLink } from 'react-router-dom'
import { GitHubIcon, LinkedInIcon, MailIcon } from './Icons'
import type { ProfileLinks } from '../api/types'

const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/resume', label: 'Resume' },
  { to: '/projects', label: 'Projects' },
  { to: '/photos', label: 'Photos' },
] as const

/**
 * A floating glass pill. It is chrome, so it is deliberately quiet: 13px
 * labels, no icons on the page links, and the accent spent only on marking
 * where you are.
 *
 * The social links live here for reach and in the footer for completeness;
 * below `sm` only the footer carries them, so the pill never has to compete
 * for width on a phone.
 */
export default function Nav({ links }: { links: ProfileLinks | null }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
      <nav
        aria-label="Primary"
        className="glass-high flex items-center gap-1 rounded-full p-1.5 pl-2"
      >
        <ul className="flex items-center gap-0.5">
          {PAGES.map((page) => (
            <li key={page.to}>
              <NavLink
                to={page.to}
                end={page.to === '/'}
                className={({ isActive }) =>
                  [
                    // 40px, the same height as the site's buttons — the pill is
                    // quiet, but it is still the primary control on a phone.
                    'flex h-10 items-center rounded-full px-3.5 text-meta font-medium',
                    'transition-[color,background-color] duration-200 ease-out-quint',
                    isActive
                      ? 'bg-ember-soft text-ember'
                      : 'text-ink-muted hover:bg-inset hover:text-ink',
                  ].join(' ')
                }
              >
                {page.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {links && (
          <>
            <span aria-hidden="true" className="mx-1 hidden h-5 w-px bg-hairline sm:block" />
            <ul className="hidden items-center gap-0.5 sm:flex">
              <SocialLink href={links.gitHub} label="GitHub">
                <GitHubIcon className="size-[1.05rem]" />
              </SocialLink>
              <SocialLink href={links.linkedIn} label="LinkedIn">
                <LinkedInIcon className="size-[1.05rem]" />
              </SocialLink>
              <SocialLink href={`mailto:${links.email}`} label="Email">
                <MailIcon className="size-[1.05rem]" />
              </SocialLink>
            </ul>
          </>
        )}
      </nav>
    </header>
  )
}

function SocialLink({
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
