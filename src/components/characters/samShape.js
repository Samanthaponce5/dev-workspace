import * as THREE from 'three'
import { samPalette } from '../three/materials'
import { bump } from './geometry/shapedSphere'

const { clamp, lerp, smoothstep } = THREE.MathUtils

/*
 * The shape of Mini-Samantha's head, face and hair, as numbers.
 *
 * Positions on the head are described by a "direction": a unit vector
 * from the centre of the head. x is her left (+) and right (-), y is up,
 * z is toward her face. So { x: 0.37, y: 0.1 } is a little left of centre
 * and slightly above the middle of her face.
 */

/** A softly oval head: a touch taller than wide, narrowing gently to the chin. */
export const HEAD = { radius: 0.19, width: 0.95, height: 1, depth: 0.93, chinTaper: 0.12 }

export const FACE = {
  eye: { x: 0.36, y: 0.08, radius: 0.033, height: 1.08, depth: 0.55 },
  brow: { x: 0.37, y: 0.4 },
  cheek: { x: 0.6, y: -0.25, spread: 0.22, strength: 0.42 },
  nose: { y: -0.12 },
  mouth: { y: -0.36 },
}

/*
 * Hair: a fitted cap, parted in the centre and swept back to the nape.
 * At the front it frames the forehead; along the sides its lower edge
 * runs from the temple back and down to where the ponytail is gathered.
 */
export const HAIR = {
  partTop: 0.8, // how high the hairline rises at the centre parting
  browLevel: 0.12, // below this the face is uncovered at its full width
  faceHalfWidth: 0.75, // half the width of the face opening
  arch: 1.3, // 2 = round hairline; nearer 1 = straight sweeps from the parting
  edge: 0.065, // softness of the hairline
  hemTemple: -0.14, // lower edge of the cap beside the eyes...
  hemNape: -0.47, // ...sweeping down to this at the back of the neck
  thickness: 0.055, // how far the cap sits off the scalp, as a fraction of head size
  partDepth: 0.022, // depth of the groove along the parting
  partWidth: 0.05,
  hidden: -0.05, // where there is no hair, the mesh tucks this far inside the head
}

const scratch = new THREE.Vector3()
const skin = new THREE.Color(samPalette.skin)
const blush = new THREE.Color(samPalette.blush)
const cheekLeft = new THREE.Vector3()
const cheekRight = new THREE.Vector3()

/** Completes a direction from its x and y, on the front of the head. */
function frontDirection(x, y, target) {
  return target.set(x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y)))
}
frontDirection(FACE.cheek.x, FACE.cheek.y, cheekLeft)
frontDirection(-FACE.cheek.x, FACE.cheek.y, cheekRight)

/** Where the skin is in the given direction. `lift` raises the point off the surface. */
export function placeHead(direction, target, lift = 0) {
  const towardChin = smoothstep(-direction.y, 0.05, 0.95)
  const width = HEAD.width * (1 - HEAD.chinTaper * towardChin)
  const depth = HEAD.depth * (1 - 0.05 * towardChin)
  return target.set(direction.x * width, direction.y * HEAD.height, direction.z * depth).multiplyScalar(HEAD.radius * (1 + lift))
}

/** Skin colour, warming to a soft blush on each cheek. */
export function paintHead(direction, target) {
  const amount = Math.max(bump(direction, cheekLeft, FACE.cheek.spread), bump(direction, cheekRight, FACE.cheek.spread))
  target.copy(skin).lerp(blush, amount * FACE.cheek.strength)
}

/** Position on the front of the head for a face feature, as [x, y, z]. */
export function onFace(x, y, lift = 0) {
  return placeHead(frontDirection(x, y, scratch), new THREE.Vector3(), lift).toArray()
}

/** How much hair covers a direction: 1 = fully covered, 0 = bare face or neck. */
function hairCover(direction) {
  const { x, y, z } = direction

  // The face opening: full width up to the brows, then arching in to a
  // soft point at the centre parting.
  const rise = clamp((y - HAIR.browLevel) / (HAIR.partTop - HAIR.browLevel), 0, 1)
  const halfWidth = y > HAIR.partTop ? (HAIR.partTop - y) * 2 : HAIR.faceHalfWidth * (1 - rise ** HAIR.arch) ** (1 / HAIR.arch)
  const besideFace = smoothstep(Math.abs(x) - halfWidth, -HAIR.edge, HAIR.edge)
  // The opening only exists on the front; the back is always covered.
  const front = lerp(1, besideFace, smoothstep(z, -0.2, 0.05))

  // Swept back: the cap's lower edge drops from the temples to the nape.
  const hem = lerp(HAIR.hemNape, HAIR.hemTemple, smoothstep(z, -0.8, 0.6))
  const aboveHem = smoothstep(y - hem, -HAIR.edge, HAIR.edge)

  return front * aboveHem
}

/**
 * Where the hair surface is in the given direction. Over the scalp it
 * sits just above the skin; over the face and neck it dips inside the
 * head. The line where it crosses the skin is the hairline, so the
 * hairline always follows the forehead smoothly.
 */
export function placeHair(direction, target) {
  const { x, y, z } = direction
  const parting = HAIR.partDepth * Math.exp(-((x / HAIR.partWidth) ** 2)) * smoothstep(y, 0.5, 0.78) * smoothstep(z, -0.5, -0.05)
  return placeHead(direction, target, lerp(HAIR.hidden, HAIR.thickness - parting, hairCover(direction)))
}
