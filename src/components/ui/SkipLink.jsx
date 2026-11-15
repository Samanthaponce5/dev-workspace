import styles from './SkipLink.module.css'

/** First focusable element on the page: jumps keyboard users past the nav. */
export function SkipLink({ targetId = 'main' }) {
  return (
    <a className={styles.skipLink} href={`#${targetId}`}>
      Skip to main content
    </a>
  )
}
