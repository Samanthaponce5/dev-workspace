import * as THREE from 'three'
import { andyPalette } from '../three/materials'
import { bump } from './geometry/shapedSphere'

const { smoothstep } = THREE.MathUtils

/*
 * The shape and markings of Andy's head, as numbers.
 *
 * As with Samantha, a spot on the head is a "direction": a unit vector
 * from its centre, where x is his left (+) / right (-), y is up and z is
 * toward his face.
 */

/** Wide and round, and not very deep front to back. */
export const ANDY_HEAD = { width: 0.162, height: 0.134, depth: 0.118 }

const unit = (x, y, z) => new THREE.Vector3(x, y, z).normalize()

export const ANDY_FACE = {
  eyeLeft: unit(0.45, 0.16, 0.88),
  eyeRight: unit(-0.45, 0.16, 0.88),
  bridge: unit(0, 0.1, 0.99), // between the eyes
  muzzle: unit(0, -0.3, 0.95),
  nose: unit(0, -0.1, 0.99),
  tongue: unit(0, -0.5, 0.87),
  beard: unit(0, -0.72, 0.7),
}

/*
 * Soft tufts: each one swells the head a little around a spot, and they
 * overlap, so the cheeks, whisker pads, muzzle and beard read as one
 * shaggy shape rather than separate parts. [direction, height, spread]
 */
const TUFTS = [
  [unit(0.8, -0.4, 0.42), 0.26, 0.58], // full cheeks
  [unit(-0.8, -0.4, 0.42), 0.26, 0.58],
  [unit(0, -0.3, 0.95), 0.15, 0.46], // short, flat muzzle
  [unit(0.36, -0.38, 0.85), 0.07, 0.24], // whisker pads either side of the nose
  [unit(-0.36, -0.38, 0.85), 0.07, 0.24],
  [unit(0, -0.72, 0.7), 0.15, 0.3], // beard under the chin
  [unit(0.55, 0.62, 0.55), 0.05, 0.36], // a little lift over each brow
  [unit(-0.55, 0.62, 0.55), 0.05, 0.36],
  [unit(0, 0.95, 0.3), 0.06, 0.4], // top knot
]

const MARKINGS = {
  eyeSpread: 0.44, // size of the dark fur around each eye
  muzzleSpread: 0.56, // size of the dark patch over the muzzle
  edge: 0.26, // lower = larger markings
  softness: 0.28, // how gradually they blend into the tan
}

const tan = new THREE.Color(andyPalette.tan)
const crown = new THREE.Color(andyPalette.crown)
const mask = new THREE.Color(andyPalette.mask)
const muzzle = new THREE.Color(andyPalette.muzzle)
const whiskers = new THREE.Color(andyPalette.whiskers)
const white = new THREE.Color(andyPalette.white)

/** Where the fur is in the given direction. `lift` raises the point off the surface. */
export function placeAndyHead(direction, target, lift = 0) {
  let swell = 1 + lift
  for (const [centre, height, spread] of TUFTS) swell += height * bump(direction, centre, spread)
  return target.set(direction.x * ANDY_HEAD.width, direction.y * ANDY_HEAD.height, direction.z * ANDY_HEAD.depth).multiplyScalar(swell)
}

/**
 * Fur colour, following the photos: a lighter tan-brown crown; darker
 * charcoal-brown fur around the eyes, sweeping out toward the ears, and
 * over the muzzle; paler whisker pads beside the nose; a white beard.
 * The colours are painted onto the one mesh, so they follow its surface.
 */
export function paintAndyHead(direction, target) {
  const { eyeLeft, eyeRight, bridge, muzzle: muzzleCentre, beard } = ANDY_FACE
  target.copy(tan).lerp(crown, smoothstep(direction.y, 0.25, 0.85))

  // A band across both eyes, joined over the bridge of the nose...
  const band = Math.max(bump(direction, eyeLeft, MARKINGS.eyeSpread), bump(direction, eyeRight, MARKINGS.eyeSpread), bump(direction, bridge, MARKINGS.eyeSpread * 0.8))
  // ...running down into a wider patch over the muzzle.
  const patch = bump(direction, muzzleCentre, MARKINGS.muzzleSpread)
  const facing = smoothstep(direction.z, 0, 0.42) // keep the markings on the front
  target.lerp(mask, smoothstep(Math.max(band, patch), MARKINGS.edge, MARKINGS.edge + MARKINGS.softness) * facing)
  target.lerp(muzzle, bump(direction, muzzleCentre, 0.26) * 0.7)

  // Paler whisker pads and a white beard, as in the photos.
  const pads = Math.max(bump(direction, TUFTS[3][0], 0.2), bump(direction, TUFTS[4][0], 0.2))
  target.lerp(whiskers, pads * 0.55)
  target.lerp(white, smoothstep(bump(direction, beard, 0.38), 0.3, 0.7))
}

/** Position on the head for a feature in the given direction, as [x, y, z]. */
export function onAndyHead(direction, lift = 0) {
  return placeAndyHead(direction, new THREE.Vector3(), lift).toArray()
}
