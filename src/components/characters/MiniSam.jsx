import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { samPalette as colors } from '../three/materials'

const { lerp } = THREE.MathUtils

const SCALE = 1.45

/* Joint angles in radians. Arms hang straight down at zero. */
const ARM = {
  typeShoulder: -1.45, // reaching forward to the keyboard
  typeElbow: -0.25,
  restShoulder: -0.45, // hand resting on her lap
  restElbow: -0.7,
  waveRaise: -2.45, // out to the side and up
  waveElbow: -0.3,
}
const EYE_HEIGHT = 1.3
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

function Face({ leftEyeRef, rightEyeRef }) {
  return (
    <>
      {[
        [-1, rightEyeRef],
        [1, leftEyeRef],
      ].map(([side, eyeRef]) => (
        <group key={side}>
          {/* Big warm brown eye with a catch-light */}
          <mesh ref={eyeRef} position={[side * 0.07, -0.005, 0.166]} scale={[1, EYE_HEIGHT, 0.6]}>
            <sphereGeometry args={[0.03, 14, 12]} />
            <meshStandardMaterial color={colors.eye} roughness={0.25} />
          </mesh>
          <mesh position={[side * 0.07 + 0.01, 0.012, 0.187]}>
            <sphereGeometry args={[0.008, 8, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Light blush */}
          <mesh position={[side * 0.115, -0.052, 0.142]} scale={[1, 0.6, 0.3]}>
            <sphereGeometry args={[0.028, 10, 8]} />
            <meshStandardMaterial color={colors.blush} roughness={0.9} transparent opacity={0.65} />
          </mesh>
        </group>
      ))}
      {/* Soft small smile: the lower half of a thin ring */}
      <mesh position={[0, -0.062, 0.172]} rotation={[0.15, 0, Math.PI]}>
        <torusGeometry args={[0.026, 0.006, 6, 14, Math.PI]} />
        <meshStandardMaterial color={colors.mouth} roughness={0.6} />
      </mesh>
    </>
  )
}

function Hair({ ponytailRef, shadows }) {
  return (
    <>
      {/* Cap of hair: a sphere set slightly back so the face shows */}
      <mesh position={[0, 0.055, -0.06]} castShadow={shadows}>
        <sphereGeometry args={[0.2, 28, 22]} />
        <meshStandardMaterial color={colors.hairDark} roughness={0.75} />
      </mesh>

      {/* Two thin face-framing strands */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.168, 0.05, 0.075]} rotation={[0.18, 0, side * 0.1]}>
          <mesh position={[0, -0.045, 0]}>
            <capsuleGeometry args={[0.009, 0.08, 4, 8]} />
            <meshStandardMaterial color={colors.hairMid} roughness={0.75} />
          </mesh>
          <mesh position={[side * 0.004, -0.125, 0.004]}>
            <capsuleGeometry args={[0.0075, 0.06, 4, 8]} />
            <meshStandardMaterial color={colors.hairLight} roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* High ponytail, dark at the tie fading to caramel at the ends */}
      <group ref={ponytailRef} position={[0, 0.16, -0.17]}>
        <mesh>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshStandardMaterial color={colors.top} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.0, -0.065]} scale={[1, 1, 1.1]} castShadow={shadows}>
          <sphereGeometry args={[0.065, 14, 12]} />
          <meshStandardMaterial color={colors.hairDark} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.09, -0.115]} rotation={[0.35, 0, 0]} castShadow={shadows}>
          <capsuleGeometry args={[0.052, 0.09, 4, 10]} />
          <meshStandardMaterial color={colors.hairMid} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.2, -0.145]} rotation={[0.15, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.08, 4, 10]} />
          <meshStandardMaterial color={colors.hairLight} roughness={0.75} />
        </mesh>
        <mesh position={[0, -0.28, -0.15]}>
          <sphereGeometry args={[0.028, 10, 8]} />
          <meshStandardMaterial color={colors.hairLight} roughness={0.75} />
        </mesh>
      </group>
    </>
  )
}

/**
 * Mini-Samantha: a seated chibi built from spheres and capsules. Big head,
 * small body, ponytail, navy top tucked into high-waisted jeans.
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
    const eyeScale = EYE_HEIGHT * (blinking ? 0.12 : 1)
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
    headRef.current.rotation.z = 0.14 * wave + Math.sin(t * 0.7) * 0.02 * motion
    ponytailRef.current.rotation.z = Math.sin(t * 1.6) * 0.06 * motion + Math.sin(t * 9) * 0.05 * wave * motion
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

      {/* Upper body leans in toward the screen */}
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
            <mesh scale={[1, 0.96, 0.95]} castShadow={shadows}>
              <sphereGeometry args={[0.19, 24, 18]} />
              <meshStandardMaterial color={colors.skin} roughness={0.7} />
            </mesh>
            <Face leftEyeRef={leftEyeRef} rightEyeRef={rightEyeRef} />
            <Hair ponytailRef={ponytailRef} shadows={shadows} />
          </group>
        </group>
      </group>
    </group>
  )
}
