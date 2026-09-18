import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRightIcon, GitHubIcon, LinkedInIcon } from './Icons'
import { presentation, profile } from '../content'
import type { ProfileLinks, QuickLink } from '../content/types'

/** Inline desktop navigation becomes a compact disclosure on smaller screens. */
export default function Nav({ links, quickLinks }: { links: ProfileLinks; quickLinks: QuickLink[] }) {
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === 'light')
  const [open, setOpen] = useState(false)
  const nav = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1200px)')
    const close = () => setOpen(false)
    desktop.addEventListener('change', close)
    return () => desktop.removeEventListener('change', close)
  }, [])

  useEffect(() => {
    if (!open) return
    function dismiss(event: PointerEvent) {
      if (!nav.current?.contains(event.target as Node)) setOpen(false)
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  function toggleTheme() {
    const next = !light
    setLight(next)
    document.documentElement.dataset.theme = next ? 'light' : 'dark'
    try {
      localStorage.setItem('site-theme', next ? 'light' : 'dark')
    } catch { /* Storage is optional. */ }
  }

  return (
    <header className="site-header">
      <nav ref={nav} className="site-nav" aria-label="Primary" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}>
        <Link to="/" className="wordmark" aria-label={`${profile.name}, home`}>
          {profile.name.split(' ').map((part) => part[0]).join('')}<span aria-hidden="true">.</span>
        </Link>
        <button ref={toggle} type="button" className="icon-button nav-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="navigation-links" onClick={() => setOpen(!open)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" className="size-5">
            <path d={open ? 'M6 6l12 12M6 18L18 6' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
        <div id="navigation-links" className="nav-content" data-open={open} onClick={(event) => {
          if ((event.target as Element).closest('a')) setOpen(false)
        }}>
          <ul className="nav-pages">
            {presentation.navigation.map((page) => (
              <li key={page.to}>
                <NavLink to={page.to} end={page.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                  {page.label}
                </NavLink>
              </li>
            ))}
          </ul>
          {quickLinks.length > 0 && (
            <ul className="nav-apps" aria-label="Live projects">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="nav-link nav-app">
                    {link.label}
                    <ArrowUpRightIcon className="size-3.5 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <div className="nav-tools">
            <a href={links.gitHub} target="_blank" rel="me noreferrer" className="icon-button nav-social" aria-label="GitHub"><GitHubIcon className="size-4" /></a>
            <a href={links.linkedIn} target="_blank" rel="me noreferrer" className="icon-button nav-social" aria-label="LinkedIn"><LinkedInIcon className="size-4" /></a>
            <button type="button" className="icon-button" onClick={toggleTheme} aria-label={light ? 'Use dark theme' : 'Use light theme'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="size-4">
                {light ? <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
