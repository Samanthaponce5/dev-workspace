import { Card, Heading, Section, Tag } from '../../components/ui'
import { skills } from '../../content/content'
import styles from './Work.module.css'

/** "What I do": three skill groups. */
export function Work() {
  return (
    <Section id="work" eyebrow={skills.eyebrow} title={skills.title}>
      <ul className={styles.grid}>
        {skills.groups.map((group, index) => (
          <Card as="li" key={group.id} className={styles.card} style={{ '--i': index + 1 }} data-rise>
            <span className={styles.index} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <Heading level={3}>{group.title}</Heading>
            <p className={styles.description}>{group.description}</p>
            <ul className={styles.tags} aria-label={`${group.title} skills`}>
              {group.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </ul>
          </Card>
        ))}
      </ul>
    </Section>
  )
}
