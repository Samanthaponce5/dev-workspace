import { useEffect, useState } from 'react'

/**
 * Tells which of the given sections is currently being read.
 *
 * A section counts as active while it crosses a thin band a little above
 * the middle of the viewport, and the last one does once the page is
 * scrolled to the bottom (it may be too short to reach the band). Returns
 * its id, or null when none of them is there (at the top of the page, in
 * the hero).
 *
 * @param {string[]} ids Element ids to watch, in page order. Keep the array stable.
 */
export function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (sections.length === 0) return undefined

    const inBand = new Set()
    const atBottom = () => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    // If two sections touch the band at once, the earlier one on the page wins.
    const update = () => setActiveId(atBottom() ? ids[ids.length - 1] : (ids.find((id) => inBand.has(id)) ?? null))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? inBand.add(entry.target.id) : inBand.delete(entry.target.id)))
        update()
      },
      { rootMargin: '-42% 0px -56% 0px' },
    )
    sections.forEach((section) => observer.observe(section))

    // Reaching the bottom doesn't move any section across the band, so it is watched for separately.
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ids])

  return activeId
}
