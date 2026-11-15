import { cx } from '../../utils/cx'
import styles from './Eyebrow.module.css'

/** Small monospace label that sits above a heading. */
export function Eyebrow({ className, children }) {
  return <p className={cx(styles.eyebrow, className)}>{children}</p>
}
