import { lightLevels, palette } from './materials'

/**
 * Night-time room lighting: a cool ambient wash, one soft key light that
 * casts the shadows, a violet fill from the far side, and the coloured
 * glow of the LED strip. The monitor, candle and lamp carry their own
 * small lights.
 */
export function Lighting({ shadows }) {
  return (
    <>
      <ambientLight intensity={lightLevels.ambient} color="#b4b8ff" />
      <hemisphereLight intensity={lightLevels.hemisphere} color="#a39bff" groundColor="#4a2f9a" />

      <directionalLight
        position={[4, 7, 6]}
        intensity={lightLevels.key}
        color="#e6e9ff"
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

      <directionalLight position={[-5, 3, -2]} intensity={lightLevels.fill} color="#9a6bff" />

      {/* LED strip glow: blue on one side fading to violet on the other. */}
      <pointLight position={[-1.3, 1.35, -0.7]} intensity={lightLevels.led * 0.8} color={palette.ledBlue} distance={6} decay={2} />
      <pointLight position={[1.3, 1.35, -0.7]} intensity={lightLevels.led} color={palette.ledViolet} distance={6} decay={2} />
      <pointLight position={[0, 1.08, -0.4]} intensity={lightLevels.led * 0.5} color={palette.ledViolet} distance={3.5} decay={2} />
      {/* Violet pooling on the floor under the desk. */}
      <pointLight position={[0.4, 0.5, 0.2]} intensity={lightLevels.led * 0.8} color="#9a5bff" distance={5} decay={2} />
    </>
  )
}
