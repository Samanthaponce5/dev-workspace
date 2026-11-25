import { Button, Heading, Section } from '../../components/ui'
import { ArrowRightIcon, Icon } from '../../components/ui/icons'
import { experience, resume } from '../../content/content'
import styles from './Experience.module.css'

function Stage({ stage, index }) {
  return (
    <li className={styles.stage} style={{ '--i': index }}>
      {/* The stage's point on the timeline. Decorative: the list is already ordered. */}
      <span className={styles.marker} aria-hidden="true" />
      <div className={styles.body}>
        <div className={styles.stageHeader}>
          <Icon name={stage.icon} className={styles.icon} width={20} height={20} />
          <Heading level={3} size="sm" className={styles.title}>
            {stage.title}
          </Heading>
        </div>
        <p className={styles.meta}>{stage.meta}</p>
        <p className={styles.summary}>{stage.summary}</p>
        <p className={styles.examples}>
          <span className={styles.examplesLabel}>{experience.examplesLabel}</span> {stage.examples}
        </p>
      </div>
    </li>
  )
}

/**
 * How the work has widened: three stages on one timeline (across on wide
 * screens, down on narrow ones), then the current role with a link to the
 * résumé. When the section first scrolls into view, the line draws in and
 * each stage appears as it reaches it.
 */
export function Experience() {
  return (
    <Section id="experience" eyebrow={experience.eyebrow} title={experience.title} intro={experience.intro}>
      <ol className={styles.timeline}>
        {experience.stages.map((stage, index) => (
          <Stage key={stage.id} stage={stage} index={index} />
        ))}
      </ol>

      <div className={styles.current} style={{ '--i': experience.stages.length + 1 }} data-rise>
        <p className={styles.role}>
          <span className={styles.live} aria-hidden="true" />
          <span className={styles.roleLabel}>{experience.currentRole.label}</span>{' '}
          <span className={styles.roleValue}>{experience.currentRole.company}</span>
          <span className={styles.roleSeparator} aria-hidden="true">
            {' · '}
          </span>
          <span className={styles.roleValue}>{experience.currentRole.role}</span>
        </p>
        <Button href={resume.href} target="_blank" rel="noopener" iconEnd={<ArrowRightIcon />} className={styles.resume}>
          {experience.resumeLabel}
          <span className="visually-hidden"> {resume.newTabNote}</span>
        </Button>
      </div>
    </Section>
  )
}
