import { useEffect, useRef } from 'react'
import { nav } from '../content/content'
import { HOME_PATH, pathOf, sectionOf } from '../utils/routes'
import { useActiveSection } from './useActiveSection'

const SECTION_IDS = nav.map((item) => item.id)

/* Scrolls to a section ('' is the top of the page). Smooth unless `instant` (the page's CSS turns smooth scrolling off with reduced motion). */
function show(id, { instant = false } = {}) {
  const behavior = instant ? 'instant' : 'auto'
  if (!id) {
    window.scrollTo({ top: 0, behavior })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior })
}

/* After a link followed from the keyboard, moves focus to the section, as a jump within a page would, without scrolling again or drawing a ring round it. */
function focusSection(id) {
  const section = id ? document.getElementById(id) : document.getElementById('main')
  if (!section) return
  if (!section.hasAttribute('tabindex')) section.setAttribute('tabindex', '-1')
  section.focus({ preventScroll: true })
}

/* True when this page load is a reload, which the browser returns to the exact spot the visitor left. */
const isReload = () => performance.getEntriesByType?.('navigation')[0]?.type === 'reload'

/**
 * Makes the section addresses work (see utils/routes.js):
 *
 *   - opened at a section's address, the page starts at that section (on a
 *     reload, the browser's own return to the exact spot is kept);
 *   - any link on the page to a section's address (or to the home page)
 *     scrolls there and updates the address bar, without a reload;
 *   - scrolling from one section into another updates the address bar to
 *     match, without adding to the history, so a reload comes back to the
 *     section the visitor was reading;
 *   - the browser's back and forward buttons scroll between them.
 *
 * Links opened in a new tab or window, or with a modifier key, are left to
 * the browser, which loads the page at that address.
 */
export function useSectionRoutes() {
  const activeId = useActiveSection(SECTION_IDS)
  const landed = useRef(false) // the address follows the scroll only once the page has reached where it opened

  useEffect(() => {
    if (!landed.current) return
    const path = activeId ? pathOf(activeId) : HOME_PATH
    if (window.location.pathname !== path) window.history.replaceState(window.history.state, '', path)
  }, [activeId])

  useEffect(() => {
    const opened = sectionOf(window.location.pathname)
    if (opened && !isReload()) {
      show(opened, { instant: true })
      // Once the web fonts are in, the text above may have moved a few pixels: land exactly, unless the visitor has started scrolling.
      const landedAt = window.scrollY
      document.fonts?.ready.then(() => {
        if (Math.abs(window.scrollY - landedAt) < 2) show(opened, { instant: true })
      })
    }
    // Let the jump (or the browser's return to the spot) settle before the address starts following the scroll.
    const settle = window.setTimeout(() => (landed.current = true), opened ? 600 : 0)

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target.closest?.('a[href]')
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return
      const url = new URL(link.href)
      if (url.origin !== window.location.origin || url.hash) return
      const id = sectionOf(url.pathname)
      if (id === null) return

      event.preventDefault()
      if (window.location.pathname !== url.pathname) window.history.pushState(null, '', url.pathname)
      show(id)
      if (event.detail === 0) focusSection(id) // a click with no pointer: Enter on a focused link
    }

    const onPopState = () => {
      const id = sectionOf(window.location.pathname)
      if (id !== null) show(id)
    }

    document.addEventListener('click', onClick)
    window.addEventListener('popstate', onPopState)
    return () => {
      window.clearTimeout(settle)
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])
}
