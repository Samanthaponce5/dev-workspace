import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { useTimedValue } from '../../hooks/useTimedValue'
import { andyPalette as colors } from '../three/materials'
import { ANDY_FACE, ANDY_LEG, onAndyHead, paintAndyBody, paintAndyHead, paintAndyLeg, placeAndyBody, placeAndyEar, placeAndyHead, placeAndyLeg } from './andyShape'
import { createShapedSphere } from './geometry/shapedSphere'
import { SpeechBubble } from '../three/SpeechBubble'

const SCALE = 1.3
const HOP_SECONDS = 0.95
const HOP_HEIGHT = 0.16
const BARK_MS = 1400
const TILT_EVERY = 6 // seconds between idle head tilts
const TILT_LENGTH = 1.8
const EAR_REST = 0.17 // sweeping down and out from high on his head; hops flap them further
const HEAD_TILT = -0.2 // chin up a little, so he looks toward the visitor
const SOLE_HEIGHT = ANDY_LEG.sole * ANDY_LEG.height // a leg's centre sits this far above the floor

/* A tuft of fur: a unit sphere stretched into shape with `scale`. */
function Fur({ color, ...meshProps }) {
  return (
    <mesh {...meshProps}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

function Eye({ direction }) {
  return (
    <group position={onAndyHead(direction, 0.035)}>
      <mesh>
        <sphereGeometry args={[0.034, 20, 14]} />
        <meshStandardMaterial color={colors.eye} roughness={0.2} />
      </mesh>
      {/* One small catchlight */}
      <mesh position={[-0.011, 0.014, 0.027]}>
        <sphereGeometry args={[0.0082, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

/* A short centre line under the nose and a shallow closed-mouth curve. */
const MOUTH = { radius: 0.036, thickness: 0.003, arc: 1.2, line: 0.016 }

function Mouth() {
  return (
    <group position={onAndyHead(ANDY_FACE.mouth, 0.016)} rotation={[0.4, 0, 0]}>
      <mesh position={[0, MOUTH.line / 2, 0]}>
        <capsuleGeometry args={[MOUTH.thickness, MOUTH.line, 4, 8]} />
        <meshStandardMaterial color={colors.mouth} roughness={0.8} />
      </mesh>
      {/* The arc is the bottom of a circle whose lowest point is where the line ends. */}
      <mesh position={[0, MOUTH.radius, 0]} rotation={[0, 0, -Math.PI / 2 - MOUTH.arc / 2]}>
        <torusGeometry args={[MOUTH.radius, MOUTH.thickness, 8, 20, MOUTH.arc]} />
        <meshStandardMaterial color={colors.mouth} roughness={0.8} />
      </mesh>
    </group>
  )
}

/* Builds Andy's shaped meshes once, and frees them when he unmounts. */
function useAndyParts() {
  const parts = useMemo(() => {
    const fur = (options) => new THREE.MeshStandardMaterial({ roughness: 0.92, ...options })
    return {
      head: createShapedSphere({ place: (direction, target) => placeAndyHead(direction, target), paint: paintAndyHead, widthSegments: 96, heightSegments: 64 }),
      body: createShapedSphere({ place: placeAndyBody, paint: paintAndyBody, widthSegments: 48, heightSegments: 36 }),
      leg: createShapedSphere({ place: placeAndyLeg, paint: paintAndyLeg, widthSegments: 48, heightSegments: 36 }),
      ear: createShapedSphere({ place: placeAndyEar, widthSegments: 24, heightSegments: 18 }),
      painted: fur({ vertexColors: true }),
      earFur: fur({ color: colors.ear }),
    }
  }, [])
  useEffect(() => () => Object.values(parts).forEach((part) => part.dispose()), [parts])
  return parts
}

/**
 * Andy's head: one broad shaped mesh. The forehead with its slight dip,
 * the full cheeks, raised brows and short two-sided muzzle are all
 * sculpted into that single surface, and the taupe-brown of his lower
 * face is painted onto it (see andyShape.js). On top sit his eyes, a
 * small nose with a soft shine, an understated closed mouth, and ears
 * that hang from high on the head to about jaw level.
 */
function AndyHead({ parts, leftEarRef, rightEarRef, shadows }) {
  return (
    <>
      <mesh geometry={parts.head} material={parts.painted} castShadow={shadows} />

      <Eye direction={ANDY_FACE.eyeLeft} />
      <Eye direction={ANDY_FACE.eyeRight} />

      <group position={onAndyHead(ANDY_FACE.nose, 0.03)}>
        <mesh scale={[1.35, 0.95, 0.8]}>
          <sphereGeometry args={[0.019, 16, 12]} />
          <meshStandardMaterial color={colors.nose} roughness={0.25} />
        </mesh>
        <mesh position={[-0.007, 0.008, 0.012]}>
          <sphereGeometry args={[0.0042, 8, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
      </group>
      <Mouth />

      <group ref={leftEarRef} position={[0.104, 0.102, -0.014]} rotation={[0, 0, EAR_REST]}>
        <mesh geometry={parts.ear} material={parts.earFur} position={[0.042, -0.12, 0]} castShadow={shadows} />
      </group>
      <group ref={rightEarRef} position={[-0.104, 0.102, -0.014]} rotation={[0, 0, -EAR_REST]}>
        <mesh geometry={parts.ear} material={parts.earFur} position={[-0.042, -0.12, 0]} castShadow={shadows} />
      </group>
    </>
  )
}

/**
 * Andy: a chibi Shih Tzu sitting beside the chair.
 *
 * Head: broad and honey tan, wider than his body, with full cheeks, a
 * short taupe-brown muzzle, dark eyes, a closed mouth and deep-brown
 * floppy ears (see AndyHead). Body: a compact pear shape sitting low over
 * rounded hind legs, with one cream bib painted on the chest. His front
 * legs are short and close together, each ending in a flat-soled paw
 * with a cream sock and toe grooves; the hind paws peek out behind them.
 *
 * Idle: wags his tail and tilts his head now and then.
 * Clicked: two happy hops with a faster wag, flapping ears and a "Woof!".
 */
export function Andy({ position, facingAngle = 0, animate = true, shadows }) {
  const rootRef = useRef(null)
  const headRef = useRef(null)
  const tailRef = useRef(null)
  const leftEarRef = useRef(null)
  const rightEarRef = useRef(null)
  const hopStart = useRef(-1)
  const parts = useAndyParts()
  const [bubble, setBubble] = useTimedValue(BARK_MS)
  const hover = useHoverCursor()

  const hop = useCallback(() => {
    hopStart.current = performance.now()
    setBubble({ text: sceneContent.andyBark, durationMs: BARK_MS })
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
    headRef.current.rotation.x = HEAD_TILT + (excited ? -0.15 * hopPhase * motion : 0)

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
        {/* Pear-shaped body with the bib painted on, sitting low */}
        <mesh geometry={parts.body} material={parts.painted} position={[0, 0.132, 0]} castShadow={shadows} />

        {[-1, 1].map((side) => (
          <group key={side}>
            {/* Rounded hind leg, with its paw peeking out behind the front leg */}
            <Fur color={colors.body} position={[side * 0.098, 0.064, -0.006]} scale={[0.07, 0.07, 0.09]} castShadow={shadows} />
            <mesh geometry={parts.leg} material={parts.painted} position={[side * 0.104, SOLE_HEIGHT * 0.62, 0.05]} rotation={[0, side * 0.35, 0]} scale={[0.86, 0.62, 0.9]} />
            {/* Short front leg and flat-soled paw, as one shape */}
            <mesh geometry={parts.leg} material={parts.painted} position={[side * 0.043, SOLE_HEIGHT, 0.09]} castShadow={shadows} />
          </group>
        ))}

        {/* Fluffy tail curled up over his back */}
        <group ref={tailRef} position={[0.02, 0.19, -0.13]}>
          <Fur color={colors.body} position={[0, 0.04, -0.02]} scale={[0.045, 0.052, 0.045]} />
          <Fur color={colors.tan} position={[0.012, 0.1, -0.025]} scale={[0.052, 0.054, 0.052]} />
          <Fur color={colors.tan} position={[0.03, 0.145, 0]} scale={[0.046, 0.044, 0.048]} />
        </group>

        <group ref={headRef} position={[0, 0.352, 0.05]}>
          <AndyHead parts={parts} leftEarRef={leftEarRef} rightEarRef={rightEarRef} shadows={shadows} />
        </group>
      </group>

      {bubble && (
        <SpeechBubble position={[0, 0.84, 0]} durationMs={bubble.durationMs} restartKey={bubble.id}>
          {bubble.text}
        </SpeechBubble>
      )}
    </group>
  )
}
