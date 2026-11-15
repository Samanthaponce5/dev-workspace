import { lightLevels, palette } from './materials'

/**
 * Night-time room lighting: a dim cool ambient, one soft key light that
 * casts the shadows, and the coloured glow from the LED strip. The monitor,
 * candle and lamp carry their own small lights.
 */
export function Lighting({ shadows }) {
  return (
    <>
      <ambientLight intensity={lightLevels.ambient} color="#9aa6ff" />
      <hemisphereLight intensity={0.35} color="#6f7cff" groundColor="#1a1030" />

      <directionalLight
        position={[4, 7, 5]}
        intensity={lightLevels.key}
        color="#dfe5ff"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />

      <directionalLight position={[-5, 3, -2]} intensity={lightLevels.fill} color="#8a5bff" />

      {/* LED strip glow: blue on one side fading to violet on the other. */}
      <pointLight position={[-1.3, 1.35, -0.75]} intensity={lightLevels.led} color={palette.ledBlue} distance={5} decay={2} />
      <pointLight position={[1.3, 1.35, -0.75]} intensity={lightLevels.led} color={palette.ledViolet} distance={5} decay={2} />
      <pointLight position={[0, 1.08, -0.45]} intensity={lightLevels.led * 0.5} color={palette.ledBlue} distance={3} decay={2} />
    </>
  )
}
