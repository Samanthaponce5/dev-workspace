import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { samPalette as colors } from '../three/materials'
import { SamHead } from './SamHead'
import { FACE } from './samShape'

const { lerp } = THREE.MathUtils

const SCALE = 1.55

/* Joint angles in radians. Arms hang straight down at zero. */
const ARM = {
  typeShoulder: -1.45, // reaching forward to the keyboard
  typeElbow: -0.25,
  restShoulder: -0.45, // hand resting on her lap
  restElbow: -0.7,
  waveRaise: -2.45, // out to the side and up
  waveElbow: -0.3,
}
const BLINK_EVERY = 3.6
const BLINK_LENGTH = 0.13

function Arm({ side, armRef, forearmRef, shadows }) {
  return (
    <group ref={armRef} position={[side * 0.125, 0.345, 0]}>
      <mesh position={[0, -0.055, 0]} castShadow={shadows}>
        <capsuleGeometry args={[0.034, 0.08, 4, 10]} />
        <meshStandardMaterial color={colors.top} roughness={0.8} />
      </mesh>
      <group ref={forearmRef} position={[0, -0.11, 0]}>
        <mesh position={[0, -0.05, 0]} castShadow={shadows}>
          <capsuleGeometry args={[0.031, 0.075, 4, 10]} />
          <meshStandardMaterial color={colors.top} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.108, 0]}>
          <sphereGeometry args={[0.036, 12, 10]} />
          <meshStandardMaterial color={colors.skin} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function Leg({ side, shadows }) {
  const x = side * 0.065
  return (
    <>
      {/* Thigh, along the seat */}
      <mesh position={[x, 0.06, 0.13]} rotation={[Math.PI / 2, 0, 0]} castShadow={shadows}>
        <capsuleGeometry args={[0.055, 0.13, 4, 10]} />
        <meshStandardMaterial color={colors.jeans} roughness={0.85} />
      </mesh>
      {/* Shin */}
      <mesh position={[x, -0.035, 0.25]} castShadow={shadows}>
        <capsuleGeometry args={[0.05, 0.07, 4, 10]} />
        <meshStandardMaterial color={colors.jeans} roughness={0.85} />
      </mesh>
      {/* Sneaker */}
      <mesh position={[x, -0.125, 0.275]} scale={[1.05, 0.72, 1.45]}>
        <sphereGeometry args={[0.058, 12, 10]} />
        <meshStandardMaterial color={colors.shoes} roughness={0.6} />
      </mesh>
    </>
  )
}

/**
 * Mini-Samantha: a seated chibi built from spheres and capsules. Big head,
 * small body, navy top tucked into high-waisted jeans, white sneakers.
 * Her head, face and hair live in SamHead.jsx.
 *
 * She animates herself (breathing, blinking, typing, waving) and blends
 * between poses using the weights in `poseRef.current`:
 *   typing  1 = hands on the keyboard, 0 = hands resting
 *   wave    1 = right arm raised and waving
 *   bounce  vertical offset for a small happy hop in the seat
 * The origin is where her hips meet the seat; she faces +Z.
 */
export function MiniSam({ poseRef, animate = true, shadows }) {
  const rootRef = useRef(null)
  const torsoRef = useRef(null)
  const headRef = useRef(null)
  const ponytailRef = useRef(null)
  const leftArmRef = useRef(null)
  const rightArmRef = useRef(null)
  const leftForearmRef = useRef(null)
  const rightForearmRef = useRef(null)
  const leftEyeRef = useRef(null)
  const rightEyeRef = useRef(null)

  useFrame(({ clock }) => {
    if (!rootRef.current) return
    const t = animate ? clock.elapsedTime : 0
    const motion = animate ? 1 : 0
    const { typing, wave, bounce } = poseRef.current

    rootRef.current.position.y = bounce

    // Breathing
    torsoRef.current.scale.y = 1 + Math.sin(t * 1.8) * 0.012 * motion

    // Blinking
    const blinking = animate && t % BLINK_EVERY > BLINK_EVERY - BLINK_LENGTH
    const eyeScale = FACE.eye.height * (blinking ? 0.1 : 1)
    leftEyeRef.current.scale.y = eyeScale
    rightEyeRef.current.scale.y = eyeScale

    // Arms: blend rest -> typing, then the right arm blends into the wave.
    const shoulder = lerp(ARM.restShoulder, ARM.typeShoulder, typing)
    const elbow = lerp(ARM.restElbow, ARM.typeElbow, typing)
    const tap = Math.sin(t * 13) * 0.09 * typing * motion

    leftArmRef.current.rotation.x = shoulder
    leftForearmRef.current.rotation.x = elbow + tap

    rightArmRef.current.rotation.x = lerp(shoulder, 0, wave)
    rightArmRef.current.rotation.z = ARM.waveRaise * wave
    rightForearmRef.current.rotation.x = lerp(elbow - tap, 0, wave)
    rightForearmRef.current.rotation.z = (ARM.waveElbow + Math.sin(t * 9) * 0.45 * motion) * wave

    // Head: looks down a touch while typing, tilts happily while waving.
    headRef.current.rotation.x = 0.1 * typing
    headRef.current.rotation.z = 0.12 * wave + Math.sin(t * 0.7) * 0.02 * motion
    ponytailRef.current.rotation.z = Math.sin(t * 1.6) * 0.05 * motion + Math.sin(t * 9) * 0.04 * wave * motion
  })

  return (
    <group ref={rootRef} scale={SCALE}>
      {/* High-waisted jeans: hips plus a waistband that the top tucks into */}
      <mesh position={[0, 0.075, 0]} scale={[1, 0.8, 0.85]} castShadow={shadows}>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color={colors.jeans} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.15, 0.008]}>
        <cylinderGeometry args={[0.106, 0.116, 0.11, 20]} />
        <meshStandardMaterial color={colors.jeans} roughness={0.85} />
      </mesh>
      <Leg side={-1} shadows={shadows} />
      <Leg side={1} shadows={shadows} />

      {/* Upper body leans in a little */}
      <group ref={torsoRef} position={[0, 0.1, 0]} rotation={[0.14, 0, 0]}>
        <group position={[0, -0.1, 0]}>
          {/* Fitted navy long-sleeve top */}
          <mesh position={[0, 0.27, 0]} castShadow={shadows}>
            <capsuleGeometry args={[0.092, 0.09, 6, 14]} />
            <meshStandardMaterial color={colors.top} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.425, 0]}>
            <cylinderGeometry args={[0.034, 0.038, 0.06, 10]} />
            <meshStandardMaterial color={colors.skin} roughness={0.7} />
          </mesh>

          <Arm side={1} armRef={leftArmRef} forearmRef={leftForearmRef} shadows={shadows} />
          <Arm side={-1} armRef={rightArmRef} forearmRef={rightForearmRef} shadows={shadows} />

          <group ref={headRef} position={[0, 0.6, 0.01]}>
            <SamHead ponytailRef={ponytailRef} leftEyeRef={leftEyeRef} rightEyeRef={rightEyeRef} shadows={shadows} />
          </group>
        </group>
      </group>
    </group>
  )
}
