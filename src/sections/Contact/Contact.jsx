import { AndySvg } from '../../components/characters/svg/AndySvg'
import { SamSvg } from '../../components/characters/svg/SamSvg'
import { Button, ScrollMoment, Section } from '../../components/ui'
import { ArrowUpRightIcon } from '../../components/ui/icons'
import { contact } from '../../content/content'
import styles from './Contact.module.css'

/** Email first, then profile links. They both wave goodbye. */
export function Contact() {
  return (
    <Section id="contact" eyebrow={contact.eyebrow} title={contact.title}>
      <div className={styles.layout}>
        <div className={styles.details}>
          <p className={styles.intro}>{contact.intro}</p>
          <div className={styles.actions}>
            <Button href={`mailto:${contact.email}`}>{contact.email}</Button>
            {contact.links.map((link) => (
              <Button key={link.id} href={link.href} variant="ghost" target="_blank" rel="noopener noreferrer" iconEnd={<ArrowUpRightIcon />}>
                {link.label}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </Button>
            ))}
          </div>
        </div>

        <ScrollMoment className={styles.pair}>
          <SamSvg pose="wave" className={styles.sam} />
          <AndySvg pose="wave" className={styles.andy} />
        </ScrollMoment>
      </div>
    </Section>
  )
}
