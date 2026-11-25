import { Card, IconTile, Section } from '../../components/ui'
import { about } from '../../content/content'
import { useCountUp } from '../../hooks/useCountUp'
import { useInView } from '../../hooks/useInView'
import { useIntroDone } from '../../hooks/useIntroDone'
import { useHydrated } from '../../hooks/useHydrated'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { cx } from '../../utils/cx'
import styles from './About.module.css'

const STAGGER_MS = 90

/*
 * One highlight. A number counts up the first time the highlights are
 * seen; a word fades up instead. An invisible copy of the final number
 * holds its space, so nothing moves the layout, and screen readers get
 * the final number only.
 */
function Highlight({ stat, index, start, reduced }) {
  const counts = typeof stat.value === 'number'
  const shown = useCountUp(counts ? stat.value : 0, { start: counts && start, delay: index * STAGGER_MS, reduced })

  return (
    <div className={styles.stat} style={{ '--delay': `${index * STAGGER_MS}ms` }}>
      <dt className={styles.statLabel}>{stat.label}</dt>
      <dd className={cx(styles.statValue, !counts && styles.statWord)}>
        {counts ? (
          <>
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
          </>
        ) : (
          stat.value
        )}
      </dd>
    </div>
  )
}

/**
 * Who I am professionally: a headline with a short introduction beside
 * it, three highlights at a glance, and three short notes on what I
 * bring, where I'm growing and how I work.
 */
export function About() {
  const [statsRef, statsSeen] = useInView({ once: true, threshold: 0.4 })
  const introDone = useIntroDone()
  const reduced = useReducedMotion()
  const hydrated = useHydrated()
  // Wait for the intro too, in case the page opens with the highlights already on screen behind it.
  const start = statsSeen && introDone
  // The words wait hidden until then (only in the browser, and not with reduced motion), then fade up once.
  const phase = hydrated && !reduced ? (start ? 'in' : 'waiting') : undefined

  return (
    <Section
      id="about"
      eyebrow={about.eyebrow}
      title={
        <>
          {about.title.lead} <span className={styles.highlight}>{about.title.highlight}</span>
        </>
      }
      aside={<p className={styles.intro}>{about.intro}</p>}
    >
      <div className={styles.stack}>
        <dl ref={statsRef} className={styles.stats} aria-label={about.statsLabel} data-phase={phase}>
          {about.stats.map((stat, index) => (
            <Highlight key={stat.id} stat={stat} index={index} start={start} reduced={reduced} />
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
