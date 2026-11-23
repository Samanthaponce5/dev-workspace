import { useEffect, useState } from 'react'
import { layoutFlow } from './flowLayout'

/* Where `element`'s circle is inside `ancestor`, ignoring transforms (so a fade-up in progress doesn't skew it). */
function circleIn(element, ancestor) {
  let x = element.offsetWidth / 2
  let y = element.offsetHeight / 2
  for (let node = element; node && node !== ancestor; node = node.offsetParent) {
    x += node.offsetLeft
    y += node.offsetTop
  }
  return { x, y, r: element.offsetWidth / 2 }
}

/**
 * Measures the diagram's circles and returns its lines (see flowLayout.js),
 * relative to `flowRef`'s element. Measures again whenever the section
 * changes size: a new screen width, larger text, fonts arriving.
 */
export function useFlowLines(flowRef, sourceRef, nodeRefs) {
  const [lines, setLines] = useState(null)

  useEffect(() => {
    const flow = flowRef.current
    const source = sourceRef.current
    const section = flow?.closest('section')
    if (!flow || !source || !section) return undefined

    const measure = () => {
      const origin = circleIn(flow, section)
      const shift = (circle) => ({ ...circle, x: circle.x - origin.x + flow.offsetWidth / 2, y: circle.y - origin.y + flow.offsetHeight / 2 })
      const from = shift(circleIn(source, section))
      const to = nodeRefs.current.filter(Boolean).map((node) => shift(circleIn(node, section)))
      setLines(layoutFlow(from, to))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(section)
    observer.observe(flow)
    return () => observer.disconnect()
  }, [flowRef, sourceRef, nodeRefs])

  return lines
}
