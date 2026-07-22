import { useMemo, useState } from 'react'
import { usePhotos } from '../api/hooks'
import Lightbox from '../components/Lightbox'
import PhotoGrid from '../components/PhotoGrid'
import { EmptyPanel, ErrorPanel, LoadingPanel } from '../components/States'
import { usePageMeta } from '../lib/usePageMeta'

const ALL = 'All'

export default function Photos() {
  usePageMeta({
    title: 'Photos',
    description: 'A gallery of photographs from travels and from home.',
  })

  const { data, error, loading, reload } = usePhotos()
  const [album, setAlbum] = useState(ALL)
  const [selected, setSelected] = useState<number | null>(null)

  const albums = useMemo(() => {
    if (data === null) return []
    return [ALL, ...new Set(data.map((photo) => photo.album))]
  }, [data])

  const visible = useMemo(() => {
    if (data === null) return []
    return album === ALL ? data : data.filter((photo) => photo.album === album)
  }, [data, album])

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

      {albums.length > 2 && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by album">
          {albums.map((name) => {
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

      {loading && <LoadingPanel label="Loading photos" lines={4} />}
      {error !== null && <ErrorPanel message={error} onRetry={reload} />}
      {data && visible.length === 0 && (
        <EmptyPanel
          title="No photos here yet"
          hint={
            album === ALL
              ? 'Gallery metadata lives in the site content files; photos will appear here once added.'
              : `Nothing filed under ${album} yet.`
          }
        />
      )}

      {visible.length > 0 && <PhotoGrid photos={visible} onSelect={setSelected} />}

      <Lightbox
        photos={visible}
        index={selected}
        onClose={() => setSelected(null)}
        onNavigate={navigate}
      />
    </div>
  )
}
