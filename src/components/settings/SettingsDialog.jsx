import { useEffect, useId, useRef, useState } from 'react'
import { displaySettings as copy } from '../../content/content'
import { DEFAULT_SETTINGS } from '../../utils/displaySettings'
import { Button, Heading } from '../ui'
import { CloseIcon } from '../ui/icons'
import { OptionGroup } from './OptionGroup'
import styles from './SettingsDialog.module.css'
import { SettingsPreview } from './SettingsPreview'

const FOCUSABLE = 'button, input:checked, [href]'

/* Just the settings this panel offers. The theme has its own switch in the navbar and is left alone here. */
const panelSettings = (settings) => Object.fromEntries(copy.groups.map((group) => [group.id, settings[group.id]]))

/**
 * The Display settings panel: a modal dialog, so the page behind is out
 * of reach while it is open and Escape closes it.
 *
 * Choices are a draft: they show in the preview straight away, and reach
 * the site only through Apply. Closing any other way discards them.
 *
 * @param {object} props
 * @param {object} props.settings The settings currently applied.
 * @param {(settings: object) => void} props.onApply
 * @param {() => void} props.onClose Called when the dialog closes, however that happened.
 */
export function SettingsDialog({ settings, onApply, onClose }) {
  const dialogRef = useRef(null)
  const titleId = useId()
  const [draft, setDraft] = useState(() => panelSettings(settings))

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog.open) dialog.showModal()
    // Start on the first setting's chosen option, not on the close button.
    dialog.querySelector('input:checked')?.focus()
  }, [])

  /*
   * Every way of closing comes through here, so the caller always hears
   * about it without waiting on the dialog's own close event.
   */
  const dismiss = () => {
    if (dialogRef.current.open) dialogRef.current.close()
    onClose()
  }

  /* Escape, or a phone's back gesture. */
  const dismissOnCancel = (event) => {
    event.preventDefault()
    dismiss()
  }

  const choose = (id) => (value) => setDraft((current) => ({ ...current, [id]: value }))

  /* Tab from the last control wraps to the first, and back, so focus never leaves for the browser's own controls. */
  const keepFocusInside = (event) => {
    if (event.key !== 'Tab') return
    const stops = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
    const first = stops[0]
    const last = stops[stops.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  /* A click on the dimmed area around the panel lands on the dialog element itself. */
  const closeOnBackdrop = (event) => {
    if (event.target === dialogRef.current) dismiss()
  }

  const apply = (event) => {
    event.preventDefault()
    onApply(draft)
    dismiss()
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} onCancel={dismissOnCancel} onKeyDown={keepFocusInside} onClick={closeOnBackdrop}>
      <form className={styles.panel} onSubmit={apply}>
        <header className={styles.header}>
          <Heading level={2} size="md" id={titleId}>
            {copy.title}
          </Heading>
          <button type="button" className={styles.close} aria-label={copy.close} onClick={dismiss}>
            <CloseIcon />
          </button>
        </header>

        <div>
          {copy.groups.map((group) => (
            <OptionGroup key={group.id} {...group} value={draft[group.id]} onChange={choose(group.id)} />
          ))}
        </div>

        <SettingsPreview textSize={draft.textSize} contrast={draft.contrast} />

        <footer className={styles.actions}>
          <button type="button" className={styles.reset} onClick={() => setDraft(panelSettings(DEFAULT_SETTINGS))}>
            {copy.reset}
          </button>
          <Button type="submit" className={styles.apply}>
            {copy.apply}
          </Button>
        </footer>
      </form>
    </dialog>
  )
}
