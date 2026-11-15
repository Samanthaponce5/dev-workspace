import { useEffect, useMemo } from 'react'
import { createCanvasTexture } from './createCanvasTexture'

const SIZE = 256
const STREAK_COUNT = 90

/* Deterministic pseudo-random so the grain is identical on every visit. */
function makeRandom(seed) {
  let state = seed
  return () => {
    state = (state * 16807) % 2147483647
    return state / 2147483647
  }
}

function paintGrain(context, base, grain) {
  context.fillStyle = base
  context.fillRect(0, 0, SIZE, SIZE)

  const random = makeRandom(7)
  context.strokeStyle = grain
  for (let index = 0; index < STREAK_COUNT; index += 1) {
    const y = random() * SIZE
    const length = 40 + random() * 200
    const x = random() * SIZE
    context.globalAlpha = 0.25 + random() * 0.4
    context.lineWidth = 0.6 + random() * 1.2
    context.beginPath()
    context.moveTo(x, y)
    context.bezierCurveTo(x + length / 3, y + 1, x + (2 * length) / 3, y - 1, x + length, y)
    context.stroke()
  }
  context.globalAlpha = 1
}

/** Subtle dark wood grain: faint streaks along one axis, tiled. */
export function useWoodTexture(base, grain) {
  const target = useMemo(() => {
    const canvasTexture = createCanvasTexture(SIZE, SIZE)
    canvasTexture.paint((context) => paintGrain(context, base, grain))
    canvasTexture.tile(2, 1)
    return canvasTexture
  }, [base, grain])

  useEffect(() => () => target.dispose(), [target])

  return target.texture
}
