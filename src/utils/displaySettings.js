/*
 * The visitor's display settings: which ones exist, and reading, applying
 * and remembering them.
 *
 * Applied settings live as data attributes on <html>, where the design
 * tokens and global styles pick them up (see styles/tokens.css and
 * styles/global.css). A small script in index.html restores saved
 * settings before the first paint; keep its key and attribute names in
 * step with the ones here.
 */

const STORAGE_KEY = 'display-settings'

export const DEFAULT_SETTINGS = Object.freeze({ textSize: 'default', contrast: 'default', motion: 'system' })

/* For each setting: its data attribute on <html>, and the one value that differs from the default. */
const ATTRIBUTES = {
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

/** Puts the settings into force across the site and remembers them for next time. */
export function applySettings(settings) {
  const { dataset } = document.documentElement
  for (const [key, { name, value }] of Object.entries(ATTRIBUTES)) {
    if (settings[key] === value) dataset[name] = value
    else delete dataset[name]
  }
  applied = { ...settings }
  read = true

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

export function sameSettings(a, b) {
  return Object.keys(DEFAULT_SETTINGS).every((key) => a[key] === b[key])
}
