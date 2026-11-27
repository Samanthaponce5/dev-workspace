import { useEffect, useRef, useState } from 'react'
import { Card, Section } from '../../components/ui'
import { ArrowUpRightIcon, CheckIcon, CopyIcon, Icon } from '../../components/ui/icons'
import { contact, resume } from '../../content/content'
import { track } from '../../utils/analytics'
import styles from './Contact.module.css'

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' }
const COPIED_MS = 2000

/* What following each row sends to analytics (see utils/analytics.js). */
const trackingFor = (link) => (link.id === 'resume' ? { 'data-track': 'resume_open', 'data-track-from': 'contact' } : { 'data-track': 'contact_click', 'data-track-method': link.id })

/*
 * The email row: a row like the others (it opens the visitor's mail app),
 * with the address shown under its name and a small Copy button beside
 * the arrow, for anyone on webmail. If the clipboard is refused, the
 * address is selected so it can be copied by hand.
 */
function EmailRow({ link }) {
  const addressRef = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return undefined
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.address)
      setCopied(true)
      track('copy_email')
    } catch {
      const range = document.createRange()
      range.selectNodeContents(addressRef.current)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }
  }

  return (
    <li className={styles.emailRow}>
      <a className={styles.link} href={link.href} {...trackingFor(link)}>
        <Icon name={link.icon} className={styles.linkIcon} width={28} height={28} />
        <span className={styles.linkLabel}>
          {link.label}
          <span ref={addressRef} className={styles.address}>
            {/* If it has to wrap, it wraps after the @. */}
            {link.address.split('@')[0]}@<wbr />
            {link.address.split('@')[1]}
          </span>
        </span>
        <ArrowUpRightIcon className={styles.linkArrow} />
      </a>
      <button type="button" className={styles.copy} onClick={copy} aria-label={contact.copy.name} title={contact.copy.name} data-copied={copied || undefined}>
        {copied && (
          <span className={styles.copied} aria-hidden="true">
            {contact.copy.done}
          </span>
        )}
        {copied ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
      </button>
      <span className="visually-hidden" role="status">
        {copied ? contact.copy.announce : ''}
      </span>
    </li>
  )
}

function ContactLink({ link }) {
  return (
    <li>
      <a className={styles.link} href={link.href} {...(link.external ? NEW_TAB : {})} {...trackingFor(link)}>
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

/** The invitation on one side, the ways to get in touch (and the résumé) on the other, stacked on phones. */
export function Contact() {
  return (
    <Section id="contact" split eyebrow={contact.eyebrow} title={contact.title} intro={contact.intro}>
      <Card className={styles.card} style={{ '--i': 1 }} data-rise>
        <ul className={styles.links} aria-label={contact.linksLabel}>
          {contact.links.map((link) => (link.address ? <EmailRow key={link.id} link={link} /> : <ContactLink key={link.id} link={link} />))}
        </ul>
      </Card>
    </Section>
  )
}
