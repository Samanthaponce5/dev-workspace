import { Card, IconTile, Section, Tag } from '../../components/ui'
import { Icon } from '../../components/ui/icons'
import { about } from '../../content/content'
import styles from './About.module.css'

/**
 * Who I am professionally: a headline with a short introduction and the
 * tools I use most beside it, a row of numbers at a glance, and three
 * short notes on what I bring, where I'm growing and how I work.
 */
export function About() {
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
        <dl className={styles.stats} aria-label={about.statsLabel} data-rise style={{ '--i': 1 }}>
          {about.stats.map((stat) => (
            <div key={stat.id} className={styles.stat}>
              <Icon name={stat.icon} className={styles.statIcon} width={22} height={22} />
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
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
