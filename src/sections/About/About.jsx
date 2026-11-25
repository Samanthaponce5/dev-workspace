import { Card, IconTile, Section, Tag } from '../../components/ui'
import { Icon } from '../../components/ui/icons'
import { about } from '../../content/content'
import { useCountUp } from '../../hooks/useCountUp'
import { useInView } from '../../hooks/useInView'
import { useIntroDone } from '../../hooks/useIntroDone'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import styles from './About.module.css'

const STAGGER_MS = 80

/*
 * One number at a glance. It counts up once, the first time the numbers
 * are seen. An invisible copy of the final number holds the space, so the
 * digits never move the layout; screen readers get the final number only.
 */
function Stat({ stat, index, start, reduced }) {
  const shown = useCountUp(stat.value, { start, delay: index * STAGGER_MS, reduced })

  return (
    <div className={styles.stat}>
      <Icon name={stat.icon} className={styles.statIcon} width={22} height={22} />
      <dt className={styles.statLabel}>
        {stat.label}
        <span className="visually-hidden">, </span>
        <span className={styles.statScope}>{stat.scope}</span>
      </dt>
      <dd className={styles.statValue}>
        <span aria-hidden="true">
          <span className={styles.statNumber}>
            <span className={styles.statHold}>{stat.value}</span>
            <span className={styles.statCount}>{shown}</span>
          </span>
          {stat.suffix}
        </span>
        <span className="visually-hidden">
          {stat.value}
          {stat.suffix}
        </span>
      </dd>
    </div>
  )
}

/**
 * Who I am professionally: a headline with a short introduction and the
 * tools I use most beside it, a row of numbers at a glance, and three
 * short notes on what I bring, where I'm growing and how I work.
 */
export function About() {
  const [statsRef, statsSeen] = useInView({ once: true, threshold: 0.4 })
  const introDone = useIntroDone()
  const reduced = useReducedMotion()
  // Wait for the intro too, in case the page opens with the numbers already on screen behind it.
  const start = statsSeen && introDone

  return (
    <Section
      id="about"
      eyebrow={about.eyebrow}
      title={
        <>
          {about.title.lead} <span className={styles.highlight}>{about.title.highlight}</span>
        </>
      }
      aside={
        <>
          <p className={styles.intro}>{about.intro}</p>
          <ul className={styles.tools} aria-label={about.toolsLabel}>
            {about.tools.map((tool) => (
              <Tag key={tool.label} className={styles.tool}>
                <Icon name={tool.icon} width={15} height={15} />
                {tool.label}
              </Tag>
            ))}
          </ul>
        </>
      }
    >
      <div className={styles.stack}>
        <dl ref={statsRef} className={styles.stats} aria-label={about.statsLabel} data-rise style={{ '--i': 1 }}>
          {about.stats.map((stat, index) => (
            <Stat key={stat.id} stat={stat} index={index} start={start} reduced={reduced} />
          ))}
        </dl>

        <ul className={styles.notes}>
          {about.notes.map((note, index) => (
            <Card as="li" key={note.id} className={styles.note} style={{ '--i': index + 2 }} data-rise>
              <IconTile name={note.icon} tone="soft" size="sm" />
              <div>
                <h3 className={styles.noteTitle}>{note.title}</h3>
                <p className={styles.noteText}>{note.text}</p>
              </div>
            </Card>
          ))}
        </ul>
      </div>
    </Section>
  )
}
