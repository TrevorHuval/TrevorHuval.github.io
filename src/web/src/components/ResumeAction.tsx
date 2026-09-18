import { useEffect, useState } from 'react'
import { DocumentIcon } from './Icons'
import ResumeDialog, { RESUME_PDF } from './ResumeDialog'
import { ActionButton, ActionLink } from './Ui'

/** Touch-only devices: no hover, coarse pointer. Phones and tablets, in practice. */
const TOUCH_ONLY = '(hover: none) and (pointer: coarse)'

function useTouchOnly() {
  const [touchOnly, setTouchOnly] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(TOUCH_ONLY).matches,
  )

  useEffect(() => {
    const query = window.matchMedia(TOUCH_ONLY)
    const update = () => setTouchOnly(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return touchOnly
}

/**
 * "View resume" as one control with two behaviours. On a desktop it opens the
 * PDF in the in-page dialog. On a phone or tablet it opens the PDF itself in a
 * new tab: iOS Safari does not reliably render a PDF inside an iframe, and the
 * platform viewer there (pinch-zoom, share sheet, "save to Files") is better
 * than anything a modal could offer on a small screen anyway.
 */
export default function ResumeAction({
  children = 'View resume',
  variant = 'primary',
}: {
  children?: React.ReactNode
  variant?: 'primary' | 'quiet'
}) {
  const touchOnly = useTouchOnly()
  const [open, setOpen] = useState(false)

  if (touchOnly) {
    return (
      <ActionLink href={RESUME_PDF} variant={variant} external>
        <DocumentIcon className="size-4" />
        {children}
      </ActionLink>
    )
  }

  return (
    <>
      <ActionButton variant={variant} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <DocumentIcon className="size-4" />
        {children}
      </ActionButton>
      <ResumeDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
