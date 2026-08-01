#!/usr/bin/env node
/**
 * Renders the social card at `public/og.png` and the touch icon at
 * `public/apple-touch-icon.png`.
 *
 * The card is a link preview, so it has to be a flat file — no fetch, no
 * runtime. But the words on it are still content: the name is read out of
 * `src/web/src/content/profile.json`, the same file the site itself renders
 * from, so the card cannot drift from the page it points at. Anything still
 * carrying a `TODO:` marker is left off rather than published.
 *
 *   npm run og
 */

import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(scriptDir, '..')
const publicDir = path.join(webRoot, 'public')
const contentDir = path.join(webRoot, 'src', 'content')

const WIDTH = 1200
const HEIGHT = 630

/* The darkroom tokens, resolved to sRGB — librsvg has no oklch(). */
const CANVAS = '#1c1f26'
const INK = '#f3f4f7'
const INK_SOFT = '#9aa0ad'
const EMBER = '#e08c4b'

const FONT =
  "'Segoe UI Variable Display', 'Segoe UI', -apple-system, 'Helvetica Neue', Arial, sans-serif"
const MONO = "'Cascadia Mono', 'Consolas', 'SF Mono', monospace"

async function main() {
  const profile = JSON.parse(await readFile(path.join(contentDir, 'profile.json'), 'utf8'))

  const name = profile.name
  const headline = real(profile.headline)
  const location = real(profile.location)

  await sharp(Buffer.from(card({ name, headline, location })))
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'og.png'))
  console.log(`  ✓ og.png            ${WIDTH}×${HEIGHT}${headline === null ? ' (no headline yet — omitted)' : ''}`)

  // iOS ignores SVG favicons and will screenshot the page instead, so the touch
  // icon has to be a raster of the same mark.
  await sharp(path.join(publicDir, 'favicon.svg'), { density: 600 })
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(publicDir, 'apple-touch-icon.png'))
  console.log('  ✓ apple-touch-icon  180×180')

  await writeFile(
    path.join(publicDir, 'site.webmanifest'),
    `${JSON.stringify(
      {
        name,
        short_name: name.split(' ')[0],
        icons: [
          { src: '/favicon.svg', type: 'image/svg+xml', sizes: 'any' },
          { src: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
        ],
        theme_color: CANVAS,
        background_color: CANVAS,
        display: 'standalone',
        start_url: '/',
      },
      null,
      2,
    )}\n`,
    'utf8',
  )
  console.log('  ✓ site.webmanifest')
}

/** Placeholder content must never reach a link preview. */
function real(value) {
  return typeof value === 'string' && !value.startsWith('TODO:') ? value : null
}

function card({ name, headline, location }) {
  const baseline = headline ?? location

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <radialGradient id="warm" cx="0.12" cy="0.08" r="0.85">
      <stop offset="0%" stop-color="${EMBER}" stop-opacity="0.30"/>
      <stop offset="60%" stop-color="${EMBER}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="cool" cx="0.95" cy="0.9" r="0.8">
      <stop offset="0%" stop-color="#5b74d6" stop-opacity="0.28"/>
      <stop offset="65%" stop-color="#5b74d6" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${CANVAS}"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#warm)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#cool)"/>

  <!-- The gutter rule: the same margin the date stamps sit in, at poster size. -->
  <rect x="96" y="150" width="3" height="${HEIGHT - 300}" fill="${EMBER}" opacity="0.85"/>

  <text x="140" y="${baseline === null ? 330 : 300}" fill="${INK}"
        font-family="${FONT}" font-size="86" font-weight="600" letter-spacing="-2.4">${escape(name)}</text>

  ${
    baseline === null
      ? ''
      : `<text x="142" y="368" fill="${INK_SOFT}" font-family="${FONT}" font-size="34" font-weight="400">${escape(
          clamp(baseline, 62),
        )}</text>`
  }

  <text x="142" y="${HEIGHT - 96}" fill="${INK_SOFT}" font-family="${MONO}" font-size="22"
        letter-spacing="3.4" opacity="0.8">RESUME · PROJECTS · PHOTOGRAPHY</text>
</svg>`
}

function clamp(value, max) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`
}

function escape(value) {
  return value.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c])
}

main().catch((error) => {
  console.error(`\n${error.message}`)
  process.exitCode = 1
})
