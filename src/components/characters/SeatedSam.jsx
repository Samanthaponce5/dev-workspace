import { useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { useTimedValue } from '../../hooks/useTimedValue'
import { Chair } from '../three/Chair'
import { SpeechBubble } from '../three/SpeechBubble'
import { MiniSam } from './MiniSam'

const { smoothstep } = THREE.MathUtils

/* Greeting timeline, in seconds from the click. */
const SPIN_END = 1.25 // chair has spun round to face the visitor
const WAVE_END = 3.1 // done waving
const RETURN_END = 4.0 // back at the keyboard

const easeOutCubic = (x) => 1 - (1 - x) ** 3
const easeInOutQuad = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)

/**
 * Mini-Samantha in her chair. She types until hovered or clicked, then
 * spins the chair a full turn, stops facing the visitor, waves, and
 * swivels back to work.
 *
 * `facingAngle` is the camera's angle around the desk, used to work out
 * how far the chair must turn to face the visitor.
 */
export function SeatedSam({ position, facingAngle, animate = true, shadows }) {
  const swivelRef = useRef(null)
  const poseRef = useRef({ typing: 1, wave: 0, bounce: 0 })
  const greetStart = useRef(-1)
  const bubbleShown = useRef(false)
  const [bubble, setBubble] = useTimedValue((WAVE_END - SPIN_END) * 1000)
  const hover = useHoverCursor()

  const greet = useCallback(() => {
    if (greetStart.current >= 0) return // already mid-greeting
    greetStart.current = performance.now()
    bubbleShown.current = false
  }, [])
  useSceneEvent('sam:greet', greet)

  useFrame(() => {
    const swivel = swivelRef.current
    const pose = poseRef.current
    if (!swivel) return

    if (greetStart.current < 0) {
      swivel.rotation.y = 0
      pose.typing = 1
      pose.wave = 0
      pose.bounce = 0
      return
    }

    const t = (performance.now() - greetStart.current) / 1000
    // The chair starts facing the desk. Half a turn plus the camera's angle
    // faces the visitor; one extra full turn makes it a proper spin.
    const faceVisitor = Math.PI + facingAngle + (animate ? Math.PI * 2 : 0)
    const backToDesk = animate ? Math.PI * 4 : Math.PI * 2

    if (t < SPIN_END) {
      const progress = animate ? easeOutCubic(t / SPIN_END) : 1
      swivel.rotation.y = progress * faceVisitor
      pose.typing = 1 - smoothstep(t, 0, 0.25)
      pose.wave = smoothstep(t, SPIN_END - 0.45, SPIN_END)
      pose.bounce = 0
    } else if (t < WAVE_END) {
      swivel.rotation.y = faceVisitor
      pose.typing = 0
      pose.wave = 1
      // One small happy hop in the seat as the wave starts.
      const hop = (t - SPIN_END) / 0.45
      pose.bounce = animate && hop < 1 ? Math.sin(hop * Math.PI) * 0.035 : 0
      if (!bubbleShown.current) {
        bubbleShown.current = true
        setBubble({ text: sceneContent.samGreeting })
      }
    } else if (t < RETURN_END) {
      const progress = easeInOutQuad((t - WAVE_END) / (RETURN_END - WAVE_END))
      swivel.rotation.y = animate ? faceVisitor + progress * (backToDesk - faceVisitor) : 0
      pose.wave = 1 - smoothstep(progress, 0, 0.4)
      pose.typing = smoothstep(progress, 0.6, 1)
      pose.bounce = 0
    } else {
      greetStart.current = -1
    }
  })

  return (
    <group position={position}>
      <group
        {...hover}
        onPointerOver={(event) => {
          hover.onPointerOver(event)
          greet()
        }}
        onClick={(event) => {
          event.stopPropagation()
          greet()
        }}
      >
        {/* The chair faces the desk (-Z). */}
        <Chair rotation={[0, Math.PI, 0]} swivelRef={swivelRef} shadows={shadows}>
          <MiniSam poseRef={poseRef} animate={animate} shadows={shadows} />
        </Chair>
      </group>

      {bubble && <SpeechBubble position={[0, 1.98, 0]}>{bubble.text}</SpeechBubble>}
    </group>
  )
}
