import { Button, Card, Heading, IconTile, Section } from '../../components/ui'
import { ArrowRightIcon } from '../../components/ui/icons'
import { experience, resume } from '../../content/content'
import styles from './Experience.module.css'

function Stage({ stage, index }) {
  return (
    <Card as="li" className={styles.stage} style={{ '--i': index + 1 }} data-rise>
      <div className={styles.stageHeader}>
        <IconTile name={stage.icon} />
        <Heading level={3}>{stage.title}</Heading>
      </div>
      <p className={styles.summary}>{stage.summary}</p>
      <p className={styles.examples}>
        <strong>{experience.examplesLabel}</strong> {stage.examples}
      </p>
      {/* Points on to the next stage. Decorative: the list is already ordered. */}
      <ArrowRightIcon className={styles.next} width={24} height={24} />
    </Card>
  )
}

/**
 * How the work has widened, as three stages in order, then the current
 * role with a link to the résumé. When the section scrolls into view, a
 * strip of light switches on across the top of each stage in turn.
 */
export function Experience() {
  return (
    <Section id="experience" eyebrow={experience.eyebrow} title={experience.title} intro={experience.intro}>
      <ol className={styles.stages}>
        {experience.stages.map((stage, index) => (
          <Stage key={stage.id} stage={stage} index={index} />
        ))}
      </ol>

      <div className={styles.current} style={{ '--i': experience.stages.length + 1 }} data-rise>
        <p className={styles.role}>
          <span className={styles.live} aria-hidden="true" />
          <span className={styles.roleLabel}>{experience.currentRole.label}</span>{' '}
          <span className={styles.roleValue}>{experience.currentRole.value}</span>
        </p>
        <Button href={resume.href} target="_blank" rel="noopener" iconEnd={<ArrowRightIcon />}>
          {experience.resumeLabel}
          <span className="visually-hidden"> {resume.newTabNote}</span>
        </Button>
      </div>
    </Section>
  )
}
