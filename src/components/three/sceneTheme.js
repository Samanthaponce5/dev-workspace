import { useSyncExternalStore } from 'react'
import { getAppliedSettings, subscribeToSettings } from '../../utils/displaySettings'

/*
 * The parts of the 3D scene that change with the site's theme: the
 * platform, the LED strips and the jellyfish lamp. Their values are the --scene-* custom
 * properties in styles/tokens.css, beside the page's own colours, so one
 * file holds each theme's whole palette.
 */
function readSceneTheme() {
  const tokens = getComputedStyle(document.documentElement)
  const token = (name) => tokens.getPropertyValue(name).trim()
  return {
    platform: token('--scene-platform'),
    platformSide: token('--scene-platform-side'),
    led: token('--scene-led'),
    ledLight: Number(token('--scene-led-light')),
    ledGlow: Number(token('--scene-led-glow')),
    jelly: token('--scene-jelly'),
    jellyGlow: Number(token('--scene-jelly-glow')),
    jellyTentacleGlow: Number(token('--scene-jelly-tentacle-glow')),
    jellyEdge: token('--scene-jelly-edge') === 'none' ? null : token('--scene-jelly-edge'),
    lampWater: token('--scene-lamp-water'),
    lampWaterGlow: Number(token('--scene-lamp-water-glow')),
    lampWaterOpacity: Number(token('--scene-lamp-water-opacity')),
    lampGlass: token('--scene-lamp-glass'),
    lampGlassOpacity: Number(token('--scene-lamp-glass-opacity')),
    lampLight: token('--scene-lamp-light'),
    lampLightLevel: Number(token('--scene-lamp-light-level')),
  }
}

let current = { appearance: null, theme: null }

/* Read again only when the theme has actually changed, so the same object comes back between renders. */
function getSceneTheme() {
  const { appearance } = getAppliedSettings()
  if (current.appearance !== appearance) current = { appearance, theme: readSceneTheme() }
  return current.theme
}

/**
 * The scene's colours and light levels for the current theme. Components
 * pass them straight to their materials and lights, which three.js then
 * changes in place: nothing in the scene is rebuilt when the theme flips.
 */
export function useSceneTheme() {
  return useSyncExternalStore(subscribeToSettings, getSceneTheme)
}
