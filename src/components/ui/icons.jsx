/*
 * Small inline icons. They are decorative (aria-hidden); the control that
 * contains one is responsible for its accessible name.
 */
const baseProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export function ArrowRightIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3.5 10h13M11.5 5l5 5-5 5" />
    </svg>
  )
}

export function ArrowUpRightIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 14L14 6M7 6h7v7" />
    </svg>
  )
}

export function MenuIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M3 6h14M3 10h14M3 14h14" />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}

export function SunIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 2v1.75M10 16.25V18M2 10h1.75M16.25 10H18M4.35 4.35l1.24 1.24M14.41 14.41l1.24 1.24M4.35 15.65l1.24-1.24M14.41 5.59l1.24-1.24" />
    </svg>
  )
}

export function MoonIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <path d="M16.5 11.6A6.75 6.75 0 0 1 8.4 3.5a6.75 6.75 0 1 0 8.1 8.1Z" />
    </svg>
  )
}

/* Three sliders: the usual shorthand for settings. */
export function SlidersIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <path d="M3 5h6M13 5h4M3 10h2M9 10h8M3 15h8M15 15h2" />
      <circle cx="11" cy="5" r="2" />
      <circle cx="7" cy="10" r="2" />
      <circle cx="13" cy="15" r="2" />
    </svg>
  )
}

export function CheckIcon(props) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M4.5 10.5l3.5 3.5 7.5-8" />
    </svg>
  )
}

/* Two overlapping sheets: copy to the clipboard. */
export function CopyIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M13 4.5V4a1.5 1.5 0 0 0-1.5-1.5h-7A1.5 1.5 0 0 0 3 4v7a1.5 1.5 0 0 0 1.5 1.5H5" />
    </svg>
  )
}

/* Thinner line icons for the Experience stages and the Contact list. */
const fineProps = { ...baseProps, width: 24, height: 24, strokeWidth: 1.5 }

/* An atom: the usual shorthand for component-based UI work. */
export function AtomIcon(props) {
  return (
    <svg {...fineProps} {...props}>
      <circle cx="10" cy="10" r="1.1" fill="currentColor" />
      <ellipse cx="10" cy="10" rx="8.2" ry="3.3" />
      <ellipse cx="10" cy="10" rx="8.2" ry="3.3" transform="rotate(60 10 10)" />
      <ellipse cx="10" cy="10" rx="8.2" ry="3.3" transform="rotate(120 10 10)" />
    </svg>
  )
}

export function LayersIcon(props) {
  return (
    <svg {...fineProps} {...props}>
      <path d="M10 2.8 2.6 6.6 10 10.4l7.4-3.8L10 2.8Z" />
      <path d="M2.6 10 10 13.8l7.4-3.8M2.6 13.4 10 17.2l7.4-3.8" />
    </svg>
  )
}

export function CodeIcon(props) {
  return (
    <svg {...fineProps} {...props}>
      <path d="M6.6 6 2.6 10l4 4M13.4 6l4 4-4 4M11.4 4.4 8.6 15.6" />
    </svg>
  )
}

export function DatabaseIcon(props) {
  return (
    <svg {...fineProps} {...props}>
      <ellipse cx="10" cy="4.6" rx="6.2" ry="2.2" />
      <path d="M3.8 4.6v10.8c0 1.2 2.8 2.2 6.2 2.2s6.2-1 6.2-2.2V4.6M3.8 10c0 1.2 2.8 2.2 6.2 2.2s6.2-1 6.2-2.2" />
    </svg>
  )
}

export function GearIcon(props) {
  return (
    <svg {...fineProps} {...props}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 1.8v2.1M10 16.1v2.1M18.2 10h-2.1M3.9 10H1.8M15.8 4.2l-1.5 1.5M5.7 14.3l-1.5 1.5M15.8 15.8l-1.5-1.5M5.7 5.7 4.2 4.2" />
      <circle cx="10" cy="10" r="5.6" />
    </svg>
  )
}

