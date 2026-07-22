/**
 * Date formatting for the gutter stamps.
 *
 * The API hands dates over as strings at whatever precision the content
 * author wrote them — `"2023-01"` for a job, `"2024-06-15"` for a photo — and
 * they are only ever displayed. So these parse defensively and fall back to
 * echoing the input rather than rendering "Invalid Date" at a visitor.
 */

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** `"2023-01"` and `"2023-01-15"` both become `"Jan 2023"`. */
export function formatMonth(value: string | null | undefined): string {
  if (!value) return ''

  const match = /^(\d{4})-(\d{2})/.exec(value)
  if (!match) return value

  const month = Number(match[2])
  if (month < 1 || month > 12) return value

  return `${MONTHS[month - 1]} ${match[1]}`
}

/** `"2024-06-15"` becomes `"15 Jun 2024"`; a month-precision value stays at
 * month precision. */
export function formatDay(value: string | null | undefined): string {
  if (!value) return ''

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return formatMonth(value)

  const month = Number(match[2])
  if (month < 1 || month > 12) return value

  return `${Number(match[3])} ${MONTHS[month - 1]} ${match[1]}`
}

/** A gutter range. A null end date means the role is current. */
export function formatRange(start: string, end: string | null | undefined): string {
  const from = formatMonth(start)
  const to = end ? formatMonth(end) : 'Present'

  return from ? `${from} — ${to}` : to
}

/** "1 yr 4 mos", shown beside a role so scanning a résumé does not require
 * mental arithmetic. Returns an empty string if the dates do not parse. */
export function formatDuration(start: string, end: string | null | undefined): string {
  const from = parseMonth(start)
  const to = end ? parseMonth(end) : monthsSinceEpoch(new Date())

  if (from === null || to === null || to < from) return ''

  // A role spanning Jan to Jan is a year of work, not zero — count inclusively.
  const totalMonths = to - from + 1
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  const parts: string[] = []
  if (years > 0) parts.push(`${years} yr${years === 1 ? '' : 's'}`)
  if (months > 0) parts.push(`${months} mo${months === 1 ? '' : 's'}`)

  return parts.join(' ')
}

/** "3 days ago" / "5 months ago", for GitHub push timestamps. */
export function formatRelative(value: string | null | undefined): string {
  if (!value) return ''

  const then = new Date(value)
  if (Number.isNaN(then.getTime())) return ''

  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000)

  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`

  const months = Math.floor(days / 30)
  if (months < 12) return `${months} mo${months === 1 ? '' : 's'} ago`

  const years = Math.floor(days / 365)
  return `${years} yr${years === 1 ? '' : 's'} ago`
}

function parseMonth(value: string): number | null {
  const match = /^(\d{4})-(\d{2})/.exec(value)
  if (!match) return null

  return Number(match[1]) * 12 + (Number(match[2]) - 1)
}

function monthsSinceEpoch(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth()
}
