import { lightLevels, palette } from './materials'

/**
 * Night-time room lighting. A near-white ambient wash and key light keep
 * everyone's colours true; a faint teal fill ties the scene to the page.
 * The LED strip's aqua light is deliberately short-range, so it pools on
 * the shelf, the back of the desk and the floor beneath, and nowhere else.
 * The monitor, candle and lamp carry their own small lights.
 */
export function Lighting({ shadows }) {
  return (
    <>
      <ambientLight intensity={lightLevels.ambient} color="#e4ecef" />
      <hemisphereLight intensity={lightLevels.hemisphere} color="#d6e6e8" groundColor="#17363c" />

      <directionalLight
        position={[4, 7, 6]}
        intensity={lightLevels.key}
        color="#fff6ea"
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

      <directionalLight position={[-5, 3, -2]} intensity={lightLevels.fill} color="#9fd6d6" />

      {/* LED strip: three short-range aqua lights along the shelf, one under the desk. */}
      {[-1.2, 0, 1.2].map((x) => (
        <pointLight key={x} position={[x, 1.3, -0.62]} intensity={lightLevels.led} color={palette.led} distance={lightLevels.ledReach} decay={2} />
      ))}
      <pointLight position={[0, 0.55, -0.35]} intensity={lightLevels.led} color={palette.led} distance={lightLevels.ledReach * 1.3} decay={2} />
    </>
  )
}
