import { useCallback, useRef, useState } from 'react'
import { nav } from '../../content/content'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useScrolled } from '../../hooks/useScrolled'
import { cx } from '../../utils/cx'
import { Container } from '../ui'
import { CloseIcon, MenuIcon } from '../ui/icons'
import { MobileMenu } from './MobileMenu'
import { Monogram } from './Monogram'
import styles from './Nav.module.css'

const MENU_ID = 'site-menu'
const SECTION_IDS = nav.map((item) => item.id)

/**
 * Fixed site header. Desktop shows every link in a row. Phones show the
 * pinned links plus a menu button that opens the full list. The link for
 * the section being read is marked with aria-current and an underline.
 */
export function Nav() {
  const scrolled = useScrolled()
  const activeId = useActiveSection(SECTION_IDS)
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef(null)

  const closeMenu = useCallback(({ restoreFocus }) => {
    setMenuOpen(false)
    if (restoreFocus) toggleRef.current?.focus()
  }, [])

  return (
    <header className={cx(styles.header, (scrolled || menuOpen) && styles.solid)}>
      <Container wide className={styles.bar}>
        <Monogram />

        <nav aria-label="Main" className={styles.nav}>
          <ul className={styles.links}>
            {nav.map((item) => (
              <li key={item.id} className={cx(!item.pinned && styles.desktopOnly)}>
                <a className={styles.link} href={`#${item.id}`} aria-current={activeId === item.id ? 'true' : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <button
            ref={toggleRef}
            type="button"
            className={styles.menuToggle}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon width={24} height={24} /> : <MenuIcon width={24} height={24} />}
          </button>
        </nav>
      </Container>

      {menuOpen && <MobileMenu id={MENU_ID} items={nav} activeId={activeId} onClose={closeMenu} ignoreRef={toggleRef} />}
    </header>
  )
}
