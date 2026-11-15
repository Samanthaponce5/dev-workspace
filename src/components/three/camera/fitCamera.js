import * as THREE from 'three'
import { fitScene } from './fitMath'

const direction = new THREE.Vector3()
const right = new THREE.Vector3()
const up = new THREE.Vector3()
const target = new THREE.Vector3()

/**
 * Points a perspective camera at the diorama so that it fills a given
 * rectangle of the canvas.
 *
 * The canvas covers the whole hero, but the layout wants the desk in one
 * part of it (the right side on desktop, the lower half on phones).
 * `frame` is that rectangle as fractions of the canvas. The camera is
 * pulled back until the view's points fit the frame (see fitMath.js),
 * then the projection is shifted with a view offset so the scene's centre
 * lands on the frame's centre.
 *
 * @param {THREE.PerspectiveCamera} camera
 * @param {{ width: number, height: number }} size Canvas size in pixels.
 * @param {object} view Camera angle and what to fit; see views.js.
 * @param {{ x: number, y: number, width: number, height: number }} frame
 */
export function fitCameraToFrame(camera, size, view, frame) {
  if (!size.width || !size.height) return

  const fit = fitScene(view, frame.width * size.width, frame.height * size.height)
  direction.fromArray(fit.direction)
  right.fromArray(fit.right)
  up.fromArray(fit.up)

  const distance = size.height / (fit.pixelsPerUnit * 2 * Math.tan(THREE.MathUtils.degToRad(view.fov) / 2))
  target.set(0, 0, 0).addScaledVector(right, fit.centre[0]).addScaledVector(up, fit.centre[1]).addScaledVector(direction, fit.centre[2])

  camera.fov = view.fov
  camera.position.copy(target).addScaledVector(direction, distance)
  camera.lookAt(target)

  // Slide the rendered window so the scene sits at the frame's centre.
  const frameCentreX = frame.x + frame.width / 2
  const frameCentreY = frame.y + frame.height / 2
  camera.setViewOffset(size.width, size.height, (0.5 - frameCentreX) * size.width, (0.5 - frameCentreY) * size.height, size.width, size.height)
  camera.updateProjectionMatrix()
}
