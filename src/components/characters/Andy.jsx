import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { useTimedValue } from '../../hooks/useTimedValue'
import { andyPalette as colors } from '../three/materials'
import { ANDY_FACE, onAndyHead, paintAndyHead, placeAndyEar, placeAndyHead } from './andyShape'
import { createShapedSphere } from './geometry/shapedSphere'
import { SpeechBubble } from '../three/SpeechBubble'

const SCALE = 1.3
const HOP_SECONDS = 0.95
const HOP_HEIGHT = 0.16
const BARK_MS = 1400
const TILT_EVERY = 6 // seconds between idle head tilts
const TILT_LENGTH = 1.8
const EAR_REST = 0.09 // draped down the sides of his head, tips swinging out a little; hops flap them further
const HEAD_TILT = -0.2 // chin up a little, so he looks toward the visitor
const TONGUE_THICKNESS = 0.24

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
    <group position={onAndyHead(direction, 0.0)}>
      <mesh>
        <sphereGeometry args={[0.04, 20, 14]} />
        <meshStandardMaterial color={colors.eye} roughness={0.15} />
      </mesh>
      {/* One clear highlight and a smaller one, on the same side in both eyes */}
      <mesh position={[-0.014, 0.017, 0.03]}>
        <sphereGeometry args={[0.0115, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.013, -0.012, 0.034]}>
        <sphereGeometry args={[0.0045, 6, 5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

/**
 * Andy's head: one big, round shaped mesh. Plump cheeks, a short rounded
 * muzzle and a softly creased forehead are overlapping swellings in that
 * single surface, and the grey-brown mask across his eyes and muzzle is
 * painted onto it, so every contour and marking flows together. The
 * shape and colours are defined in andyShape.js.
 */
function AndyHead({ tongueRef, leftEarRef, rightEarRef, shadows }) {
  const head = useMemo(
    () => ({
      geometry: createShapedSphere({ place: (direction, target) => placeAndyHead(direction, target), paint: paintAndyHead, widthSegments: 72, heightSegments: 54 }),
      material: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }),
      ear: createShapedSphere({ place: placeAndyEar, widthSegments: 24, heightSegments: 18 }),
      earMaterial: new THREE.MeshStandardMaterial({ color: colors.ear, roughness: 0.9 }),
    }),
    [],
  )
  useEffect(
    () => () => {
      head.geometry.dispose()
      head.material.dispose()
      head.ear.dispose()
      head.earMaterial.dispose()
    },
    [head],
  )

  return (
    <>
      <mesh geometry={head.geometry} material={head.material} castShadow={shadows} />

      <Eye direction={ANDY_FACE.eyeLeft} />
      <Eye direction={ANDY_FACE.eyeRight} />

      <mesh position={onAndyHead(ANDY_FACE.nose, 0.035)} scale={[1.5, 1, 0.8]}>
        <sphereGeometry args={[0.024, 16, 12]} />
        <meshStandardMaterial color={colors.nose} roughness={0.25} />
      </mesh>
      {/* Tongue, hanging out below the nose */}
      <mesh ref={tongueRef} position={onAndyHead(ANDY_FACE.mouth, 0.0)} rotation={[0.95, 0, 0]} scale={[0.62, TONGUE_THICKNESS, 0.9]}>
        <sphereGeometry args={[0.046, 16, 12]} />
        <meshStandardMaterial color={colors.tongue} roughness={0.45} />
      </mesh>

      {/* Big floppy ears, joined high on the head and draped down its sides */}
      <group ref={leftEarRef} position={[0.112, 0.108, -0.012]} rotation={[0, 0, EAR_REST]}>
        <mesh geometry={head.ear} material={head.earMaterial} position={[0.046, -0.118, 0]} castShadow={shadows} />
      </group>
      <group ref={rightEarRef} position={[-0.112, 0.108, -0.012]} rotation={[0, 0, -EAR_REST]}>
        <mesh geometry={head.ear} material={head.earMaterial} position={[-0.046, -0.118, 0]} castShadow={shadows} />
      </group>
    </>
  )
}

/**
 * Andy: a chibi Shih Tzu sitting beside the chair.
 *
 * Head: big and round, caramel with a grey-brown mask across the eyes
 * and muzzle, large glossy eyes, a black nose, his tongue out, and dark
 * floppy ears draped down its sides (see AndyHead). Body: small and
 * caramel, with a wide white bib and white paws.
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
    tongueRef.current.scale.y = TONGUE_THICKNESS * (1 + Math.sin(t * 7) * 0.2 * motion)

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
        <Fur color={colors.body} position={[0, 0.145, 0]} scale={[0.128, 0.145, 0.13]} castShadow={shadows} />

        {/* White bib: one broad, smooth shield down his chest */}
        <Fur color={colors.white} position={[0, 0.165, 0.074]} scale={[0.094, 0.118, 0.07]} />

        {/* Haunches with white back feet, and front legs with white paws */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Fur color={colors.body} position={[side * 0.1, 0.07, 0]} scale={[0.068, 0.074, 0.09]} castShadow={shadows} />
            <Fur color={colors.white} position={[side * 0.122, 0.026, 0.088]} scale={[0.042, 0.028, 0.054]} />
            <Fur color={colors.tan} position={[side * 0.055, 0.082, 0.108]} scale={[0.036, 0.072, 0.038]} />
            <Fur color={colors.white} position={[side * 0.055, 0.028, 0.136]} scale={[0.043, 0.03, 0.05]} />
          </group>
        ))}

        {/* Fluffy tail curled up over his back */}
        <group ref={tailRef} position={[0.02, 0.19, -0.13]}>
          <Fur color={colors.body} position={[0, 0.04, -0.02]} scale={[0.045, 0.052, 0.045]} />
          <Fur color={colors.tan} position={[0.012, 0.1, -0.025]} scale={[0.052, 0.054, 0.052]} />
          <Fur color={colors.tan} position={[0.03, 0.145, 0]} scale={[0.046, 0.044, 0.048]} />
        </group>

        <group ref={headRef} position={[0, 0.385, 0.045]}>
          <AndyHead tongueRef={tongueRef} leftEarRef={leftEarRef} rightEarRef={rightEarRef} shadows={shadows} />
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
