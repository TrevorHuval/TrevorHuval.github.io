#!/usr/bin/env node
/**
 * Gallery image pipeline.
 *
 * Takes the camera originals — which are 2–5 MB each and deliberately not in
 * the repo — and derives every asset the site actually serves:
 *
 *   public/photos/<id>.jpg          full size, long edge 2000px
 *   public/photos/<id>.avif         same, roughly a third of the bytes
 *   public/photos/thumbs/<id>.jpg   grid thumbnail, long edge 800px
 *   public/photos/thumbs/<id>.avif
 *
 * It then writes the produced paths and the true pixel dimensions back into
 * `src/Api/Data/photos.json`, matching on `id`. Dimensions are what let the
 * browser reserve layout space before an image arrives, so having a human keep
 * them in step by hand is how a gallery ends up jumping on load. Captions,
 * locations, dates and albums are left exactly as they are — this owns the
 * files, a person owns the words.
 *
 * This is an authoring step, not a build step: the outputs are committed and
 * the inputs are not, so `vite build` must never depend on it.
 *
 *   npm run photos            reads originals from ~/Pictures/personalSitePics
 *   PHOTOS_SRC=... npm run photos
 *   npm run photos -- --check verifies the manifest against what is on disk
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(webRoot, '../..')

const SOURCE_DIR =
  process.env.PHOTOS_SRC ?? path.join(homedir(), 'Pictures', 'personalSitePics')
const OUTPUT_DIR = path.join(webRoot, 'public', 'photos')
const THUMB_DIR = path.join(OUTPUT_DIR, 'thumbs')
const MANIFEST = path.join(repoRoot, 'src', 'Api', 'Data', 'photos.json')

/** Long edge, in px. 2000 is a comfortable ceiling for a full-screen lightbox
 *  on a 2x display without shipping a print master. */
const FULL_EDGE = 2000
/** The grid never shows a thumbnail wider than ~340 CSS px, so 800 covers 2x. */
const THUMB_EDGE = 800

const JPEG = { quality: 82, mozjpeg: true, chromaSubsampling: '4:4:4' }
const AVIF = { quality: 55, effort: 5 }

const checkOnly = process.argv.includes('--check')

async function main() {
  const { sources } = JSON.parse(
    await readFile(path.join(scriptDir, 'photo-sources.json'), 'utf8'),
  )
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))

  const unknown = Object.keys(sources).filter((id) => !manifest.some((p) => p.id === id))
  if (unknown.length > 0) {
    throw new Error(
      `photo-sources.json names ids that photos.json does not have: ${unknown.join(', ')}`,
    )
  }

  if (!checkOnly) {
    await mkdir(THUMB_DIR, { recursive: true })
  }

  let changed = 0
  let skipped = 0
  const updated = []

  for (const photo of manifest) {
    const sourceName = sources[photo.id]
    const sourcePath = sourceName === undefined ? null : path.join(SOURCE_DIR, sourceName)

    if (sourcePath === null) {
      report(photo.id, 'no source mapped — leaving its entry alone')
    } else if (!checkOnly && !existsSync(sourcePath)) {
      // Anyone without the originals — CI, a fresh clone — still gets a clean
      // run and a working site, because the derived files are committed.
      report(photo.id, `original missing at ${sourcePath}`)
    }

    const derived =
      sourcePath === null
        ? null
        : checkOnly
          ? await measure(photo)
          : existsSync(sourcePath)
            ? await render(photo.id, sourcePath)
            : null

    if (derived === null) {
      skipped += 1
      updated.push(photo)
      continue
    }

    const next = rebuild(photo, derived)
    if (JSON.stringify(next) !== JSON.stringify(photo)) changed += 1
    updated.push(next)
  }

  if (changed > 0) {
    if (checkOnly) {
      throw new Error(
        `photos.json is out of step with the files on disk for ${changed} photo(s). Run: npm run photos`,
      )
    }
    await writeFile(MANIFEST, `${JSON.stringify(updated, null, 2)}\n`, 'utf8')
    console.log(`\nUpdated ${MANIFEST} (${changed} entr${changed === 1 ? 'y' : 'ies'}).`)
  } else {
    console.log('\nphotos.json already matches the generated files.')
  }

  if (skipped > 0) console.log(`${skipped} photo(s) skipped.`)
}

/** Writes all four derivatives and returns what the manifest should say. */
async function render(id, sourcePath) {
  // rotate() with no argument applies the EXIF orientation and drops it, so a
  // portrait shot off a phone is not left sideways once metadata is stripped.
  const input = sharp(sourcePath).rotate()
  const { width, height } = await input.metadata()

  const full = input.clone().resize({
    width: width >= height ? FULL_EDGE : null,
    height: width >= height ? null : FULL_EDGE,
    withoutEnlargement: true,
    fit: 'inside',
  })

  const thumb = input.clone().resize({
    width: width >= height ? THUMB_EDGE : null,
    height: width >= height ? null : THUMB_EDGE,
    withoutEnlargement: true,
    fit: 'inside',
  })

  const [fullJpeg] = await Promise.all([
    full.clone().jpeg(JPEG).toFile(path.join(OUTPUT_DIR, `${id}.jpg`)),
    full.clone().avif(AVIF).toFile(path.join(OUTPUT_DIR, `${id}.avif`)),
    thumb.clone().jpeg(JPEG).toFile(path.join(THUMB_DIR, `${id}.jpg`)),
    thumb.clone().avif(AVIF).toFile(path.join(THUMB_DIR, `${id}.avif`)),
  ])

  const sizes = await Promise.all(
    [`${id}.jpg`, `${id}.avif`].map(async (name) => (await stat(path.join(OUTPUT_DIR, name))).size),
  )
  report(
    id,
    `${fullJpeg.width}×${fullJpeg.height} — jpg ${kb(sizes[0])}, avif ${kb(sizes[1])}`,
    'ok',
  )

  return { width: fullJpeg.width, height: fullJpeg.height }
}

/** `--check` mode: read the dimensions already on disk rather than re-encoding. */
async function measure(photo) {
  const file = path.join(webRoot, 'public', photo.src.replace(/^\//, ''))
  if (!existsSync(file)) {
    report(photo.id, `generated file missing at ${file}`)
    return null
  }
  const { width, height } = await sharp(file).metadata()
  return { width, height }
}

/**
 * Rebuilds the entry with the generated fields replaced, in a fixed key order
 * so re-running the pipeline produces a diff of values rather than of layout.
 */
function rebuild(photo, { width, height }) {
  return {
    id: photo.id,
    src: `/photos/${photo.id}.jpg`,
    srcAvif: `/photos/${photo.id}.avif`,
    thumbnail: `/photos/thumbs/${photo.id}.jpg`,
    thumbnailAvif: `/photos/thumbs/${photo.id}.avif`,
    caption: photo.caption,
    location: photo.location,
    date: photo.date,
    album: photo.album,
    width,
    height,
  }
}

function report(id, message, level = 'skip') {
  console.log(`${level === 'ok' ? '  ✓' : '  ·'} ${id.padEnd(20)} ${message}`)
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`
}

main().catch((error) => {
  console.error(`\n${error.message}`)
  process.exitCode = 1
})
