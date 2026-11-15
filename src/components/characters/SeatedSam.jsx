import { useCallback, useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { scene as sceneContent } from '../../content/content'
import { useHoverCursor } from '../../hooks/useHoverCursor'
import { useSceneEvent } from '../../hooks/useSceneEvent'
import { emitSceneEvent } from '../../utils/sceneEvents'
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
 * desk and types; when that turn is complete she emits "intro:finished",
 * which is the duck's cue. After that, hovering or clicking makes her spin
 * the chair round and wave again. A greeting in progress is never interrupted
 * or restarted, so hover can't cut the intro short.
 *
 * `cameraAzimuth` is the camera's angle around the desk, used to work
 * out how far the chair turns to face the visitor.
 */
export function SeatedSam({ position, cameraAzimuth, introStarted, animate = true, shadows }) {
  const swivelRef = useRef(null)
  const face = facingAngle(cameraAzimuth)
  const poseRef = useRef({ angle: face, typing: 0, wave: 0, bounce: 0, bubble: false, bubbleLeaving: false })
  // kind: 'intro' | 'hover' | null (working). start: ms timestamp, or null while the intro waits.
  const greeting = useRef({ kind: 'intro', start: null })
  // 'hidden' | 'shown' | 'leaving' (fading out). Follows the greeting timeline.
  const [bubble, setBubble] = useState('hidden')
  const bubbleState = useRef('hidden')
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
      if (write(pose, t, face, animate)) {
        greeting.current = { kind: null, start: null }
        if (kind === 'intro') emitSceneEvent('intro:finished')
      }
    }
    if (!greeting.current.kind) setWorkingPose(pose)

    swivel.rotation.y = pose.angle
    // Only touch React state on the frames where the bubble's state changes.
    const nextBubble = !pose.bubble ? 'hidden' : pose.bubbleLeaving ? 'leaving' : 'shown'
    if (nextBubble !== bubbleState.current) {
      bubbleState.current = nextBubble
      setBubble(nextBubble)
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

      {bubble !== 'hidden' && (
        <SpeechBubble position={BUBBLE_ANCHOR} leaving={bubble === 'leaving'}>
          {sceneContent.samGreeting}
        </SpeechBubble>
      )}
    </group>
  )
}
