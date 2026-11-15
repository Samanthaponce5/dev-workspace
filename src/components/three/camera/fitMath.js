/*
 * The geometry behind fitting the diorama into a rectangle on screen.
 *
 * This file has no dependencies on purpose. The 3D camera uses it (see
 * fitCamera.js), and so does the static poster image that stands in for
 * the scene while it loads (see ScenePoster.jsx). Sharing the maths is
 * what lets the poster sit exactly where the live scene will appear.
 */

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

/** The camera's axes for a view: toward the camera, screen-right and screen-up. */
export function viewBasis({ azimuth, elevation }) {
  const direction = [Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation), Math.cos(azimuth) * Math.cos(elevation)]
  // right = worldUp × direction, normalised; up = direction × right.
  const length = Math.hypot(direction[2], direction[0])
  const right = [direction[2] / length, 0, -direction[0] / length]
  const up = [direction[1] * right[2] - direction[2] * right[1], direction[2] * right[0] - direction[0] * right[2], direction[0] * right[1] - direction[1] * right[0]]
  return { direction, right, up }
}

function extent(points, axis) {
  let min = Infinity
  let max = -Infinity
  for (const point of points) {
    const value = dot(point, axis)
    if (value < min) min = value
    if (value > max) max = value
  }
  return { span: max - min, centre: (min + max) / 2 }
}

/**
 * Works out how large the scene can be drawn inside a box of the given
 * pixel size: `view.widthPoints` must fit its width and `view.heightPoints`
 * its height, each with the view's margin.
 *
 * @returns {{ pixelsPerUnit: number, direction: number[], right: number[], up: number[], centre: number[] }}
 *   `pixelsPerUnit` is the on-screen size of one scene unit. `centre` is
 *   the middle of the fitted points along right, up and direction.
 */
export function fitScene(view, boxWidth, boxHeight) {
  const basis = viewBasis(view)
  const horizontal = extent(view.widthPoints, basis.right)
  const vertical = extent(view.heightPoints, basis.up)
  const depth = extent(view.heightPoints, basis.direction)

  return {
    ...basis,
    pixelsPerUnit: Math.min(boxWidth / (horizontal.span * view.marginX), boxHeight / (vertical.span * view.marginY)),
    centre: [horizontal.centre, vertical.centre, depth.centre],
  }
}
