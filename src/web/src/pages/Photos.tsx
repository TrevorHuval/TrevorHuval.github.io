import { useMemo, useState } from 'react'
import { photos, presentation } from '../content'
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
      <header className="page-heading">
        <p className="gutter-date">{presentation.photos.eyebrow}</p>
        <h1>{presentation.photos.title}</h1>
        <p className="max-w-[60ch] text-lg text-ink-muted">
          {presentation.photos.description}
        </p>
      </header>

      {ALBUMS.length > 2 && (
        <div className="album-filters" role="group" aria-label="Filter by album">
          {ALBUMS.map((name) => {
            const isActive = name === album
            return (
              <button
                key={name}
                type="button"
                aria-pressed={isActive}
                onClick={() => selectAlbum(name)}
                className="album-filter"
              >
                {name}
                <span className="ml-2 numeric opacity-70">{name === ALL ? photos.length : photos.filter((photo) => photo.album === name).length}</span>
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
