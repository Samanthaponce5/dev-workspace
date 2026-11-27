import { useEffect, useState } from 'react'
import { consent } from '../../content/content'
import { analyticsStatus, onAnalyticsChange, onConsentNeeded, onOpenCookieSettings, setConsent } from '../../utils/analytics'
import { cx } from '../../utils/cx'
import { CloseIcon } from '../ui/icons'
import styles from './ConsentBanner.module.css'

const SETTINGS_HASH = '#cookie-settings' // the privacy page's "Cookie settings" link opens the panel with this

/**
 * The cookie panel, in two forms:
 *
 *   - The question, for visitors who must be asked before analytics runs
 *     (the EU/EEA, the UK and Switzerland; see utils/analytics.js). It
 *     opens by itself once, after the intro: "No thanks" or "Allow".
 *   - Cookie settings, opened by anyone from the footer: an Off / On switch
 *     showing where analytics stands right now, applied at once, with a
 *     line saying why it is off when the browser asked for that.
 */
export function ConsentBanner() {
  const [mode, setMode] = useState(null) // null (closed), 'ask' or 'settings'
  const [status, setStatus] = useState(analyticsStatus)

  useEffect(() => {
    const openSettings = () => {
      setStatus(analyticsStatus())
      setMode('settings')
    }
    const stopAsking = onConsentNeeded(() => setMode('ask'))
    const stopSettings = onOpenCookieSettings(openSettings)
    const stopChanges = onAnalyticsChange(() => setStatus(analyticsStatus()))
    if (window.location.hash === SETTINGS_HASH) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`)
      openSettings()
    }
    return () => {
      stopAsking()
      stopSettings()
      stopChanges()
    }
  }, [])

  if (!mode) return null

  if (mode === 'ask') {
    const answer = (allowed) => {
      setConsent(allowed)
      setMode(null)
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

  const isOn = status.state === 'on'
  const isOff = status.state === 'off'
  const note = isOff && status.reason === 'browser' ? consent.browserNote : null

  return (
    <section className={styles.banner} aria-label={consent.settingsTitle}>
      <button type="button" className={styles.close} onClick={() => setMode(null)} aria-label={consent.close}>
        <CloseIcon width={18} height={18} />
      </button>
      <h2 className={styles.title}>{consent.settingsTitle}</h2>
      <p className={styles.text}>
        {consent.settingsText}{' '}
        <a className={styles.link} href="/privacy" data-track="click_privacy_policy">
          {consent.privacy}
        </a>
      </p>
      <div className={styles.setting}>
        <span id="analytics-setting" className={styles.settingLabel}>
          {consent.settingLabel}
        </span>
        <div className={styles.switch} role="group" aria-labelledby="analytics-setting">
          <button type="button" className={cx(styles.option, isOff && styles.selected)} aria-pressed={isOff} onClick={() => setConsent(false)}>
            {consent.off}
          </button>
          <button type="button" className={cx(styles.option, isOn && styles.selected)} aria-pressed={isOn} onClick={() => setConsent(true)}>
            {consent.on}
          </button>
        </div>
      </div>
      {note && <p className={styles.note}>{note}</p>}
    </section>
  )
}
