import { useMemo, useState } from 'react'
import { photos } from '../content'
import Lightbox from '../components/Lightbox'
import PhotoGrid from '../components/PhotoGrid'
import { usePageMeta } from '../lib/usePageMeta'

const ALL = 'All'

const ALBUMS = [ALL, ...new Set(photos.map((photo) => photo.album))]

export default function Photos() {
  usePageMeta({
    title: 'Photos',
    description: 'A gallery of photographs from travels and from home.',
  })

  const [album, setAlbum] = useState(ALL)
  const [selected, setSelected] = useState<number | null>(null)

  const visible = useMemo(
    () => (album === ALL ? photos : photos.filter((photo) => photo.album === album)),
    [album],
  )

  // The lightbox indexes into the filtered list, so switching albums while it
  // is open would point at the wrong photo. Closing is the honest fix.
  const selectAlbum = (next: string) => {
    setSelected(null)
    setAlbum(next)
  }

  const navigate = (delta: number) => {
    setSelected((current) => {
      if (current === null || visible.length === 0) return current
      return (current + delta + visible.length) % visible.length
    })
  }

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-4 pt-6">
        <p className="gutter-date">Gallery</p>
        <h1 className="text-3xl font-semibold text-ink">Life and travels</h1>
        <p className="max-w-[60ch] text-lg text-ink-muted">
          Photographs from the road and from home. Pick one to see it full size.
        </p>
      </header>

      {ALBUMS.length > 2 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by album">
          {ALBUMS.map((name) => {
            const isActive = name === album
            return (
              <button
                key={name}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectAlbum(name)}
                className={`flex h-9 items-center rounded-full px-4 text-meta font-medium transition-[background-color,color,border-color] duration-200 ease-out-quint ${
                  isActive
                    ? 'bg-ember-soft text-ember'
                    : 'border border-hairline-strong text-ink-muted hover:bg-inset hover:text-ink'
                }`}
              >
                {name}
              </button>
            )
          })}
        </div>
      )}

      <PhotoGrid photos={visible} onSelect={setSelected} />

      <Lightbox
        photos={visible}
        index={selected}
        onClose={() => setSelected(null)}
        onNavigate={navigate}
      />
    </div>
  )
}
