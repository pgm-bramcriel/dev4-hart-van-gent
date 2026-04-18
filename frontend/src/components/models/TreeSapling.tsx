import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { Mesh, MeshStandardMaterial } from "three";

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

export function TreeSapling(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/models/tree_sapling.glb",
  ) as unknown as GLTFResult;
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
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere001.geometry}
        material={materials.Leaves}
        position={[-0.102, 1.176, -0.441]}
        rotation={[1.958, -1.156, 2.809]}
        scale={[0.104, 0.102, 0.077]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere007.geometry}
        material={materials.Leaves}
        position={[-0.41, 0.928, -0.024]}
        rotation={[1.969, -1.188, 1.452]}
        scale={[0.099, 0.098, 0.074]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere002.geometry}
        material={materials.Leaves}
        position={[-0.01, 0.802, 0.603]}
        rotation={[1.291, -1.144, -2.712]}
        scale={[0.108, 0.106, 0.08]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere005.geometry}
        material={materials.Leaves}
        position={[0.02, 1.8, -0.028]}
        rotation={[Math.PI, -1.415, Math.PI]}
        scale={[0.135, 0.135, 0.084]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere006.geometry}
        material={materials.Leaves}
        position={[0.45, 1.417, -0.057]}
        rotation={[-2.764, -0.495, -1.827]}
        scale={[0.105, 0.103, 0.077]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere003.geometry}
        material={materials.Leaves}
        position={[0.103, 1.524, 0.373]}
        rotation={[0.814, -0.745, -0.219]}
        scale={[0.086, 0.084, 0.064]}
      />
    </group>
  );
}

useGLTF.preload("/models/tree_sapling.glb");
