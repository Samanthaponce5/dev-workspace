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

/*
 * Napping. While Samantha works, Andy lies down and sleeps; a click wakes
 * him, he sits up and barks, and five quiet seconds later he settles down
 * again.
 *
 * He is built as one jointed body, so he moves like one: the torso pivots
 * inside his body, and everything else hangs off it: the front legs from
 * the shoulders, the hind legs (with their paws) from the hips, the tail,
 * and the head on the neck. Lying down is the torso tipping forward and
 * down; the front legs swing forward from the shoulders just as far as
 * keeps the paws on the floor (worked out each frame from the shoulder's
 * height), the hind legs fold, and the head lowers onto the paws. Nothing
 * is moved on its own, so no part can come away from another.
 *
 * One number, his sleepiness (0 awake, 1 asleep), drives the joints, each
 * over its own stretch of it (SLEEP_STAGES), overlapping. Waking runs the
 * same stages backwards, and a click part-way just turns the direction
 * round, so he never jumps between poses.
 */
const FALL_ASLEEP_SECONDS = 1.9
const WAKE_SECONDS = 1.3
const RESETTLE_MS = 5000 // quiet time before he settles down again after a click
const BREATH_RATE = 1.6 // radians per second: a slow, sleepy breath

/* Where each joint's move falls within his sleepiness, as [start, end]. They overlap. */
const SLEEP_STAGES = {
  torso: [0, 0.78], // leans forward and lowers his chest to the floor (the front legs follow from it)
  hind: [0.18, 0.86], // hind legs fold alongside, tail tucks in
  head: [0.32, 1], // head comes down to rest on his paws
  eyes: [0.66, 1], // eyes slowly close
}

/*
 * The joints, in the body's own space (before SCALE). The awake values put
 * every part exactly where it was drawn before he had joints.
 */
// lie: how far he tips forward; curl: how far his back end swings round as he settles (radians), the head turning back so he still faces the visitor
const TORSO = { pivot: [0, 0.13, -0.02], lie: 1.3, curl: -0.85, settle: [0.045, -0.006, -0.012] }
const SHOULDER = [0.043, 0.02, 0.1] // front leg joints, in the torso
const LEG_LENGTH = TORSO.pivot[1] + SHOULDER[1] // shoulder to sole: the shoulder's height when he sits
const LEG_FROM_SHOULDER = [0, SOLE_HEIGHT - LEG_LENGTH, 0.09 - (TORSO.pivot[2] + SHOULDER[2])] // a front leg's centre, from its shoulder (where it was drawn)
const HIP = [0.098, 0.064 - TORSO.pivot[1], -0.006 - TORSO.pivot[2]] // where the hind legs hang, in the torso
const HIND_PAW_FROM_HIP = [0.006, SOLE_HEIGHT * 0.62 - 0.064, 0.056] // a hind paw, from its hip (where it was drawn)
const NECK = [0, 0.12, 0.06] // in the torso
const HEAD_FROM_NECK = [0, 0.102, 0.01]
const HEAD_REST = { nod: 0.25, tilt: -0.23 } // asleep: the neck bends forward this far (world), the head tips back up this much
const TAIL = { awake: [0.02, 0.06, -0.11], asleep: [0.02, -0.12, 0.02] } // in the torso; as he lies down it slides down his back and tucks under him, out of sight

const { clamp, lerp } = THREE.MathUtils
const X_AXIS = new THREE.Vector3(1, 0, 0)
const Y_AXIS = new THREE.Vector3(0, 1, 0)
const torsoTurn = new THREE.Quaternion() // scratch, for keeping his face (and paws) to the visitor
const nodTurn = new THREE.Quaternion()
const legTurn = new THREE.Quaternion()
const legSwing = new THREE.Quaternion()
const PAWS_FOLLOW_CURL = 0.25 // the front paws turn only this much of the curl, staying under his chin
const PAW_SPLAY = 0.2 // and part a little, so one shows each side of it
const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)
/* How far through its stage a joint is, eased, for a sleepiness of `s`. */
const stage = (s, [start, end]) => easeInOut(clamp((s - start) / (end - start), 0, 1))

