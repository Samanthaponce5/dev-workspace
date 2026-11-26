import { site } from '../../content/content'
import { HOME_PATH } from '../../utils/routes'
import { LOGO_HEIGHT, LOGO_LETTERS, LOGO_WIDTH, STROKE } from './logoShape'
import styles from './Monogram.module.css'

/**
 * "SP" home link with a small accent dot, in the theme's mint. The letters are drawn as
 * rounded lines (see logoShape.js), the same shapes the intro assembles.
 * Its accessible name starts with the visible letters, so voice-control
 * users can say what they see.
 *
 * The data attributes let the intro measure the logo: its moving copy
 * lands on exactly these letters and this dot (see src/intro/reveal.js).
 */
export function Monogram() {
  return (
    <a className={styles.monogram} href={HOME_PATH} aria-label={`${site.initials}: ${site.name}, back to top`} data-site-logo>
      <svg
        className={styles.letters}
        viewBox={`0 0 ${LOGO_WIDTH} ${LOGO_HEIGHT}`}
        style={{ aspectRatio: `${LOGO_WIDTH} / ${LOGO_HEIGHT}` }}
        aria-hidden="true"
        focusable="false"
        data-site-logo-letters
      >
        <g fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
          <path d={LOGO_LETTERS.s} />
          <path d={LOGO_LETTERS.p} />
        </g>
      </svg>
      <span className={styles.dot} aria-hidden="true" data-site-logo-dot />
    </a>
  )
}
