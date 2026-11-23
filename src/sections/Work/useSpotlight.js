import { useCallback, useRef, useState } from 'react'

/**
 * Which branch of the diagram is picked out, if any: the one under the
 * mouse, the one with keyboard focus, or the one last tapped (tap it again,
 * or anywhere else, to let it go). Returns the picked id and the event
 * handlers for a branch.
 */
export function useSpotlight() {
  const [active, setActive] = useState(null)
  const press = useRef({ type: 'mouse', wasActive: false })

  const handlersFor = useCallback(
    (id) => ({
      onPointerDown: (event) => {
        press.current = { type: event.pointerType, wasActive: active === id }
      },
      onPointerEnter: (event) => {
        if (event.pointerType === 'mouse') setActive(id)
      },
      onPointerLeave: (event) => {
        if (event.pointerType === 'mouse') setActive((current) => (current === id ? null : current))
      },
      onFocus: () => setActive(id),
      onBlur: () => setActive((current) => (current === id ? null : current)),
      onClick: () => {
        if (press.current.type !== 'mouse') setActive(press.current.wasActive ? null : id)
      },
    }),
    [active],
  )

  return { active, handlersFor }
}
