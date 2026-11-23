/*
 * The lines of the "What I do" diagram, worked out from where its circles
 * actually are, so they meet them exactly at any screen width.
 *
 * `from` is the code circle and `to` the three skill circles, each as
 * { x, y, r } in the diagram's own pixels. The shape follows the layout:
 *
 *   - "right": the skills sit to the right (wide screens). One line runs
 *     across from the code circle, then splits into three curves.
 *   - "down": the skills sit below, side by side (tablets). The line runs
 *     down, then splits.
 *   - "side": the skills are stacked below (phones). The line runs down
 *     their left and a short curve branches off to each.
 *
 * Every branch ends in a small dot just outside its circle.
 */

const DOT_GAP = 8 // px between a branch's end dot and its circle
const BEND = 26 // px of straight line before a branch meets its dot

export function layoutFlow(from, to) {
  if (!to.length) return null
  const below = to.every((t) => t.y - t.r > from.y + from.r)
  const xs = to.map((t) => t.x)
  const spread = Math.max(...xs) - Math.min(...xs)
  const mode = !below ? 'right' : spread > from.r * 2 ? 'down' : 'side'

  if (mode === 'right') {
    const x0 = from.x + from.r
    const ends = to.map((t) => ({ x: t.x - t.r - DOT_GAP, y: t.y }))
    const split = x0 + (Math.min(...ends.map((end) => end.x)) - BEND - x0) * 0.55
    return {
      mode,
      trunk: `M${x0} ${from.y}H${split}`,
      branches: ends.map((end) => {
        const pull = (end.x - BEND - split) * 0.55
        return { end, d: `M${split} ${from.y}C${split + pull} ${from.y} ${end.x - BEND - pull} ${end.y} ${end.x - BEND} ${end.y}H${end.x}` }
      }),
    }
  }

  if (mode === 'down') {
    const y0 = from.y + from.r
    const ends = to.map((t) => ({ x: t.x, y: t.y - t.r - DOT_GAP }))
    const split = y0 + (Math.min(...ends.map((end) => end.y)) - BEND - y0) * 0.45
    return {
      mode,
      trunk: `M${from.x} ${y0}V${split}`,
      branches: ends.map((end) => {
        const pull = (end.y - BEND - split) * 0.55
        return { end, d: `M${from.x} ${split}C${from.x} ${split + pull} ${end.x} ${end.y - BEND - pull} ${end.x} ${end.y - BEND}V${end.y}` }
      }),
    }
  }

  // "side"
  const x0 = from.x
  const ends = to.map((t) => ({ x: t.x - t.r - DOT_GAP, y: t.y }))
  const turn = 22 // px the curve off the line takes
  return {
    mode,
    trunk: `M${x0} ${from.y + from.r}V${Math.max(...ends.map((end) => end.y)) - turn}`,
    branches: ends.map((end) => ({
      end,
      d: `M${x0} ${end.y - turn}C${x0} ${end.y - 6} ${x0 + 6} ${end.y} ${x0 + 16} ${end.y}H${end.x}`,
    })),
  }
}
