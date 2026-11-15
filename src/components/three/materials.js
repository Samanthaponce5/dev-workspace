/*
 * Colours shared across the 3D scene so the whole diorama can be retuned
 * in one place. Values are plain hex strings that three.js parses.
 */
export const palette = {
  platform: '#2a2570',
  platformSide: '#1b1850',
  deskWood: '#1f1a22',
  deskGrain: '#32293a',
  metalDark: '#2a2c33',
  monitorBody: '#15161b',
  laptopBody: '#3b3e46',
  laptopKeys: '#23252b',
  chairBlack: '#15161c',
  chairWhite: '#f1f1f5',
  ledBlue: '#4f6bff',
  ledViolet: '#a05bff',
  clockWood: '#5a3b23',
  clockFace: '#1a120c',
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
  mug: '#f1ede6',
  coffee: '#3b2416',
}

/* Mini-Samantha. */
export const samPalette = {
  skin: '#e8b490',
  hairDark: '#3a2417',
  hairMid: '#6b4226',
  hairLight: '#c08d5a',
  top: '#1e2658',
  jeans: '#4470b8',
  shoes: '#f1f1f5',
  eye: '#2e1a10',
  blush: '#f29a9a',
  mouth: '#a8504a',
}

/* Andy the Shih Tzu. */
export const andyPalette = {
  coat: '#8b6844',
  gold: '#c9a56e',
  grey: '#a3957f',
  ear: '#4b3323',
  white: '#f4efe8',
  nose: '#121212',
  eye: '#1c120c',
  tongue: '#f08aa0',
}

/* Light levels used by Lighting.jsx and the glowing props. */
export const lightLevels = {
  ambient: 0.75,
  hemisphere: 0.7,
  key: 2.3,
  fill: 1.1,
  led: 6,
  monitor: 4,
  candle: 1.4,
  lamp: 2.4,
}
