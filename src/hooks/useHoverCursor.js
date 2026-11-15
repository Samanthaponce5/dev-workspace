import { useEffect, useMemo, useState } from 'react'

/**
 * Shows a pointer cursor while a 3D object is hovered. Spread the returned
 * handlers onto the mesh or group that should feel clickable.
 */
export function useHoverCursor() {
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (!hovered) return undefined
    document.body.style.cursor = 'pointer'
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  return useMemo(
    () => ({
      onPointerOver: (event) => {
        event.stopPropagation()
        setHovered(true)
      },
      onPointerOut: () => setHovered(false),
    }),
    [],
  )
}
