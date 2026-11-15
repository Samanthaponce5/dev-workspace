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
import { CoffeeMug } from './props/CoffeeMug'
import { PencilCup } from './props/PencilCup'
import { JellyfishLamp } from './props/JellyfishLamp'
import { RubberDuck } from './props/RubberDuck'
import { SceneRig } from './SceneRig'

const DESK_Y = DESK.height

/**
 * Everything in the diorama, laid out to match the real desk: monitor
 * centred on the riser with the clock and lamp either side of it, laptop
 * in front, coffee within reach, Samantha in her chair and Andy beside it.
 * `facingAngle` is the camera's angle around the desk, so characters know
 * which way to turn to look at the visitor.
 */
export function DeskWorld({ scene, animate, parallax, shadows }) {
  return (
    <SceneRig animate={animate} parallax={parallax}>
      <group position={[0, WORLD_OFFSET_Y, 0]}>
        <Lighting shadows={shadows} />
        <Platform shadows={shadows} />
        <Desk shadows={shadows} />
        <LedStrip />
        <Monitor shadows={shadows} />
        <Laptop position={[-0.1, 0, 0.3]} shadows={shadows} />

        {/* Shelf, either side of the monitor */}
        <Clock position={[-1.42, SHELF_Y, SHELF_Z + 0.04]} temperature={scene.clockTemperature} shadows={shadows} />
        <JellyfishLamp position={[1.3, SHELF_Y, SHELF_Z - 0.02]} animate={animate} />
        <RubberDuck position={[1.56, SHELF_Y, SHELF_Z + 0.1]} quotes={scene.duckQuotes} animate={animate} />

        {/* Desk surface */}
        <Candle position={[-1.2, DESK_Y, 0.0]} animate={animate} />
        <CoffeeMug position={[0.62, DESK_Y, 0.36]} animate={animate} shadows={shadows} />
        <PencilCup position={[1.25, DESK_Y, -0.05]} shadows={shadows} />

        <Chair position={CHAIR_POSITION} rotation={[0, Math.PI, 0]} shadows={shadows} />
      </group>
    </SceneRig>
  )
}
