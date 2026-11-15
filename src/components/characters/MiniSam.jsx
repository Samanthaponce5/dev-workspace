import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { samPalette as colors } from '../three/materials'

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
const EYE = { radius: 0.034, height: 1.12, depth: 0.55, x: 0.072, y: -0.005, z: 0.168 }
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
 * One eye: a round, open brown eye with two catch-lights, a thin lash
 * line over the top that runs a little past the outer corner, and one
 * small outer lash. The lash line stays put during a blink, so a closed
 * eye still reads as an eye.
 */
function Eye({ side, eyeRef }) {
  // The lash arc starts near the outer corner and sweeps over the top.
  const lashStart = side > 0 ? 0.25 : Math.PI - 0.25 - 2.0
  return (
    <group position={[side * EYE.x, EYE.y, EYE.z]}>
      <mesh ref={eyeRef} scale={[1, EYE.height, EYE.depth]}>
        <sphereGeometry args={[EYE.radius, 18, 14]} />
        <meshStandardMaterial color={colors.eye} roughness={0.2} />
      </mesh>
      <mesh position={[0.011, 0.013, 0.02]}>
        <sphereGeometry args={[0.0095, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.01, -0.012, 0.019]}>
        <sphereGeometry args={[0.0045, 6, 5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.002, 0.006]} rotation={[0, side * 0.3, lashStart]} scale={[1, 1.08, 0.5]}>
        <torusGeometry args={[EYE.radius + 0.003, 0.0038, 6, 16, 2.0]} />
        <meshStandardMaterial color={colors.lash} roughness={0.6} />
      </mesh>
      <mesh position={[side * 0.04, 0.02, -0.004]} rotation={[0, 0, side * -1.05]}>
        <capsuleGeometry args={[0.003, 0.014, 3, 6]} />
        <meshStandardMaterial color={colors.lash} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Face({ leftEyeRef, rightEyeRef }) {
  return (
    <>
      <Eye side={1} eyeRef={leftEyeRef} />
      <Eye side={-1} eyeRef={rightEyeRef} />
      {/* Light blush */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.118, -0.058, 0.138]} scale={[1, 0.6, 0.3]}>
          <sphereGeometry args={[0.028, 10, 8]} />
          <meshStandardMaterial color={colors.blush} roughness={0.9} transparent opacity={0.55} />
        </mesh>
      ))}
      {/* Soft small smile: the lower half of a thin ring */}
      <mesh position={[0, -0.066, 0.172]} rotation={[0.15, 0, Math.PI]}>
        <torusGeometry args={[0.024, 0.0055, 6, 14, Math.PI]} />
        <meshStandardMaterial color={colors.mouth} roughness={0.6} />
      </mesh>
    </>
  )
}

/**
 * Centre-parted hair with two short face-framing strands and a low
 * ponytail. Every piece shares the one material created here, so the
 * hair colour is changed in a single place (samPalette.hair).
 */
function Hair({ ponytailRef, shadows }) {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: colors.hair, roughness: 0.78 }), [])
  useEffect(() => () => material.dispose(), [material])

  return (
    <>
      {/* Crown and back of the head */}
      <mesh material={material} position={[0, 0.05, -0.055]} castShadow={shadows}>
        <sphereGeometry args={[0.2, 28, 22]} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          {/* A curtain of hair sweeping from the centre parting down to the temple */}
          <mesh material={material} position={[side * 0.118, 0.108, 0.052]} rotation={[-0.22, 0, side * 0.66]} scale={[0.056, 0.158, 0.058]} castShadow={shadows}>
            <sphereGeometry args={[1, 20, 16]} />
          </mesh>
          {/* Short face-framing strand beside the cheek */}
          <mesh material={material} position={[side * 0.184, -0.04, 0.07]} rotation={[0.12, 0, side * 0.07]}>
            <capsuleGeometry args={[0.017, 0.07, 4, 8]} />
          </mesh>
        </group>
      ))}

      {/* Low ponytail, gathered at the nape and falling over one shoulder */}
      <group ref={ponytailRef} position={[-0.02, -0.1, -0.16]}>
        <mesh material={material} position={[-0.035, -0.02, -0.02]} scale={[0.07, 0.07, 0.065]} castShadow={shadows}>
          <sphereGeometry args={[1, 14, 12]} />
        </mesh>
        <mesh material={material} position={[-0.088, -0.1, -0.015]} rotation={[0, 0, -0.45]} castShadow={shadows}>
          <capsuleGeometry args={[0.05, 0.08, 4, 10]} />
        </mesh>
        <mesh material={material} position={[-0.128, -0.185, -0.01]} scale={[0.04, 0.05, 0.04]}>
          <sphereGeometry args={[1, 12, 10]} />
        </mesh>
      </group>
    </>
  )
}

/**
 * Mini-Samantha: a seated chibi built from spheres and capsules. Big head,
 * small body, centre-parted hair in a low ponytail, navy top tucked into
 * high-waisted jeans, white sneakers.
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
    const eyeScale = EYE.height * (blinking ? 0.1 : 1)
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
            <mesh scale={[1, 0.96, 0.95]} castShadow={shadows}>
              <sphereGeometry args={[0.19, 28, 22]} />
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
