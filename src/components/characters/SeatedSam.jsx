import { useCallback, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { Chair } from '../three/Chair'
import { SpeechBubble } from '../three/SpeechBubble'
import { facingAngle, INTRO, setWorkingPose, writeHoverPose, writeIntroPose } from './greeting'
import { MiniSam } from './MiniSam'

/* The bubble's tail points here: above her head, clear of the waving hand. */
const BUBBLE_ANCHOR = [0, 2.04, 0]

/**
 * Mini-Samantha in her chair.
 *
 * She begins facing the visitor. Once `introStarted` is true (the scene
 * has faded in) she waves with a "Hi there!" bubble, then turns to the
 * desk and types. After that, hovering or clicking makes her spin the
 * chair round and wave again. A greeting in progress is never interrupted
 * or restarted, so hover can't cut the intro short.
 *
 * `cameraAzimuth` is the camera's angle around the desk, used to work
 * out how far the chair turns to face the visitor.
 */
export function SeatedSam({ position, cameraAzimuth, introStarted, animate = true, shadows }) {
  const swivelRef = useRef(null)
  const face = facingAngle(cameraAzimuth)
  const poseRef = useRef({ angle: face, typing: 0, wave: 0, bounce: 0, bubble: false })
  // kind: 'intro' | 'hover' | null (working). start: ms timestamp, or null while the intro waits.
  const greeting = useRef({ kind: 'intro', start: null })
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const bubbleShown = useRef(false)
  const hover = useHoverCursor()

  useEffect(() => {
    const current = greeting.current
    if (introStarted && current.kind === 'intro' && current.start === null) {
      current.start = performance.now() + INTRO.delay * 1000
    }
  }, [introStarted])

  const greet = useCallback(() => {
    if (greeting.current.kind) return
    greeting.current = { kind: 'hover', start: performance.now() }
  }, [])
  useSceneEvent('sam:greet', greet)

  useFrame(() => {
    const swivel = swivelRef.current
    if (!swivel) return
    const pose = poseRef.current
    const { kind, start } = greeting.current

    if (kind) {
      const t = start === null ? -1 : (performance.now() - start) / 1000
      const write = kind === 'intro' ? writeIntroPose : writeHoverPose
      if (write(pose, t, face, animate)) greeting.current = { kind: null, start: null }
    }
    if (!greeting.current.kind) setWorkingPose(pose)

    swivel.rotation.y = pose.angle
    // Only touch React state on the frames where the bubble appears or goes.
    if (pose.bubble !== bubbleShown.current) {
      bubbleShown.current = pose.bubble
      setBubbleVisible(pose.bubble)
    }
  })

  return (
    <group position={position}>
      <group
        {...hover}
        onPointerOver={(event) => {
          hover.onPointerOver(event)
          greet()
        }}
        onClick={(event) => {
          event.stopPropagation()
          greet()
        }}
      >
        {/* The chair faces the desk (-Z). */}
        <Chair rotation={[0, Math.PI, 0]} swivelRef={swivelRef} shadows={shadows}>
          <MiniSam poseRef={poseRef} animate={animate} shadows={shadows} />
        </Chair>
      </group>

      {bubbleVisible && <SpeechBubble position={BUBBLE_ANCHOR}>{sceneContent.samGreeting}</SpeechBubble>}
    </group>
  )
}
