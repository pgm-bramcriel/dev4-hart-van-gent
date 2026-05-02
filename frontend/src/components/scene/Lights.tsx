import { Environment } from "@react-three/drei";
import { useEffect, useRef } from "react";
import type { DirectionalLight, Object3D } from "three";

const SECONDARY_TREE_SHADOW_TARGET: [number, number, number] = [36, 0, -18];
const SECONDARY_TREE_SHADOW_LIGHT_POSITION: [number, number, number] = [
  18, 30, -2,
];

const Lights = () => {
  const secondaryTreeLightRef = useRef<DirectionalLight | null>(null);
  const secondaryTreeTargetRef = useRef<Object3D | null>(null);

  useEffect(() => {
    if (!secondaryTreeLightRef.current || !secondaryTreeTargetRef.current) {
      return;
    }

    secondaryTreeLightRef.current.target = secondaryTreeTargetRef.current;
    secondaryTreeLightRef.current.target.updateMatrixWorld();
  }, []);

  // apartment: string;
  // city: string;
  // dawn: string;
  // forest: string;
  // lobby: string;
  // night: string;
  // park: string;
  // studio: string;
  // sunset: string;
  // warehouse: string;

  return (
    <>
      <Environment preset="apartment" background={false} />
      <object3D
        ref={secondaryTreeTargetRef}
        position={SECONDARY_TREE_SHADOW_TARGET}
      />
      <directionalLight
        ref={secondaryTreeLightRef}
        position={SECONDARY_TREE_SHADOW_LIGHT_POSITION}
        intensity={0.5}
        castShadow
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
};

export default Lights;
