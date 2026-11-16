import { Button, IconTile, Section } from '../../components/ui'
import { ArrowRightIcon, ArrowUpRightIcon } from '../../components/ui/icons'
import { about } from '../../content/content'
import styles from './About.module.css'

/** A short introduction beside three one-line answers a hiring manager looks for. */
export function About() {
  const { work, contact } = about.actions

  return (
    <Section
      id="about"
      split
      eyebrow={about.eyebrow}
      title={about.title}
      intro={about.intro}
      actions={
        <>
          <Button href={work.href} iconEnd={<ArrowRightIcon />}>
            {work.label}
          </Button>
          <Button href={contact.href} variant="ghost" iconEnd={<ArrowUpRightIcon />}>
            {contact.label}
          </Button>
        </>
      }
    >
      <ul className={styles.points}>
        {about.points.map((point, index) => (
          <li key={point.id} className={styles.point} style={{ '--i': index + 1 }} data-rise>
            <IconTile name={point.icon} tone="soft" />
            <p className={styles.text}>
              <strong className={styles.label}>{point.label}</strong> {point.text}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
