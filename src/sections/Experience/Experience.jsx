import { AndyTrotSvg } from '../../components/characters/svg/AndySvg'
import { Heading, ScrollMoment, Section } from '../../components/ui'
import { experience } from '../../content/content'
import { cx } from '../../utils/cx'
import styles from './Experience.module.css'

/** Roles, newest first. Andy trots along the bottom when it scrolls into view. */
export function Experience() {
  return (
    <Section id="experience" eyebrow={experience.eyebrow} title={experience.title} className={styles.section}>
      <ol className={styles.roles}>
        {experience.roles.map((role) => (
          <li key={role.id} className={cx(styles.role, role.current && styles.current)}>
            <p className={styles.period}>
              {role.current && <span className={styles.badge}>{experience.currentLabel}</span>}
              {role.period}
            </p>
            <div className={styles.body}>
              <Heading level={3}>{role.company}</Heading>
              <p className={styles.title}>{role.title}</p>
              <p className={styles.summary}>{role.summary}</p>
            </div>
          </li>
        ))}
      </ol>

      <ScrollMoment className={styles.track} threshold={0.9}>
        <AndyTrotSvg className={styles.trotter} />
      </ScrollMoment>
    </Section>
  )
}
