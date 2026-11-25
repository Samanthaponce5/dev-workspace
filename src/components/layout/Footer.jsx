import { footer } from '../../content/content'
import { HOME_PATH } from '../../utils/routes'
import { Container } from '../ui'
import styles from './Footer.module.css'

/** Closing lines, with a note on how the site is built, and a link back to the top. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.credits}>
          <p>{footer.note}</p>
          <p className={styles.built}>{footer.built}</p>
        </div>
        <a className={styles.top} href={HOME_PATH}>
          {footer.backToTop}
        </a>
      </Container>
    </footer>
  )
}
