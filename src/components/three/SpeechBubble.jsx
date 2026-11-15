import { useCallback, useRef } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import styles from './SpeechBubble.module.css'

const { clamp } = THREE.MathUtils

const EDGE_GAP = 12 // px kept between the bubble and the canvas edges
const TOP_GAP = 76 // px kept clear at the top, so the header never covers it
const TAIL = 10 // px between the anchor point and the bubble's bottom edge
const projected = new THREE.Vector3()

/**
 * A small DOM speech bubble whose tail points at a spot in the 3D scene.
 * It is real text, so screen readers announce it when it appears.
 *
 * `position` is the point the tail touches. The bubble sits above it and
 * is nudged sideways or down when needed so it always stays fully on
 * screen; the tail slides to keep pointing at the anchor.
 *
 * To fade out instead of vanishing, either pass `durationMs` (how long
 * the bubble will be shown, for bubbles on a timer) or set `leaving` just
 * before removing it (for bubbles driven by an animation timeline).
 */
export function SpeechBubble({ position, durationMs, leaving = false, children }) {
  const bubbleRef = useRef(null)

  const calculatePosition = useCallback((object, camera, size) => {
    projected.setFromMatrixPosition(object.matrixWorld).project(camera)
    const anchorX = (projected.x * 0.5 + 0.5) * size.width
    const anchorY = (-projected.y * 0.5 + 0.5) * size.height

    const bubble = bubbleRef.current
    if (!bubble) return [anchorX, anchorY]

    const halfWidth = bubble.offsetWidth / 2
    const x = clamp(anchorX, halfWidth + EDGE_GAP, Math.max(halfWidth + EDGE_GAP, size.width - halfWidth - EDGE_GAP))
    const y = Math.max(anchorY, bubble.offsetHeight + TAIL + TOP_GAP)
    // Keep the tail under the anchor, within the bubble's rounded corners.
    const tailLimit = Math.max(0, halfWidth - 18)
    bubble.style.setProperty('--tail-shift', `${clamp(anchorX - x, -tailLimit, tailLimit)}px`)
    return [x, y]
  }, [])

  return (
    <Html position={position} calculatePosition={calculatePosition} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className={styles.anchor} style={{ '--tail': `${TAIL}px` }}>
        <div
          ref={bubbleRef}
          className={styles.bubble}
          role="status"
          data-timed={durationMs ? true : undefined}
          data-leaving={leaving || undefined}
          style={durationMs ? { '--life': `${durationMs}ms` } : undefined}
        >
          {children}
        </div>
      </div>
    </Html>
  )
}
