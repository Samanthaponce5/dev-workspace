import { useEffect, useMemo } from 'react'
import { createCanvasTexture, fillRoundedRect } from './createCanvasTexture'

const WIDTH = 1536
const HEIGHT = 512

const SIDEBAR_WIDTH = 190
const TAB_HEIGHT = 44
const GUTTER_WIDTH = 60
const LINE_HEIGHT = 26
const LINE_START_Y = TAB_HEIGHT + 26

const TOKEN_COLORS = ['#c792ea', '#82aaff', '#c3e88d', '#ffcb6b', '#89ddff', '#f78c6c', '#a6accd']

/*
 * A fixed "program" so every visitor sees the same screen. Each entry is
 * [indent level, token widths in px]. An empty list is a blank line.
 */
const PROGRAM = [
  [0, [70, 110, 40, 150]],
  [0, [70, 120, 40, 120]],
  [0, []],
  [0, [90, 60, 180, 30]],
  [1, [60, 110, 90, 50]],
  [1, [60, 150, 40, 120, 30]],
  [1, []],
  [1, [70, 90, 60, 130, 20]],
  [2, [100, 40, 140, 60]],
  [2, [120, 60, 80, 40, 90]],
  [2, [80, 130, 50]],
  [1, [20]],
  [1, []],
  [1, [60, 40, 150, 30]],
  [2, [40, 150, 80]],
  [1, [20]],
  [0, [20]],
]

function drawEditorChrome(context) {
  context.fillStyle = '#0b0e17'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  // File sidebar.
  context.fillStyle = '#0f1320'
  context.fillRect(0, 0, SIDEBAR_WIDTH, HEIGHT)
  for (let row = 0; row < 15; row += 1) {
    const y = 60 + row * 28
    const width = 70 + ((row * 37) % 60)
    fillRoundedRect(context, 26 + (row % 3) * 10, y, width, 8, 4, row === 4 ? '#8f9dff' : '#2c3350')
  }

  // Tab bar with one active tab.
  context.fillStyle = '#0d1120'
  context.fillRect(SIDEBAR_WIDTH, 0, WIDTH - SIDEBAR_WIDTH, TAB_HEIGHT)
  fillRoundedRect(context, SIDEBAR_WIDTH + 14, 10, 150, TAB_HEIGHT - 10, 6, '#0b0e17')
  fillRoundedRect(context, SIDEBAR_WIDTH + 30, 24, 90, 8, 4, '#8f9dff')
  fillRoundedRect(context, SIDEBAR_WIDTH + 200, 24, 70, 8, 4, '#2c3350')
  fillRoundedRect(context, SIDEBAR_WIDTH + 300, 24, 100, 8, 4, '#2c3350')

  // Line-number gutter.
  context.fillStyle = '#0d1120'
  context.fillRect(SIDEBAR_WIDTH, TAB_HEIGHT, GUTTER_WIDTH, HEIGHT - TAB_HEIGHT)
}

function drawCodeLines(context) {
  const x0 = SIDEBAR_WIDTH + GUTTER_WIDTH + 28

  // Slightly muted so the code reads as texture, not as the focal point.
  context.globalAlpha = 0.82
  PROGRAM.forEach(([indent, tokens], index) => {
    const y = LINE_START_Y + index * LINE_HEIGHT
    fillRoundedRect(context, SIDEBAR_WIDTH + 20, y + 4, 20, 8, 4, '#273051')

    let x = x0 + indent * 40
    tokens.forEach((width, tokenIndex) => {
      const color = TOKEN_COLORS[(index + tokenIndex) % TOKEN_COLORS.length]
      fillRoundedRect(context, x, y + 1, width, 13, 6.5, color)
      x += width + 14
    })
  })
  context.globalAlpha = 1
}

/* Right half of the screen: a live preview of this very site, above a test run. */
const PANE = { x: 880, width: 628 }
const PREVIEW = { y: 22, height: 300 }
const TERMINAL = { y: 338, height: 156 }

const SANS = "'Geist Variable', system-ui, sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, monospace"

