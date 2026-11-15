import { useCallback, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useHoverCursor } from '../../../hooks/useHoverCursor'
import { useSceneEvent } from '../../../hooks/useSceneEvent'
import { useTimedValue } from '../../../hooks/useTimedValue'
import { playSqueak } from '../../../utils/squeak'
import { INTRO } from '../../characters/greeting'
import { palette } from '../materials'
import { SpeechBubble } from '../SpeechBubble'

const BUBBLE_MS = 2600
const HOP_SECONDS = 0.7

/**
 * Rubber duck debugging easter egg.
 *
 * On load it gives one silent little hop and says `introQuote`, which
 * stays up until Samantha turns back to her desk. After that, clicking
 * it squeaks, hops, and shows one of `quotes` in turn.
 */
export function RubberDuck({ position, quotes, introQuote, introStarted, animate = true }) {
  const bodyRef = useRef(null)
  const hopStart = useRef(-1)
  const nextQuote = useRef(0)
  const introPlayed = useRef(false)
  const [bubble, setBubble] = useTimedValue(BUBBLE_MS)
  const hover = useHoverCursor()

  const hopAndSay = useCallback(
    (text, durationMs) => {
      hopStart.current = performance.now()
      setBubble({ text, durationMs })
    },
    [setBubble],
  )

  // Intro: timed to appear with Samantha's wave and leave when she turns away.
  useEffect(() => {
    if (!introStarted || introPlayed.current) return undefined
    const id = window.setTimeout(() => {
      introPlayed.current = true
      hopAndSay(introQuote, INTRO.waveEnd * 1000)
    }, INTRO.delay * 1000)
    return () => window.clearTimeout(id)
  }, [introStarted, introQuote, hopAndSay])

  const squeak = useCallback(() => {
    playSqueak()
    hopAndSay(quotes[nextQuote.current % quotes.length])
    nextQuote.current += 1
  }, [quotes, hopAndSay])
  useSceneEvent('duck:squeak', squeak)

  useFrame(() => {
    const body = bodyRef.current
    if (!body) return

    const t = hopStart.current < 0 ? -1 : (performance.now() - hopStart.current) / 1000
    if (!animate || t < 0 || t > HOP_SECONDS) {
      hopStart.current = -1
      body.position.y = 0
      body.scale.set(1, 1, 1)
      return
    }
    // A hop with a little squash as it takes off.
    const hop = Math.max(0, Math.sin((t / HOP_SECONDS) * Math.PI)) * 0.12
    const squash = t < 0.08 ? 1 - (0.08 - t) * 3 : 1
    body.position.y = hop
    body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash))
  })

  return (
    <group position={position}>
      <group
        ref={bodyRef}
        {...hover}
        onClick={(event) => {
          event.stopPropagation()
          squeak()
        }}
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

      {bubble && <SpeechBubble position={[0, 0.32, 0]}>{bubble.text}</SpeechBubble>}
    </group>
  )
}
