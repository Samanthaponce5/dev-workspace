import { useHydrated } from '../../hooks/useHydrated'
import { useInView } from '../../hooks/useInView'
import { cx } from '../../utils/cx'
import { Container } from './Container'
import { Eyebrow } from './Eyebrow'
import { Heading } from './Heading'
import styles from './Section.module.css'

/**
 * A page section with a labelled heading. The `id` doubles as the anchor
 * that the nav links scroll to.
 *
 * `intro` is an optional sentence or two under the title and `actions`
 * optional buttons under that. `headerExtra` is anything else that belongs
 * with the heading, placed between the title and the intro. With `split`, the heading sits beside the
 * content on wide screens instead of above it. `aside` is a short block that sits beside the heading on
 * wide screens (under it on small ones), with the content below both.
 *
 * The section also runs the scroll reveal: it sets data-reveal to
 * "pending" once JavaScript is running and to "in" the first time it
 * scrolls into view. Anything inside marked data-rise fades up then (see
 * global.css). Prerendered and no-JavaScript pages never hide anything.
 */
export function Section({ id, eyebrow, title, intro, actions, headerExtra, aside, split = false, className, children }) {
  const headingId = `${id}-heading`
  const hydrated = useHydrated()
  const [ref, inView] = useInView({ once: true, rootMargin: '0px 0px -18% 0px' })
  const reveal = inView ? 'in' : 'pending'
  const header = (
    <header className={styles.header} data-rise>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Heading level={2} size={split ? 'xxl' : undefined} id={headingId} className={styles.title}>
        {title}
      </Heading>
      {headerExtra}
      {intro && <p className={styles.intro}>{intro}</p>}
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )

  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={headingId}
      className={cx(styles.section, split && styles.split, className)}
      data-reveal={hydrated ? reveal : undefined}
    >
      <Container>
        <div className={styles.layout}>
          {aside ? (
            <div className={styles.lead}>
              {header}
              <div className={styles.aside} data-rise>
                {aside}
              </div>
            </div>
          ) : (
            header
          )}
          <div className={styles.body}>{children}</div>
        </div>
      </Container>
    </section>
  )
}