/* A tuft of fur: a unit sphere stretched into shape with `scale`. */
function Fur({ color, ...meshProps }) {
  return (
    <mesh {...meshProps}>
      <sphereGeometry args={[1, 16, 12]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

/*
 * An eye. To close it, the round eye flattens and then gives way to
 * "closed", a soft curved line like a sleeping smile (see the nap in Andy).
 */
function Eye({ direction, eyeRef }) {
  return (
    <group ref={eyeRef} position={onAndyHead(direction, EYE_SET)}>
      <mesh name="open">
        <sphereGeometry args={[EYE_RADIUS, 20, 14]} />
        <meshStandardMaterial color={colors.eye} roughness={0.2} />
      </mesh>
      <mesh name="closed" position={[0, 0.006, 0.012]} rotation={[0, 0, Math.PI]} visible={false}>
        <torusGeometry args={[EYE_RADIUS * 0.72, 0.0052, 8, 20, Math.PI]} />
        <meshStandardMaterial color={colors.eye} roughness={0.4} />
      </mesh>
      {/* One small highlight */}
      <mesh name="highlight" position={[-0.009, 0.012, 0.025]}>
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
function AndyHead({ parts, tongueRef, leftEarRef, rightEarRef, leftEyeRef, rightEyeRef, shadows }) {
  return (
    <>
      <mesh geometry={parts.head} material={parts.headFur} castShadow={shadows} />

      <Eye direction={ANDY_FACE.eyeLeft} eyeRef={leftEyeRef} />
      <Eye direction={ANDY_FACE.eyeRight} eyeRef={rightEyeRef} />
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
 * While Samantha works he naps (see FALL_ASLEEP_SECONDS above); a click
 * wakes him first, then he barks.
 */
export function Andy({ position, facingAngle = 0, animate = true, shadows }) {
  const rootRef = useRef(null)
  const torsoRef = useRef(null)
  const bodyRef = useRef(null)
  const neckRef = useRef(null)
  const headRef = useRef(null)
  const tailRef = useRef(null)
  const tongueRef = useRef(null)
  const leftEarRef = useRef(null)
  const rightEarRef = useRef(null)
  const leftEyeRef = useRef(null)
  const rightEyeRef = useRef(null)
  const jointRefs = useRef({}) // shoulders, hips and hind paws, by name and side
  const hopStart = useRef(-1)
  // Napping: sleepiness (0 awake, 1 asleep), which way it is heading, and what is waiting to happen.
  const nap = useRef({ s: 0, direction: 0, samWorking: false, lastClick: -Infinity, barkWhenAwake: false })
  const parts = useAndyParts()
  const [bubble, setBubble] = useTimedValue(BARK_MS)
  const hover = useHoverCursor()

  const bark = useCallback(() => {
    hopStart.current = performance.now()
    setBubble({ text: sceneContent.andyBark, durationMs: BARK_MS })
  }, [setBubble])

  // A click (or the keyboard control): awake, he barks; lying down or asleep, he wakes first and barks once sitting up.
  const hop = useCallback(() => {
    const state = nap.current
    state.lastClick = performance.now()
    if (animate && state.s > 0) {
      state.direction = -1
      state.barkWhenAwake = true
      return
    }
    bark()
  }, [animate, bark])
  useSceneEvent('andy:hop', hop)

  // Development only: lets tests and tuning hold him at any point of a nap (window.__andyNap.s = 0.5).
  useEffect(() => {
    if (import.meta.env.DEV) window.__andyNap = nap.current
  }, [])

  useSceneEvent(
    'sam:turning-to-desk',
    useCallback(() => {
      const state = nap.current
      state.samWorking = true
      if (animate && state.direction === 0 && state.s === 0 && performance.now() - state.lastClick > RESETTLE_MS) state.direction = 1
    }, [animate]),
  )
  useSceneEvent(
    'sam:greeting',
    useCallback(() => {
      nap.current.samWorking = false
    }, []),
  )

  useFrame(({ clock }, delta) => {
    if (!rootRef.current) return
    const t = animate ? clock.elapsedTime : 0
    const motion = animate ? 1 : 0
    const now = performance.now()
    const state = nap.current
    const dt = Math.min(delta, 0.1)

    let hopT = hopStart.current < 0 ? -1 : (now - hopStart.current) / 1000
    if (hopT > HOP_SECONDS) {
      hopStart.current = -1
      hopT = -1
    }
    const excited = hopT >= 0

    // Napping: settle down again after a quiet spell, provided Samantha is still at work.
    if (animate && state.direction === 0 && state.s === 0 && !excited && state.samWorking && now - state.lastClick > RESETTLE_MS) state.direction = 1
    if (state.direction !== 0) {
      state.s = clamp(state.s + state.direction * (dt / (state.direction > 0 ? FALL_ASLEEP_SECONDS : WAKE_SECONDS)), 0, 1)
      if (state.s === 1 && state.direction > 0) state.direction = 0
      if (state.s === 0 && state.direction < 0) {
        state.direction = 0
        if (state.barkWhenAwake) {
          state.barkWhenAwake = false
          state.lastClick = now // the quiet spell starts once he is up and has barked
          bark()
        }
      }
    }
    if (!animate) state.s = 0
    const s = state.s
    const lean = stage(s, SLEEP_STAGES.torso)
    const fold = stage(s, SLEEP_STAGES.hind)
    const rest = stage(s, SLEEP_STAGES.head)
    const eyes = stage(s, SLEEP_STAGES.eyes)
    const breath = Math.sin(t * BREATH_RATE) * eyes * motion

    // Two hops across the duration.
    const hopPhase = excited ? Math.abs(Math.sin((hopT / HOP_SECONDS) * Math.PI * 2)) : 0
    rootRef.current.position.y = hopPhase * HOP_HEIGHT * motion

    // Torso: tips forward and settles a little lower, carrying every other part with it.
    const tip = TORSO.lie * lean
    const curl = TORSO.curl * fold
    const torso = torsoRef.current
    torso.position.set(TORSO.pivot[0] + TORSO.settle[0] * fold, TORSO.pivot[1] + TORSO.settle[1] * lean, TORSO.pivot[2] + TORSO.settle[2] * lean)
    torso.rotation.set(tip, curl, 0)
    bodyRef.current.scale.set(1 + breath * 0.012, 1 + breath * 0.012, 1 + breath * 0.025) // breathing, once asleep

    // Front legs: each swings forward from its shoulder just far enough to keep the paw on the floor.
    const cos = Math.cos(tip)
    const sin = Math.sin(tip)
    const shoulderHeight = torso.position.y + SHOULDER[1] * cos - SHOULDER[2] * sin
    const reach = Math.acos(clamp(shoulderHeight / LEG_LENGTH, 0, 1)) // 0 standing straight down, toward a quarter turn lying flat
    // Each leg's direction in the scene (a little of the curl, then the swing forward), made relative to the torso.
    torsoTurn.setFromEuler(torso.rotation).invert()
    legSwing.setFromAxisAngle(X_AXIS, -reach)
    for (const side of [-1, 1]) {
      legTurn.setFromAxisAngle(Y_AXIS, curl * PAWS_FOLLOW_CURL + side * PAW_SPLAY * lean).multiply(legSwing)
      jointRefs.current[`shoulder${side}`].quaternion.multiplyQuaternions(torsoTurn, legTurn)
      // Hind legs fold alongside the body; their paws stay flat on the floor.
      const hipBend = -tip * 0.6 * fold - tip * 0.6 * (1 - fold) * lean
      jointRefs.current[`hip${side}`].rotation.set(hipBend, 0, 0)
      jointRefs.current[`hindPaw${side}`].rotation.set(-tip - hipBend, side * 0.35, 0)
    }

    // Tail: wags while he's up; as he settles it slides down his back and tucks under him, still, in step with the torso.
    const tail = tailRef.current
    tail.position.set(lerp(TAIL.awake[0], TAIL.asleep[0], lean), lerp(TAIL.awake[1], TAIL.asleep[1], lean), lerp(TAIL.awake[2], TAIL.asleep[2], lean))
    tail.rotation.set(0, 0, Math.sin(t * (excited ? 20 : 9)) * (excited ? 0.7 : 0.42) * motion * (1 - lean))

    // Head: stays level while he leans, then the neck bends to lay it on his paws, still facing the visitor.
    // The neck undoes the torso's turn exactly (as a quaternion), then nods: so the face never turns away.
    torsoTurn.setFromEuler(torso.rotation).invert()
    nodTurn.setFromAxisAngle(X_AXIS, HEAD_REST.nod * rest)
    neckRef.current.quaternion.multiplyQuaternions(torsoTurn, nodTurn)
    const head = headRef.current
    head.position.y = HEAD_FROM_NECK[1] + breath * 0.002
    const cycle = t % TILT_EVERY
    const tilt = cycle < TILT_LENGTH ? Math.sin((cycle / TILT_LENGTH) * Math.PI) : 0
    head.rotation.set(lerp(HEAD_TILT, HEAD_REST.tilt, rest) + (excited ? -0.15 * hopPhase * motion : 0), 0, (excited ? 0 : tilt * 0.3 * motion) * (1 - rest))

    // Eyes close slowly; panting stops and the tongue tucks away.
    for (const eye of [leftEyeRef.current, rightEyeRef.current]) {
      if (!eye) continue
      const open = eyes < 0.7
      const lid = eye.getObjectByName('open')
      lid.visible = open
      lid.scale.y = lerp(1, 0.2, Math.min(1, eyes / 0.7)) // the eye narrows, then becomes the closed line
      eye.getObjectByName('highlight').visible = eyes < 0.45
      eye.getObjectByName('closed').visible = !open
    }
    tongueRef.current.scale.y = TONGUE_THICKNESS * (1 + Math.sin(t * 7) * 0.2 * motion) * (1 - rest)
    tongueRef.current.visible = rest < 0.98

    // Ears flap with a hop, and hang a little lower once he's resting.
    const flap = hopPhase * 0.5 * motion
    leftEarRef.current.rotation.set(rest * 0.2, 0, lerp(EAR_REST, 0.05, rest) + flap)
    rightEarRef.current.rotation.set(rest * 0.2, 0, -lerp(EAR_REST, 0.05, rest) - flap)
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
        {/* The torso: everything else hangs off it, so he moves as one body (see the nap, above). */}
        <group ref={torsoRef} position={TORSO.pivot} rotation-order="YXZ">
          {/* Pear-shaped body with the bib painted on, sitting low */}
          <mesh ref={bodyRef} geometry={parts.body} material={parts.painted} position={[0, 0.002, 0.02]} castShadow={shadows} />

          {[-1, 1].map((side) => (
            <group key={side}>
              {/* Rounded hind leg, hanging from the hip, with its paw peeking out behind the front leg */}
              <group ref={(node) => (jointRefs.current[`hip${side}`] = node)} position={[side * HIP[0], HIP[1], HIP[2]]}>
                <Fur color={colors.body} scale={[0.07, 0.07, 0.09]} castShadow={shadows} />
                <mesh
                  ref={(node) => (jointRefs.current[`hindPaw${side}`] = node)}
                  geometry={parts.leg}
                  material={parts.painted}
                  position={[side * HIND_PAW_FROM_HIP[0], HIND_PAW_FROM_HIP[1], HIND_PAW_FROM_HIP[2]]}
                  rotation={[0, side * 0.35, 0]}
                  scale={[0.86, 0.62, 0.9]}
                />
              </group>
              {/* Short front leg and flat-soled paw, as one shape, swinging from the shoulder */}
              <group ref={(node) => (jointRefs.current[`shoulder${side}`] = node)} position={[side * SHOULDER[0], SHOULDER[1], SHOULDER[2]]}>
                <mesh geometry={parts.leg} material={parts.painted} position={LEG_FROM_SHOULDER} castShadow={shadows} />
              </group>
            </group>
          ))}

          {/* Fluffy tail curled up over his back */}
          <group ref={tailRef} position={TAIL.awake}>
            <Fur color={colors.body} position={[0, 0.04, -0.02]} scale={[0.045, 0.052, 0.045]} />
            <Fur color={colors.tan} position={[0.012, 0.1, -0.025]} scale={[0.052, 0.054, 0.052]} />
            <Fur color={colors.tan} position={[0.03, 0.145, 0]} scale={[0.046, 0.044, 0.048]} />
          </group>

          {/* The head, on the neck */}
          <group ref={neckRef} position={NECK}>
            <group ref={headRef} name="andy-head" position={HEAD_FROM_NECK} rotation={[HEAD_TILT, 0, 0]}>
              <AndyHead parts={parts} tongueRef={tongueRef} leftEarRef={leftEarRef} rightEarRef={rightEarRef} leftEyeRef={leftEyeRef} rightEyeRef={rightEyeRef} shadows={shadows} />
            </group>
          </group>
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
