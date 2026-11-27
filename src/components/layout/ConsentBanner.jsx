import { useEffect, useState } from 'react'
import { consent } from '../../content/content'
import { onConsentNeeded, setConsent } from '../../utils/analytics'
import styles from './ConsentBanner.module.css'

/**
 * The cookie question, shown only to visitors who must be asked before
 * analytics runs (the EU/EEA, the UK and Switzerland; see
 * utils/analytics.js), once, after the intro. Both answers are equally easy
 * and remembered; the privacy page explains how to change it later.
 */
export function ConsentBanner() {
  const [asking, setAsking] = useState(false)

  useEffect(() => onConsentNeeded(() => setAsking(true)), [])

  if (!asking) return null

  const answer = (allowed) => {
    setConsent(allowed)
    setAsking(false)
  }

  return (
    <section className={styles.banner} aria-label={consent.label}>
      <p className={styles.text}>
        {consent.text}{' '}
        <a className={styles.link} href="/privacy" data-track="click_privacy_policy">
          {consent.privacy}
        </a>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => answer(false)}>
          {consent.decline}
        </button>
        <button type="button" className={styles.button} onClick={() => answer(true)}>
          {consent.allow}
        </button>
      </div>
    </section>
  )
}
