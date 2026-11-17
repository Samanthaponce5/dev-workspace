import * as THREE from 'three'
import { andyPalette } from '../three/materials'
import { bump } from './geometry/shapedSphere'

const { smoothstep } = THREE.MathUtils

/*
 * Andy's shapes and markings, as numbers. Each part is one smooth mesh
 * made by moving the points of a sphere (see geometry/shapedSphere.js).
 * His bib and socks are painted on, so there are no joins between a
 * marking and the fur around it.
 *
 * As with Samantha, a spot on a part is a "direction": a unit vector
 * from its centre, where x is his left (+) / right (-), y is up and z is
 * toward his front.
 */

const unit = (x, y, z) => new THREE.Vector3(x, y, z).normalize()
const color = (name) => new THREE.Color(andyPalette[name])

const tan = color('tan')
const bodyTan = color('body')
const cream = color('cream')
const creamShade = color('creamShade')

/* ---------------------------------------------------------------- Head */

/** One smooth, softly rounded shape: wider than it is tall. */
export const ANDY_HEAD = { width: 0.174, height: 0.146, depth: 0.14 }

export const ANDY_FACE = {
  eyeLeft: unit(0.4, 0.14, 0.9),
  eyeRight: unit(-0.4, 0.14, 0.9),
}

/*
 * Gentle swellings (or, with a negative height, hollows) that keep the
 * head from being a plain ball: each one moves the surface a little
 * around a spot, and they overlap, so it stays one smooth shape.
 * [direction, height, spread]
 */
const SWELLS = [
  [unit(0.8, -0.38, 0.46), 0.13, 0.56], // full cheeks
  [unit(-0.8, -0.38, 0.46), 0.13, 0.56],
  [unit(0, 0.8, 0.5), 0.05, 0.6], // a relaxed, rounded forehead
  [ANDY_FACE.eyeLeft, -0.035, 0.2], // the eyes sit a little way into the face
  [ANDY_FACE.eyeRight, -0.035, 0.2],
]

/** Where the fur is in the given direction. `lift` raises the point off the surface. */
export function placeAndyHead(direction, target, lift = 0) {
  let swell = 1 + lift
  for (const [centre, height, spread] of SWELLS) swell += height * bump(direction, centre, spread)
  return target.set(direction.x * ANDY_HEAD.width, direction.y * ANDY_HEAD.height, direction.z * ANDY_HEAD.depth).multiplyScalar(swell)
}

/** Position on the head for a feature in the given direction, as [x, y, z]. */
export function onAndyHead(direction, lift = 0) {
  return placeAndyHead(direction, new THREE.Vector3(), lift).toArray()
}

/* ---------------------------------------------------------------- Ears */

/* Broad where they join the head, softly flattened front to back, rounded at the tip. */
const ANDY_EAR = { width: 0.06, length: 0.122, depth: 0.052, taper: 0.1 }

/** Where an ear's surface is in the given direction, measured from the ear's middle. */
export function placeAndyEar(direction, target) {
  const fullness = 1 - ANDY_EAR.taper * direction.y
  return target.set(direction.x * ANDY_EAR.width * fullness, direction.y * ANDY_EAR.length, direction.z * ANDY_EAR.depth)
}

/* ---------------------------------------------------------------- Body */

/* A soft pear: narrow at the shoulders, with his weight low. */
const ANDY_BODY = { width: 0.118, height: 0.142, depth: 0.12, pear: 0.26 }
const BIB = { top: 0.74, bottom: 0.3, softness: 0.14 } // half-width under the chin, and low on the chest

/* 0 outside the bib, 1 inside it: wide under the chin, tapering gently down the chest. */
function bibAt(direction) {
  const down = smoothstep(-direction.y, -0.7, 0.75)
  const halfWidth = BIB.top + (BIB.bottom - BIB.top) * down
  const across = 1 - smoothstep(Math.abs(direction.x), halfWidth - BIB.softness, halfWidth)
  const front = smoothstep(direction.z, 0.05, 0.35)
  const aboveBelly = 1 - smoothstep(-direction.y, 0.6, 0.82)
  return across * front * aboveBelly
}

export function placeAndyBody(direction, target) {
  const fullness = 1 - ANDY_BODY.pear * direction.y
  const fluff = 1 + 0.07 * bibAt(direction) // the bib is a little fuller than the fur round it
  return target.set(direction.x * ANDY_BODY.width * fullness, direction.y * ANDY_BODY.height, direction.z * ANDY_BODY.depth * fullness * fluff)
}

/** One cream bib painted on the chest, following its curve. */
export function paintAndyBody(direction, target) {
  target.copy(bodyTan).lerp(cream, bibAt(direction))
}

/* ---------------------------------------------------------------- Legs */

/*
 * A leg and its paw are one shape: a short column that widens and runs
 * forward at the bottom into a flat-soled paw, with two shallow grooves
 * between the toes. `sole` is how far down the sphere is cut off flat.
 */
export const ANDY_LEG = { radius: 0.033, height: 0.076, sole: 0.78 }
const TOE_GROOVES = [-0.36, 0.36]

/* How deep into a toe groove this direction is, 0–1. */
function grooveAt(direction, across) {
  const low = smoothstep(-direction.y, 0.3, 0.7)
  const front = smoothstep(direction.z, 0.1, 0.6)
  let groove = 0
  for (const centre of TOE_GROOVES) groove = Math.max(groove, Math.exp(-(((across - centre) / 0.13) ** 2)))
  return groove * low * front
}

export function placeAndyLeg(direction, target) {
  const reach = Math.hypot(direction.x, direction.z) // 0 at the top and bottom, 1 round the middle
  const across = reach > 1e-5 ? direction.x / reach : 0
  const forward = reach > 1e-5 ? direction.z / reach : 0
  const low = smoothstep(-direction.y, 0.2, 0.75)
  const column = Math.min(1, reach * 1.22) // straight sides, rounded over at the top
  const radius = ANDY_LEG.radius * column * (1 + 0.24 * low) * (1 - 0.14 * grooveAt(direction, across))
  const toes = 1 + 0.6 * low * Math.max(forward, 0) // the paw runs forward
  return target.set(across * radius, Math.max(direction.y, -ANDY_LEG.sole) * ANDY_LEG.height, forward * radius * toes)
}

/** Tan, with cream wrapped over the end of the paw like a sock. */
export function paintAndyLeg(direction, target) {
  const reach = Math.hypot(direction.x, direction.z)
  const across = reach > 1e-5 ? direction.x / reach : 0
  target.copy(tan).lerp(cream, smoothstep(-direction.y, 0.02, 0.3))
  target.lerp(creamShade, grooveAt(direction, across) * 0.85)
}
