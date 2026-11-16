import { cx } from '../../utils/cx'
import styles from './Card.module.css'

/* Tells the card where the pointer is, so its soft light can follow it. */
function trackPointer(event) {
  const card = event.currentTarget
  const box = card.getBoundingClientRect()
  card.style.setProperty('--light-x', `${event.clientX - box.left}px`)
  card.style.setProperty('--light-y', `${event.clientY - box.top}px`)
}

/**
 * A raised surface for grouping related content. On devices with a
 * mouse, a pool of teal light follows the pointer across it.
 */
export function Card({ as: Element = 'div', className, children, ...rest }) {
  return (
    <Element className={cx(styles.card, className)} onPointerMove={trackPointer} {...rest}>
      {children}
    </Element>
  )
}
