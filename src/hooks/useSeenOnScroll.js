import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * Which items in a section have scrolled into view, once each.
 *
 * Used where a section is taller than a phone's screen, so its parts can
 * appear one by one as they are scrolled to instead of all at once when
 * the section first appears (the sections' CSS decides which screen sizes
 * use it). Watching starts once the section has revealed (its data-reveal
 * turns "in"), plus `after` ms, so an item already on screen still follows
 * whatever the section plays first. With reduced motion every item counts
 * as seen as soon as the section reveals.
 *
 * @param {React.RefObject<HTMLElement>} rootRef An element inside the section, holding the items.
 * @param {string} selector The items, in page order.
 * @param {{ after?: number }} [options]
 * @returns {Set<number>} The indexes of the items seen so far.
 */
export function useSeenOnScroll(rootRef, selector, { after = 0 } = {}) {
  const reduced = useReducedMotion()
  const [seen, setSeen] = useState(() => new Set())

  useEffect(() => {
    const section = rootRef.current?.closest('section') // its data-reveal arrives just after hydration
    const items = [...(rootRef.current?.querySelectorAll(selector) ?? [])]
    if (!section || items.length === 0) return undefined

    let timer = 0
    let observer = null
    const markAll = () => setSeen(new Set(items.map((_, index) => index)))
    const watch = () => {
      observer = new IntersectionObserver(
        (entries) => {
          const newlySeen = entries.filter((entry) => entry.isIntersecting).map((entry) => items.indexOf(entry.target))
          if (newlySeen.length === 0) return
          setSeen((before) => new Set([...before, ...newlySeen]))
          entries.forEach((entry) => entry.isIntersecting && observer.unobserve(entry.target))
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.1 }, // as soon as an item starts coming into view
      )
      items.forEach((item) => observer.observe(item))
    }
    const start = () => {
      if (reduced) markAll()
      else timer = window.setTimeout(watch, after)
    }

    // Wait for the section's reveal (it may already have happened).
    const revealWatcher = new MutationObserver(() => {
      if (section.dataset.reveal !== 'in') return
      revealWatcher.disconnect()
      start()
    })
    if (section.dataset.reveal === 'in') start()
    else revealWatcher.observe(section, { attributes: true, attributeFilter: ['data-reveal'] })

    return () => {
      revealWatcher.disconnect()
      window.clearTimeout(timer)
      observer?.disconnect()
    }
  }, [rootRef, selector, after, reduced])

  return seen
}