function drawPreview(context, content) {
  const { x, width } = PANE
  const { y, height } = PREVIEW
  const barHeight = 30

  // Browser window
  fillRoundedRect(context, x, y, width, height, 12, '#0b1721')
  context.save()
  context.beginPath()
  context.roundRect(x, y, width, height, 12)
  context.clip()

  // Teal glow behind the little desk, like the real hero
  const glow = context.createRadialGradient(x + width * 0.72, y + height * 0.62, 10, x + width * 0.72, y + height * 0.62, width * 0.5)
  glow.addColorStop(0, 'rgba(20, 96, 106, 0.95)')
  glow.addColorStop(1, 'rgba(20, 96, 106, 0)')
  context.fillStyle = glow
  context.fillRect(x, y, width, height)

  // Address bar
  context.fillStyle = '#132733'
  context.fillRect(x, y, width, barHeight)
  ;['#ff6b6b', '#ffd23f', '#63b06f'].forEach((color, index) => {
    context.beginPath()
    context.arc(x + 20 + index * 18, y + barHeight / 2, 5, 0, Math.PI * 2)
    context.fillStyle = color
    context.fill()
  })
  fillRoundedRect(context, x + 86, y + 7, 300, 16, 8, '#0b1721')

  // Mini page: monogram, name, role, button
  const left = x + 30
  context.textBaseline = 'alphabetic'
  context.textAlign = 'left'
  context.fillStyle = '#eef7f6'
  context.font = `700 17px ${SANS}`
  context.fillText(content.monogram, left, y + 62)
  context.beginPath()
  context.arc(left + 28, y + 58, 3.5, 0, Math.PI * 2)
  context.fillStyle = '#c8f55a'
  context.fill()

  context.fillStyle = '#eef7f6'
  context.font = `760 46px ${SANS}`
  content.nameLines.forEach((line, index) => context.fillText(line, left, y + 132 + index * 44))
  fillRoundedRect(context, left, y + 196, 190, 9, 4.5, 'rgba(238, 247, 246, 0.8)')
  fillRoundedRect(context, left, y + 228, 112, 32, 16, '#aeded1')
  fillRoundedRect(context, left + 22, y + 240, 52, 8, 4, '#0b1721')

  // Mini desk on its platform
  const cx = x + width * 0.74
  const cy = y + height * 0.66
  const slab = (dx, dy, halfW, halfH, fill) => {
    context.beginPath()
    context.moveTo(cx + dx - halfW, cy + dy)
    context.lineTo(cx + dx, cy + dy - halfH)
    context.lineTo(cx + dx + halfW, cy + dy)
    context.lineTo(cx + dx, cy + dy + halfH)
    context.closePath()
    context.fillStyle = fill
    context.fill()
  }
  slab(0, 44, 140, 46, '#0f3540')
  slab(0, 36, 140, 46, '#2d6069')
  slab(4, 2, 92, 30, '#1c1c1f')
  fillRoundedRect(context, cx - 52, cy - 74, 112, 44, 5, '#15161b')
  fillRoundedRect(context, cx - 47, cy - 69, 102, 34, 3, '#0b0e17')
  ;[
    [0, 40, '#c792ea'],
    [1, 62, '#82aaff'],
    [2, 34, '#c3e88d'],
  ].forEach(([row, barWidth, color]) => fillRoundedRect(context, cx - 40, cy - 63 + row * 9, barWidth, 4, 2, color))
  fillRoundedRect(context, cx - 62, cy - 26, 132, 4, 2, '#71c9c8')

  context.restore()
  context.strokeStyle = 'rgba(174, 222, 209, 0.28)'
  context.lineWidth = 2
  context.beginPath()
  context.roundRect(x, y, width, height, 12)
  context.stroke()
}

function drawTinyDuck(context, x, y) {
  context.fillStyle = '#ffd23f'
  context.beginPath()
  context.ellipse(x, y, 13, 9, 0, 0, Math.PI * 2)
  context.fill()
  context.beginPath()
  context.arc(x + 9, y - 10, 7.5, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#ff8a3d'
  context.beginPath()
  context.ellipse(x + 18, y - 9, 5, 2.6, 0, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#1a1a1a'
  context.beginPath()
  context.arc(x + 11, y - 12, 1.4, 0, Math.PI * 2)
  context.fill()
}

function drawTerminal(context, content) {
  const { x, width } = PANE
  const { y, height } = TERMINAL

  fillRoundedRect(context, x, y, width, height, 12, '#081018')
  context.strokeStyle = 'rgba(174, 222, 209, 0.2)'
  context.lineWidth = 2
  context.beginPath()
  context.roundRect(x, y, width, height, 12)
  context.stroke()

  context.textBaseline = 'alphabetic'
  context.textAlign = 'left'
  context.font = `500 21px ${MONO}`
  const left = x + 24
  const lineHeight = 31

  context.fillStyle = '#7b9398'
  context.fillText(content.command, left, y + 38)

  content.tests.forEach((label, index) => {
    const baseline = y + 38 + (index + 1) * lineHeight
    context.fillStyle = '#7ee0a1'
    context.fillText('✓', left, baseline)
    context.fillStyle = '#d7e6e6'
    context.fillText(label, left + 30, baseline)
    if (index === content.tests.length - 1) drawTinyDuck(context, left + 30 + context.measureText(label).width + 30, baseline - 5)
  })
}

/**
 * The monitor's picture: a code editor on the left; on the right, a tiny
 * browser preview of this site above a terminal with a passing test run.
 * `content` supplies the words (see `scene.monitor` in content.js).
 */
export function useCodeScreenTexture({ content, mirrorX = false }) {
  const target = useMemo(() => createCanvasTexture(WIDTH, HEIGHT, { mirrorX }), [mirrorX])

  useEffect(() => {
    const draw = () =>
      target.paint((context) => {
        drawEditorChrome(context)
        drawCodeLines(context)
        drawPreview(context, content)
        drawTerminal(context, content)
      })

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
