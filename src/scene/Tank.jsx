import { useMemo } from 'react';
import { CuboidCollider } from '@react-three/rapier';
import { TANK_HEIGHT, TANK_VISUAL } from './constants';

export default function Tank({ width, depth }) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const halfH = TANK_HEIGHT / 2;
  const t = TANK_VISUAL.wallThickness;
  const safetyT = 0.35;

  const wallMaterial = useMemo(
    () => ({
      color: TANK_VISUAL.glassColor,
      transparent: true,
      opacity: TANK_VISUAL.glassOpacity,
      roughness: 0.03,
      metalness: 0.1,
      transmission: 0.9,
    }),
    [],
  );

  return (
    <group>
      {/* Physical boundaries */}
      <CuboidCollider args={[halfW, t / 2, halfD]} position={[0, 0, 0]} friction={0.95} restitution={0.2} />
      <CuboidCollider
        args={[halfW, t / 2, halfD]}
        position={[0, TANK_HEIGHT, 0]}
        friction={0.4}
        restitution={0.85}
      />
      <CuboidCollider args={[t / 2, halfH, halfD]} position={[-halfW, halfH, 0]} restitution={0.78} />
      <CuboidCollider args={[t / 2, halfH, halfD]} position={[halfW, halfH, 0]} restitution={0.78} />
      <CuboidCollider args={[halfW, halfH, t / 2]} position={[0, halfH, -halfD]} restitution={0.78} />
      <CuboidCollider args={[halfW, halfH, t / 2]} position={[0, halfH, halfD]} restitution={0.78} />

      {/* Secondary containment shell to catch rare high-speed tunneling cases. */}
      <CuboidCollider
        args={[halfW + safetyT, safetyT / 2, halfD + safetyT]}
        position={[0, TANK_HEIGHT + safetyT, 0]}
        restitution={0.75}
      />
      <CuboidCollider
        args={[safetyT / 2, halfH + safetyT, halfD + safetyT]}
        position={[-halfW - safetyT, halfH, 0]}
        restitution={0.75}
      />
      <CuboidCollider
        args={[safetyT / 2, halfH + safetyT, halfD + safetyT]}
        position={[halfW + safetyT, halfH, 0]}
        restitution={0.75}
      />
      <CuboidCollider
        args={[halfW + safetyT, halfH + safetyT, safetyT / 2]}
        position={[0, halfH, -halfD - safetyT]}
        restitution={0.75}
      />
      <CuboidCollider
        args={[halfW + safetyT, halfH + safetyT, safetyT / 2]}
        position={[0, halfH, halfD + safetyT]}
        restitution={0.75}
      />

      {/* Visual floor */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[width, t, depth]} />
        <meshStandardMaterial color={TANK_VISUAL.floorColor} roughness={0.9} metalness={0.08} />
      </mesh>

      {/* Visual walls + ceiling */}
      <mesh position={[0, TANK_HEIGHT, 0]}>
        <boxGeometry args={[width, t, depth]} />
        <meshPhysicalMaterial {...wallMaterial} />
      </mesh>

      <mesh position={[-halfW, halfH, 0]}>
        <boxGeometry args={[t, TANK_HEIGHT, depth]} />
        <meshPhysicalMaterial {...wallMaterial} />
      </mesh>
      <mesh position={[halfW, halfH, 0]}>
        <boxGeometry args={[t, TANK_HEIGHT, depth]} />
        <meshPhysicalMaterial {...wallMaterial} />
      </mesh>
      <mesh position={[0, halfH, -halfD]}>
        <boxGeometry args={[width, TANK_HEIGHT, t]} />
        <meshPhysicalMaterial {...wallMaterial} />
      </mesh>
      <mesh position={[0, halfH, halfD]}>
        <boxGeometry args={[width, TANK_HEIGHT, t]} />
        <meshPhysicalMaterial {...wallMaterial} />
      </mesh>
    </group>
  );
}
