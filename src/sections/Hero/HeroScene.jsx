import { lazy, Suspense } from 'react'
import { scene } from '../../content/content'
import { useCanRender3D } from '../../hooks/useCanRender3D'
import { useInView } from '../../hooks/useInView'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePageVisible } from '../../hooks/usePageVisible'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRelativeFrame } from '../../hooks/useRelativeFrame'
import { HeroFallback } from './HeroFallback'
import { SceneControls } from './SceneControls'
import styles from './HeroScene.module.css'

/* three.js is only downloaded when the scene is going to be shown. */
const DeskScene = lazy(() => import('../../components/three/DeskScene'))

/**
 * The hero's 3D layer. Covers the whole hero and fits the diorama to the
 * stage slot. Falls back to a static illustration when WebGL is missing
 * or the device is low-power, and pauses rendering whenever the hero
 * scrolls off screen or the tab is hidden.
 */
export function HeroScene({ containerRef, stageRef }) {
  const canRender3D = useCanRender3D()
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const pageVisible = usePageVisible()
  const frame = useRelativeFrame(containerRef, stageRef)
  const [sceneRef, inView] = useInView({ rootMargin: '120px' })

  return (
    <div ref={sceneRef} className={styles.scene}>
      {canRender3D ? (
        <>
          <Suspense fallback={<HeroFallback frame={frame} loading />}>
            <div className={styles.canvas}>
              <DeskScene
                scene={scene}
                frame={frame}
                active={inView && pageVisible}
                animate={!reducedMotion}
                isMobile={isMobile}
              />
            </div>
          </Suspense>
          <SceneControls labels={scene.controls} />
        </>
      ) : (
        <HeroFallback frame={frame} label={scene.description} />
      )}
    </div>
  )
}
