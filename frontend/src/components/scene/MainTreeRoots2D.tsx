import { useTexture } from "@react-three/drei";

const ROOTS_TEXTURE_PATH = "/images/roots_svg.svg";

export function MainTreeRoots2D() {
  const rootsTexture = useTexture(ROOTS_TEXTURE_PATH);

  return (
    <mesh
      position={[0.028, -2.25, -1]}
      scale={1.08}
      renderOrder={8}
      frustumCulled={false}
    >
      <planeGeometry args={[2.6, 1.46]} />
      <meshBasicMaterial
        map={rootsTexture}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
