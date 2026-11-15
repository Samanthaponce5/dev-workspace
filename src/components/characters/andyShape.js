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

/** Broad and shallow: wider than it is tall, and not very deep front to back. */
export const ANDY_HEAD = { width: 0.152, height: 0.128, depth: 0.114 }

const unit = (x, y, z) => new THREE.Vector3(x, y, z).normalize()

export const ANDY_FACE = {
  eyeLeft: unit(0.46, 0.17, 0.87),
  eyeRight: unit(-0.46, 0.17, 0.87),
  bridge: unit(0, 0.12, 0.99), // between the eyes
  muzzle: unit(0, -0.3, 0.95),
  nose: unit(0, -0.08, 0.99),
  tongue: unit(0, -0.5, 0.87),
  chin: unit(0, -0.82, 0.57),
  cheekLeft: unit(0.82, -0.42, 0.38),
  cheekRight: unit(-0.82, -0.42, 0.38),
}

const SWELL = {
  cheeks: 0.2, // fluffy jowls that widen the lower face
  cheekSpread: 0.55,
  muzzle: 0.24, // a short muzzle that stays close to the face
  muzzleSpread: 0.34,
}

const MARKINGS = {
  eyeSpread: 0.46, // size of the dark fur around each eye
  muzzleSpread: 0.62, // size of the dark patch over the muzzle
  edge: 0.26, // lower = larger markings
  softness: 0.3, // how gradually they blend into the tan
}

const tan = new THREE.Color(andyPalette.tan)
const crown = new THREE.Color(andyPalette.crown)
const mask = new THREE.Color(andyPalette.mask)
const muzzle = new THREE.Color(andyPalette.muzzle)
const white = new THREE.Color(andyPalette.white)

/** Where the fur is in the given direction. `lift` raises the point off the surface. */
export function placeAndyHead(direction, target, lift = 0) {
  const { cheekLeft, cheekRight, muzzle: muzzleCentre } = ANDY_FACE
  const swell =
    1 +
    SWELL.cheeks * (bump(direction, cheekLeft, SWELL.cheekSpread) + bump(direction, cheekRight, SWELL.cheekSpread)) +
    SWELL.muzzle * bump(direction, muzzleCentre, SWELL.muzzleSpread) +
    lift
  return target.set(direction.x * ANDY_HEAD.width, direction.y * ANDY_HEAD.height, direction.z * ANDY_HEAD.depth).multiplyScalar(swell)
}

/**
 * Fur colour. Tan all over, lighter on the crown; a band of darker fur
 * around the eyes that runs down over the muzzle; a small white chin.
 * Because the colours are painted onto the one mesh, the markings follow
 * the surface of the head.
 */
export function paintAndyHead(direction, target) {
  const { eyeLeft, eyeRight, bridge, muzzle: muzzleCentre, chin } = ANDY_FACE
  target.copy(tan).lerp(crown, smoothstep(direction.y, 0.3, 0.85))

  // A band across both eyes, joined over the bridge of the nose...
  const band = Math.max(bump(direction, eyeLeft, MARKINGS.eyeSpread), bump(direction, eyeRight, MARKINGS.eyeSpread), bump(direction, bridge, MARKINGS.eyeSpread * 0.8))
  // ...running down into a wider patch over the muzzle.
  const patch = bump(direction, muzzleCentre, MARKINGS.muzzleSpread)
  const facing = smoothstep(direction.z, 0.05, 0.45) // keep the markings on the front
  const amount = smoothstep(Math.max(band, patch), MARKINGS.edge, MARKINGS.edge + MARKINGS.softness)
  target.lerp(mask, amount * facing)
  target.lerp(muzzle, bump(direction, muzzleCentre, 0.3) * 0.75)
  target.lerp(white, bump(direction, chin, 0.22) * 0.95)
}

/** Position on the head for a feature in the given direction, as [x, y, z]. */
export function onAndyHead(direction, lift = 0) {
  return placeAndyHead(direction, new THREE.Vector3(), lift).toArray()
}
