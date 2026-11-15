import { lazy, Suspense, useCallback, useState } from 'react'
import { scene } from '../../content/content'
import { useCanRender3D } from '../../hooks/useCanRender3D'
import { useInView } from '../../hooks/useInView'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePageVisible } from '../../hooks/usePageVisible'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRelativeFrame } from '../../hooks/useRelativeFrame'
import { HeroFallback } from './HeroFallback'
import { SceneControls } from './SceneControls'
import { ScenePlaceholder } from './ScenePlaceholder'
import styles from './HeroScene.module.css'

/* three.js is only downloaded when the scene is going to be shown. */
const DeskScene = lazy(() => import('../../components/three/DeskScene'))

/**
 * The hero's 3D layer. Covers the whole hero and fits the diorama to the
 * stage slot.
 *
 * First load: the canvas stays invisible until the scene reports that it
 * has drawn completely, with a soft glow holding its place. Then the
 * finished scene fades in and the characters start their greeting, so
 * visitors never see a half-built desk. Nothing here affects layout, so
 * the page doesn't shift while the scene loads.
 *
 * Falls back to a static illustration when WebGL is missing or the device
 * is low-power, and pauses rendering whenever the hero scrolls off screen
 * or the tab is hidden.
 */
export function HeroScene({ containerRef, stageRef }) {
  const canRender3D = useCanRender3D()
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const pageVisible = usePageVisible()
  const frame = useRelativeFrame(containerRef, stageRef)
  const [sceneRef, inView] = useInView({ rootMargin: '120px' })
  const [ready, setReady] = useState(false)
  const markReady = useCallback(() => setReady(true), [])

  if (!canRender3D) {
    return (
      <div className={styles.scene}>
        <HeroFallback frame={frame} label={scene.description} />
      </div>
    )
  }

  return (
    <div ref={sceneRef} className={styles.scene}>
      <ScenePlaceholder frame={frame} hidden={ready} />

      <div className={styles.canvas} data-ready={ready || undefined}>
        {/* Wait for the stage to be measured so the camera is right on its first frame. */}
        {frame && (
          <Suspense fallback={null}>
            <DeskScene
              scene={scene}
              frame={frame}
              active={inView && pageVisible}
              animate={!reducedMotion}
              isMobile={isMobile}
              introStarted={ready}
              onReady={markReady}
            />
          </Suspense>
        )}
      </div>

      {ready && <SceneControls labels={scene.controls} />}
    </div>
  )
}
