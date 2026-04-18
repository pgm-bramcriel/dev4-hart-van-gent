import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { Mesh, MeshStandardMaterial } from "three";

type GLTFResult = GLTF & {
  nodes: {
    Trunk: Mesh;
    Icosphere021: Mesh;
    Icosphere022: Mesh;
    Icosphere009: Mesh;
    Icosphere008: Mesh;
    Icosphere007: Mesh;
    Icosphere006: Mesh;
    Icosphere005: Mesh;
    Icosphere004: Mesh;
    Icosphere003: Mesh;
    Icosphere002: Mesh;
    Icosphere001: Mesh;
    Icosphere: Mesh;
    Icosphere010: Mesh;
    Icosphere011: Mesh;
    Icosphere012: Mesh;
    Icosphere013: Mesh;
    Icosphere014: Mesh;
    Icosphere015: Mesh;
    Icosphere016: Mesh;
    Icosphere017: Mesh;
    Icosphere018: Mesh;
    Icosphere019: Mesh;
    Icosphere020: Mesh;
  };
  materials: {
    "Trunk.002": MeshStandardMaterial;
    Leaves: MeshStandardMaterial;
    "Leaves.001": MeshStandardMaterial;
    "Leaves.002": MeshStandardMaterial;
    "Leaves.003": MeshStandardMaterial;
    "Leaves.004": MeshStandardMaterial;
    "Leaves.005": MeshStandardMaterial;
    "Leaves.006": MeshStandardMaterial;
    "Leaves.007": MeshStandardMaterial;
    "Leaves.008": MeshStandardMaterial;
    "Leaves.009": MeshStandardMaterial;
    "Leaves.010": MeshStandardMaterial;
    "Leaves.011": MeshStandardMaterial;
    "Leaves.012": MeshStandardMaterial;
    "Leaves.013": MeshStandardMaterial;
  };
};

export function TreeLarge(props: ThreeElements["group"]) {
  const { nodes, materials } = useGLTF(
    "/models/tree_large.glb",
  ) as unknown as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Trunk.geometry}
        material={materials["Trunk.002"]}
        position={[-0.128, 1.187, 0.002]}
        scale={1.286}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere021.geometry}
        material={materials["Leaves.012"]}
        position={[-3.701, 14.182, 1.417]}
        rotation={[2.654, -0.412, -1.651]}
        scale={[0.786, 0.786, 0.485]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere022.geometry}
        material={materials["Leaves.013"]}
        position={[-1.948, 14.684, -3.033]}
        rotation={[1.355, -1.315, 1.419]}
        scale={[0.274, 0.372, 0.274]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere009.geometry}
        material={materials.Leaves}
        position={[0.784, 10.85, -7.098]}
        rotation={[2.874, -1.419, -2.478]}
        scale={[1.13, 1.109, 0.837]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere008.geometry}
        material={materials.Leaves}
        position={[-3.577, 11.186, 4.535]}
        rotation={[1.046, -0.507, 1.265]}
        scale={[1.078, 1.078, 0.666]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere007.geometry}
        material={materials.Leaves}
        position={[-6.677, 9.741, -0.463]}
        rotation={[2.678, -0.693, 2.288]}
        scale={[1.314, 1.289, 0.972]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere006.geometry}
        material={materials.Leaves}
        position={[-2.339, 12.797, -4.977]}
        rotation={[-0.361, -0.549, 0.671]}
        scale={[0.849, 0.833, 0.628]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere005.geometry}
        material={materials.Leaves}
        position={[1.254, 15.343, 3.883]}
        rotation={[Math.PI, -1.415, Math.PI]}
        scale={[0.606, 0.606, 0.374]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere004.geometry}
        material={materials.Leaves}
        position={[1.69, 12.522, 7.071]}
        rotation={[-2.657, -1.297, -Math.PI]}
        scale={[1.399, 1.372, 1.035]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere003.geometry}
        material={materials.Leaves}
        position={[5.26, 12.609, -5.268]}
        rotation={[0, -1.002, 0]}
        scale={[0.992, 1.349, 0.992]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere002.geometry}
        material={materials.Leaves}
        position={[8.083, 13.538, 0.351]}
        scale={[0.919, 0.919, 0.567]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere001.geometry}
        material={materials.Leaves}
        position={[5.14, 12.847, 2.587]}
        rotation={[2.131, -1.297, -Math.PI]}
        scale={[1.229, 1.206, 0.91]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere.geometry}
        material={materials.Leaves}
        position={[-0.128, 17.71, 0.002]}
        scale={1.505}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere010.geometry}
        material={materials["Leaves.001"]}
        position={[-2.488, 15.093, 5.001]}
        rotation={[0.187, -0.473, -0.254]}
        scale={[0.906, 0.906, 0.559]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere011.geometry}
        material={materials["Leaves.002"]}
        position={[-4.544, 12.674, -3.269]}
        rotation={[-1.964, -0.988, -1.699]}
        scale={[0.754, 0.754, 0.466]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere012.geometry}
        material={materials["Leaves.003"]}
        position={[-4.236, 15.884, -0.568]}
        scale={[0.614, 0.614, 0.379]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere013.geometry}
        material={materials["Leaves.004"]}
        position={[-4.893, 15.078, -2.714]}
        rotation={[0, 1.331, 0]}
        scale={[0.659, 0.659, 0.407]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere014.geometry}
        material={materials["Leaves.005"]}
        position={[0.544, 13.938, -4.124]}
        rotation={[1.355, -1.315, 1.419]}
        scale={[0.617, 0.839, 0.617]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere015.geometry}
        material={materials["Leaves.006"]}
        position={[3.635, 15.166, -2.353]}
        rotation={[-1.049, -0.545, -0.581]}
        scale={[0.97, 0.97, 0.599]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere016.geometry}
        material={materials["Leaves.007"]}
        position={[2.246, 14.766, 0.824]}
        rotation={[1.319, 1.097, -1.249]}
        scale={[0.614, 0.614, 0.379]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere017.geometry}
        material={materials["Leaves.008"]}
        position={[5.261, 9.935, 4.984]}
        rotation={[2.849, -0.336, -0.491]}
        scale={[0.792, 0.792, 0.489]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere018.geometry}
        material={materials["Leaves.009"]}
        position={[5.048, 9.089, 2.215]}
        rotation={[2.649, -0.873, 2.394]}
        scale={[0.539, 0.529, 0.399]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere019.geometry}
        material={materials["Leaves.010"]}
        position={[2.495, 8.781, 4.45]}
        rotation={[0.095, -0.12, 0.879]}
        scale={[0.614, 0.614, 0.379]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Icosphere020.geometry}
        material={materials["Leaves.011"]}
        position={[8.459, 11.197, -3.065]}
        rotation={[2.654, -0.412, -1.651]}
        scale={[0.786, 0.786, 0.485]}
      />
    </group>
  );
}

useGLTF.preload("/models/tree_large.glb");
