# PongTrap (React Three Fiber)

Interactive chain-reaction simulator: a glass tank filled with mousetraps and ping pong balls.
Click any trap to launch its ball, then watch collisions trigger other traps.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Architecture

- `src/App.jsx`
  - Main app shell + Leva control panel
  - Rows/cols + density + launch controls
  - Simulation state (`triggeredMap`, `triggerCounts`)
- `src/scene/Scene.jsx`
  - Canvas setup, camera, controls, lighting, shadows, optional post FX
  - Physics world + chain-reaction detection loop
- `src/scene/Tank.jsx`
  - Floor, 4 walls, and ceiling (visual + colliders)
  - Height fixed at `10`
- `src/scene/Trap.jsx`
  - Flat-ish trap mesh + fixed collider + click handling
- `src/scene/Ball.jsx`
  - Dynamic rigid-body ping pong ball
  - Applies launch impulse when trap trigger count increments
- `src/scene/constants.js`
  - All core tuning values in one place

## Key tuning constants

In `src/scene/constants.js`:

- `LAUNCH.upwardImpulse` / `LAUNCH.lateralImpulse` / `LAUNCH.randomLateralJitter`
  - Controls launch arc and spread
- `GRID.baseSpacing` / `GRID.edgePadding`
  - Base trap spacing and margins (actual spacing is scaled by the Leva `density` slider)
- `CHAIN_REACTION.minSpeedToTrigger`
  - Ball speed threshold required to set off an untriggered trap
- `CHAIN_REACTION.trapTriggerRadius`
  - Effective XZ trigger radius around each trap
- `TRAP.ballRestitution`
  - Bounce behavior on walls/ceiling/floor/traps
- `TANK_HEIGHT`
  - Fixed at `10` for now

## Notes

- Current trap is intentionally simple geometry; swap `Trap.jsx` visuals with your Blender model later.
- Chain reaction logic is centralized in `Scene.jsx` (`useFrame`) to keep behavior easy to evolve.
