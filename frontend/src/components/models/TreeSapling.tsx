import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { Mesh, MeshStandardMaterial } from "three";
import { useLeafRustleAnimation } from "@/components/scene/useLeafRustleAnimation";

type GLTFResult = GLTF & {
  nodes: {
    Trunk: Mesh;
    Icosphere001: Mesh;
    Icosphere007: Mesh;
    Icosphere002: Mesh;
    Icosphere005: Mesh;
    Icosphere006: Mesh;
    Icosphere003: Mesh;
  };
  materials: {
    Trunk: MeshStandardMaterial;
    Leaves: MeshStandardMaterial;
  };
};

type TreeProps = ThreeElements["group"] & {
  rustleIntensity?: number;
  leafGrowthProgress?: number;
};

export function TreeSapling({
  rustleIntensity = 0,
  leafGrowthProgress = 1,
  ...props
}: TreeProps) {
  const { nodes, materials } = useGLTF(
    "/models/tree_sapling.glb",
  ) as unknown as GLTFResult;
  const leavesGroupRef = useLeafRustleAnimation({
    intensity: rustleIntensity,
    phaseOffset: 1.2,
  });
  const totalLeaves = 6;
  const baseVisibleLeaves = 3;
  const visibleLeafCount = Math.min(
    totalLeaves,
    baseVisibleLeaves +
      Math.ceil(Math.max(0, Math.min(1, leafGrowthProgress)) * (totalLeaves - baseVisibleLeaves)),
  );
  const isLeafVisible = (index: number) => index < visibleLeafCount;

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Trunk.geometry}
        material={materials.Trunk}
        position={[0, 0.525, 0]}
        scale={[0.048, 0.511, 0.048]}
      />
      <group ref={leavesGroupRef}>
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(0)}
          geometry={nodes.Icosphere001.geometry}
          material={materials.Leaves}
          position={[-0.102, 1.176, -0.441]}
          rotation={[1.958, -1.156, 2.809]}
          scale={[0.104, 0.102, 0.077]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(1)}
          geometry={nodes.Icosphere007.geometry}
          material={materials.Leaves}
          position={[-0.41, 0.928, -0.024]}
          rotation={[1.969, -1.188, 1.452]}
          scale={[0.099, 0.098, 0.074]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(2)}
          geometry={nodes.Icosphere002.geometry}
          material={materials.Leaves}
          position={[-0.01, 0.802, 0.603]}
          rotation={[1.291, -1.144, -2.712]}
          scale={[0.108, 0.106, 0.08]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(3)}
          geometry={nodes.Icosphere005.geometry}
          material={materials.Leaves}
          position={[0.02, 1.8, -0.028]}
          rotation={[Math.PI, -1.415, Math.PI]}
          scale={[0.135, 0.135, 0.084]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(4)}
          geometry={nodes.Icosphere006.geometry}
          material={materials.Leaves}
          position={[0.45, 1.417, -0.057]}
          rotation={[-2.764, -0.495, -1.827]}
          scale={[0.105, 0.103, 0.077]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(5)}
          geometry={nodes.Icosphere003.geometry}
          material={materials.Leaves}
          position={[0.103, 1.524, 0.373]}
          rotation={[0.814, -0.745, -0.219]}
          scale={[0.086, 0.084, 0.064]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/models/tree_sapling.glb");
