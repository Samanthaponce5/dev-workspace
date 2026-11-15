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
