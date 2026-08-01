/**
 * Every icon inherits `currentColor` and sits on a 24-unit grid at 1.6 stroke,
 * so they optically match the text they sit beside at any size. The two brand
 * marks are filled paths; everything else is stroked.
 */

type IconProps = {
  className?: string
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={className ?? 'size-4'}
    >
      {children}
    </svg>
  )
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.75c0 .26.18.58.69.48A10 10 0 0 0 12 2Z"
      />
    </Svg>
  )
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        fill="currentColor"
        d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11.25H3V9.75Zm6.5 0h3.83v1.54h.05c.53-.95 1.83-1.96 3.77-1.96 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.03c0-1.2-.02-2.75-1.75-2.75-1.75 0-2.02 1.3-2.02 2.66V21h-4V9.75Z"
      />
    </Svg>
  )
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path {...stroke} d="M7 17 17 7M8.5 7H17v8.5" />
    </Svg>
  )
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path {...stroke} d="M12 3.5v11m0 0 4-4m-4 4-4-4M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </Svg>
  )
}

export function StarIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path
        {...stroke}
        d="m12 4 2.47 5.01 5.53.8-4 3.9.94 5.5L12 16.62 7.06 19.2l.94-5.5-4-3.9 5.53-.8L12 4Z"
      />
    </Svg>
  )
}

export function ForkIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle {...stroke} cx="6.5" cy="5.5" r="2.25" />
      <circle {...stroke} cx="17.5" cy="5.5" r="2.25" />
      <circle {...stroke} cx="12" cy="18.5" r="2.25" />
      <path {...stroke} d="M6.5 7.75v1.5a2.5 2.5 0 0 0 2.5 2.5h6a2.5 2.5 0 0 0 2.5-2.5v-1.5M12 11.75v4.5" />
    </Svg>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path {...stroke} d="M6 6l12 12M18 6 6 18" />
    </Svg>
  )
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path {...stroke} d="M14.5 5.5 8 12l6.5 6.5" />
    </Svg>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <path {...stroke} d="M9.5 5.5 16 12l-6.5 6.5" />
    </Svg>
  )
}

export function ImageIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <rect {...stroke} x="3.25" y="4.75" width="17.5" height="14.5" rx="2.5" />
      <circle {...stroke} cx="8.75" cy="9.75" r="1.5" />
      <path {...stroke} d="m3.75 17 4.6-4.35a2 2 0 0 1 2.7-.03L15 16.2m0 0 1.9-1.7a2 2 0 0 1 2.66-.01l1.19 1.05" />
    </Svg>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <Svg className={className}>
      <circle {...stroke} cx="12" cy="12" r="8.75" />
      <path {...stroke} d="M12 7.75v5m0 3.25v.01" />
    </Svg>
  )
}
