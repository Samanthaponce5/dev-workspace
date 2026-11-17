import { useCallback, useRef, useState } from 'react'
import { displaySettings as copy } from '../../content/content'
import { useDisplaySettings } from '../../hooks/useDisplaySettings'
import { applySettings } from '../../utils/displaySettings'
import { SlidersIcon } from '../ui/icons'
import styles from './DisplaySettings.module.css'
import { SettingsDialog } from './SettingsDialog'

/**
 * The Display settings button, fixed to the bottom corner of every page,
 * and the panel it opens. On a phone the button shows its icon alone, so
 * it covers as little of the page as possible; its name is still read out. Screen readers hear a short confirmation when
 * new settings are applied.
 */
export function DisplaySettings() {
  const launcherRef = useRef(null)
  const settings = useDisplaySettings()
  const [open, setOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const apply = useCallback((next) => {
    applySettings(next)
    setAnnouncement(copy.applied)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    launcherRef.current?.focus()
  }, [])

  const openPanel = () => {
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
