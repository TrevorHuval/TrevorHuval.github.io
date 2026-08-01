import { useEffect, useRef } from 'react'
import type { Photo } from '../content/types'
import { formatDay } from '../lib/dates'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from './Icons'
import PhotoImage from './PhotoImage'

/**
 * Built on a native `<dialog>` opened with `showModal()`, which is what gives
 * us the focus trap, Escape-to-close, focus return to the thumbnail, top-layer
 * stacking and an inert background â€” all of it correct, none of it hand-rolled.
 *
 * What the platform does not give us and this adds: arrow-key and swipe
 * navigation, body scroll lock (the backdrop does not stop the page behind it
 * scrolling), and click-outside-to-close.
 */
/** How much of the viewport a photo may take, leaving room for the caption bar
 *  and the dialog's own padding. */
const MAX_HEIGHT = '68dvh'

/** Below this the caption has nowhere to go, so a very tall photo in a very
 *  short window gets a caption bar wider than itself rather than an unreadable
 *  one the same width. */
const MIN_CAPTION_WIDTH = '21rem'

export default function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: Photo[]
  /** `null` when closed. */
  index: number | null
  onClose: () => void
  /** `-1` for previous, `1` for next. The caller wraps around. */
  onNavigate: (delta: number) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const touchStartX = useRef<number | null>(null)
  const isOpen = index !== null

  // Held in a ref so the listener below can stay attached for the component's
  // whole life instead of being torn down on every parent render.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  /**
   * A modal dialog can be dismissed by the user agent itself â€” Escape, or the
   * browser closing the top layer â€” which fires `close` on the element without
   * going through any of our handlers. React state has to follow, or the
   * dialog vanishes while we still believe it is open and `body` is left
   * scroll-locked.
   *
   * Bound natively rather than through `onClose`: `close` does not bubble, so
   * this sidesteps any question of how the synthetic event system routes it.
   */
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const handleClose = () => {
      onCloseRef.current()
    }

    dialog.addEventListener('close', handleClose)
    return () => {
      dialog.removeEventListener('close', handleClose)
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // showModal() throws if the dialog is already open, and close() on a closed
    // dialog fires a spurious 'close' event â€” so both are guarded.
    if (isOpen && !dialog.open) dialog.showModal()
    else if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [isOpen])

  // The dialog element itself always stays mounted so the open/close effect
  // above has something to act on, but there is nothing to render inside it
  // until a photo is selected.
  const photo = index === null ? undefined : photos[index]
  if (index === null || photo === undefined) {
    return <dialog ref={dialogRef} className="hidden" />
  }

  const meta = [photo.location, formatDay(photo.date)].filter(Boolean).join(' Â· ')
  const hasSiblings = photos.length > 1
  const frameWidth = `calc(${MAX_HEIGHT} * ${photo.width} / ${photo.height})`

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Photo ${index + 1} of ${photos.length}: ${photo.caption}`}
      onClick={(event) => {
        // Only a click on the dialog box itself â€” the padding around the
        // figure â€” counts as clicking out.
        if (event.target === dialogRef.current) onClose()
      }}
      onKeyDown={(event) => {
        // The user agent also closes the dialog on Escape by itself. Unwinding
        // our own state here too means the scroll lock lifts even if the
        // resulting `close` event never reaches the listener above. Running
        // both paths is harmless â€” it just sets the same state twice.
        if (event.key === 'Escape') {
          onClose()
          return
        }

        if (!hasSiblings) return

        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          onNavigate(-1)
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          onNavigate(1)
        }
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current
        touchStartX.current = null
        if (start === null || !hasSiblings) return

        const delta = (event.changedTouches[0]?.clientX ?? start) - start
        if (Math.abs(delta) > 50) onNavigate(delta < 0 ? 1 : -1)
      }}
      className="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-4 backdrop:bg-scrim backdrop:backdrop-blur-2xl sm:p-8"
    >
      <div className="pointer-events-none flex h-full w-full items-center justify-center">
        {/* The frame and the caption bar hug the photo instead of stranding it
            in a wide slab of glass â€” a portrait shot and a panorama each get
            chrome cut to their own shape.

            The width is computed rather than left to `w-fit`, because
            shrink-to-fit sizes a replaced element from its intrinsic width and
            never hears about the height cap: a tall photo in a short viewport
            would leave the frame at full width with the picture stranded down
            one edge. Deriving the width from the height cap and the photo's own
            ratio is the same answer in both directions. */}
        <figure
          style={{ width: `min(100%, max(${MIN_CAPTION_WIDTH}, ${frameWidth}))` }}
          className="pointer-events-auto flex max-h-full flex-col items-center gap-3"
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <div
            style={{ width: `min(100%, ${frameWidth})` }}
            className="glass-high overflow-hidden rounded-panel p-2"
          >
            <PhotoImage
              key={photo.id}
              src={photo.src}
              avif={photo.srcAvif}
              alt={photo.caption}
              width={photo.width}
              height={photo.height}
              eager
              className="w-full rounded-[0.75rem]"
            />
          </div>

          <figcaption className="glass-high flex w-full items-center gap-4 rounded-full py-2.5 pr-2.5 pl-5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-meta font-medium text-ink">{photo.caption}</p>
              {meta && <p className="gutter-date mt-0.5 truncate">{meta}</p>}
            </div>

            {hasSiblings && (
              <span className="numeric shrink-0 font-mono text-caption text-ink-faint">
                {index + 1} / {photos.length}
              </span>
            )}

            <div className="flex shrink-0 items-center gap-1">
              {hasSiblings && (
                <>
                  <ChromeButton label="Previous photo" onClick={() => onNavigate(-1)}>
                    <ChevronLeftIcon className="size-[1.15rem]" />
                  </ChromeButton>
                  <ChromeButton label="Next photo" onClick={() => onNavigate(1)}>
                    <ChevronRightIcon className="size-[1.15rem]" />
                  </ChromeButton>
                </>
              )}
              <ChromeButton label="Close" onClick={onClose}>
                <CloseIcon className="size-[1.15rem]" />
              </ChromeButton>
            </div>
          </figcaption>
        </figure>
      </div>
    </dialog>
  )
}

function ChromeButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-[background-color,color,transform] duration-200 ease-out-quint hover:bg-inset hover:text-ink active:scale-[0.97]"
    >
      {children}
    </button>
  )
}
