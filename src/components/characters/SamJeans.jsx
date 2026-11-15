import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { samPalette as colors } from '../three/materials'
import { createTaperedTube } from './geometry/taperedTube'

const { lerp } = THREE.MathUtils

const LEG_SPACING = 0.065 // each leg's distance from the centre line
const TORSO_PIVOT_Y = 0.1 // height the upper body leans about (matches MiniSam)

/*
 * One leg, seen from the side (y up, z forward), as a single bent tube:
 * along the seat from the hip, round the knee, down to the ankle.
 * Drawing it as one curve is what makes the knee read as denim bending
 * rather than two pieces meeting.
 */
const LEG_PATH = [
  [0, 0.058, -0.01], // hip
  [0, 0.06, 0.1],
  [0, 0.06, 0.19],
  [0, 0.036, 0.25], // knee
  [0, -0.03, 0.272],
  [0, -0.1, 0.279], // ankle
]
const KNEE_AT = 0.52 // how far along the leg the knee is, from 0 to 1
/* Fullest at the thigh, easing in to the knee, then tapering to the ankle. */
const legRadius = (t) => (t < KNEE_AT ? lerp(0.06, 0.054, t / KNEE_AT) : lerp(0.054, 0.041, (t - KNEE_AT) / (1 - KNEE_AT)))

/*
 * Waistband, as a side profile of [radius, height] spun round the body.
 * The last height is where the jeans stop; raise or lower the profile to
 * change how high they sit. It hugs the torso and its top edge rolls inward, so there is no
 * hard rim where the top tucks in.
 */
const WAIST_PROFILE = [
  [0.118, 0.08],
  [0.115, 0.108],
  [0.109, 0.136],
  [0.103, 0.158],
  [0.1005, 0.172],
  [0.0995, 0.183],
  [0.096, 0.1905],
  [0.086, 0.1935],
  [0.07, 0.1935],
]

function createJeans() {
  const profile = new THREE.SplineCurve(WAIST_PROFILE.map(([radius, height]) => new THREE.Vector2(radius, height))).getPoints(24)
  return {
    leg: createTaperedTube(LEG_PATH, legRadius, { lengthSegments: 30, radialSegments: 16 }),
    waistband: new THREE.LatheGeometry(profile, 40),
    material: new THREE.MeshStandardMaterial({ color: colors.jeans, roughness: 0.85 }),
  }
}

/**
 * Mini-Samantha's high-waisted jeans and sneakers, seated: hips on the
 * chair, a fitted rounded waistband, and legs that bend softly at the
 * knee and taper to the ankle. The origin is where her hips meet the
 * seat; she faces +Z. `torsoLean` is how far her upper body tips forward.
 */
export function SamJeans({ torsoLean = 0, shadows }) {
  const jeans = useMemo(() => createJeans(), [])
  useEffect(() => () => Object.values(jeans).forEach((resource) => resource.dispose()), [jeans])

  return (
    <>
      {/* Hips */}
      <mesh material={jeans.material} position={[0, 0.075, 0]} scale={[1, 0.8, 0.85]} castShadow={shadows}>
        <sphereGeometry args={[0.13, 20, 14]} />
      </mesh>
      {/* Waistband. It leans with the torso, about the same pivot, so the two meet in a clean line. */}
      <group position={[0, TORSO_PIVOT_Y, 0]} rotation={[torsoLean, 0, 0]}>
        <mesh geometry={jeans.waistband} material={jeans.material} position={[0, -TORSO_PIVOT_Y, 0]} scale={[1, 1, 0.94]} />
      </group>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * LEG_SPACING, 0, 0]}>
          <mesh geometry={jeans.leg} material={jeans.material} castShadow={shadows} />
          {/* Sneaker */}
          <mesh position={[0, -0.13, 0.296]} scale={[1.05, 0.72, 1.45]}>
            <sphereGeometry args={[0.058, 14, 10]} />
            <meshStandardMaterial color={colors.shoes} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </>
  )
}
