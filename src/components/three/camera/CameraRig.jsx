import { useLayoutEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { fitCameraToFrame } from './fitCamera'

/** Keeps the camera fitted to the stage frame as the canvas or layout changes. */
export function CameraRig({ view, frame }) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)

  useLayoutEffect(() => {
    fitCameraToFrame(camera, size, view, frame)
    invalidate()
  }, [camera, size, view, frame, invalidate])

  return null
}
