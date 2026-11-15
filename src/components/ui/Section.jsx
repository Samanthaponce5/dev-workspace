import { cx } from '../../utils/cx'
import { Container } from './Container'
import { Eyebrow } from './Eyebrow'
import { Heading } from './Heading'
import styles from './Section.module.css'

/**
 * A page section with a labelled heading. The `id` doubles as the
 * anchor that the nav links scroll to.
 */
export function Section({ id, eyebrow, title, className, children }) {
  const headingId = `${id}-heading`

  return (
    <section id={id} aria-labelledby={headingId} className={cx(styles.section, className)}>
      <Container>
        <header className={styles.header}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <Heading level={2} id={headingId}>
            {title}
          </Heading>
        </header>
        {children}
      </Container>
    </section>
  )
}
