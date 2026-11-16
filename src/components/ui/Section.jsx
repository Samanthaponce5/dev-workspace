import { cx } from '../../utils/cx'
import { Container } from './Container'
import { Eyebrow } from './Eyebrow'
import { Heading } from './Heading'
import styles from './Section.module.css'

/**
 * A page section with a labelled heading. The `id` doubles as the
 * anchor that the nav links scroll to. `intro` is an optional sentence
 * or two under the title. `aside` is optional content shown beside the
 * heading, such as a small illustration.
 */
export function Section({ id, eyebrow, title, intro, aside, className, children }) {
  const headingId = `${id}-heading`

  return (
    <section id={id} aria-labelledby={headingId} className={cx(styles.section, className)}>
      <Container>
        <div className={styles.top}>
          <header className={styles.header}>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <Heading level={2} id={headingId}>
              {title}
            </Heading>
            {intro && <p className={styles.intro}>{intro}</p>}
          </header>
          {aside}
        </div>
        {children}
      </Container>
    </section>
  )
}
