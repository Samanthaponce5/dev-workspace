import { useEffect, useMemo } from 'react'
import { createCanvasTexture, fillRoundedRect } from './createCanvasTexture'

const WIDTH = 1536
const HEIGHT = 512

const SIDEBAR_WIDTH = 150
const TAB_HEIGHT = 44
const GUTTER_WIDTH = 60
const LINE_HEIGHT = 24
const LINE_START_Y = TAB_HEIGHT + 22

const TOKEN_COLORS = ['#c792ea', '#82aaff', '#c3e88d', '#ffcb6b', '#89ddff', '#f78c6c', '#a6accd']

/*
 * A fixed "program" so every visitor sees the same screen. Each entry is
 * [indent level, token widths in px]. Width 0 means a blank line.
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
  [1, [20]],
  [1, []],
  [1, [60, 40, 150, 30]],
  [2, [40, 150, 80]],
  [2, [80, 110, 60, 100]],
  [1, [20]],
  [0, [20]],
]

function drawEditorChrome(context) {
  context.fillStyle = '#0b0e17'
  context.fillRect(0, 0, WIDTH, HEIGHT)

  // Activity sidebar with file rows.
  context.fillStyle = '#0f1320'
  context.fillRect(0, 0, SIDEBAR_WIDTH, HEIGHT)
  for (let row = 0; row < 14; row += 1) {
    const y = 64 + row * 28
    const width = 60 + ((row * 37) % 50)
    fillRoundedRect(context, 22 + (row % 3) * 8, y, width, 8, 4, row === 4 ? '#8f9dff' : '#2c3350')
  }

  // Tab bar with one active tab.
  context.fillStyle = '#0d1120'
  context.fillRect(SIDEBAR_WIDTH, 0, WIDTH - SIDEBAR_WIDTH, TAB_HEIGHT)
  fillRoundedRect(context, SIDEBAR_WIDTH + 14, 10, 150, TAB_HEIGHT - 10, 6, '#0b0e17')
  fillRoundedRect(context, SIDEBAR_WIDTH + 30, 24, 90, 8, 4, '#8f9dff')
  fillRoundedRect(context, SIDEBAR_WIDTH + 200, 24, 70, 8, 4, '#2c3350')
  fillRoundedRect(context, SIDEBAR_WIDTH + 300, 24, 100, 8, 4, '#2c3350')

  // Gutter.
  context.fillStyle = '#0d1120'
  context.fillRect(SIDEBAR_WIDTH, TAB_HEIGHT, GUTTER_WIDTH, HEIGHT - TAB_HEIGHT)
}

function drawCodeLines(context, lineCount) {
  const x0 = SIDEBAR_WIDTH + GUTTER_WIDTH + 24
  for (let index = 0; index < lineCount; index += 1) {
    const line = PROGRAM[index % PROGRAM.length]
    const [indent, tokens] = line
    const y = LINE_START_Y + index * LINE_HEIGHT

    fillRoundedRect(context, SIDEBAR_WIDTH + 20, y + 4, 20, 8, 4, '#273051')

    let x = x0 + indent * 36
    tokens.forEach((width, tokenIndex) => {
      const color = TOKEN_COLORS[(index + tokenIndex) % TOKEN_COLORS.length]
      fillRoundedRect(context, x, y + 2, width, 12, 6, color)
      x += width + 14
    })
  }

  // Blinking caret on the last line.
  const caretY = LINE_START_Y + lineCount * LINE_HEIGHT
  context.fillStyle = '#eceefb'
  context.fillRect(x0, caretY, 3, 16)
}

function drawNamePanel(context, lines) {
  const panelX = SIDEBAR_WIDTH + 170
  const panelWidth = WIDTH - panelX - 140
  const panelY = 110
  const panelHeight = HEIGHT - 220

  context.save()
  context.shadowColor = 'rgba(79, 107, 255, 0.55)'
  context.shadowBlur = 60
  fillRoundedRect(context, panelX, panelY, panelWidth, panelHeight, 28, 'rgba(14, 18, 36, 0.96)')
  context.restore()

  context.strokeStyle = 'rgba(143, 157, 255, 0.35)'
  context.lineWidth = 2
  context.beginPath()
  context.roundRect(panelX, panelY, panelWidth, panelHeight, 28)
  context.stroke()

  const centerX = panelX + panelWidth / 2
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  context.save()
  context.shadowColor = 'rgba(170, 180, 255, 0.6)'
  context.shadowBlur = 24
  context.fillStyle = '#f2f3ff'
  context.font = "500 78px 'Geist Variable', system-ui, sans-serif"
  context.fillText(lines[0], centerX, panelY + panelHeight / 2 - 30)
  context.restore()

  context.fillStyle = '#aab4ff'
  context.font = "500 34px 'Geist Mono Variable', ui-monospace, monospace"
  context.fillText(lines[1], centerX, panelY + panelHeight / 2 + 48)
}

/**
 * Renders a dark code editor to a texture, and once `showName` is true
 * draws a glowing panel with the given lines on top of it.
 */
export function useCodeScreenTexture({ showName, lines, mirrorX = false }) {
  const target = useMemo(() => createCanvasTexture(WIDTH, HEIGHT, { mirrorX }), [mirrorX])

  useEffect(() => {
    const draw = () =>
      target.paint((context) => {
        drawEditorChrome(context)
        drawCodeLines(context, 17)
        if (showName) drawNamePanel(context, lines)
      })

    draw()
    // Redraw once web fonts are in so the name uses Geist, not the fallback.
    let cancelled = false
    document.fonts?.ready.then(() => {
      if (!cancelled) draw()
    })
    return () => {
      cancelled = true
    }
  }, [target, showName, lines])

  useEffect(() => () => target.dispose(), [target])

  return target.texture
}
