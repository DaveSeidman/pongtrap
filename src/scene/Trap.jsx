import { CuboidCollider, RigidBody } from '@react-three/rapier';
import { TRAP } from './constants';
import Ball from './Ball';

export default function Trap({ id, position, triggered, triggerCount, onTrigger, registerBallBody }) {
  const [x, z] = position;
  const [trapW, trapH, trapD] = TRAP.size;

  return (
    <group position={[x, 0, z]}>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[trapW / 2, trapH / 2, trapD / 2]}
          position={[0, trapH / 2, 0]}
          friction={0.9}
          restitution={0.25}
        />

        <mesh
          castShadow
          receiveShadow
          position={[0, trapH / 2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onTrigger(id);
          }}
        >
          <boxGeometry args={TRAP.size} />
          <meshStandardMaterial
            color={triggered ? '#e29f63' : TRAP.color}
            roughness={0.65}
            metalness={0.18}
          />
        </mesh>

        {/* tiny visual spring/bar hint */}
        <mesh position={[0, trapH + 0.03, 0]} castShadow>
          <boxGeometry args={[trapW * 0.86, 0.04, 0.04]} />
          <meshStandardMaterial color={TRAP.metalColor} roughness={0.35} metalness={0.85} />
        </mesh>
      </RigidBody>

      <Ball
        id={id}
        position={[0, trapH + TRAP.ballRadius + 0.02, 0]}
        triggerCount={triggerCount}
        registerBody={registerBallBody}
      />
    </group>
  );
}
