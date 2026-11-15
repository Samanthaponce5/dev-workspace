import { Html } from '@react-three/drei'
import styles from './SpeechBubble.module.css'

/**
 * A small DOM speech bubble anchored to a point in the 3D scene.
 * It is real text, so screen readers announce it when it appears.
 */
export function SpeechBubble({ position, children }) {
  return (
    <Html position={position} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className={styles.bubble} role="status">
        {children}
      </div>
    </Html>
  )
}
