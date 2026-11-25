import styles from './SkipLink.module.css'

/**
 * First focusable element on the page: jumps keyboard users past the nav.
 * It moves focus itself, so the address bar keeps its clean address.
 */
export function SkipLink({ targetId = 'main' }) {
  const skip = (event) => {
    const target = document.getElementById(targetId)
    if (!target) return
    event.preventDefault()
    target.focus()
  }

  return (
    <a className={styles.skipLink} href={`#${targetId}`} onClick={skip}>
      Skip to main content
    </a>
  )
}
