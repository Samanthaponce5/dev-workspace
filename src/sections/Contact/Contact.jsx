import { Card, Section } from '../../components/ui'
import { ArrowUpRightIcon, Icon } from '../../components/ui/icons'
import { contact, resume } from '../../content/content'
import styles from './Contact.module.css'

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' }

function ContactLink({ link }) {
  return (
    <li>
      <a className={styles.link} href={link.href} {...(link.external ? NEW_TAB : {})}>
        <Icon name={link.icon} className={styles.linkIcon} width={28} height={28} />
        <span className={styles.linkLabel}>
          {link.label}
          {link.external && <span className="visually-hidden"> {resume.newTabNote}</span>}
        </span>
        <ArrowUpRightIcon className={styles.linkArrow} />
      </a>
    </li>
  )
}

/** The invitation on one side, the ways to get in touch on the other (stacked on phones). */
export function Contact() {
  return (
    <Section id="contact" split eyebrow={contact.eyebrow} title={contact.title} intro={contact.intro}>
      <Card className={styles.card} style={{ '--i': 1 }} data-rise>
        <ul className={styles.links} aria-label={contact.linksLabel}>
          {contact.links.map((link) => (
            <ContactLink key={link.id} link={link} />
          ))}
        </ul>
        <a className={styles.resume} href={resume.href} {...NEW_TAB}>
          {contact.resumeLabel}
          <span className="visually-hidden"> {resume.newTabNote}</span>
          <ArrowUpRightIcon width={18} height={18} />
        </a>
      </Card>
    </Section>
  )
}
