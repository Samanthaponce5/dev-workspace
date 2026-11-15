import { useEffect, useMemo } from 'react'
import { createCanvasTexture } from './createCanvasTexture'

const WIDTH = 512
const HEIGHT = 192

function formatTime(date) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
    .format(date)
    .replace(/\s?(AM|PM|am|pm)$/, '')
}

function drawClock(context, time, temperature) {
  context.fillStyle = '#120d09'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.textBaseline = 'middle'
  context.fillStyle = '#ffffff'
  context.shadowColor = 'rgba(255, 255, 255, 0.8)'
  context.shadowBlur = 18

  context.textAlign = 'left'
  context.font = "500 118px 'Geist Mono Variable', ui-monospace, monospace"
  context.fillText(time, 28, HEIGHT / 2 + 4)

  context.textAlign = 'right'
  context.font = "500 54px 'Geist Mono Variable', ui-monospace, monospace"
  context.fillText(temperature, WIDTH - 28, HEIGHT / 2 + 6)
}

/**
 * A texture showing the visitor's current local time and a temperature,
 * redrawn at the start of every minute.
 */
export function useClockTexture(temperature) {
  const target = useMemo(() => createCanvasTexture(WIDTH, HEIGHT), [])

  useEffect(() => {
    let timeoutId

    const tick = () => {
      const now = new Date()
      target.paint((context) => drawClock(context, formatTime(now), temperature))
      const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
      timeoutId = window.setTimeout(tick, msToNextMinute + 50)
    }

    tick()
    return () => window.clearTimeout(timeoutId)
  }, [target, temperature])

  useEffect(() => () => target.dispose(), [target])

  return target.texture
}
