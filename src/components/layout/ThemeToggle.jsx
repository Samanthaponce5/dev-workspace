import { themeToggle as copy } from '../../content/content'
import { useDisplaySettings } from '../../hooks/useDisplaySettings'
import { applySettings } from '../../utils/displaySettings'
import { MoonIcon, SunIcon } from '../ui/icons'
import styles from './ThemeToggle.module.css'

/**
 * Switches the whole site, 3D scene included, between the Dark and Light
 * themes, and remembers the choice. It shows a sun in Dark and a moon in
 * Light, and its name says what pressing it will do.
 *
 * Which icon shows is decided in CSS from the theme on <html>, so a saved
 * Light theme has the right icon from the first paint.
 */
export function ThemeToggle() {
  const { appearance } = useDisplaySettings()
  const isLight = appearance === 'light'

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={isLight ? copy.toDark : copy.toLight}
      onClick={() => applySettings({ appearance: isLight ? 'dark' : 'light' })}
    >
      <SunIcon className={styles.sun} width={22} height={22} />
      <MoonIcon className={styles.moon} width={22} height={22} />
    </button>
  )
}
