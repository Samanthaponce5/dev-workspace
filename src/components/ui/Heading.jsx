import { cx } from '../../utils/cx'
import styles from './Heading.module.css'

const DEFAULT_SIZE_BY_LEVEL = { 1: 'display', 2: 'xl', 3: 'md', 4: 'sm' }

/**
 * A heading whose semantic level (h1–h4) is independent of its visual size,
 * so the document outline stays correct whatever the design calls for.
 */
export function Heading({ level = 2, size, className, children, ...rest }) {
  const Element = `h${level}`
  const visualSize = size ?? DEFAULT_SIZE_BY_LEVEL[level]

  return (
    <Element className={cx(styles.heading, styles[visualSize], className)} {...rest}>
      {children}
    </Element>
  )
}
