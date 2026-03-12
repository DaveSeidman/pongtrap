import { Canvas, useFrame } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerformanceMonitor,
  Stats,
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { useCallback, useMemo, useRef } from 'react';
import Tank from './Tank';
import Trap from './Trap';
import { CHAIN_REACTION, GRID, TANK_HEIGHT, TRAP, WORLD } from './constants';

function buildTrapLayout(width, depth) {
  const usableX = Math.max(0, width - GRID.edgePadding * 2);
  const usableZ = Math.max(0, depth - GRID.edgePadding * 2);

  const cols = Math.max(1, Math.floor(usableX / GRID.spacing));
  const rows = Math.max(1, Math.floor(usableZ / GRID.spacing));

  const offsetX = ((cols - 1) * GRID.spacing) / 2;
  const offsetZ = ((rows - 1) * GRID.spacing) / 2;

  const traps = [];
  let id = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      traps.push({
        id,
        x: col * GRID.spacing - offsetX,
        z: row * GRID.spacing - offsetZ,
      });
      id += 1;
    }
  }

  return traps;
}

function World({
  width,
  depth,
  triggeredMap,
  triggerCounts,
  onTrigger,
  postProcessing = true,
  showStats = false,
}) {
  const traps = useMemo(() => buildTrapLayout(width, depth), [width, depth]);
  const ballBodiesRef = useRef(new Map());

  const registerBallBody = useCallback((id, body) => {
    if (!body) {
      ballBodiesRef.current.delete(id);
      return;
    }
    ballBodiesRef.current.set(id, body);
  }, []);

  useFrame(() => {
    // Lightweight chain-reaction detector:
    // If a moving ball passes through an untriggered trap's XZ trigger radius near trap height,
    // trigger that trap (which launches its own ball via an impulse).
    traps.forEach((trap) => {
      if (triggeredMap[trap.id]) return;

      for (const [ballId, body] of ballBodiesRef.current.entries()) {
        if (!body || ballId === trap.id) continue;

        const velocity = body.linvel();
        const speed = Math.hypot(velocity.x, velocity.y, velocity.z);
        if (speed < CHAIN_REACTION.minSpeedToTrigger) continue;

        const p = body.translation();
        if (p.y > CHAIN_REACTION.maxBallHeightForTrigger) continue;

        const dx = p.x - trap.x;
        const dz = p.z - trap.z;
        if (Math.hypot(dx, dz) <= CHAIN_REACTION.trapTriggerRadius) {
          onTrigger(trap.id);
          break;
        }
      }
    });
  });

  return (
    <>
      <color attach="background" args={['#07090d']} />
      <fog attach="fog" args={['#07090d', 14, 34]} />

      <ambientLight intensity={0.25} />
      <directionalLight
        castShadow
        intensity={1.1}
        position={[6, 11, 4]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      <Physics gravity={WORLD.gravity} timeStep={WORLD.timeStep}>
        <Tank width={width} depth={depth} />

        {traps.map((trap) => (
          <Trap
            key={trap.id}
            id={trap.id}
            position={[trap.x, trap.z]}
            triggered={Boolean(triggeredMap[trap.id])}
            triggerCount={triggerCounts[trap.id] ?? 0}
            onTrigger={onTrigger}
            registerBallBody={registerBallBody}
          />
        ))}
      </Physics>

      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={Math.max(width, depth)} blur={1.5} />
      <Environment preset="city" />

      {postProcessing && (
        <EffectComposer>
          <Bloom intensity={0.45} luminanceThreshold={0.6} mipmapBlur />
        </EffectComposer>
      )}

      <OrbitControls
        makeDefault
        target={[0, 1.6, 0]}
        minDistance={8}
        maxDistance={45}
        maxPolarAngle={Math.PI * 0.495}
      />

      {showStats && <Stats />}
      <PerformanceMonitor />
    </>
  );
}

export default function Scene(props) {
  const { width, depth } = props;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [width * 0.55, TANK_HEIGHT * 0.7, depth * 0.55], fov: 48, near: 0.1, far: 120 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <World {...props} />
    </Canvas>
  );
}
