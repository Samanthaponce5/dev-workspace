import { useEffect, useRef, useState } from 'react'

/**
 * Reports whether an element is inside the viewport.
 *
 * @param {object} options
 * @param {boolean} [options.once=false] Stop observing after the first entry.
 * @param {string} [options.rootMargin='0px'] IntersectionObserver rootMargin.
 * @param {number} [options.threshold=0] IntersectionObserver threshold.
 * @returns {[React.RefObject, boolean]} A ref to attach, and the in-view flag.
 */
export function useInView({ once = false, rootMargin = '0px', threshold = 0 } = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting)
        if (entry.isIntersecting && once) observer.disconnect()
      },
      { rootMargin, threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once, rootMargin, threshold])

  return [ref, inView]
}
