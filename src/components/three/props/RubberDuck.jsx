import { useCallback, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useHoverCursor } from '../../../hooks/useHoverCursor'
import { useSceneEvent } from '../../../hooks/useSceneEvent'
import { useTimedValue } from '../../../hooks/useTimedValue'
import { isIntroDone, onIntroDone } from '../../../utils/intro'
import { registerSceneDuck } from '../../../utils/sceneBridge'
import { playSqueak } from '../../../utils/squeak'
import { palette } from '../materials'
import { SpeechBubble } from '../SpeechBubble'

const BUBBLE_MS = 2600
const INTRO_BUBBLE_MS = 3000
const HOP_SECONDS = 0.7
const TAP_RADIUS = 0.2 // in scene units; roughly a fingertip on a phone
const corner = new THREE.Vector3()

/*
 * The duck's outline on screen, in viewport pixels: every vertex of its
 * visible parts is projected through the camera and the extremes kept.
 */
function screenRect(body, camera, canvas) {
  const bounds = canvas.getBoundingClientRect()
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity

  body.updateWorldMatrix(true, true)
  body.traverse((part) => {
    if (!part.isMesh || part.userData.tapTarget) return
    const positions = part.geometry.attributes.position
    for (let index = 0; index < positions.count; index += 1) {
      corner.fromBufferAttribute(positions, index).applyMatrix4(part.matrixWorld).project(camera)
      const x = bounds.left + (corner.x * 0.5 + 0.5) * bounds.width
      const y = bounds.top + (-corner.y * 0.5 + 0.5) * bounds.height
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  })
  return Number.isFinite(left) ? { left, top, width: right - left, height: bottom - top } : null
}

/**
 * Rubber duck debugging easter egg.
 *
 * Once per page load, when Samantha has finished her greeting and turned
 * back to her desk, it gives a silent little hop and says `introQuote`
 * for a few seconds. Clicking it at any time squeaks, hops, and shows one
 * of `quotes` in turn; every click shows the bubble afresh and restarts
 * its timer, even if a bubble is already up.
 */
export function RubberDuck({ position, quotes, introQuote, animate = true }) {
  const groupRef = useRef(null)
  const bodyRef = useRef(null)
  const hopStart = useRef(-1)
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const invalidate = useThree((state) => state.invalidate)

  // During the intro the duck is hidden: the intro's own duck hops across
  // the page and lands here, and the two are swapped at that instant.
  useEffect(() => {
    const group = groupRef.current
    const show = () => {
      group.visible = true
      invalidate()
    }
    group.visible = isIntroDone()
    const unregister = registerSceneDuck({ getRect: () => screenRect(bodyRef.current, camera, gl.domElement), show })
    const unsubscribe = onIntroDone(show)
    return () => {
      unregister()
      unsubscribe()
    }
  }, [camera, gl, invalidate])
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

  const sayIntro = useCallback(() => {
    if (introPlayed.current) return
    introPlayed.current = true
    hopAndSay(introQuote, INTRO_BUBBLE_MS)
  }, [introQuote, hopAndSay])
  useSceneEvent('intro:finished', sayIntro)

  const squeak = useCallback(() => {
    playSqueak()
    hopAndSay(quotes[nextQuote.current % quotes.length], BUBBLE_MS)
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
    <group ref={groupRef} position={position} name="rubber-duck">
      <group
        ref={bodyRef}
        {...hover}
        onClick={(event) => {
          event.stopPropagation()
          squeak()
        }}
      >
        {/* Invisible, generous tap target: the duck itself is only a few pixels wide on a phone. */}
        <mesh position={[0, 0.08, 0]} userData={{ tapTarget: true }}>
          <sphereGeometry args={[TAP_RADIUS, 12, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
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

      {bubble && (
        <SpeechBubble position={[0, 0.32, 0]} durationMs={bubble.durationMs} restartKey={bubble.id}>
          {bubble.text}
        </SpeechBubble>
      )}
    </group>
  )
}
