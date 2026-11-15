/*
 * Colours shared across the 3D scene so the whole diorama can be retuned
 * in one place. Values are plain hex strings that three.js parses.
 */
export const palette = {
  platform: '#2d6069',
  platformSide: '#0f3540',
  deskWood: '#1c1c1f',
  deskGrain: '#2c2c31',
  metalDark: '#2a2c33',
  monitorBody: '#15161b',
  laptopBody: '#3b3e46',
  laptopKeys: '#23252b',
  chairBlack: '#15161c',
  chairWhite: '#f1f1f5',
  led: '#71c9c8',
  screenGlow: '#cfe4f2',
  clockWood: '#5a3b23',
  clockFace: '#1a120c',
  candleGlass: '#c8743a',
  candleWax: '#f3dcc2',
  flame: '#ffb347',
  lampGlass: '#b6dfe6',
  lampWater: '#2f8fb8',
  lampLight: '#8fdbe6',
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
  hair: '#3b2416',
  top: '#1e2658',
  jeans: '#4470b8',
  shoes: '#f1f1f5',
  eye: '#3a2012',
  lash: '#24150c',
  brow: '#4a2f1f',
  blush: '#f29a9a',
  mouth: '#a8504a',
}

/* Andy the Shih Tzu. */
export const andyPalette = {
  body: '#9b6a40',
  tan: '#b98f5e',
  crown: '#cfa671',
  mask: '#5a4a41',
  muzzle: '#473a34',
  whiskers: '#a89684',
  ear: '#3d2b22',
  white: '#f4efe8',
  nose: '#121212',
  eye: '#1c120c',
  tongue: '#f08aa0',
}

/*
 * Light levels used by Lighting.jsx and the glowing props.
 * The general lighting is close to white so skin, fur, the duck and the
 * code on screen keep their own colours. The aqua LED light is weak and
 * short-range, so it only tints the surfaces right next to the strip.
 */
export const lightLevels = {
  ambient: 0.85,
  hemisphere: 0.6,
  key: 2.5,
  fill: 0.55,
  led: 2.4,
  ledReach: 2.1,
  monitor: 2.6,
  candle: 1.8,
  lamp: 1.4,
}
