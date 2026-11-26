import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const TRUNK_DRAWN_MS = 600 // the section's own reveal: the code circle lights and the trunk draws (see Work.module.css)

/**
 * Which of the diagram's branches have scrolled into view, once each.
 *
 * On phones the three branches are stacked down the side, taller than the
 * screen, so each one draws out as it is scrolled to rather than all at
 * once when the section first appears (see the phone rules in
 * Work.module.css; wider screens show the whole diagram and ignore this).
 * Watching starts once the section has revealed and its trunk has drawn,
 * so a branch already on screen still follows the trunk. With reduced
 * motion, every branch counts as seen as soon as the section reveals.
 *
 * @param {React.RefObject<HTMLElement>} flowRef The diagram, inside its section.
 * @returns {Set<number>} The indexes of the branches seen so far.
 */
export function useBranchesSeen(flowRef) {
  const reduced = useReducedMotion()
  const [seen, setSeen] = useState(() => new Set())

  useEffect(() => {
    const section = flowRef.current?.closest('section') // its data-reveal arrives just after hydration
    const branches = [...(flowRef.current?.querySelectorAll('[data-branch]') ?? [])]
    if (!section || branches.length === 0) return undefined

    let timer = 0
    let observer = null
    const markAll = () => setSeen(new Set(branches.map((_, index) => index)))
    const watch = () => {
      observer = new IntersectionObserver(
        (entries) => {
          const newlySeen = entries.filter((entry) => entry.isIntersecting).map((entry) => branches.indexOf(entry.target))
          if (newlySeen.length === 0) return
          setSeen((before) => new Set([...before, ...newlySeen]))
          entries.forEach((entry) => entry.isIntersecting && observer.unobserve(entry.target))
        },
        { rootMargin: '0px 0px -6% 0px', threshold: 0.1 }, // as soon as a branch starts coming into view
      )
      branches.forEach((branch) => observer.observe(branch))
    }
    const start = () => {
      if (reduced) markAll()
      else timer = window.setTimeout(watch, TRUNK_DRAWN_MS)
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
  }, [flowRef, reduced])

  return seen
}
