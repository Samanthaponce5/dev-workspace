import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TURN_AMPLITUDE = 0.07 // radians, about 4 degrees each way
const TURN_SPEED = 0.25
const BOB_AMPLITUDE = 0.025
const PARALLAX_YAW = 0.16
const PARALLAX_PITCH = 0.07

/**
 * Wraps the diorama in a group that floats, slowly turns, and tilts a
 * little toward the pointer. The pointer is tracked on the whole window
 * so the tilt responds while the cursor is over the hero text too.
 *
 * Nothing moves until `started` is true, and the float and turn are timed
 * from that moment. So the scene's first visible frame is always its
 * rest position, which is what the static poster image shows.
 */
export function SceneRig({ animate = true, parallax = true, started = true, children }) {
  const groupRef = useRef(null)
  const pointer = useRef({ x: 0, y: 0 })
  const startedAt = useRef(null)

  useEffect(() => {
    if (!parallax) return undefined
    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [parallax])

  useFrame(({ clock }, delta) => {
    const group = groupRef.current
    if (!group) return

    if (!started) return
    startedAt.current ??= clock.elapsedTime
    const t = clock.elapsedTime - startedAt.current
    const turn = animate ? Math.sin(t * TURN_SPEED) * TURN_AMPLITUDE : 0
    const bob = animate ? Math.sin(t * 0.8) * BOB_AMPLITUDE : 0

    const targetYaw = turn + pointer.current.x * PARALLAX_YAW
    const targetPitch = pointer.current.y * PARALLAX_PITCH
    const smoothing = 1 - Math.exp(-delta * 4)

    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetYaw, smoothing)
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetPitch, smoothing)
    group.position.y = bob
  })

  return <group ref={groupRef}>{children}</group>
}
