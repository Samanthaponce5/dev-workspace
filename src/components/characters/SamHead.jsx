import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { samPalette as colors } from '../three/materials'
import { createShapedSphere } from './geometry/shapedSphere'
import { createTaperedTube } from './geometry/taperedTube'
import { FACE, onFace, paintHead, placeHair, placeHead } from './samShape'

const { lerp, smoothstep } = THREE.MathUtils

/* Disposes a set of geometries and materials when the component goes away. */
function useDisposable(create) {
  const resources = useMemo(() => create(), [create])
  useEffect(() => () => Object.values(resources).forEach((resource) => resource.dispose()), [resources])
  return resources
}

/*
 * Slim strand of hair. It starts tucked under the cap beside the brow,
 * slips out at the temple and follows the cheek down, tapering to a fine
 * point above the jaw. It sits on the face, inside the outline of the
 * head, so it reads as a separate lock from the front.
 */
const strandPath = (side) => [
  onFace(side * 0.6, 0.44, 0.03),
  onFace(side * 0.68, 0.2, 0.045),
  onFace(side * 0.705, -0.06, 0.045),
  onFace(side * 0.69, -0.31, 0.036),
  onFace(side * 0.62, -0.52, 0.026),
]
const strandRadius = (t) => lerp(0.0155, 0.0028, t ** 0.9)

/*
 * Low ponytail, relative to its pivot at the nape. It is pinched where it
 * is gathered, fills out beside her jaw, then tapers toward her right
 * shoulder. Sitting out to the side keeps it in view from the front, the
 * side and the back, and clear of the chair.
 */
const PONYTAIL_PATH = [
  [0.01, 0.02, 0.01],
  [-0.075, 0.018, -0.02],
  [-0.155, -0.012, -0.005],
  [-0.212, -0.075, 0.012],
  [-0.232, -0.16, 0.028],
]
const ponytailRadius = (t) => {
  if (t < 0.14) return lerp(0.042, 0.03, t / 0.14)
  if (t < 0.52) return lerp(0.03, 0.062, smoothstep((t - 0.14) / 0.38, 0, 1))
  return lerp(0.062, 0.011, ((t - 0.52) / 0.48) ** 1.25)
}

const createHeadParts = () => ({
  skin: createShapedSphere({ place: (direction, target) => placeHead(direction, target), paint: paintHead }),
  skinMaterial: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }),
})

const createHairParts = () => ({
  cap: createShapedSphere({ place: placeHair, widthSegments: 144, heightSegments: 96 }),
  leftStrand: createTaperedTube(strandPath(1), strandRadius, { lengthSegments: 28 }),
  rightStrand: createTaperedTube(strandPath(-1), strandRadius, { lengthSegments: 28 }),
  ponytail: createTaperedTube(PONYTAIL_PATH, ponytailRadius, { lengthSegments: 28, radialSegments: 16 }),
  // The one material shared by every piece of hair.
  material: new THREE.MeshStandardMaterial({ color: colors.hair, roughness: 0.75 }),
})

const SMILE_ARC = 1.5 // radians: shallow, so it reads as a soft smile
const LASH_ARC = 1.5 // radians: a short lash line over the outer half of the eye
const BROW_ARC = 0.95 // radians: a gentle curve

/**
 * One eye: gently rounded with a large and a small catch-light, a short
 * lash line over its outer half, and a softly curved brow above. The
 * brow's outer end sits a touch lower than the inner, which is what makes
 * the expression relaxed rather than stern. The lash line stays put
 * during a blink, so a closed eye still reads.
 */
function Eye({ side, eyeRef }) {
  const { eye, brow } = FACE
  // Arcs are measured anticlockwise from +X, so the two eyes mirror each other.
  const lashStart = side > 0 ? 0.42 : Math.PI - 0.42 - LASH_ARC
  const browStart = Math.PI / 2 - BROW_ARC / 2 - side * 0.1

  return (
    <>
      {/* Turned slightly outward so the eye lies flat on the curve of the face. */}
      <group position={onFace(side * eye.x, eye.y)} rotation={[-0.06, side * 0.3, 0]}>
        <mesh ref={eyeRef} scale={[1, eye.height, eye.depth]}>
          <sphereGeometry args={[eye.radius, 22, 18]} />
          <meshStandardMaterial color={colors.eye} roughness={0.2} />
        </mesh>
        <mesh position={[0.01, 0.013, 0.019]}>
          <sphereGeometry args={[0.0088, 10, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.0105, -0.011, 0.0185]}>
          <sphereGeometry args={[0.004, 8, 6]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.001, 0.0075]} rotation={[0, 0, lashStart]} scale={[1, 1.05, 0.5]}>
          <torusGeometry args={[eye.radius + 0.0025, 0.003, 6, 16, LASH_ARC]} />
          <meshStandardMaterial color={colors.lash} roughness={0.6} />
        </mesh>
      </group>

      <mesh position={onFace(side * brow.x, brow.y - 0.19, 0.012)} rotation={[-0.3, side * 0.3, browStart]}>
        <torusGeometry args={[0.036, 0.0036, 6, 14, BROW_ARC]} />
        <meshStandardMaterial color={colors.brow} roughness={0.8} />
      </mesh>
    </>
  )
}

/**
 * Mini-Samantha's head: a softly oval face with the blush painted into
 * the skin, and centre-parted hair.
 *
 * The hair cap is one shaped mesh: fitted to the scalp, parted in the
 * centre and swept back to the nape. It dips inside the head over the
 * face, so the parting flows into a smooth hairline with nothing hidden
 * underneath. Two slim cheek strands and the low ponytail are tapered
 * tubes on the same material. The shapes are defined in samShape.js.
 *
 * `ponytailRef` is the ponytail's pivot at the nape; the eye refs are
 * scaled by the blink animation.
 */
export function SamHead({ ponytailRef, leftEyeRef, rightEyeRef, shadows }) {
  const head = useDisposable(createHeadParts)
  const hair = useDisposable(createHairParts)

  return (
    <>
      <mesh geometry={head.skin} material={head.skinMaterial} castShadow={shadows} />

      <Eye side={1} eyeRef={leftEyeRef} />
      <Eye side={-1} eyeRef={rightEyeRef} />
      {/* A hint of a nose */}
      <mesh position={onFace(0, FACE.nose.y, 0.002)} scale={[1, 0.8, 0.6]}>
        <sphereGeometry args={[0.01, 10, 8]} />
        <meshStandardMaterial color={colors.skin} roughness={0.7} />
      </mesh>
      {/* Small closed-mouth smile: a short, shallow arc */}
      <mesh position={onFace(0, FACE.mouth.y + 0.12, 0.004)} rotation={[0.2, 0, Math.PI + (Math.PI - SMILE_ARC) / 2]}>
        <torusGeometry args={[0.027, 0.0042, 6, 14, SMILE_ARC]} />
        <meshStandardMaterial color={colors.mouth} roughness={0.6} />
      </mesh>

      <mesh geometry={hair.cap} material={hair.material} castShadow={shadows} />
      <mesh geometry={hair.leftStrand} material={hair.material} />
      <mesh geometry={hair.rightStrand} material={hair.material} />
      <group ref={ponytailRef} position={[-0.02, -0.1, -0.16]}>
        <mesh geometry={hair.ponytail} material={hair.material} castShadow={shadows} />
      </group>
    </>
  )
}
