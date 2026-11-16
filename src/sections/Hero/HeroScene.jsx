import { useCallback, useEffect, useState } from 'react'
import { scene } from '../../content/content'
import { canRender3D } from '../../hooks/useCanRender3D'
import { useInView } from '../../hooks/useInView'
import { useIntroDone } from '../../hooks/useIntroDone'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePageVisible } from '../../hooks/usePageVisible'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useRelativeFrame } from '../../hooks/useRelativeFrame'
import { revealIntro } from '../../intro/reveal'
import { isIntroDone } from '../../utils/intro'
import { SceneControls } from './SceneControls'
import { ScenePoster } from './ScenePoster'
import styles from './HeroScene.module.css'

/*
 * The 3D bundle starts downloading the moment this file is evaluated,
 * alongside the first render, rather than waiting for the hero to mount.
 * (index.html also preloads it, so on a slow connection it is usually
 * already on its way.)
 */
const liveScene = { Component: null }
const liveSceneLoaded = canRender3D
  ? import('../../components/three/DeskScene').then((module) => {
      liveScene.Component = module.default
    })
  : null

/* How long after the page opened to keep waiting for the live scene before revealing with the still image. */
const LIVE_WAIT_MS = 4500
/* The still image is only fetched this long before it might be needed, so it never competes with the 3D bundle. */
const POSTER_LEAD_MS = 1500
/* The reveal lands the logo on the navbar's text, so it gives the fonts this long to arrive first. */
const FONT_WAIT_MS = 700

/*
 * True once the scene's bundle has loaded and `liveScene.Component` can
 * be rendered. This is plain state rather than React.lazy with Suspense,
 * because React deliberately waits about 300ms before replacing a
 * Suspense fallback, which delayed the canvas for no reason.
 */
function useLiveSceneLoaded() {
  const [loaded, setLoaded] = useState(liveScene.Component !== null)
  useEffect(() => {
    let cancelled = false
    liveSceneLoaded?.then(
      () => {
        if (!cancelled) setLoaded(true)
      },
      () => {}, // a failed download falls through to the still image
    )
    return () => {
      cancelled = true
    }
  }, [])
  return loaded
}

/* True after `ms` have passed since the page opened. */
function useElapsedSinceLoad(ms) {
  const [elapsed, setElapsed] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(() => setElapsed(true), Math.max(0, ms - performance.now()))
    return () => window.clearTimeout(id)
  }, [ms])
  return elapsed
}

/* True once the web fonts are in, or `ms` after mounting, whichever is first. */
function useFontsSettled(ms) {
  const [settled, setSettled] = useState(false)
  useEffect(() => {
    let cancelled = false
    const settle = () => {
      if (!cancelled) setSettled(true)
    }
    const id = window.setTimeout(settle, ms)
    ;(document.fonts?.ready ?? Promise.resolve()).then(settle)
    return () => {
      cancelled = true
      window.clearTimeout(id)
    }
  }, [ms])
  return settled
}

/**
 * The hero's 3D layer. Covers the whole hero and fits the diorama to the
 * stage slot.
 *
 * Loading: the canvas mounts at its final size behind the intro overlay
 * and renders there. As soon as it has drawn one complete frame, the
 * intro's reveal plays over a landing page that is already assembled, and
 * the characters' greeting starts the moment the reveal clears.
 *
 * If WebGL is missing, the device is low-power, or the live scene is
 * taking unusually long, the reveal goes ahead with a still image of the
 * finished scene in the same position. A live scene that turns up later
 * fades in over that image without moving anything, and the greeting
 * plays then.
 *
 * Rendering pauses whenever the hero scrolls off screen or the tab is
 * hidden.
 */
export function HeroScene({ containerRef, stageRef }) {
  const reducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const pageVisible = usePageVisible()
  const introDone = useIntroDone()
  const frame = useRelativeFrame(containerRef, stageRef)
  const [sceneRef, inView] = useInView({ rootMargin: '120px' })
  const sceneLoaded = useLiveSceneLoaded()
  const waitedTooLong = useElapsedSinceLoad(LIVE_WAIT_MS)
  const posterMayBeNeeded = useElapsedSinceLoad(LIVE_WAIT_MS - POSTER_LEAD_MS)
  const fontsSettled = useFontsSettled(FONT_WAIT_MS)

  // `live`: the 3D scene has drawn a complete frame. `late`: it did so after the intro had already cleared.
  const [{ live, late }, setScene] = useState({ live: false, late: false })
  const [posterSettled, setPosterSettled] = useState(false)
  const markLive = useCallback(() => setScene({ live: true, late: isIntroDone() }), [])
  const settlePoster = useCallback(() => setPosterSettled(true), [])

  useEffect(() => {
    if (introDone || !fontsSettled) return
    if (live) revealIntro({ toShelf: true, reducedMotion })
    else if ((!canRender3D || waitedTooLong) && posterSettled) revealIntro({ toShelf: false, reducedMotion })
  }, [introDone, fontsSettled, live, waitedTooLong, posterSettled, reducedMotion])

  const showing = live && introDone

  return (
    <div ref={sceneRef} className={styles.scene}>
      {/* On a normal load the live scene is ready first and the still image is never downloaded. */}
      {(!canRender3D || (posterMayBeNeeded && !(live && !late))) && (
        <ScenePoster
          frame={frame}
          isMobile={isMobile}
          hidden={live}
          late={late}
          label={canRender3D ? undefined : scene.description}
          onSettled={settlePoster}
        />
      )}

      {canRender3D && (
        <>
          <div className={styles.canvas} data-ready={live || undefined} data-late={late || undefined}>
            {/* Wait for the stage to be measured so the camera is right on its first frame. */}
            {sceneLoaded && frame && (
              <liveScene.Component
                scene={scene}
                frame={frame}
                active={inView && pageVisible}
                animate={!reducedMotion}
                isMobile={isMobile}
                sceneStarted={showing}
                introStarted={showing}
                onReady={markLive}
              />
            )}
          </div>
          {showing && <SceneControls labels={scene.controls} />}
        </>
      )}
    </div>
  )
}
