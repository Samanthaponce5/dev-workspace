import { useEffect, useMemo } from 'react'
import { createCanvasTexture, fillRoundedRect } from './createCanvasTexture'

const WIDTH = 512
const HEIGHT = 320
const MARGIN = 24

const SANS = "'Geist Variable', system-ui, sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, monospace"
const ORANGE = '#f48024'
const GREEN = '#5eba7d'

/* Breaks text into lines no wider than `maxWidth`, using the current font. */
function wrapLines(context, text, maxWidth) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word
    if (line && context.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

/* The familiar mark: a tray holding a fanned stack of orange bars. */
function drawLogo(context, x, y) {
  context.strokeStyle = '#bcbbbb'
  context.lineWidth = 4
  context.lineJoin = 'round'
  context.beginPath()
  context.moveTo(x, y + 18)
  context.lineTo(x, y + 30)
  context.lineTo(x + 26, y + 30)
  context.lineTo(x + 26, y + 18)
  context.stroke()

  context.fillStyle = ORANGE
  ;[0, 0.22, 0.5].forEach((angle, index) => {
    context.save()
    context.translate(x + 13 + index * 2.5, y + 21 - index * 7)
    context.rotate(angle)
    context.fillRect(-8, -2, 16, 4)
    context.restore()
  })
}

function drawQuestionPage(context, content) {
  context.fillStyle = '#1b1b1d'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  // Top bar with the logo and a search box
  context.fillStyle = '#2d2d2f'
  context.fillRect(0, 0, WIDTH, 46)
  context.fillStyle = ORANGE
  context.fillRect(0, 0, WIDTH, 4)
  drawLogo(context, MARGIN, 6)
  fillRoundedRect(context, 72, 15, 250, 20, 10, '#3d3e41')

  // The question
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'
  context.fillStyle = '#f2f2f3'
  context.font = `700 35px ${SANS}`
  const lines = wrapLines(context, content.question, WIDTH - MARGIN * 2)
  lines.forEach((line, index) => context.fillText(line, MARGIN, 92 + index * 41))
  const titleBottom = 92 + (lines.length - 1) * 41

  // Accepted answer: green tick and label
  const rowY = titleBottom + 44
  context.beginPath()
  context.arc(MARGIN + 18, rowY, 18, 0, Math.PI * 2)
  context.fillStyle = GREEN
  context.fill()
  context.strokeStyle = '#10301d'
  context.lineWidth = 5
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()
  context.moveTo(MARGIN + 9, rowY + 1)
  context.lineTo(MARGIN + 16, rowY + 8)
  context.lineTo(MARGIN + 28, rowY - 7)
  context.stroke()
  context.fillStyle = GREEN
  context.font = `700 27px ${SANS}`
  context.fillText(content.accepted, MARGIN + 48, rowY + 9)

  // The answer's one line of code
  const codeY = rowY + 30
  fillRoundedRect(context, MARGIN, codeY, WIDTH - MARGIN * 2, 44, 8, '#2a2b2e')
  context.fillStyle = '#e6e6e6'
  context.font = `500 19px ${MONO}`
  context.fillText(content.snippet, MARGIN + 16, codeY + 29)
}

/**
 * The laptop's screen: a simplified dark-mode Q&A page with the question,
 * a green "accepted answer" tick and a one-line fix. `content` supplies
 * the words (see `scene.laptop` in content.js).
 */
export function useLaptopScreenTexture(content) {
  const target = useMemo(() => createCanvasTexture(WIDTH, HEIGHT), [])

  useEffect(() => {
    const draw = () => target.paint((context) => drawQuestionPage(context, content))
    draw()
    // Redraw once web fonts are in, so the text isn't left in a fallback face.
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) draw()
    })
    return () => {
      cancelled = true
    }
  }, [target, content])

  useEffect(() => () => target.dispose(), [target])

  return target.texture
}
