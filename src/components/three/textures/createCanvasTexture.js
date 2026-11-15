import * as THREE from 'three'

/**
 * An offscreen canvas wrapped with a three.js texture.
 *
 * All drawing goes through `paint`, which hands the 2D context to a draw
 * function and then flags the texture for upload. Keeping the mutation
 * inside this object means components never poke at the texture directly.
 */
export function createCanvasTexture(width, height, { mirrorX = false } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4

  if (mirrorX) {
    // Used when a surface is viewed from its back face, which flips U.
    texture.wrapS = THREE.RepeatWrapping
    texture.repeat.x = -1
    texture.offset.x = 1
  }

  return {
    texture,
    width,
    height,
    paint(draw) {
      draw(context, width, height)
      texture.needsUpdate = true
    },
    tile(repeatX, repeatY) {
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(repeatX, repeatY)
      texture.needsUpdate = true
    },
    dispose() {
      texture.dispose()
    },
  }
}

/** Draws a rounded rectangle path and fills it. */
export function fillRoundedRect(context, x, y, width, height, radius, fill) {
  context.beginPath()
  context.roundRect(x, y, width, height, radius)
  context.fillStyle = fill
  context.fill()
}
