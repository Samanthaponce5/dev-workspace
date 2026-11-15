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

/* Right half of the screen: a browser DevTools panel on its Network tab. */
const PANE = { x: 874, y: 14, width: 646, height: 484 }
const ROWS = { tabs: 52, overview: 46, filters: 50, header: 32, request: 64, highlighted: 92, footer: 34 }
const COLUMNS = { name: 22, status: 360, waterfall: 520 }

const SANS = "'Geist Variable', system-ui, sans-serif"
const MONO = "'Geist Mono Variable', ui-monospace, monospace"
const BLUE = '#8ab4f8'
const GREEN = '#81c995'
const MUTED = '#9aa0a6'

/* Where each request's bar sits in the waterfall: [start, length] as fractions. */
const WATERFALL = [
  [0.04, 0.3],
  [0.22, 0.62],
  [0.6, 0.28],
]

function drawDevTools(context, content) {
  const { x, y, width, height } = PANE
  const right = x + width

  fillRoundedRect(context, x, y, width, height, 12, '#202124')
  context.save()
  context.beginPath()
  context.roundRect(x, y, width, height, 12)
  context.clip()
  context.textAlign = 'left'
  context.textBaseline = 'alphabetic'

  // Tab bar, with the open tab large enough to act as the panel's heading
  context.fillStyle = '#292a2d'
  context.fillRect(x, y, width, ROWS.tabs)
  let cursor = x + 20
  content.tabs.forEach((tab) => {
    const active = tab === content.activeTab
    context.font = active ? `700 31px ${SANS}` : `500 21px ${SANS}`
    context.fillStyle = active ? '#ffffff' : MUTED
    context.fillText(tab, cursor, y + 35)
    const tabWidth = context.measureText(tab).width
    if (active) {
      context.fillStyle = BLUE
      context.fillRect(cursor, y + ROWS.tabs - 5, tabWidth, 5)
    }
    cursor += tabWidth + 26
  })

  // Timeline overview: tick marks and a few coloured bars
  let top = y + ROWS.tabs
  context.fillStyle = '#1a1b1e'
  context.fillRect(x, top, width, ROWS.overview)
  context.fillStyle = '#303134'
  for (let tick = x + 60; tick < right; tick += 84) context.fillRect(tick, top, 2, ROWS.overview)
  ;[
    [0.05, 0.2, '#f6ae2d', 10],
    [0.18, 0.34, BLUE, 20],
    [0.3, 0.42, GREEN, 30],
    [0.66, 0.2, BLUE, 16],
  ].forEach(([start, length, color, offset]) => fillRoundedRect(context, x + start * width, top + offset, length * width, 6, 3, color))

  // Filter chips, with the active one filled in
  top += ROWS.overview
  cursor = x + 18
  content.filters.forEach((filter) => {
    const active = filter === content.activeFilter
    context.font = active ? `700 23px ${SANS}` : `500 21px ${SANS}`
    const chipWidth = context.measureText(filter).width + 26
    if (active) fillRoundedRect(context, cursor, top + 9, chipWidth, 33, 16.5, 'rgba(138, 180, 248, 0.28)')
    context.fillStyle = active ? '#d2e3fc' : MUTED
    context.fillText(filter, cursor + 13, top + 33)
    cursor += chipWidth + 6
  })

  // Column headings
  top += ROWS.filters
  context.fillStyle = '#292a2d'
  context.fillRect(x, top, width, ROWS.header)
  context.font = `500 17px ${SANS}`
  context.fillStyle = MUTED
  context.fillText('Name', x + COLUMNS.name, top + 22)
  context.fillText('Status', x + COLUMNS.status, top + 22)
  context.fillText('Waterfall', x + COLUMNS.waterfall, top + 22)

  // Requests
  top += ROWS.header
  const waterfallWidth = width - COLUMNS.waterfall - 18
  content.requests.forEach((request, index) => {
    const rowHeight = request.highlight ? ROWS.highlighted : ROWS.request
    const middle = top + rowHeight / 2

    if (request.highlight) {
      context.fillStyle = 'rgba(138, 180, 248, 0.17)'
      context.fillRect(x, top, width, rowHeight)
      context.fillStyle = BLUE
      context.fillRect(x, top, 6, rowHeight)
    }

    context.font = request.highlight ? `700 22px ${MONO}` : `500 19px ${MONO}`
    context.fillStyle = request.highlight ? BLUE : '#7d848c'
    context.fillText(request.method, x + COLUMNS.name, middle + 8)
    const methodWidth = context.measureText(request.method).width

    context.font = request.highlight ? `700 33px ${MONO}` : `500 23px ${MONO}`
    context.fillStyle = request.highlight ? '#ffffff' : '#bdc1c6'
    context.fillText(request.path, x + COLUMNS.name + methodWidth + 12, middle + (request.highlight ? 11 : 8))

    if (request.highlight) {
      context.beginPath()
      context.arc(x + COLUMNS.status + 8, middle, 8, 0, Math.PI * 2)
      context.fillStyle = GREEN
      context.fill()
      context.font = `700 29px ${MONO}`
      context.fillText(request.status, x + COLUMNS.status + 24, middle + 10)
    } else {
      context.font = `500 22px ${MONO}`
      context.fillStyle = MUTED
      context.fillText(request.status, x + COLUMNS.status, middle + 8)
    }

    const [start, length] = WATERFALL[index % WATERFALL.length]
    const barHeight = request.highlight ? 16 : 10
    const barX = x + COLUMNS.waterfall + start * waterfallWidth
    fillRoundedRect(context, barX - 12, middle - 1, 12, 2, 1, '#5f6368')
    fillRoundedRect(context, barX, middle - barHeight / 2, length * waterfallWidth, barHeight, barHeight / 2, request.highlight ? GREEN : BLUE)

    context.fillStyle = '#303134'
    context.fillRect(x, top + rowHeight - 1, width, 1)
    top += rowHeight
  })

  // Status bar
  context.fillStyle = '#292a2d'
  context.fillRect(x, y + height - ROWS.footer, width, ROWS.footer)
  context.font = `500 17px ${SANS}`
  context.fillStyle = MUTED
  context.fillText(content.summary, x + COLUMNS.name, y + height - 11)

  context.restore()
  context.strokeStyle = 'rgba(174, 222, 209, 0.25)'
  context.lineWidth = 2
  context.beginPath()
  context.roundRect(x, y, width, height, 12)
  context.stroke()
}

/**
 * The monitor's picture: a code editor on the left; on the right, a
 * browser DevTools panel on its Network tab with one request picked out.
 * `content` supplies the words (see `scene.monitor` in content.js).
 */
export function useCodeScreenTexture({ content, mirrorX = false }) {
  const target = useMemo(() => createCanvasTexture(WIDTH, HEIGHT, { mirrorX }), [mirrorX])

  useEffect(() => {
    const draw = () =>
      target.paint((context) => {
        drawEditorChrome(context)
        drawCodeLines(context)
        drawDevTools(context, content)
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
