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

/** A dark code editor with coloured bars standing in for lines of code. */
export function useCodeScreenTexture({ mirrorX = false } = {}) {
  const target = useMemo(() => {
    const canvasTexture = createCanvasTexture(WIDTH, HEIGHT, { mirrorX })
    canvasTexture.paint((context) => {
      drawEditorChrome(context)
      drawCodeLines(context)
    })
    return canvasTexture
  }, [mirrorX])

  useEffect(() => () => target.dispose(), [target])

  return target.texture
}
