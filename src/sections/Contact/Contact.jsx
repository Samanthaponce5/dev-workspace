import { AndySvg } from '../../components/characters/svg/AndySvg'
import { SamSvg } from '../../components/characters/svg/SamSvg'
import { Card, Container, Eyebrow, Heading, ScrollMoment } from '../../components/ui'
import { ArrowUpRightIcon, GitHubIcon, LinkedInIcon, MailIcon } from '../../components/ui/icons'
import { contact, resume } from '../../content/content'
import styles from './Contact.module.css'

const LINK_ICONS = { mail: MailIcon, linkedin: LinkedInIcon, github: GitHubIcon }
const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' }

function ContactLink({ link }) {
  const Icon = LINK_ICONS[link.icon]

  return (
    <li>
      <a className={styles.link} href={link.href} {...(link.external ? NEW_TAB : {})}>
        <Icon className={styles.linkIcon} width={28} height={28} />
        <span className={styles.linkLabel}>
          {link.label}
          {link.external && <span className="visually-hidden"> {resume.newTabNote}</span>}
        </span>
        <ArrowUpRightIcon className={styles.linkArrow} />
      </a>
    </li>
  )
}

/**
 * The invitation on one side, the ways to get in touch on the other
 * (stacked on phones). Samantha and Andy wave goodbye under the text.
 */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className={styles.section}>
      <Container>
        <div className={styles.layout}>
          <header className={styles.header}>
            <Eyebrow>{contact.eyebrow}</Eyebrow>
            <Heading level={2} size="xxl" id="contact-heading">
              {contact.title}
            </Heading>
            <p className={styles.intro}>{contact.intro}</p>
          </header>

          <Card className={styles.card}>
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

          <ScrollMoment className={styles.pair}>
            <SamSvg pose="wave" className={styles.sam} />
            <AndySvg pose="wave" className={styles.andy} />
          </ScrollMoment>
        </div>
      </Container>
    </section>
  )
}
