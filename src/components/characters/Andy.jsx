import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { useTimedValue } from '../../hooks/useTimedValue'
import { andyPalette as colors } from '../three/materials'
import { ANDY_FACE, onAndyHead, paintAndyHead, placeAndyHead } from './andyShape'
import { createShapedSphere } from './geometry/shapedSphere'
import { SpeechBubble } from '../three/SpeechBubble'

const SCALE = 1.3
const HOP_SECONDS = 0.95
const HOP_HEIGHT = 0.16
const BARK_MS = 1400
const TILT_EVERY = 6 // seconds between idle head tilts
const TILT_LENGTH = 1.8
const EAR_REST = 0.03 // hanging close against the head; hops flap them outward
const HEAD_TILT = -0.2 // chin up a little, so he looks toward the visitor

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
    <group position={onAndyHead(direction, 0.02)}>
      <mesh>
        <sphereGeometry args={[0.03, 16, 12]} />
        <meshStandardMaterial color={colors.eye} roughness={0.2} />
      </mesh>
      <mesh position={[0.009, 0.012, 0.024]}>
        <sphereGeometry args={[0.008, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.009, -0.009, 0.026]}>
        <sphereGeometry args={[0.0035, 6, 5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

/**
 * Andy's head: one broad, shallow shaped mesh. The fluffy cheeks and the
 * short muzzle are swells in that single surface, and the tan crown, the
 * darker fur round the eyes and muzzle and the white chin are painted
 * onto it, so every contour and marking flows together. The shape and
 * colours are defined in andyShape.js.
 */
function AndyHead({ tongueRef, leftEarRef, rightEarRef, shadows }) {
  const head = useMemo(
    () => ({
      geometry: createShapedSphere({ place: (direction, target) => placeAndyHead(direction, target), paint: paintAndyHead, widthSegments: 72, heightSegments: 54 }),
      material: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }),
    }),
    [],
  )
  useEffect(
    () => () => {
      head.geometry.dispose()
      head.material.dispose()
    },
    [head],
  )

  return (
    <>
      <mesh geometry={head.geometry} material={head.material} castShadow={shadows} />

      <Eye direction={ANDY_FACE.eyeLeft} />
      <Eye direction={ANDY_FACE.eyeRight} />

      <mesh position={onAndyHead(ANDY_FACE.nose, 0.04)} scale={[1.35, 0.95, 0.85]}>
        <sphereGeometry args={[0.021, 14, 10]} />
        <meshStandardMaterial color={colors.nose} roughness={0.3} />
      </mesh>
      <mesh ref={tongueRef} position={onAndyHead(ANDY_FACE.tongue, 0.02)} rotation={[0.5, 0, 0]} scale={[0.55, 0.3, 0.7]}>
        <sphereGeometry args={[0.04, 14, 10]} />
        <meshStandardMaterial color={colors.tongue} roughness={0.5} />
      </mesh>

      {/* Dark floppy ears, hanging close against the sides of the head */}
      <group ref={leftEarRef} position={[0.128, 0.07, -0.005]} rotation={[0, 0, EAR_REST]}>
        <Fur color={colors.ear} position={[0.034, -0.105, 0]} scale={[0.052, 0.128, 0.078]} castShadow={shadows} />
      </group>
      <group ref={rightEarRef} position={[-0.128, 0.07, -0.005]} rotation={[0, 0, -EAR_REST]}>
        <Fur color={colors.ear} position={[-0.034, -0.105, 0]} scale={[0.052, 0.128, 0.078]} castShadow={shadows} />
      </group>
    </>
  )
}

/**
 * Andy: a chibi Shih Tzu sitting beside the chair.
 *
 * Head: one broad, shallow shape with a tan crown, darker fur around the
 * eyes and muzzle, a small black nose, pink tongue and dark floppy ears
 * tucked against its sides (see AndyHead). Body: warm brown with a white
 * chest of overlapping tufts and white paws.
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
        <group ref={tailRef} position={[0.02, 0.19, -0.13]}>
          <Fur color={colors.body} position={[0, 0.04, -0.02]} scale={[0.045, 0.052, 0.045]} />
          <Fur color={colors.tan} position={[0.012, 0.1, -0.025]} scale={[0.052, 0.054, 0.052]} />
          <Fur color={colors.tan} position={[0.03, 0.145, 0]} scale={[0.046, 0.044, 0.048]} />
        </group>

        <group ref={headRef} position={[0, 0.375, 0.05]}>
          <AndyHead tongueRef={tongueRef} leftEarRef={leftEarRef} rightEarRef={rightEarRef} shadows={shadows} />
        </group>
      </group>

      {bubble && (
        <SpeechBubble position={[0, 0.84, 0]} durationMs={bubble.durationMs}>
          {bubble.text}
        </SpeechBubble>
      )}
    </group>
  )
}
