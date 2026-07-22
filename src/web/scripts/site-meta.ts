import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

/**
 * Builds the parts of the site a crawler sees before React runs.
 *
 * `index.html` is the one file no component owns, which makes it the natural
 * place for someone to paste a name and a description and let them rot. So it
 * carries placeholders instead, and this plugin fills them from
 * `src/Api/Data/profile.json` — the same file the rendered page reads from, so
 * the tab title, the link preview and the hero cannot disagree.
 *
 * The absolute site URL is not content, it is deployment: it comes from the
 * `SITE_URL` environment variable. Without it, Open Graph paths stay
 * root-relative and no sitemap is emitted, which is the honest output for a
 * build that does not yet know where it will live.
 */

interface Profile {
  name: string
  headline: string
  location: string
  bio: string[]
  links: { gitHub: string; linkedIn: string; email: string }
}

/** Pages a crawler should know about, mirroring the routes in `App.tsx`. */
const ROUTES = ['/', '/resume', '/projects', '/photos'] as const

export function siteMeta(options: { dataDir: string; publicDir: string }): Plugin {
  let siteUrl = ''

  return {
    name: 'site-meta',

    configResolved() {
      siteUrl = (process.env.SITE_URL ?? '').replace(/\/+$/, '')
    },

    transformIndexHtml(html) {
      const profile = readProfile(options.dataDir)
      const description = describe(profile)

      return html
        .replace(
          '</head>',
          `  <script type="application/ld+json">${personSchema(profile, description, siteUrl)}</script>\n  </head>`,
        )
        .replace(/%SITE_([A-Z_]+)%/g, (match, key: string) => {
          switch (key) {
            case 'NAME':
              return escapeHtml(profile.name)
            case 'DESCRIPTION':
              return escapeHtml(description)
            case 'URL':
              // A relative og:url says nothing, so it collapses to the site
              // root until a real origin is known.
              return siteUrl || '/'
            case 'IMAGE':
              return `${siteUrl}/og.png`
            default:
              return match
          }
        })
    },

    generateBundle() {
      if (siteUrl === '') return

      const today = new Date().toISOString().slice(0, 10)
      const urls = ROUTES.map(
        (route) =>
          `  <url>\n    <loc>${siteUrl}${route}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`,
      ).join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      })

      // public/robots.txt is copied verbatim; this overwrites it with a copy
      // that can point at the sitemap it now knows the address of.
      const robots = readFileSync(path.join(options.publicDir, 'robots.txt'), 'utf8').trimEnd()
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `${robots}\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      })
    },
  }
}

/**
 * A `Person` graph, so a search engine can tie the name to the two profiles
 * that prove it is the same person. `sameAs` is the whole point of the block;
 * a placeholder URL in there would be worse than no block at all, so anything
 * still unfilled is dropped.
 */
function personSchema(profile: Profile, description: string, siteUrl: string): string {
  const sameAs = [profile.links.gitHub, profile.links.linkedIn].filter(
    (link) => link.startsWith('http'),
  )

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    description,
    ...(real(profile.headline) === null ? {} : { jobTitle: profile.headline }),
    ...(real(profile.location) === null ? {} : { address: profile.location }),
    ...(sameAs.length === 0 ? {} : { sameAs }),
    ...(siteUrl === '' ? {} : { url: siteUrl, image: `${siteUrl}/og.png` }),
  })
}

/** Placeholder content must never reach a crawler. */
function real(value: string): string | null {
  return value !== '' && !value.startsWith('TODO:') ? value : null
}

function readProfile(dataDir: string): Profile {
  return JSON.parse(readFileSync(path.join(dataDir, 'profile.json'), 'utf8')) as Profile
}

/**
 * The meta description a search result shows. The headline is the one-liner
 * written for exactly this job; the bio's opening sentence is the fallback, and
 * unfilled placeholder content is skipped rather than published.
 */
function describe(profile: Profile): string {
  const chosen = [profile.headline, profile.bio[0] ?? ''].map(real).find((v) => v !== null)

  if (chosen === undefined || chosen === null) {
    return `${profile.name} — resume, projects and photography.`
  }

  return chosen.length <= 160 ? chosen : `${chosen.slice(0, 157).trimEnd()}…`
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string,
  )
}
