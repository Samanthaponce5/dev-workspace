import { useEffect, useState } from 'react'

const round = (value) => Math.round(value * 1000) / 1000

/**
 * Measures where `targetRef` sits inside `containerRef`, as fractions of
 * the container's size: { x, y, width, height }, each between 0 and 1.
 * Also reports the container's own size in pixels (containerWidth and
 * containerHeight). Updates whenever either element resizes. Returns
 * null until measured.
 */
export function useRelativeFrame(containerRef, targetRef) {
  const [frame, setFrame] = useState(null)

  useEffect(() => {
    const container = containerRef.current
    const target = targetRef.current
    if (!container || !target) return undefined

    const measure = () => {
      const outer = container.getBoundingClientRect()
      const inner = target.getBoundingClientRect()
      if (!outer.width || !outer.height) return

      const next = {
        x: round((inner.left - outer.left) / outer.width),
        y: round((inner.top - outer.top) / outer.height),
        width: round(inner.width / outer.width),
        height: round(inner.height / outer.height),
        containerWidth: Math.round(outer.width),
        containerHeight: Math.round(outer.height),
      }
      setFrame((previous) =>
        previous &&
        previous.x === next.x &&
        previous.y === next.y &&
        previous.width === next.width &&
        previous.height === next.height &&
        previous.containerWidth === next.containerWidth &&
        previous.containerHeight === next.containerHeight
          ? previous
          : next,
      )
    }

    // ResizeObserver also fires once on observe, giving the first measurement.
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(target)
    return () => observer.disconnect()
  }, [containerRef, targetRef])

  return frame
}
