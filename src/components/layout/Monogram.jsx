import { site } from '../../content/content'
import styles from './Monogram.module.css'

const initials = site.name
  .split(' ')
  .map((word) => word[0])
  .join('')

/** "SP" home link with a small lime accent dot. */
export function Monogram() {
  return (
    <a className={styles.monogram} href="#top" aria-label={`${site.name}, back to top`}>
      <span aria-hidden="true">{initials}</span>
      <span className={styles.dot} aria-hidden="true" />
    </a>
  )
}
