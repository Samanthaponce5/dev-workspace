/*
 * The visitor's display settings: the theme (chosen with the navbar
 * toggle) and text size, contrast and motion (chosen in the Display
 * settings panel). Reading, applying and remembering them.
 *
 * Applied settings live as data attributes on <html>, where the design
 * tokens and global styles pick them up (see styles/tokens.css and
 * styles/global.css). A small script in index.html restores saved
 * settings before the first paint; keep its key and attribute names in
 * step with the ones here.
 */

const STORAGE_KEY = 'display-settings'

export const DEFAULT_SETTINGS = Object.freeze({ appearance: 'dark', textSize: 'default', contrast: 'default', motion: 'system' })

/* For each setting: its data attribute on <html>, and the one value that differs from the default. */
const ATTRIBUTES = {
  appearance: { name: 'theme', value: 'light' },
  textSize: { name: 'textSize', value: 'large' },
  contrast: { name: 'contrast', value: 'high' },
  motion: { name: 'motion', value: 'reduced' },
}

const listeners = new Set()
let applied = DEFAULT_SETTINGS
let read = false

function readFromPage() {
  const { dataset } = document.documentElement
  const settings = { ...DEFAULT_SETTINGS }
  for (const [key, { name, value }] of Object.entries(ATTRIBUTES)) {
    if (dataset[name] === value) settings[key] = value
  }
  return settings
}

/** The settings in force on the page right now. */
export function getAppliedSettings() {
  if (!read && typeof document !== 'undefined') {
    applied = readFromPage()
    read = true
  }
  return applied
}

/** Keeps the browser's own toolbar colour (on phones) in step with the theme. */
export function syncBrowserColor() {
  const background = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
  if (background) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background)
}

/**
 * Puts settings into force across the site and remembers them for next
 * time. Pass only the ones that are changing; the rest stay as they are.
 */
export function applySettings(changes) {
  const settings = { ...getAppliedSettings(), ...changes }
  const { dataset } = document.documentElement
  for (const [key, { name, value }] of Object.entries(ATTRIBUTES)) {
    if (settings[key] === value) dataset[name] = value
    else delete dataset[name]
  }
  applied = settings
  read = true
  syncBrowserColor()

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applied))
  } catch {
    // Storage is blocked or full. The settings still hold until the page is closed.
  }

  listeners.forEach((listener) => listener())
}

export function subscribeToSettings(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
