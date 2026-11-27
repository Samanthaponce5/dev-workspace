import { useCallback, useEffect, useRef, useState } from 'react'
import { displaySettings as copy } from '../../content/content'
import { useDisplaySettings } from '../../hooks/useDisplaySettings'
import { track } from '../../utils/analytics'
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
      track('open_display_settings')
      returnFocusRef.current = event.detail?.returnFocus ?? null
      setAnnouncement('')
      setOpen(true)
    }
    window.addEventListener(OPEN_DISPLAY_SETTINGS, onOpen)
    return () => window.removeEventListener(OPEN_DISPLAY_SETTINGS, onOpen)
  }, [])

  const apply = useCallback((next) => {
    // One event for applying, plus one per setting turned on, so each choice reads plainly in Google Analytics.
    track('apply_display_settings', { text_size: next.textSize, contrast: next.contrast, motion: next.motion })
    if (next.textSize === 'large') track('set_large_text')
    if (next.contrast === 'high') track('set_high_contrast')
    if (next.motion === 'reduced') track('set_reduced_motion')
    applySettings(next)
    setAnnouncement(copy.applied)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    ;(returnFocusRef.current ?? launcherRef.current)?.focus()
    returnFocusRef.current = null
  }, [])

  const openPanel = () => {
    track('open_display_settings')
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
