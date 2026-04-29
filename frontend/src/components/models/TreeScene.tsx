import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { GLTF } from "three-stdlib";
import type { Mesh, MeshStandardMaterial } from "three";
import { useLeafRustleAnimation } from "@/components/scene/useLeafRustleAnimation";

const TREE_SCENE_TREE_BASE_POSITION: [number, number, number] = [
  -34.764, 0, -5.384,
];
const TREE_SCENE_TREE_OFFSET: [number, number, number] = [
  34.764, 0, 5.384,
];

type GLTFResult = GLTF & {
  nodes: {
    Landscape002: Mesh;
    Cube: Mesh;
    Cube002: Mesh;
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
    Cube001: Mesh;
    Cube003: Mesh;
    Cube005: Mesh;
    Cube006: Mesh;
    Cube008: Mesh;
  };
  materials: {
    Ground: MeshStandardMaterial;
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
    "Trunk.003": MeshStandardMaterial;
    "Trunk.005": MeshStandardMaterial;
    "Trunk.006": MeshStandardMaterial;
    "Trunk.008": MeshStandardMaterial;
  };
};

type TreeProps = ThreeElements["group"] & {
  rustleIntensity?: number;
  growthScale?: number;
};

export function TreeScene({
  rustleIntensity = 0,
  growthScale = 1,
  ...props
}: TreeProps) {
  const { nodes, materials } = useGLTF(
    "/models/tree_scene.glb",
  ) as unknown as GLTFResult;
  const leavesGroupRef = useLeafRustleAnimation({
    intensity: rustleIntensity,
    phaseOffset: 2.8,
  });

  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Landscape002.geometry}
        material={materials.Ground}
        position={[-0.319, 3.764, -0.821]}
        scale={-5.626}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube001.geometry}
        material={nodes.Cube001.material}
        position={[8.08, 4.77, 2.351]}
      />
      <group position={TREE_SCENE_TREE_BASE_POSITION} scale={growthScale}>
        <group position={TREE_SCENE_TREE_OFFSET}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube.geometry}
        material={materials["Trunk.002"]}
        position={[-34.126, 1.913, -5.376]}
        rotation={[-Math.PI, 1.514, -Math.PI]}
        scale={[1.854, 1.851, 2.763]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube002.geometry}
        material={materials["Trunk.002"]}
        position={[-34.713, 1.666, -5.311]}
        rotation={[0, -1.514, 0]}
        scale={[2.47, 2.457, 6.577]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Trunk.geometry}
        material={materials["Trunk.002"]}
        position={[-34.764, 2.997, -5.384]}
        scale={1.286}
      />
      <group ref={leavesGroupRef}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere021.geometry}
          material={materials["Leaves.012"]}
          position={[-38.336, 15.993, -3.97]}
          rotation={[2.654, -0.412, -1.651]}
          scale={[0.786, 0.786, 0.485]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere022.geometry}
          material={materials["Leaves.013"]}
          position={[-36.583, 16.495, -8.42]}
          rotation={[1.355, -1.315, 1.419]}
          scale={[0.274, 0.372, 0.274]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere009.geometry}
          material={materials.Leaves}
          position={[-33.851, 12.661, -12.485]}
          rotation={[2.874, -1.419, -2.478]}
          scale={[1.13, 1.109, 0.837]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere008.geometry}
          material={materials.Leaves}
          position={[-38.213, 12.996, -0.852]}
          rotation={[1.046, -0.507, 1.265]}
          scale={[1.078, 1.078, 0.666]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere007.geometry}
          material={materials.Leaves}
          position={[-41.312, 11.551, -5.85]}
          rotation={[2.678, -0.693, 2.288]}
          scale={[1.314, 1.289, 0.972]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere006.geometry}
          material={materials.Leaves}
          position={[-36.975, 14.608, -10.364]}
          rotation={[-0.361, -0.549, 0.671]}
          scale={[0.849, 0.833, 0.628]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere005.geometry}
          material={materials.Leaves}
          position={[-33.382, 17.154, -1.504]}
          rotation={[Math.PI, -1.415, Math.PI]}
          scale={[0.606, 0.606, 0.374]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere004.geometry}
          material={materials.Leaves}
          position={[-32.945, 14.332, 1.684]}
          rotation={[-2.657, -1.297, -Math.PI]}
          scale={[1.399, 1.372, 1.035]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere003.geometry}
          material={materials.Leaves}
          position={[-29.376, 14.419, -10.655]}
          rotation={[0, -1.002, 0]}
          scale={[0.992, 1.349, 0.992]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere002.geometry}
          material={materials.Leaves}
          position={[-26.553, 15.349, -5.036]}
          scale={[0.919, 0.919, 0.567]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere001.geometry}
          material={materials.Leaves}
          position={[-29.495, 14.658, -2.799]}
          rotation={[2.131, -1.297, -Math.PI]}
          scale={[1.229, 1.206, 0.91]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere.geometry}
          material={materials.Leaves}
          position={[-34.764, 19.52, -5.384]}
          scale={1.505}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere010.geometry}
          material={materials["Leaves.001"]}
          position={[-37.123, 16.904, -0.386]}
          rotation={[0.187, -0.473, -0.254]}
          scale={[0.906, 0.906, 0.559]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere011.geometry}
          material={materials["Leaves.002"]}
          position={[-39.179, 14.485, -8.656]}
          rotation={[-1.964, -0.988, -1.699]}
          scale={[0.754, 0.754, 0.466]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere012.geometry}
          material={materials["Leaves.003"]}
          position={[-38.872, 17.695, -5.955]}
          scale={[0.614, 0.614, 0.379]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere013.geometry}
          material={materials["Leaves.004"]}
          position={[-39.529, 16.888, -8.101]}
          rotation={[0, 1.331, 0]}
          scale={[0.659, 0.659, 0.407]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere014.geometry}
          material={materials["Leaves.005"]}
          position={[-34.091, 15.748, -9.511]}
          rotation={[1.355, -1.315, 1.419]}
          scale={[0.617, 0.839, 0.617]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere015.geometry}
          material={materials["Leaves.006"]}
          position={[-31.001, 16.977, -7.74]}
          rotation={[-1.049, -0.545, -0.581]}
          scale={[0.97, 0.97, 0.599]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere016.geometry}
          material={materials["Leaves.007"]}
          position={[-32.39, 16.577, -4.562]}
          rotation={[1.319, 1.097, -1.249]}
          scale={[0.614, 0.614, 0.379]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere017.geometry}
          material={materials["Leaves.008"]}
          position={[-29.374, 11.745, -0.402]}
          rotation={[2.849, -0.336, -0.491]}
          scale={[0.792, 0.792, 0.489]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere018.geometry}
          material={materials["Leaves.009"]}
          position={[-29.588, 10.899, -3.171]}
          rotation={[2.649, -0.873, 2.394]}
          scale={[0.539, 0.529, 0.399]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere019.geometry}
          material={materials["Leaves.010"]}
          position={[-32.14, 10.591, -0.937]}
          rotation={[0.095, -0.12, 0.879]}
          scale={[0.614, 0.614, 0.379]}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Icosphere020.geometry}
          material={materials["Leaves.011"]}
          position={[-26.177, 13.007, -8.452]}
          rotation={[2.654, -0.412, -1.651]}
          scale={[0.786, 0.786, 0.485]}
        />
      </group>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube003.geometry}
        material={materials["Trunk.003"]}
        position={[-34.713, 1.41, -5.301]}
        rotation={[Math.PI, -0.907, Math.PI]}
        scale={[2.573, 2.457, 6.343]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube005.geometry}
        material={materials["Trunk.005"]}
        position={[-34.185, 1.823, -5.213]}
        rotation={[0, -1.075, 0]}
        scale={[2.531, 2.157, 6.44]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube006.geometry}
        material={materials["Trunk.006"]}
        position={[-34.126, 1.694, -5.551]}
        rotation={[-Math.PI, 0.144, -Math.PI]}
        scale={[1.873, 1.851, 3.882]}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Cube008.geometry}
        material={materials["Trunk.008"]}
        position={[-34.126, 1.789, -5.609]}
        rotation={[-0.13, -0.278, -0.018]}
        scale={[1.873, 1.851, 3.882]}
      />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/tree_scene.glb");
