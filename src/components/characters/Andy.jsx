import { useCallback, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { useTimedValue } from '../../hooks/useTimedValue'
import { andyPalette as colors } from '../three/materials'
import { SpeechBubble } from '../three/SpeechBubble'

const SCALE = 1.3
const HOP_SECONDS = 0.95
const HOP_HEIGHT = 0.16
const TILT_EVERY = 6 // seconds between idle head tilts
const TILT_LENGTH = 1.8
const EAR_REST = 0.16

/* A tuft of fur: a unit sphere stretched into shape with `scale`. */
function Fur({ color, ...meshProps }) {
  return (
    <mesh {...meshProps}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

function Eye({ side }) {
  return (
    <group position={[side * 0.06, 0.018, 0.128]}>
      <mesh>
        <sphereGeometry args={[0.026, 12, 10]} />
        <meshStandardMaterial color={colors.eye} roughness={0.2} />
      </mesh>
      <mesh position={[0.008, 0.01, 0.022]}>
        <sphereGeometry args={[0.007, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

/**
 * Andy: a chibi Shih Tzu sitting beside the chair.
 *
 * Face: wide and fluffy, with a tan crown, a band of darker fur around
 * the eyes and muzzle, a short flat muzzle, small black nose, pink tongue
 * and dark floppy ears. Body: warm brown with a white chest and paws.
 * Cheeks and chest are a few overlapping rounded tufts.
 *
 * Idle: wags his tail, pants, and tilts his head now and then.
 * Clicked: two happy hops with a faster wag, flapping ears and a "Woof!".
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
    headRef.current.rotation.z = excited ? 0 : tilt * 0.3 * motion
    headRef.current.rotation.x = excited ? -0.15 * hopPhase * motion : 0

    // Panting
    tongueRef.current.scale.y = 0.3 * (1 + Math.sin(t * 7) * 0.2 * motion)

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
        <Fur color={colors.body} position={[0, 0.15, 0]} scale={[0.135, 0.15, 0.135]} castShadow={shadows} />

        {/* White chest: three overlapping tufts */}
        <Fur color={colors.white} position={[0, 0.16, 0.088]} scale={[0.08, 0.095, 0.056]} />
        <Fur color={colors.white} position={[-0.036, 0.215, 0.096]} scale={[0.052, 0.05, 0.04]} />
        <Fur color={colors.white} position={[0.036, 0.215, 0.096]} scale={[0.052, 0.05, 0.04]} />

        {/* Haunches, front legs and white paws */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Fur color={colors.body} position={[side * 0.105, 0.065, 0]} scale={[0.066, 0.07, 0.088]} castShadow={shadows} />
            <Fur color={colors.white} position={[side * 0.115, 0.022, 0.092]} scale={[0.037, 0.024, 0.05]} />
            <Fur color={colors.tan} position={[side * 0.054, 0.08, 0.108]} scale={[0.032, 0.07, 0.034]} />
            <Fur color={colors.white} position={[side * 0.054, 0.024, 0.134]} scale={[0.037, 0.026, 0.045]} />
          </group>
        ))}

        {/* Fluffy tail curled up over his back */}
        <group ref={tailRef} position={[0.07, 0.2, -0.12]}>
          <Fur color={colors.body} position={[0, 0.045, -0.02]} scale={[0.045, 0.055, 0.045]} />
          <Fur color={colors.tan} position={[0.03, 0.12, -0.01]} scale={[0.055, 0.058, 0.055]} />
          <Fur color={colors.tan} position={[0.075, 0.175, 0.03]} scale={[0.05, 0.048, 0.052]} />
        </group>

        <group ref={headRef} position={[0, 0.375, 0.05]}>
          {/* Wide head with a lighter tan crown */}
          <Fur color={colors.tan} scale={[0.158, 0.135, 0.135]} castShadow={shadows} />
          <Fur color={colors.crown} position={[0, 0.07, 0.005]} scale={[0.134, 0.068, 0.116]} />

          {/* Fluffy cheek tufts that widen the face */}
          <Fur color={colors.tan} position={[-0.122, -0.055, 0.04]} scale={[0.078, 0.075, 0.07]} />
          <Fur color={colors.tan} position={[0.122, -0.055, 0.04]} scale={[0.078, 0.075, 0.07]} />

          {/* Darker fur around the eyes and over the muzzle */}
          <Fur color={colors.mask} position={[0, 0.008, 0.09]} scale={[0.102, 0.05, 0.046]} />
          <Fur color={colors.mask} position={[-0.05, -0.052, 0.108]} scale={[0.05, 0.044, 0.042]} />
          <Fur color={colors.mask} position={[0.05, -0.052, 0.108]} scale={[0.05, 0.044, 0.042]} />
          {/* Short, flat muzzle */}
          <Fur color={colors.muzzle} position={[0, -0.036, 0.124]} scale={[0.058, 0.04, 0.04]} />

          <mesh position={[0, -0.02, 0.164]} scale={[1.25, 0.9, 0.8]}>
            <sphereGeometry args={[0.019, 12, 10]} />
            <meshStandardMaterial color={colors.nose} roughness={0.3} />
          </mesh>
          <mesh ref={tongueRef} position={[0, -0.075, 0.15]} scale={[0.55, 0.3, 0.6]}>
            <sphereGeometry args={[0.038, 12, 10]} />
            <meshStandardMaterial color={colors.tongue} roughness={0.5} />
          </mesh>
          {/* Little white tuft under the chin */}
          <Fur color={colors.white} position={[0, -0.108, 0.098]} scale={[0.042, 0.04, 0.036]} />

          <Eye side={-1} />
          <Eye side={1} />

          {/* Dark floppy ears */}
          <group ref={leftEarRef} position={[0.135, 0.045, -0.01]} rotation={[0, 0, EAR_REST]}>
            <Fur color={colors.ear} position={[0.028, -0.1, 0]} scale={[0.05, 0.122, 0.082]} castShadow={shadows} />
          </group>
          <group ref={rightEarRef} position={[-0.135, 0.045, -0.01]} rotation={[0, 0, -EAR_REST]}>
            <Fur color={colors.ear} position={[-0.028, -0.1, 0]} scale={[0.05, 0.122, 0.082]} castShadow={shadows} />
          </group>
        </group>
      </group>

      {bubble && <SpeechBubble position={[0, 0.84, 0]}>{bubble.text}</SpeechBubble>}
    </group>
  )
}
