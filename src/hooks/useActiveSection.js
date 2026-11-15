import { useEffect, useState } from 'react'

/**
 * Tells which of the given sections is currently being read.
 *
 * A section counts as active while it crosses a thin band a little above
 * the middle of the viewport. Returns its id, or null when none of them
 * is there (at the top of the page, in the hero).
 *
 * @param {string[]} ids Element ids to watch, in page order. Keep the array stable.
 */
export function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (sections.length === 0) return undefined

    const inBand = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? inBand.add(entry.target.id) : inBand.delete(entry.target.id)))
        // If two sections touch the band at once, the earlier one on the page wins.
        setActiveId(ids.find((id) => inBand.has(id)) ?? null)
      },
      { rootMargin: '-42% 0px -56% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}
