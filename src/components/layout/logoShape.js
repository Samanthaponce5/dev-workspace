/*
 * The SP logo as drawn lines: rounded, even strokes with round ends, used
 * by the navbar logo (Monogram.jsx) and the intro (index.html, written by
 * scripts/capture-posters.mjs), so the intro's letters land on exactly the
 * shapes in the navbar.
 *
 * Units: the letters are 95 tall and the box is their ink, edge to edge.
 * Every line is STROKE wide, so a centre line sits STROKE / 2 inside the
 * box. The S is two stacked ellipses (the lower a little taller); the P is
 * a stem with a round bowl.
 *
 * Each letter is also split into the pieces the intro assembles: the S
 * into its top arc, middle sweep and bottom arc, the P into its bowl (an
 * open curve, from the stem round and back) and its stem. The pieces are parts of the same centre lines, so put together
 * they are the letters exactly.
 */

export const STROKE = 19
const R = STROKE / 2

const S_UPPER = { cx: 36, cy: 27.5, rx: 26.5, ry: 18 }
const S_LOWER = { cx: 36, cy: 65.5, rx: 26.5, ry: 20 }
const S_TOP_END = -32 // where the S starts and ends, as angles round its ellipses (degrees, clockwise from 3 o'clock)
const S_BOTTOM_END = 150
const S_UPPER_JOIN = -200 // where the middle sweep meets the top arc...
const S_LOWER_JOIN = -20 // ...and the bottom arc

const P_STEM = 92.5 // the stem's centre line
const P_BOWL = 20.5 // the bowl's radius (to its centre line)
const P_BAR = 18 // how far the bowl's bars run straight before it curves
const P_MIDDLE = R + 2 * P_BOWL // the centre line of the bowl's lower bar

export const LOGO_HEIGHT = 95
export const LOGO_WIDTH = P_STEM + P_BAR + P_BOWL + R

/* Segments: an arc of an ellipse (from one angle to another) or a straight line. */
const arc = (ellipse, from, to) => ({ ...ellipse, from, to })
const line = (from, to) => ({ from, to, line: true })

const pointOn = (segment, t) => {
  if (segment.line) return [segment.from[0] + (segment.to[0] - segment.from[0]) * t, segment.from[1] + (segment.to[1] - segment.from[1]) * t]
  const angle = ((segment.from + (segment.to - segment.from) * t) * Math.PI) / 180
  return [segment.cx + segment.rx * Math.cos(angle), segment.cy + segment.ry * Math.sin(angle)]
}

const round = (value) => Math.round(value * 100) / 100

/* SVG path data for a run of joined segments (arcs written in quarter turns or less). */
function pathData(segments) {
  let d = ''
  segments.forEach((segment, i) => {
    const [x0, y0] = pointOn(segment, 0)
    if (i === 0) d += `M${round(x0)} ${round(y0)}`
    if (segment.line) {
      const [x1, y1] = segment.to
      d += `L${round(x1)} ${round(y1)}`
      return
    }
    const parts = Math.ceil(Math.abs(segment.to - segment.from) / 90)
    for (let k = 1; k <= parts; k += 1) {
      const [x, y] = pointOn(segment, k / parts)
      d += `A${round(segment.rx)} ${round(segment.ry)} 0 0 ${segment.to > segment.from ? 1 : 0} ${round(x)} ${round(y)}`
    }
  })
  return d
}

/* Points evenly spread along a run of segments (for the intro's maths). */
export function samplePiece(segments, count = 48) {
  const fine = segments.flatMap((segment) => Array.from({ length: 41 }, (_, k) => pointOn(segment, k / 40)))
  const lengths = fine.map((point, i) => (i === 0 ? 0 : Math.hypot(point[0] - fine[i - 1][0], point[1] - fine[i - 1][1])))
  const total = lengths.reduce((sum, length) => sum + length, 0)
  const points = []
  let travelled = 0
  let next = 0
  fine.forEach((point, i) => {
    travelled += lengths[i]
    while (next <= count && travelled >= (next / count) * total - 1e-9) {
      points.push(point)
      next += 1
    }
  })
  return points
}

/* The pieces, in the order the S and P are drawn. */
const bowl = [line([P_STEM, R], [P_STEM + P_BAR, R]), { cx: P_STEM + P_BAR, cy: R + P_BOWL, rx: P_BOWL, ry: P_BOWL, from: -90, to: 90 }, line([P_STEM + P_BAR, P_MIDDLE], [P_STEM, P_MIDDLE])]
export const LOGO_PIECES = [
  { name: 's-top', letter: 's', segments: [arc(S_UPPER, S_TOP_END, S_UPPER_JOIN)] },
  { name: 's-middle', letter: 's', segments: [arc(S_UPPER, S_UPPER_JOIN, -270), arc(S_LOWER, -90, S_LOWER_JOIN)] },
  { name: 's-bottom', letter: 's', segments: [arc(S_LOWER, S_LOWER_JOIN, S_BOTTOM_END)] },
  { name: 'p-bowl', letter: 'p', segments: bowl },
  { name: 'p-stem', letter: 'p', segments: [line([P_STEM, R], [P_STEM, LOGO_HEIGHT - R])] },
].map((piece) => ({ ...piece, d: pathData(piece.segments) }))

/* The whole letters, each one continuous line. */
export const LOGO_LETTERS = {
  s: pathData([arc(S_UPPER, S_TOP_END, -270), arc(S_LOWER, -90, S_BOTTOM_END)]),
  p: pathData([line([P_STEM, LOGO_HEIGHT - R], [P_STEM, R]), ...bowl]),
}
