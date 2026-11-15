import { useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { useTimedValue } from '../../hooks/useTimedValue'
import { andyPalette as colors } from '../three/materials'
import { SpeechBubble } from '../three/SpeechBubble'

const SCALE = 1.2
const HOP_SECONDS = 0.95
const HOP_HEIGHT = 0.16
const TILT_EVERY = 6 // seconds between idle head tilts
const TILT_LENGTH = 1.8
const EAR_REST = 0.22

function Fur({ color, ...meshProps }) {
  return (
    <mesh {...meshProps}>
      <sphereGeometry args={[1, 14, 12]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

/**
 * Andy: a chibi Shih Tzu sitting beside the chair. Shaggy brown coat with
 * golden and grey tones, darker floppy ears, white chin tuft, chest and
 * paws, tongue out, fluffy tail curled over his back.
 *
 * Idle: wags his tail, pants, and tilts his head now and then.
 * Clicked: two happy hops with a faster wag and flapping ears.
 * Every `Fur` piece is a unit sphere scaled into shape.
 */
export function Andy({ position, facingAngle = 0, animate = true, shadows }) {
  const rootRef = useRef(null)
  const headRef = useRef(null)
  const tailRef = useRef(null)
  const tongueRef = useRef(null)
  const leftEarRef = useRef(null)
  const rightEarRef = useRef(null)
  const hopStart = useRef(-1)
  const [bubble, setBubble] = useTimedValue(1400)
  const hover = useHoverCursor()

  const hop = useCallback(() => {
    hopStart.current = performance.now()
    setBubble({ text: sceneContent.andyBark })
  }, [setBubble])
  useSceneEvent('andy:hop', hop)

  useFrame(({ clock }) => {
    if (!rootRef.current) return
    const t = animate ? clock.elapsedTime : 0
    const motion = animate ? 1 : 0

    let hopT = hopStart.current < 0 ? -1 : (performance.now() - hopStart.current) / 1000
    if (hopT > HOP_SECONDS) {
      hopStart.current = -1
      hopT = -1
    }
    const excited = hopT >= 0

    // Two hops across the duration.
    const hopPhase = excited ? Math.abs(Math.sin((hopT / HOP_SECONDS) * Math.PI * 2)) : 0
    rootRef.current.position.y = hopPhase * HOP_HEIGHT * motion

    tailRef.current.rotation.z = Math.sin(t * (excited ? 20 : 9)) * (excited ? 0.7 : 0.42) * motion

    // Idle head tilt: eases over to one side and back.
    const cycle = t % TILT_EVERY
    const tilt = cycle < TILT_LENGTH ? Math.sin((cycle / TILT_LENGTH) * Math.PI) : 0
    headRef.current.rotation.z = excited ? 0 : tilt * 0.34 * motion
    headRef.current.rotation.x = excited ? -0.15 * hopPhase * motion : 0

    // Panting
    tongueRef.current.scale.y = 0.26 * (1 + Math.sin(t * 7) * 0.2 * motion)

    const flap = hopPhase * 0.5 * motion
    leftEarRef.current.rotation.z = EAR_REST + flap
    rightEarRef.current.rotation.z = -EAR_REST - flap
  })

  return (
    <group position={position} rotation={[0, facingAngle, 0]}>
      <group
        ref={rootRef}
        scale={SCALE}
        {...hover}
        onClick={(event) => {
          event.stopPropagation()
          hop()
        }}
      >
        {/* Body, sitting upright */}
        <Fur color={colors.coat} position={[0, 0.15, 0]} scale={[0.13, 0.15, 0.135]} castShadow={shadows} />
        <Fur color={colors.grey} position={[0, 0.17, -0.055]} scale={[0.11, 0.12, 0.09]} />
        {/* White chest patch */}
        <Fur color={colors.white} position={[0, 0.165, 0.085]} scale={[0.075, 0.09, 0.055]} />

        {/* Haunches and paws */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Fur color={colors.coat} position={[side * 0.1, 0.065, 0.0]} scale={[0.065, 0.07, 0.085]} castShadow={shadows} />
            <Fur color={colors.white} position={[side * 0.11, 0.022, 0.09]} scale={[0.036, 0.024, 0.048]} />
            <Fur color={colors.gold} position={[side * 0.052, 0.08, 0.105]} scale={[0.032, 0.07, 0.034]} />
            <Fur color={colors.white} position={[side * 0.052, 0.024, 0.13]} scale={[0.036, 0.026, 0.044]} />
          </group>
        ))}

        {/* Fluffy tail curled up over his back */}
        <group ref={tailRef} position={[0.07, 0.2, -0.12]}>
          <Fur color={colors.coat} position={[0, 0.045, -0.02]} scale={[0.045, 0.055, 0.045]} />
          <Fur color={colors.gold} position={[0.03, 0.12, -0.01]} scale={[0.055, 0.058, 0.055]} />
          <Fur color={colors.gold} position={[0.075, 0.175, 0.03]} scale={[0.05, 0.048, 0.052]} />
        </group>

        <group ref={headRef} position={[0, 0.37, 0.045]}>
          <Fur color={colors.gold} scale={[0.145, 0.135, 0.135]} castShadow={shadows} />
          {/* Shaggy crown: darker at the back, a soft grey-gold fringe in front */}
          <Fur color={colors.coat} position={[0, 0.06, -0.06]} scale={[0.12, 0.09, 0.09]} />
          <Fur color={colors.grey} position={[-0.04, 0.105, 0.04]} scale={[0.05, 0.035, 0.05]} />
          <Fur color={colors.grey} position={[0.04, 0.105, 0.04]} scale={[0.05, 0.035, 0.05]} />
          <Fur color={colors.gold} position={[0, 0.115, 0.01]} scale={[0.045, 0.035, 0.05]} />

          {/* Floppy darker ears */}
          <group ref={leftEarRef} position={[0.125, 0.04, -0.01]} rotation={[0, 0, EAR_REST]}>
            <Fur color={colors.ear} position={[0.02, -0.09, 0]} scale={[0.045, 0.11, 0.075]} castShadow={shadows} />
          </group>
          <group ref={rightEarRef} position={[-0.125, 0.04, -0.01]} rotation={[0, 0, -EAR_REST]}>
            <Fur color={colors.ear} position={[-0.02, -0.09, 0]} scale={[0.045, 0.11, 0.075]} castShadow={shadows} />
          </group>

          {/* Muzzle, button nose, tongue and white beard */}
          <Fur color={colors.gold} position={[0, -0.03, 0.105]} scale={[0.085, 0.058, 0.06]} />
          <mesh position={[0, -0.005, 0.163]} scale={[1.25, 0.9, 0.8]}>
            <sphereGeometry args={[0.021, 12, 10]} />
            <meshStandardMaterial color={colors.nose} roughness={0.3} />
          </mesh>
          <mesh ref={tongueRef} position={[0, -0.066, 0.15]} scale={[0.55, 0.26, 0.6]}>
            <sphereGeometry args={[0.04, 12, 10]} />
            <meshStandardMaterial color={colors.tongue} roughness={0.5} />
          </mesh>
          <Fur color={colors.white} position={[0, -0.1, 0.105]} scale={[0.05, 0.055, 0.042]} />

          {/* Big dark round eyes */}
          {[-1, 1].map((side) => (
            <group key={side}>
              <mesh position={[side * 0.058, 0.03, 0.118]}>
                <sphereGeometry args={[0.027, 12, 10]} />
                <meshStandardMaterial color={colors.eye} roughness={0.2} />
              </mesh>
              <mesh position={[side * 0.058 + 0.008, 0.04, 0.141]}>
                <sphereGeometry args={[0.007, 8, 6]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {bubble && <SpeechBubble position={[0, 0.82, 0]}>{bubble.text}</SpeechBubble>}
    </group>
  )
}
