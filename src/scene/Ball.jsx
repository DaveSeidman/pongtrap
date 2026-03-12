import { RigidBody } from '@react-three/rapier';
import { useEffect, useRef } from 'react';
import { LAUNCH, TRAP } from './constants';

function pseudoRandom(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function Ball({ id, position, triggerCount, registerBody, launchScale = 1 }) {
  const bodyRef = useRef(null);
  const launchedCountRef = useRef(0);

  useEffect(() => {
    registerBody(id, bodyRef.current);
    return () => registerBody(id, null);
  }, [id, registerBody]);

  useEffect(() => {
    if (!bodyRef.current || triggerCount <= launchedCountRef.current) return;

    const r1 = pseudoRandom(id + triggerCount);
    const r2 = pseudoRandom(id * 31 + triggerCount);
    const angle = r1 * Math.PI * 2;

    const impulse = {
      x:
        Math.cos(angle) *
        (LAUNCH.lateralImpulse + (r2 - 0.5) * LAUNCH.randomLateralJitter) *
        launchScale,
      y: LAUNCH.upwardImpulse * launchScale,
      z:
        Math.sin(angle) *
        (LAUNCH.lateralImpulse + (0.5 - r2) * LAUNCH.randomLateralJitter) *
        launchScale,
    };

    bodyRef.current.applyImpulse(impulse, true);
    launchedCountRef.current = triggerCount;
  }, [id, triggerCount, launchScale]);

  return (
    <RigidBody
      ref={bodyRef}
      position={position}
      colliders="ball"
      restitution={TRAP.ballRestitution}
      friction={TRAP.ballFriction}
      mass={TRAP.ballMass}
      linearDamping={0.06}
      angularDamping={0.05}
      canSleep={false}
    >
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[TRAP.ballRadius, 24, 24]} />
        <meshStandardMaterial color={TRAP.ballColor} roughness={0.24} metalness={0.05} />
      </mesh>
    </RigidBody>
  );
}
