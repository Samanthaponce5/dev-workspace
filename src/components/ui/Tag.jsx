import { cx } from '../../utils/cx'
import styles from './Tag.module.css'

/** Small pill label, used for skill names. Renders as a list item by default. */
export function Tag({ as: Element = 'li', className, children }) {
  return <Element className={cx(styles.tag, className)}>{children}</Element>
}
