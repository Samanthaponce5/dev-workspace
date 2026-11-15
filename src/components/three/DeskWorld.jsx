import { Chair } from './Chair'
import { Desk } from './Desk'
import { CHAIR_POSITION, DESK, SHELF_Y, SHELF_Z, WORLD_OFFSET_Y } from './dimensions'
import { Laptop } from './Laptop'
import { LedStrip } from './LedStrip'
import { Lighting } from './Lighting'
import { Monitor } from './Monitor'
import { Platform } from './Platform'
import { Candle } from './props/Candle'
import { Clock } from './props/Clock'
import { Glass, PencilCup, WaterBottle } from './props/DeskClutter'
import { JellyfishLamp } from './props/JellyfishLamp'
import { PottedPlant, Succulent } from './props/Plants'
import { RubberDuck } from './props/RubberDuck'
import { SceneRig } from './SceneRig'

const DESK_Y = DESK.height

/**
 * Everything in the diorama, laid out to match the real desk:
 * monitor centred on the riser with the clock and lamp either side of
 * it, laptop in front, plants and candle on the left, chair pulled up.
 */
export function DeskWorld({ scene, animate, parallax, shadows, simplified }) {
  return (
    <SceneRig animate={animate} parallax={parallax}>
      <group position={[0, WORLD_OFFSET_Y, 0]}>
        <Lighting shadows={shadows} />
        <Platform shadows={shadows} />
        <Desk shadows={shadows} />
        <LedStrip />
        <Monitor lines={scene.monitorLines} shadows={shadows} />
        <Laptop position={[0.05, 0, 0.12]} shadows={shadows} />
        <Chair position={CHAIR_POSITION} rotation={[0, Math.PI, 0]} shadows={shadows} />

        {/* Shelf, either side of the monitor */}
        <Clock position={[-1.42, SHELF_Y, SHELF_Z + 0.04]} temperature={scene.clockTemperature} shadows={shadows} />
        <JellyfishLamp position={[1.3, SHELF_Y, SHELF_Z - 0.02]} animate={animate} />
        <RubberDuck position={[1.56, SHELF_Y, SHELF_Z + 0.1]} quotes={scene.duckQuotes} animate={animate} />

        {/* Desk surface, left */}
        <PottedPlant position={[-1.5, DESK_Y, 0.38]} shadows={shadows} />
        <Succulent position={[-1.1, DESK_Y, 0.5]} shadows={shadows} />
        <Candle position={[-0.95, DESK_Y, 0.0]} animate={animate} />

        {/* Desk surface, right */}
        {!simplified && (
          <>
            <PencilCup position={[1.25, DESK_Y, -0.05]} shadows={shadows} />
            <WaterBottle position={[0.95, DESK_Y, 0.42]} shadows={shadows} />
            <Glass position={[1.18, DESK_Y, 0.48]} />
          </>
        )}
      </group>
    </SceneRig>
  )
}
