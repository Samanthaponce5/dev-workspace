import { useCallback, useEffect, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { palette } from '../materials'
import { playSqueak } from '../../../utils/squeak'
import styles from './RubberDuck.module.css'

const BUBBLE_MS = 2600

/**
 * Rubber duck debugging easter egg. Clicking it squeaks, bounces, and
 * shows a short speech bubble with one of the quotes in turn.
 */
export function RubberDuck({ position, quotes, animate = true }) {
  const bodyRef = useRef(null)
  const bounceStart = useRef(-1)
  const [quoteIndex, setQuoteIndex] = useState(-1)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    if (quoteIndex < 0) return undefined
    const id = window.setTimeout(() => setQuoteIndex(-1), BUBBLE_MS)
    return () => window.clearTimeout(id)
  }, [quoteIndex])

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hovered])

  const squeak = useCallback(
    (event) => {
      event.stopPropagation()
      playSqueak()
      bounceStart.current = performance.now()
      setQuoteIndex((index) => (index + 1) % quotes.length)
    },
    [quotes.length],
  )

  useFrame(() => {
    const body = bodyRef.current
    if (!body) return
    if (!animate || bounceStart.current < 0) {
      body.position.y = 0
      body.scale.set(1, 1, 1)
      return
    }
    const t = (performance.now() - bounceStart.current) / 1000
    if (t > 0.7) {
      bounceStart.current = -1
      return
    }
    // A hop with a little squash on landing.
    const hop = Math.max(0, Math.sin(t * Math.PI * 1.43)) * 0.12
    const squash = t < 0.08 ? 1 - (0.08 - t) * 3 : 1
    body.position.y = hop
    body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash))
  })

  const quote = quoteIndex >= 0 ? quotes[quoteIndex] : null

  return (
    <group position={position}>
      <group
        ref={bodyRef}
        onClick={squeak}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Body */}
        <mesh position={[0, 0.05, 0]} scale={[1.1, 0.85, 1.35]}>
          <sphereGeometry args={[0.06, 16, 12]} />
          <meshStandardMaterial color={palette.duck} roughness={0.45} />
        </mesh>
        {/* Tail nub */}
        <mesh position={[0, 0.085, -0.08]} rotation={[0.6, 0, 0]} scale={[0.7, 0.5, 1]}>
          <sphereGeometry args={[0.035, 10, 8]} />
          <meshStandardMaterial color={palette.duck} roughness={0.45} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.125, 0.035]}>
          <sphereGeometry args={[0.048, 16, 12]} />
          <meshStandardMaterial color={palette.duck} roughness={0.45} />
        </mesh>
        {/* Beak */}
        <mesh position={[0, 0.115, 0.085]} scale={[1.2, 0.6, 1]}>
          <sphereGeometry args={[0.022, 10, 8]} />
          <meshStandardMaterial color={palette.duckBeak} roughness={0.5} />
        </mesh>
        {/* Eyes */}
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.025, 0.14, 0.068]}>
            <sphereGeometry args={[0.007, 8, 6]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
          </mesh>
        ))}
      </group>

      {quote && (
        <Html position={[0, 0.26, 0]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className={styles.bubble} role="status">
            {quote}
          </div>
        </Html>
      )}
    </group>
  )
}
