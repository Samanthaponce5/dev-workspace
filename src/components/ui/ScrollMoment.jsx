import { useInView } from '../../hooks/useInView'
import { cx } from '../../utils/cx'
import styles from './ScrollMoment.module.css'

/**
 * A small decorative moment that comes to life when it scrolls into view.
 *
 * It fades its children in the first time it is on screen and sets
 * [data-visible], which the character illustrations use to start their
 * animations. It is hidden from assistive technology and never takes
 * pointer events, so it can't get in the way of the content.
 */
export function ScrollMoment({ className, threshold = 0.5, children }) {
  const [ref, inView] = useInView({ once: true, threshold })

  return (
    <div ref={ref} className={cx(styles.moment, className)} data-visible={inView || undefined} aria-hidden="true">
      {children}
    </div>
  )
}
