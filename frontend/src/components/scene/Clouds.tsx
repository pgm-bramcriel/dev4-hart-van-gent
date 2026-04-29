import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

const CLOUD_WRAP_MIN_X = -9.5;
const CLOUD_WRAP_MAX_X = 9.5;

type CloudConfig = {
  startX: number;
  y: number;
  z: number;
  speed: number;
  scale: number;
};

const CLOUD_CONFIGS: CloudConfig[] = [
  { startX: -9.2, y: 3.05, z: -7.7, speed: 0.1, scale: 0.9 },
  { startX: -6.4, y: 2.45, z: -6.8, speed: 0.09, scale: 1.05 },
  { startX: -2.3, y: 2.2, z: -6.6, speed: 0.08, scale: 1.2 },
  { startX: 1.1, y: 2.95, z: -7.3, speed: 0.075, scale: 1.15 },
  { startX: 3.7, y: 3.2, z: -8.1, speed: 0.07, scale: 1.35 },
  { startX: 6.1, y: 2.3, z: -6.9, speed: 0.085, scale: 1.0 },
  { startX: 8.6, y: 2.7, z: -7.4, speed: 0.095, scale: 0.95 },
];

export function Clouds() {
  const cloudRefs = useRef<Array<Group | null>>([]);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const wrapDistance = CLOUD_WRAP_MAX_X - CLOUD_WRAP_MIN_X;

    CLOUD_CONFIGS.forEach((cloud, index) => {
      const cloudGroup = cloudRefs.current[index];
      if (!cloudGroup) {
        return;
      }

      const distanceFromMin =
        ((cloud.startX - CLOUD_WRAP_MIN_X + elapsedTime * cloud.speed) %
          wrapDistance) +
        wrapDistance;
      cloudGroup.position.x =
        CLOUD_WRAP_MIN_X + (distanceFromMin % wrapDistance);
    });
  });

  return (
    <>
      {CLOUD_CONFIGS.map((cloud, index) => (
        <group
          key={`${cloud.startX}-${cloud.y}-${cloud.z}`}
          ref={(group) => {
            cloudRefs.current[index] = group;
          }}
          position={[cloud.startX, cloud.y, cloud.z]}
          scale={cloud.scale}
        >
          <mesh position={[-0.65, 0, 0]}>
            <sphereGeometry args={[0.55, 12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.88} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.7, 12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
          <mesh position={[0.72, 0, 0]}>
            <sphereGeometry args={[0.5, 12, 12]} />
            <meshStandardMaterial color="#ffffff" transparent opacity={0.88} />
          </mesh>
        </group>
      ))}
    </>
  );
}