export function MailIcon(props) {
  return (
    <svg {...fineProps} {...props}>
      <rect x="2.4" y="4.4" width="15.2" height="11.2" rx="2" />
      <path d="m3 6 7 5.2L17 6" />
    </svg>
  )
}

/* A page with a folded corner and two lines of text: a document (the résumé). */
export function DocumentIcon(props) {
  return (
    <svg {...fineProps} {...props}>
      <path d="M5.5 2.5h6l3.5 3.5v10a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 16V4a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="M11.5 2.5V6H15M7 10.5h6M7 13.5h4" />
    </svg>
  )
}

/* Two four-point sparkles: the usual shorthand for AI assistance. */
export function SparklesIcon(props) {
  return (
    <svg {...fineProps} {...props}>
      <path d="M8 3.2C8.5 6.2 9.8 7.5 12.8 8 9.8 8.5 8.5 9.8 8 12.8 7.5 9.8 6.2 8.5 3.2 8 6.2 7.5 7.5 6.2 8 3.2Z" />
      <path d="M14.6 11.6c.3 1.7 1 2.4 2.7 2.7-1.7.3-2.4 1-2.7 2.7-.3-1.7-1-2.4-2.7-2.7 1.7-.3 2.4-1 2.7-2.7Z" />
    </svg>
  )
}

/* Brand marks are solid shapes on a 24-unit grid. */
const brandProps = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true, focusable: false }

export function LinkedInIcon(props) {
  return (
    <svg {...brandProps} {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

export function GitHubIcon(props) {
  return (
    <svg {...brandProps} {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

/* A lab flask: testing. */
export function FlaskIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <path d="M8 2.5h4M8.5 2.5v5L3.8 15.4A1.4 1.4 0 0 0 5 17.5h10a1.4 1.4 0 0 0 1.2-2.1L11.5 7.5v-5M6 12.5h8" />
    </svg>
  )
}

/* A target: focus on outcomes. */
export function TargetIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <circle cx="10" cy="10" r="7.25" />
      <circle cx="10" cy="10" r="3.75" />
      <circle cx="10" cy="10" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* Three rising bars: growth. */
export function ChartIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <path d="M4.5 16.5V11.5M10 16.5V7.5M15.5 16.5V3.5" />
    </svg>
  )
}

/* A compass: how I find my way through work. */
export function CompassIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <circle cx="10" cy="10" r="7.25" />
      <path d="M13 7l-1.75 4.25L7 13l1.75-4.25L13 7z" />
    </svg>
  )
}

/* Two arrows chasing each other: side effects and data flow (Redux-Saga). */
export function CycleIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <path d="M15.6 7.4A6 6 0 0 0 4.7 6.2M4.4 12.6a6 6 0 0 0 10.9 1.2M4.5 2.8v3.6h3.6M15.5 17.2v-3.6h-3.6" />
    </svg>
  )
}

/* A server: Node.js and the back end. */
export function ServerIcon(props) {
  return (
    <svg {...baseProps} strokeWidth={1.75} {...props}>
      <rect x="3" y="3.5" width="14" height="5.5" rx="1.5" />
      <rect x="3" y="11" width="14" height="5.5" rx="1.5" />
      <path d="M6.5 6.25h.01M6.5 13.75h.01" />
    </svg>
  )
}

const GLYPHS = {
  atom: AtomIcon,
  chart: ChartIcon,
  code: CodeIcon,
  compass: CompassIcon,
  flask: FlaskIcon,
  cycle: CycleIcon,
  database: DatabaseIcon,
  document: DocumentIcon,
  gear: GearIcon,
  github: GitHubIcon,
  layers: LayersIcon,
  linkedin: LinkedInIcon,
  mail: MailIcon,
  server: ServerIcon,
  sparkles: SparklesIcon,
  target: TargetIcon,
}

/** Picks an icon by the name used for it in content.js. */
export function Icon({ name, ...props }) {
  const Glyph = GLYPHS[name]
  return <Glyph {...props} />
}
