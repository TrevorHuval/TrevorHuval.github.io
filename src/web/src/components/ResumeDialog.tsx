import { useEffect, useRef } from 'react'
import { CloseIcon, DownloadIcon } from './Icons'

/** Served straight out of the web root; the one place contact details live. */
export const RESUME_PDF = '/trevor_huval_resume.pdf'

/**
 * The résumé PDF in a modal, so a visitor can read it without leaving the page
 * or opening a tab. Same native `<dialog>` + `showModal()` foundation as the
 * photo lightbox: focus trap, Escape, focus return and the inert background all
 * come from the platform.
 *
 * The document itself is the browser's own PDF viewer in an iframe. The
 * `#toolbar=0` fragment asks Chromium/Firefox to drop their toolbar so the
 * page's own chrome is the only chrome; viewers that ignore it just show
 * theirs, which is harmless. On phones the built-in viewer is unreliable, so
 * the download link in the bar stays the guaranteed path.
 */
export default function ResumeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  // The user agent can close the dialog on its own (Escape); state has to follow.
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
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-label="Resume"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
      className="m-0 h-dvh max-h-none w-dvw max-w-none bg-transparent p-4 backdrop:bg-scrim backdrop:backdrop-blur-2xl sm:p-8"
    >
      {/* Nothing is mounted until it opens, so the PDF is never fetched for a
          visitor who never asks for it. */}
      {open && (
        <div className="pointer-events-none flex h-full w-full items-center justify-center">
          {/* Letter-page proportions capped to the viewport: on a wide screen
              the frame is a sheet of paper, not a slab of glass. */}
          <div
            className="pointer-events-auto flex h-full w-full max-w-[52rem] flex-col gap-3"
            onClick={(event) => {
              event.stopPropagation()
            }}
          >
            <div className="glass-high flex shrink-0 items-center gap-4 rounded-full py-2.5 pr-2.5 pl-5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-meta font-medium text-ink">Trevor Huval — Resume</p>
                <p className="gutter-date mt-0.5 truncate">PDF · one page</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a
                  href={RESUME_PDF}
                  download
                  aria-label="Download PDF"
                  className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-[background-color,color,transform] duration-200 ease-out-quint hover:bg-inset hover:text-ink active:scale-[0.97]"
                >
                  <DownloadIcon className="size-[1.15rem]" />
                </a>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex size-10 items-center justify-center rounded-full text-ink-muted transition-[background-color,color,transform] duration-200 ease-out-quint hover:bg-inset hover:text-ink active:scale-[0.97]"
                >
                  <CloseIcon className="size-[1.15rem]" />
                </button>
              </div>
            </div>

            <div className="glass-high min-h-0 flex-1 overflow-hidden rounded-panel p-2">
              <iframe
                src={`${RESUME_PDF}#toolbar=0&navpanes=0&view=FitH`}
                title="Trevor Huval resume, PDF"
                className="h-full w-full rounded-[0.75rem] bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
