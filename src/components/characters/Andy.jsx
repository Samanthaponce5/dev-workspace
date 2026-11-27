import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { useTimedValue } from '../../hooks/useTimedValue'
import { andyPalette as colors } from '../three/materials'
import { ANDY_FACE, ANDY_LEG, onAndyHead, paintAndyBody, paintAndyLeg, placeAndyBody, placeAndyEar, placeAndyHead, placeAndyLeg } from './andyShape'
import { createShapedSphere } from './geometry/shapedSphere'
import { SpeechBubble } from '../three/SpeechBubble'
import { track } from '../../utils/analytics'

const SCALE = 1.3
const HOP_SECONDS = 0.95
const HOP_HEIGHT = 0.16
const BARK_MS = 1400
const TILT_EVERY = 6 // seconds between idle head tilts
const TILT_LENGTH = 1.8
const EAR_REST = 0.12 // hanging low and close beside his face; hops flap them outward
const HEAD_TILT = -0.2 // chin up a little, so he looks toward the visitor
const TONGUE_THICKNESS = 0.2
const EYE_RADIUS = 0.03
const EYE_SET = 0.02 // the eyes' centres sit just outside the hollows made for them
const CHEEK_LIFT = 0.36 // how far the outer end of each cheek tips up
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
    <group position={onAndyHead(direction, EYE_SET)}>
      <mesh>
        <sphereGeometry args={[EYE_RADIUS, 20, 14]} />
        <meshStandardMaterial color={colors.eye} roughness={0.2} />
      </mesh>
      {/* One small highlight */}
      <mesh position={[-0.009, 0.012, 0.025]}>
        <sphereGeometry args={[0.0068, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

/**
 * Andy's muzzle: two shallow oval cheeks tucked under his nose, their
 * outer ends tipped up so the whole thing reads as a smile, and under
 * them a small round mouth with the tip of his tongue showing.
 */
function Muzzle({ tongueRef }) {
  return (
    <group position={[0, -0.036, 0.128]}>
      {/* Mouth and tongue first, tucked back under the cheeks */}
      <Fur color={colors.mouth} position={[0, -0.031, 0.015]} scale={[0.019, 0.013, 0.013]} />
      <mesh ref={tongueRef} position={[0, -0.04, 0.023]} rotation={[1.15, 0, 0]} scale={[0.3, TONGUE_THICKNESS, 0.34]}>
        <sphereGeometry args={[0.04, 16, 12]} />
        <meshStandardMaterial color={colors.tongue} roughness={0.6} />
      </mesh>

      {[1, -1].map((side) => (
        <Fur key={side} color={colors.muzzle} position={[side * 0.027, -0.007, 0.008]} rotation={[0, side * 0.3, side * CHEEK_LIFT]} scale={[0.036, 0.026, 0.024]} />
      ))}

      <mesh position={[0, 0.016, 0.034]} scale={[1.35, 0.9, 0.8]}>
        <sphereGeometry args={[0.015, 16, 12]} />
        <meshStandardMaterial color={colors.nose} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* Builds Andy's shaped meshes once, and frees them when he unmounts. */
function useAndyParts() {
  const parts = useMemo(() => {
    const fur = (options) => new THREE.MeshStandardMaterial({ roughness: 0.92, ...options })
    return {
      head: createShapedSphere({ place: (direction, target) => placeAndyHead(direction, target), widthSegments: 64, heightSegments: 48 }),
      body: createShapedSphere({ place: placeAndyBody, paint: paintAndyBody, widthSegments: 48, heightSegments: 36 }),
      leg: createShapedSphere({ place: placeAndyLeg, paint: paintAndyLeg, widthSegments: 48, heightSegments: 36 }),
      ear: createShapedSphere({ place: placeAndyEar, widthSegments: 24, heightSegments: 18 }),
      painted: fur({ vertexColors: true }),
      headFur: fur({ color: colors.head }),
      earFur: fur({ color: colors.brown }),
    }
  }, [])
  useEffect(() => () => Object.values(parts).forEach((part) => part.dispose()), [parts])
  return parts
}

/**
 * Andy's head: one smooth, softly rounded shape in a single colour, with
 * round eyes set a little way into it, the muzzle (see Muzzle), and
 * floppy ears hanging close beside his cheeks.
 */
function AndyHead({ parts, tongueRef, leftEarRef, rightEarRef, shadows }) {
  return (
    <>
      <mesh geometry={parts.head} material={parts.headFur} castShadow={shadows} />

      <Eye direction={ANDY_FACE.eyeLeft} />
      <Eye direction={ANDY_FACE.eyeRight} />
      <Muzzle tongueRef={tongueRef} />

      <group ref={leftEarRef} position={[0.118, 0.07, -0.014]} rotation={[0, 0, EAR_REST]}>
        <mesh geometry={parts.ear} material={parts.earFur} position={[0.036, -0.1, 0]} castShadow={shadows} />
      </group>
      <group ref={rightEarRef} position={[-0.118, 0.07, -0.014]} rotation={[0, 0, -EAR_REST]}>
        <mesh geometry={parts.ear} material={parts.earFur} position={[-0.036, -0.1, 0]} castShadow={shadows} />
      </group>
    </>
  )
}

/**
 * Andy: a chibi Shih Tzu sitting beside the chair.
 *
 * Head: one smooth, softly rounded shape, wider than his body, with
 * round eyes, a small lifted muzzle of two pale cheeks under his nose,
 * a little smiling mouth with the tip of his tongue showing, and
 * deep-brown floppy ears (see AndyHead). Body: a compact pear shape
 * sitting low over rounded hind legs, with one cream bib painted on the
 * chest. His front legs are short and close together, each ending in a
 * flat-soled paw with a cream sock and toe grooves; the hind paws peek
 * out behind them.
 *
 * Idle: wags his tail, pants lightly, and tilts his head now and then.
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

    // Light panting
    tongueRef.current.scale.y = TONGUE_THICKNESS * (1 + Math.sin(t * 7) * 0.2 * motion)

    const flap = hopPhase * 0.5 * motion
    leftEarRef.current.rotation.z = EAR_REST + flap
    rightEarRef.current.rotation.z = -EAR_REST - flap
  })

  return (
    <group name="andy" position={position} rotation={[0, facingAngle, 0]}>
      <group
        ref={rootRef}
        scale={SCALE}
        {...hover}
        onClick={(event) => {
          event.stopPropagation()
          track('tap_andy')
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

        <group ref={headRef} name="andy-head" position={[0, 0.352, 0.05]}>
          <AndyHead parts={parts} tongueRef={tongueRef} leftEarRef={leftEarRef} rightEarRef={rightEarRef} shadows={shadows} />
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
