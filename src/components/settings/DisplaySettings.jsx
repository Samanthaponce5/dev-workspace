import { useCallback, useEffect, useRef, useState } from 'react'
import { displaySettings as copy } from '../../content/content'
import { useDisplaySettings } from '../../hooks/useDisplaySettings'
import { applySettings } from '../../utils/displaySettings'
import { SlidersIcon } from '../ui/icons'
import styles from './DisplaySettings.module.css'
import { SettingsDialog } from './SettingsDialog'

/* Fired (with an optional `returnFocus` element) to open the panel from elsewhere: the phone menu. */
export const OPEN_DISPLAY_SETTINGS = 'display-settings:open'

/**
 * The Display settings button, fixed to the bottom corner of the page on
 * tablets and desktops, and the panel it opens. On phones the button would
 * sit over the text, so it lives in the menu instead, which opens the same
 * panel (see MobileMenu). Screen readers hear a short confirmation when
 * new settings are applied.
 */
export function DisplaySettings() {
  const launcherRef = useRef(null)
  const returnFocusRef = useRef(null)
  const settings = useDisplaySettings()
  const [open, setOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const onOpen = (event) => {
      returnFocusRef.current = event.detail?.returnFocus ?? null
      setAnnouncement('')
      setOpen(true)
    }
    window.addEventListener(OPEN_DISPLAY_SETTINGS, onOpen)
    return () => window.removeEventListener(OPEN_DISPLAY_SETTINGS, onOpen)
  }, [])

  const apply = useCallback((next) => {
    applySettings(next)
    setAnnouncement(copy.applied)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    ;(returnFocusRef.current ?? launcherRef.current)?.focus()
    returnFocusRef.current = null
  }, [])

  const openPanel = () => {
    returnFocusRef.current = null
    setAnnouncement('')
    setOpen(true)
  }

  return (
    <>
      <button ref={launcherRef} type="button" className={styles.launcher} aria-haspopup="dialog" aria-expanded={open} onClick={openPanel}>
        <SlidersIcon />
        <span className={styles.label}>{copy.title}</span>
      </button>
      <p className="visually-hidden" role="status">
        {announcement}
      </p>
      {open && <SettingsDialog settings={settings} onApply={apply} onClose={close} />}
    </>
  )
}
