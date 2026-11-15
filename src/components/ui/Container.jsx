import { cx } from '../../utils/cx'
import styles from './Container.module.css'

/** Centres content and applies the page gutters. */
export function Container({ as: Element = 'div', narrow = false, wide = false, className, children, ...rest }) {
  return (
    <Element className={cx(styles.container, narrow && styles.narrow, wide && styles.wide, className)} {...rest}>
      {children}
    </Element>
  )
}
