import { useEffect, useRef } from 'react'
import styles from './MobileMenu.module.css'

/**
 * Dropdown panel with every section link, for phones and tablets.
 * Closes on Escape, on a click outside, and when a link is followed.
 * Focus moves to the first link on open; the caller restores it on close.
 */
export function MobileMenu({ id, items, onClose, ignoreRef }) {
  const panelRef = useRef(null)

  useEffect(() => {
    panelRef.current?.querySelector('a')?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose({ restoreFocus: true })
    }
    const onPointerDown = (event) => {
      const insidePanel = panelRef.current?.contains(event.target)
      const onToggle = ignoreRef.current?.contains(event.target)
      if (!insidePanel && !onToggle) onClose({ restoreFocus: false })
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [onClose, ignoreRef])

  return (
    <div ref={panelRef} id={id} className={styles.panel}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <a className={styles.link} href={`#${item.id}`} onClick={() => onClose({ restoreFocus: false })}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
