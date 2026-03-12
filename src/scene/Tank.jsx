import { useMemo } from 'react';
import { CuboidCollider } from '@react-three/rapier';
import { MeshTransmissionMaterial, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { TANK_HEIGHT, TANK_VISUAL } from './constants';
import { clearcoatRoughness } from 'three/tsl';

export default function Tank({ width, depth }) {
  const halfW = width / 2;
  const halfD = depth / 2;
  const halfH = TANK_HEIGHT / 2;
  const t = TANK_VISUAL.wallThickness;
  const safetyT = 0.35;
  const baseOverhang = 1;
  const baseThickness = 0.8;

  const woodTexture = useTexture('/wood-grain.svg');
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(Math.max(2, width * 0.35), Math.max(2, depth * 0.35));
  woodTexture.anisotropy = 4;

  const transmissionProps = useMemo(
    () => ({
      // Low-cost transmission profile with a bit more "glassy" feel.
      transmissionSampler: true,
      samples: 4,
      resolution: 128,
      thickness: 0.14,
      roughness: 0.07,
      ior: 1.15,
      chromaticAberration: 0.3,
      distortion: 0.18,
      temporalDistortion: 0.04,
      anisotropy: 0,
      clearcoat: 0.5,
      clearcoatRoughness: 0.5,
      envMapIntensity: 1.55,
      attenuationDistance: 4.5,
      attenuationColor: '#d7eeff',
      backside: true,
      transparent: true,
      opacity: 0.16,
    }),
    [],
  );

  return (
    <group>
      {/* Physical boundaries */}
      <CuboidCollider
        args={[halfW + baseOverhang, baseThickness / 2, halfD + baseOverhang]}
        position={[0, -baseThickness / 2, 0]}
        friction={0.95}
        restitution={0.2}
      />
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

      {/* Visual floor (wood texture) */}
      <mesh receiveShadow position={[0, -baseThickness / 2, 0]}>
        <boxGeometry args={[width + baseOverhang * 2, baseThickness, depth + baseOverhang * 2]} />
        <meshStandardMaterial map={woodTexture} color="#89633d" roughness={0.86} metalness={0.04} />
      </mesh>

      {/* Visual walls + ceiling */}
      <mesh position={[0, TANK_HEIGHT, 0]}>
        <boxGeometry args={[width, t, depth]} />
        <MeshTransmissionMaterial {...transmissionProps} />
      </mesh>

      <mesh position={[-halfW, halfH, 0]}>
        <boxGeometry args={[t, TANK_HEIGHT, depth]} />
        <MeshTransmissionMaterial {...transmissionProps} />
      </mesh>
      <mesh position={[halfW, halfH, 0]}>
        <boxGeometry args={[t, TANK_HEIGHT, depth]} />
        <MeshTransmissionMaterial {...transmissionProps} />
      </mesh>
      <mesh position={[0, halfH, -halfD]}>
        <boxGeometry args={[width, TANK_HEIGHT, t]} />
        <MeshTransmissionMaterial {...transmissionProps} />
      </mesh>
      <mesh position={[0, halfH, halfD]}>
        <boxGeometry args={[width, TANK_HEIGHT, t]} />
        <MeshTransmissionMaterial {...transmissionProps} />
      </mesh>
    </group>
  );
}
