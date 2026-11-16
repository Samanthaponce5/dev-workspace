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

/** Big and round: a puppy's head, nearly as deep as it is tall. */
export const ANDY_HEAD = { width: 0.174, height: 0.148, depth: 0.142 }

const unit = (x, y, z) => new THREE.Vector3(x, y, z).normalize()

export const ANDY_FACE = {
  eyeLeft: unit(0.43, 0.1, 0.9),
  eyeRight: unit(-0.43, 0.1, 0.9),
  bridge: unit(0, 0.02, 1), // between the eyes
  muzzle: unit(0, -0.34, 0.94),
  nose: unit(0, -0.17, 0.985),
  mouth: unit(0, -0.4, 0.92),
}

/*
 * Soft swellings: each one pushes the head out a little around a spot,
 * and they overlap, so the cheeks, the short muzzle and the two halves
 * of the forehead read as one plump shape rather than separate parts.
 * [direction, height, spread]
 */
const SWELLS = [
  [unit(0.82, -0.36, 0.44), 0.12, 0.6], // round cheeks
  [unit(-0.82, -0.36, 0.44), 0.12, 0.6],
  [ANDY_FACE.muzzle, 0.17, 0.36], // short, rounded muzzle
  [unit(0.5, 0.72, 0.48), 0.1, 0.46], // the forehead is two soft domes...
  [unit(-0.5, 0.72, 0.48), 0.1, 0.46],
  [unit(0, 0.86, 0.5), -0.035, 0.16], // ...with a shallow crease between them
]

const MARKINGS = {
  eyeSpread: 0.47, // size of the grey-brown fur around each eye
  sweepSpread: 0.36, // how far it sweeps out toward the ears
  muzzleSpread: 0.44, // size of the patch over the muzzle
  edge: 0.36, // lower = larger markings
  softness: 0.13, // how gradually they blend into the tan
}

const sweepLeft = unit(0.82, 0.02, 0.57)
const sweepRight = unit(-0.82, 0.02, 0.57)

const tan = new THREE.Color(andyPalette.tan)
const crown = new THREE.Color(andyPalette.crown)
const mask = new THREE.Color(andyPalette.mask)
const muzzle = new THREE.Color(andyPalette.muzzle)

/** Where the fur is in the given direction. `lift` raises the point off the surface. */
export function placeAndyHead(direction, target, lift = 0) {
  let swell = 1 + lift
  for (const [centre, height, spread] of SWELLS) swell += height * bump(direction, centre, spread)
  return target.set(direction.x * ANDY_HEAD.width, direction.y * ANDY_HEAD.height, direction.z * ANDY_HEAD.depth).multiplyScalar(swell)
}

/**
 * Fur colour: caramel, a little lighter over the crown, with a
 * grey-brown mask. The mask is a patch round each eye, joined across the
 * bridge of the nose and sweeping out toward the ears, running down into
 * a darker patch over the muzzle. The colours are painted onto the one
 * mesh, so they follow its surface.
 */
export function paintAndyHead(direction, target) {
  const { eyeLeft, eyeRight, bridge, muzzle: muzzleCentre } = ANDY_FACE
  target.copy(tan).lerp(crown, smoothstep(direction.y, 0.3, 0.9))

  const eyes = Math.max(bump(direction, eyeLeft, MARKINGS.eyeSpread), bump(direction, eyeRight, MARKINGS.eyeSpread))
  const sweep = Math.max(bump(direction, sweepLeft, MARKINGS.sweepSpread), bump(direction, sweepRight, MARKINGS.sweepSpread))
  const patch = bump(direction, muzzleCentre, MARKINGS.muzzleSpread)
  const coverage = Math.max(eyes, sweep, bump(direction, bridge, MARKINGS.eyeSpread * 0.8), patch)
  const facing = smoothstep(direction.z, 0.1, 0.45) // keep the markings on the front
  target.lerp(mask, smoothstep(coverage, MARKINGS.edge, MARKINGS.edge + MARKINGS.softness) * facing)
  target.lerp(muzzle, smoothstep(patch, 0.42, 0.62))
}

/* Ears: long drops, narrow where they join the head and fuller toward the tip. */
const ANDY_EAR = { width: 0.062, length: 0.148, depth: 0.08, flare: 0.3 }

/** Where an ear's surface is in the given direction, measured from the ear's middle. */
export function placeAndyEar(direction, target) {
  const fullness = 1 - ANDY_EAR.flare * direction.y
  return target.set(direction.x * ANDY_EAR.width * fullness, direction.y * ANDY_EAR.length, direction.z * ANDY_EAR.depth * fullness)
}

/** Position on the head for a feature in the given direction, as [x, y, z]. */
export function onAndyHead(direction, lift = 0) {
  return placeAndyHead(direction, new THREE.Vector3(), lift).toArray()
}
