import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { GitHubIcon, LinkedInIcon } from './Icons'
import { presentation, profile } from '../content'
import type { ProfileLinks } from '../content/types'

export default function Nav({ links }: { links: ProfileLinks }) {
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === 'light')

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
      <nav className="site-nav glass-high" aria-label="Primary">
        <Link to="/" className="wordmark" aria-label={`${profile.name}, home`}>
          {profile.name.split(' ').map((part) => part[0]).join('')}<span aria-hidden="true">.</span>
        </Link>
        <ul className="nav-pages">
          {presentation.navigation.map((page) => (
            <li key={page.to}>
              <NavLink to={page.to} end={page.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                {page.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="nav-tools">
          <a href={links.gitHub} target="_blank" rel="me noreferrer" className="icon-button nav-social" aria-label="GitHub"><GitHubIcon className="size-4" /></a>
          <a href={links.linkedIn} target="_blank" rel="me noreferrer" className="icon-button nav-social" aria-label="LinkedIn"><LinkedInIcon className="size-4" /></a>
          <button type="button" className="icon-button" onClick={toggleTheme} aria-label={light ? 'Use dark theme' : 'Use light theme'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true" className="size-4">
              {light ? <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}
            </svg>
          </button>
        </div>
      </nav>
    </header>
  )
}
