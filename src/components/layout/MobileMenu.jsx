import { useEffect, useRef } from 'react'
import { displaySettings } from '../../content/content'
import { pathOf } from '../../utils/routes'
import { OPEN_DISPLAY_SETTINGS } from '../settings/DisplaySettings'
import { SlidersIcon } from '../ui/icons'
import styles from './MobileMenu.module.css'

/**
 * Dropdown panel with every section link, for phones, and the Display
 * settings (which have no floating button on phones). Closes on Escape,
 * on a click outside, and when a link is followed. Focus moves to the
 * first link on open; the caller restores it on close.
 */
export function MobileMenu({ id, items, activeId, onClose, ignoreRef }) {
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
            <a
              className={styles.link}
              href={pathOf(item.id)}
              aria-current={activeId === item.id ? 'true' : undefined}
              onClick={() => onClose({ restoreFocus: false })}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={styles.settings}
        onClick={() => {
          onClose({ restoreFocus: false })
          window.dispatchEvent(new CustomEvent(OPEN_DISPLAY_SETTINGS, { detail: { returnFocus: ignoreRef.current } }))
        }}
      >
        <SlidersIcon />
        {displaySettings.title}
      </button>
    </div>
  )
}
