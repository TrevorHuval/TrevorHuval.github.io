import type { Photo } from '../content/types'
import { formatDay } from '../lib/dates'
import PhotoImage from './PhotoImage'

/**
 * A CSS-columns masonry. Real masonry (rather than a fixed-ratio grid) is the
 * point of a photo gallery â€” cropping someone's portrait orientation into a
 * square to make the rows line up is the tell of a developer's photo page.
 *
 * Reading order runs down each column rather than across, which is the accepted
 * trade for `columns`; captions carry the metadata, so nothing depends on the
 * visual sequence.
 */
export default function PhotoGrid({
  photos,
  onSelect,
}: {
  photos: Photo[]
  onSelect: (index: number) => void
}) {
  return (
    <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
      {photos.map((photo, index) => (
        <li key={photo.id} className="break-inside-avoid">
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => onSelect(index)}
            className="group relative block w-full overflow-hidden rounded-card transition-[transform,box-shadow] duration-200 ease-out-quint hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift-high)]"
          >
            <PhotoImage
              src={photo.thumbnail}
              avif={photo.thumbnailAvif}
              alt={photo.caption}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 21rem, (min-width: 640px) 45vw, 90vw"
              className="w-full rounded-card"
            />

            {/* Metadata rides in on hover on a pointer device; on touch it is
                always visible, since there is no hover to reveal it. */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-0.5 rounded-b-card bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4 pt-10 text-left opacity-100 transition-opacity duration-200 ease-out-quint sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
              <span className="line-clamp-2 text-meta font-medium text-white">{photo.caption}</span>
              <span className="font-mono text-caption tracking-[0.06em] text-white/70 uppercase">
                {[photo.location, formatDay(photo.date)].filter(Boolean).join(' Â· ')}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
