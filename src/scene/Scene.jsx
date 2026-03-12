import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerformanceMonitor,
  Stats,
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import Tank from './Tank';
import Trap from './Trap';
import { CHAIN_REACTION, GRID, TANK_HEIGHT, TRAP, WORLD } from './constants';

function buildTrapLayout(rows, cols, spacing) {
  const offsetX = ((cols - 1) * spacing) / 2;
  const offsetZ = ((rows - 1) * spacing) / 2;

  const traps = [];
  let id = 0;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      traps.push({
        id,
        x: col * spacing - offsetX,
        z: row * spacing - offsetZ,
      });
      id += 1;
    }
  }

  return traps;
}

function getTankSize(rows, cols, spacing) {
  const [trapW] = TRAP.size;
  const [, , trapD] = TRAP.size;

  const width = Math.max(trapW + GRID.edgePadding * 2, (cols - 1) * spacing + trapW + GRID.edgePadding * 2);
  const depth = Math.max(trapD + GRID.edgePadding * 2, (rows - 1) * spacing + trapD + GRID.edgePadding * 2);

  return { width, depth };
}

function CameraRig({ width, depth, controlsRef, layoutKey }) {
  const { camera } = useThree();
  const desired = useMemo(() => {
    const maxSize = Math.max(width, depth);
    return {
      position: new THREE.Vector3(maxSize * 1.2, TANK_HEIGHT * 0.95, maxSize * 1.2),
      target: new THREE.Vector3(0, 1.6, 0),
    };
  }, [width, depth]);

  const tweenActiveRef = useRef(false);

  useEffect(() => {
    // Only re-frame camera when the layout topology changes.
    tweenActiveRef.current = true;
  }, [layoutKey]);

  useFrame((_, dt) => {
    if (!tweenActiveRef.current) return;

    const alpha = 1 - Math.exp(-dt * 4.5);
    camera.position.lerp(desired.position, alpha);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(desired.target, alpha);
      controlsRef.current.update();
    }

    const done = camera.position.distanceTo(desired.position) < 0.02;
    if (done && controlsRef.current) {
      controlsRef.current.target.copy(desired.target);
      controlsRef.current.update();
      tweenActiveRef.current = false;
    }
  });

  return null;
}

function World({
  simVersion,
  rows,
  cols,
  density,
  triggeredMap,
  triggerCounts,
  onTrigger,
  launchScale = 0.1,
  postProcessing = true,
  showStats = false,
}) {
  const spacing = GRID.baseSpacing / density;
  const layoutKey = `${rows}:${cols}:${density}`;
  const traps = useMemo(() => buildTrapLayout(rows, cols, spacing), [rows, cols, spacing]);
  const { width, depth } = useMemo(() => getTankSize(rows, cols, spacing), [rows, cols, spacing]);
  const ballBodiesRef = useRef(new Map());
  const controlsRef = useRef(null);

  const registerBallBody = useCallback((id, body) => {
    if (!body) {
      ballBodiesRef.current.delete(id);
      return;
    }
    ballBodiesRef.current.set(id, body);
  }, []);

  useFrame(() => {
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

      <CameraRig width={width} depth={depth} controlsRef={controlsRef} layoutKey={layoutKey} />

      <Physics key={simVersion} gravity={WORLD.gravity} timeStep={WORLD.timeStep}>
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
            launchScale={launchScale}
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
        ref={controlsRef}
        makeDefault
        target={[0, 1.6, 0]}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
      />

      {showStats && <Stats />}
      <PerformanceMonitor />
    </>
  );
}

export default function Scene(props) {
  const { rows, cols, density } = props;
  const spacing = GRID.baseSpacing / density;
  const { width, depth } = getTankSize(rows, cols, spacing);
  const maxSize = Math.max(width, depth);

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 2]}
      camera={{
        position: [maxSize * 1.2, TANK_HEIGHT * 0.95, maxSize * 1.2],
        fov: 48,
        near: 0.1,
        far: 220,
      }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <World {...props} />
    </Canvas>
  );
}
