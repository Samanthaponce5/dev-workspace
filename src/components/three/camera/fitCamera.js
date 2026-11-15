import * as THREE from 'three'

const WORLD_UP = new THREE.Vector3(0, 1, 0)
const direction = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()
const target = new THREE.Vector3()
const point = new THREE.Vector3()

function extent(points, axis) {
  let min = Infinity
  let max = -Infinity
  for (const [x, y, z] of points) {
    const value = point.set(x, y, z).dot(axis)
    if (value < min) min = value
    if (value > max) max = value
  }
  return { min, max, span: max - min, centre: (min + max) / 2 }
}

/**
 * Points a perspective camera at the diorama so that it fills a given
 * rectangle of the canvas.
 *
 * The canvas covers the whole hero, but the layout wants the desk in one
 * part of it (the right side on desktop, the lower half on phones).
 * `frame` is that rectangle as fractions of the canvas. The camera is
 * pulled back until `view.widthPoints` fit the frame's width and
 * `view.heightPoints` fit its height, then the projection is shifted with
 * a view offset so the scene's centre lands on the frame's centre.
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {{ width: number, height: number }} size Canvas size in pixels.
 * @param {object} view Camera angle and what to fit; see views.js.
 * @param {{ x: number, y: number, width: number, height: number }} frame
 */
export function fitCameraToFrame(camera, size, view, frame) {
  if (!size.width || !size.height) return

  const { azimuth, elevation, fov, marginX, marginY } = view
  // Unit vector from the scene toward the camera.
  direction.set(Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation))
  right.crossVectors(WORLD_UP, direction).normalize()
  up.crossVectors(direction, right)

  const horizontal = extent(view.widthPoints, right)
  const vertical = extent(view.heightPoints, up)
  const depth = extent(view.heightPoints, direction)

  const boxWidth = frame.width * size.width
  const boxHeight = frame.height * size.height
  const pixelsPerUnit = Math.min(boxWidth / (horizontal.span * marginX), boxHeight / (vertical.span * marginY))
  const distance = size.height / (pixelsPerUnit * 2 * Math.tan(THREE.MathUtils.degToRad(fov) / 2))

  target
    .set(0, 0, 0)
    .addScaledVector(right, horizontal.centre)
    .addScaledVector(up, vertical.centre)
    .addScaledVector(direction, depth.centre)

  camera.fov = fov
  camera.position.copy(target).addScaledVector(direction, distance)
  camera.lookAt(target)

  // Slide the rendered window so the scene sits at the frame's centre.
  const frameCentreX = frame.x + frame.width / 2
  const frameCentreY = frame.y + frame.height / 2
  camera.setViewOffset(
    size.width,
    size.height,
    (0.5 - frameCentreX) * size.width,
    (0.5 - frameCentreY) * size.height,
    size.width,
    size.height,
  )
  camera.updateProjectionMatrix()
}
