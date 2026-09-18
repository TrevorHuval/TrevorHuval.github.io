import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Photo } from '../content/types'
import { ArrowUpRightIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons'
import PhotoImage from './PhotoImage'

/** Dwell per slide. Long enough to look, short enough to notice it moves. */
const INTERVAL_MS = 5000

/**
 * One frame in the hero that cycles through the gallery. Every slide is
 * rendered and stacked, and only the opacity changes, so the cross-fade is a
 * compositor-only transition and the frame never resizes between photos.
 *
 * Auto-advance pauses while the pointer or keyboard focus is on it, and is
 * off entirely under `prefers-reduced-motion`; the arrows and dots always
 * work. The frame itself is a link into the gallery, since a photo you can
 * see but not open is a tease.
 */
export default function HeroCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = photos.length

  const go = (delta: number) => setIndex((current) => (current + delta + count) % count)

  useEffect(() => {
    if (count < 2 || paused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => go(1), INTERVAL_MS)
    return () => window.clearInterval(timer)
    // `go` is stable in behaviour; re-arming on index keeps the dwell even after
    // a manual step so a click does not cut the next slide short.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, paused, index])

  if (count === 0) return null
  const current = photos[index]!

  return (
    <section
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Photos from life and travels"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Link to="/photos" className="hero-carousel-frame" aria-label={`Open the photo gallery at ${current.caption}`}>
        {photos.map((photo, i) => (
          <PhotoImage
            key={photo.id}
            src={photo.src}
            avif={photo.srcAvif}
            alt={photo.caption}
            width={photo.width}
            height={photo.height}
            crop
            eager={i === 0}
            className={`hero-slide ${i === index ? 'is-current' : ''}`}
          />
        ))}
        <span className="photo-label glass-high">
          <span>{current.location ?? current.album}</span>
          <ArrowUpRightIcon className="size-4" />
        </span>
      </Link>

      {count > 1 && (
        <div className="hero-carousel-controls">
          <button type="button" className="icon-button glass-high" aria-label="Previous photo" onClick={() => go(-1)}>
            <ChevronLeftIcon className="size-4" />
          </button>
          <div className="hero-carousel-dots" role="tablist" aria-label="Choose a photo">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={photo.location ?? photo.caption}
                className={`hero-carousel-dot ${i === index ? 'is-current' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button type="button" className="icon-button glass-high" aria-label="Next photo" onClick={() => go(1)}>
            <ChevronRightIcon className="size-4" />
          </button>
        </div>
      )}
    </section>
  )
}
