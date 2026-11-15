import { cx } from '../../utils/cx'
import styles from './Card.module.css'

/** A raised surface for grouping related content. */
export function Card({ as: Element = 'div', className, children, ...rest }) {
  return (
    <Element className={cx(styles.card, className)} {...rest}>
      {children}
    </Element>
  )
}
