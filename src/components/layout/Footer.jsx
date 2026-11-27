import { useId } from 'react'
import { footer } from '../../content/content'
import { openCookieSettings } from '../../utils/analytics'
import { HOME_PATH } from '../../utils/routes'
import { Container } from '../ui'
import styles from './Footer.module.css'

/* A small heart in the theme's mint and aqua, with a highlight, that turns once in 3D every few seconds. Decorative. */
function Heart() {
  const id = `heart${useId().replace(/[^a-zA-Z0-9_-]/g, '')}` // React's ids can contain characters that break url(#...) references
  return (
    <span className={styles.heart} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="1em" height="1em" focusable="false">
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className={styles.heartLight} />
            <stop offset="1" className={styles.heartDeep} />
          </linearGradient>
        </defs>
        <path
          fill={`url(#${id}-fill)`}
          d="M12 21.2s-7.6-4.7-9.7-9.4C.8 8.4 3 4.4 6.7 4.4c2.1 0 3.6 1.2 4.5 2.7.9-1.5 2.4-2.7 4.5-2.7 3.7 0 5.9 4 4.4 7.4-2.1 4.7-8.1 9.4-8.1 9.4Z"
        />
        <ellipse cx="7.6" cy="8.6" rx="2" ry="1.3" transform="rotate(-35 7.6 8.6)" fill="#fff" opacity="0.55" />
      </svg>
    </span>
  )
}

/** Closing lines, with a note on how the site is built, and links to the privacy page and back to the top. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.credits}>
          <p>
            {footer.note}
            <Heart />
          </p>
          <p className={styles.built}>{footer.built}</p>
        </div>
        <div className={styles.links}>
          <a className={styles.top} href="/privacy" data-track="click_privacy_policy">
            {footer.privacy}
          </a>
          <button type="button" className={styles.top} onClick={openCookieSettings} data-track="open_cookie_settings">
            {footer.cookieSettings}
          </button>
          <a className={styles.top} href={HOME_PATH} data-track="click_back_to_top">
            {footer.backToTop}
          </a>
        </div>
      </Container>
    </footer>
  )
}
