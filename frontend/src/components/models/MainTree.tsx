import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { Mesh, MeshStandardMaterial } from "three";
import { useLeafRustleAnimation } from "@/components/scene/useLeafRustleAnimation";

type GLTFResult = GLTF & {
  nodes: {
    Trunk: Mesh;
    Icosphere: Mesh;
    Icosphere001: Mesh;
    Icosphere002: Mesh;
    Icosphere003: Mesh;
    Icosphere004: Mesh;
    Icosphere005: Mesh;
    Icosphere006: Mesh;
    Icosphere007: Mesh;
    Icosphere008: Mesh;
    Icosphere009: Mesh;
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

export function MainTree({
  rustleIntensity = 0,
  leafGrowthProgress = 1,
  ...props
}: TreeProps) {
  const { nodes, materials } = useGLTF(
    "/models/tree_main.glb",
  ) as unknown as GLTFResult;
  const leavesGroupRef = useLeafRustleAnimation({
    intensity: rustleIntensity,
    phaseOffset: 0.25,
  });
  const totalLeaves = 10;
  const baseVisibleLeaves = 4;
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
        position={[0, 1.029, 0]}
      />
      <group ref={leavesGroupRef}>
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(0)}
          geometry={nodes.Icosphere.geometry}
          material={materials.Leaves}
          position={[0, 11.121, 0]}
          scale={1.17}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(1)}
          geometry={nodes.Icosphere001.geometry}
          material={materials.Leaves}
          position={[3.872, 9.129, 1.333]}
          rotation={[2.131, -1.297, -Math.PI]}
          scale={[0.844, 0.828, 0.625]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(2)}
          geometry={nodes.Icosphere002.geometry}
          material={materials.Leaves}
          position={[5.849, 9.797, -0.444]}
          scale={[0.647, 0.647, 0.4]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(3)}
          geometry={nodes.Icosphere003.geometry}
          material={materials.Leaves}
          position={[4.317, 9.663, -2.86]}
          rotation={[0, -1.002, 0]}
          scale={[0.748, 1.017, 0.748]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(4)}
          geometry={nodes.Icosphere004.geometry}
          material={materials.Leaves}
          position={[1.487, 9.129, 5.187]}
          rotation={[-2.657, -1.297, -Math.PI]}
          scale={[1.088, 1.067, 0.805]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(5)}
          geometry={nodes.Icosphere005.geometry}
          material={materials.Leaves}
          position={[-3.435, 9.699, -1.431]}
          rotation={[Math.PI, -1.415, Math.PI]}
          scale={[0.471, 0.471, 0.291]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(6)}
          geometry={nodes.Icosphere006.geometry}
          material={materials.Leaves}
          position={[-1.778, 9.766, -3.612]}
          rotation={[-0.361, -0.549, 0.671]}
          scale={[0.613, 0.602, 0.454]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(7)}
          geometry={nodes.Icosphere007.geometry}
          material={materials.Leaves}
          position={[-4.382, 9.519, 1.639]}
          rotation={[1.969, -1.188, 1.452]}
          scale={[0.95, 0.932, 0.703]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(8)}
          geometry={nodes.Icosphere008.geometry}
          material={materials.Leaves}
          position={[-1.786, 9.272, 3.872]}
          rotation={[1.046, -0.507, 1.265]}
          scale={[0.586, 0.586, 0.362]}
        />
        <mesh
          castShadow
          receiveShadow
          visible={isLeafVisible(9)}
          geometry={nodes.Icosphere009.geometry}
          material={materials.Leaves}
          position={[0.795, 7.495, -3.773]}
          rotation={[2.874, -1.419, -2.478]}
          scale={[0.817, 0.802, 0.605]}
        />
      </group>
    </group>
  );
}

useGLTF.preload("/models/tree_main.glb");
