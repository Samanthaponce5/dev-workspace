import { footer } from '../../content/content'
import { Container } from '../ui'
import styles from './Footer.module.css'

/** Closing line and a link back to the top. */
export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <p>{footer.note}</p>
        <a className={styles.top} href="#top">
          {footer.backToTop}
        </a>
      </Container>
    </footer>
  )
}
