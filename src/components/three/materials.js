/*
 * Colours shared across the 3D scene so the whole diorama can be retuned
 * in one place. Values are plain hex strings that three.js parses.
 */
export const palette = {
  platform: '#131730',
  platformEdge: '#1b2142',
  deskWood: '#1a1619',
  deskGrain: '#2a2328',
  metalDark: '#2a2c33',
  monitorBody: '#15161b',
  screenBg: '#0b0e17',
  laptopBody: '#3b3e46',
  laptopKeys: '#23252b',
  chairBlack: '#121318',
  chairWhite: '#e9e9ee',
  ledBlue: '#4f6bff',
  ledViolet: '#8a5bff',
  clockWood: '#5a3b23',
  clockFace: '#1a120c',
  terracotta: '#b5633a',
  soil: '#2a1e16',
  leaf: '#3f8f4f',
  leafLight: '#63b06f',
  planter: '#7f8ea0',
  succulent: '#5f9a56',
  candleGlass: '#c8743a',
  candleWax: '#f3dcc2',
  flame: '#ffb347',
  lampGlass: '#a8c8ff',
  lampWater: '#2a62ff',
  jelly: '#ffd3ee',
  duck: '#ffd23f',
  duckBeak: '#ff8a3d',
  cup: '#2a2a30',
  pens: ['#ff6b6b', '#4f6bff', '#ffd23f', '#63b06f', '#f0f0f5'],
  bottle: '#cfe3ff',
  bottleCap: '#2f6fe6',
  glass: '#dbe8ff',
}

/* Light levels used by Lighting.jsx and the glowing props. */
export const lightLevels = {
  ambient: 0.35,
  key: 1.6,
  fill: 0.6,
  led: 6,
  monitor: 3,
  candle: 1.2,
  lamp: 2,
}
