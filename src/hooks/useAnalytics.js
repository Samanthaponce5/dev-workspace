import { useEffect, useRef } from 'react'
import { nav } from '../content/content'
import { startAnalytics, track, trackClicks } from '../utils/analytics'

/* Sections by the names visitors see in the menu (the Work section is "Skills"). */
const SECTION_NAMES = Object.fromEntries(nav.map((item) => [item.id, item.label.toLowerCase()]))

/**
 * Google Analytics for the page (see utils/analytics.js): starts it once,
 * sends the events written on links when they are followed, and a
 * reached_<section> event the first time each section is reached. Until analytics has
 * decided whether it may run, events wait; if it may not, they are dropped.
 *
 * @param {string | null} activeId The section being read (null in the hero).
 */
export function useAnalytics(activeId) {
  const seen = useRef(new Set())

  useEffect(() => {
    startAnalytics()
    return trackClicks()
  }, [])

  useEffect(() => {
    if (!activeId || seen.current.has(activeId)) return
    seen.current.add(activeId)
    track(`reached_${SECTION_NAMES[activeId]}`)
  }, [activeId])
}
