import { site } from '../../content/content'
import styles from './Monogram.module.css'

const initials = site.name
  .split(' ')
  .map((word) => word[0])
  .join('')

/**
 * "SP" home link with a small lime accent dot.
 *
 * The data attributes let the intro measure the logo: its moving copy
 * lands on exactly these letters and this dot (see src/intro/reveal.js).
 */
export function Monogram() {
  return (
    <a className={styles.monogram} href="#top" aria-label={`${site.name}, back to top`} data-site-logo>
      <span aria-hidden="true" data-site-logo-letters>
        {initials}
      </span>
      <span className={styles.dot} aria-hidden="true" data-site-logo-dot />
    </a>
  )
}
