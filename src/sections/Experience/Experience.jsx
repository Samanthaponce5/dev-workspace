import { AndyTrotSvg } from '../../components/characters/svg/AndySvg'
import { Button, Card, Heading, ScrollMoment, Section } from '../../components/ui'
import { ArrowRightIcon, AtomIcon, CodeIcon, LayersIcon } from '../../components/ui/icons'
import { experience, resume } from '../../content/content'
import styles from './Experience.module.css'

const STAGE_ICONS = { atom: AtomIcon, layers: LayersIcon, code: CodeIcon }

function Stage({ stage }) {
  const Icon = STAGE_ICONS[stage.icon]

  return (
    <Card as="li" className={styles.stage}>
      <div className={styles.stageHeader}>
        <span className={styles.stageIcon}>
          <Icon width={28} height={28} />
        </span>
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
 * role with a link to the résumé. Andy trots along the bottom when it
 * scrolls into view.
 */
export function Experience() {
  return (
    <Section id="experience" eyebrow={experience.eyebrow} title={experience.title} intro={experience.intro}>
      <ol className={styles.stages}>
        {experience.stages.map((stage) => (
          <Stage key={stage.id} stage={stage} />
        ))}
      </ol>

      <div className={styles.current}>
        <p className={styles.role}>
          <span className={styles.roleLabel}>{experience.currentRole.label}</span>{' '}
          <span className={styles.roleValue}>{experience.currentRole.value}</span>
        </p>
        <Button href={resume.href} target="_blank" rel="noopener" iconEnd={<ArrowRightIcon />}>
          {experience.resumeLabel}
          <span className="visually-hidden"> {resume.newTabNote}</span>
        </Button>
      </div>

      <ScrollMoment className={styles.track} threshold={0.9}>
        <AndyTrotSvg className={styles.trotter} />
      </ScrollMoment>
    </Section>
  )
}
