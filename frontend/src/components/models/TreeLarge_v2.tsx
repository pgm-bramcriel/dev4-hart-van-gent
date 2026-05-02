import type { ThreeElements } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Color, MathUtils, Vector3 } from "three";
import type { GLTF } from "three-stdlib";
import type { Mesh, MeshStandardMaterial } from "three";
import { useLeafRustleAnimation } from "@/components/scene/useLeafRustleAnimation";

const TREE_LARGE_V2_MODEL_PATH = "/models/tree_large_v2.glb";
const TREE_BASE_POSITION: [number, number, number] = [-34.834, 0, 162.088];
const TREE_OFFSET_FROM_BASE: [number, number, number] = [34.834, 0, -162.088];
const ROOTS_FILL_START_COLOR = new Color("#F5B041");
const ROOTS_FILL_END_COLOR = new Color("#FFC300");
const ROOTS_FILL_AXIS_Y = new Vector3(0, 1, 0);

type GLTFResult = GLTF & {
  nodes: Record<string, Mesh>;
  materials: Record<string, MeshStandardMaterial>;
};

type TreeLargeV2Props = ThreeElements["group"] & {
  growthScale?: number;
  hideRoots?: boolean;
  rustleIntensity?: number;
  rootsFillProgress?: number;
};

type RootFillShader = {
  uniforms: Record<string, { value: unknown }>;
  vertexShader: string;
  fragmentShader: string;
};

type RootFillMeshProps = Omit<
  ThreeElements["mesh"],
  "geometry" | "material"
> & {
  fillProgress: number;
  geometry: Mesh["geometry"];
  material: MeshStandardMaterial;
};

function RootFillMesh({
  fillProgress,
  geometry,
  material,
  ...meshProps
}: RootFillMeshProps) {
  const shaderRef = useRef<RootFillShader | null>(null);
  const clampedFillProgress = MathUtils.clamp(fillProgress, 0, 1);
  const fillProgressRef = useRef(clampedFillProgress);
  fillProgressRef.current = clampedFillProgress;
  const [fillAxisRange] = useState(() => {
    geometry.computeBoundingBox();

    const boundingBox = geometry.boundingBox;
    if (!boundingBox) {
      return {
        min: 0,
        max: 1,
      };
    }

    return {
      min: boundingBox.min.y,
      max: boundingBox.max.y,
    };
  });

  const [fillMaterial] = useState(() => {
    const clonedMaterial = material.clone();

    clonedMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uRootsFillProgress = {
        value: fillProgressRef.current,
      };
      shader.uniforms.uRootsFillStartColor = {
        value: ROOTS_FILL_START_COLOR,
      };
      shader.uniforms.uRootsFillEndColor = {
        value: ROOTS_FILL_END_COLOR,
      };
      shader.uniforms.uRootsFillAxis = {
        value: ROOTS_FILL_AXIS_Y,
      };
      shader.uniforms.uRootsFillMin = {
        value: fillAxisRange.min,
      };
      shader.uniforms.uRootsFillMax = {
        value: fillAxisRange.max,
      };

      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        `
        uniform vec3 uRootsFillAxis;
        varying float vRootsFillAxisPosition;

        void main() {
          vRootsFillAxisPosition = dot(position, uRootsFillAxis);
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        `
        uniform float uRootsFillProgress;
        uniform vec3 uRootsFillStartColor;
        uniform vec3 uRootsFillEndColor;
        uniform float uRootsFillMin;
        uniform float uRootsFillMax;
        varying float vRootsFillAxisPosition;

        void main() {
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <map_fragment>",
        `
        #include <map_fragment>

        float rootsFillRange = max(uRootsFillMax - uRootsFillMin, 0.0001);
        float rootsFillPosition = clamp(
          (vRootsFillAxisPosition - uRootsFillMin) / rootsFillRange,
          0.0,
          1.0
        );
        float rootsClipMask = step(rootsFillPosition, uRootsFillProgress);
        vec3 rootsFillColor = mix(
          uRootsFillStartColor,
          uRootsFillEndColor,
          rootsFillPosition
        );

        diffuseColor.rgb = mix(diffuseColor.rgb, rootsFillColor, rootsClipMask);
        `,
      );

      shaderRef.current = shader;
    };

    clonedMaterial.customProgramCacheKey = () => "tree-large-v2-root-fill";

    return clonedMaterial;
  });

  useEffect(() => {
    if (!shaderRef.current) {
      return;
    }

    shaderRef.current.uniforms.uRootsFillProgress.value = clampedFillProgress;
  }, [clampedFillProgress]);

  useEffect(() => {
    return () => {
      fillMaterial.dispose();
    };
  }, [fillMaterial]);

  return <mesh {...meshProps} geometry={geometry} material={fillMaterial} />;
}

type RootMeshConfig = {
  node: string;
  material: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
};

const ROOT_MESHES: RootMeshConfig[] = [
  {
    node: "Cube009",
    material: "Material",
    position: [-35.344, -0.02, 159.618],
  },
  {
    node: "Cube010",
    material: "Material.001",
    position: [-35.344, -0.02, 164.545],
    rotation: [Math.PI, 0, Math.PI],
  },
  {
    node: "Cube011",
    material: "Material.002",
    position: [-35.411, 0.139, 163.736],
    rotation: [-3.041, 0, -Math.PI],
    scale: 0.766,
  },
  {
    node: "Cube012",
    material: "Material.003",
    position: [-35.344, -0.02, 160.369],
    rotation: [-0.141, 0, 0],
  },
  {
    node: "Cube013",
    material: "Material.005",
    position: [-35.344, -0.02, 162.712],
    rotation: [-2.522, 0, -Math.PI],
    scale: [1, 0.705, 0.937],
  },
  {
    node: "Cube014",
    material: "Material.006",
    position: [-35.437, -0.389, 162.372],
    rotation: [-2.113, 0.05, 3.067],
    scale: [0.574, 0.404, 0.537],
  },
  {
    node: "Cube015",
    material: "Material.007",
    position: [-35.344, -0.02, 161.53],
    rotation: [-0.62, 0, 0],
    scale: [1, 0.705, 0.937],
  },
  {
    node: "Cube016",
    material: "Material.008",
    position: [-35.394, -0.178, 161.016],
    rotation: [-0.249, 0, 0],
    scale: [0.58, 0.409, 0.543],
  },
  {
    node: "Cube017",
    material: "Material.009",
    position: [-35.344, -0.02, 165.254],
    rotation: [2.84, 0, Math.PI],
    scale: 0.742,
  },
  {
    node: "Cube018",
    material: "Material.010",
    position: [-35.344, -0.02, 158.727],
    rotation: [0.378, 0, 0],
    scale: 0.762,
  },
  {
    node: "Cube019",
    material: "Material.011",
    position: [-35.351, -0.791, 163.843],
    rotation: [-2.73, 0, -Math.PI],
    scale: 0.609,
  },
  {
    node: "Cube020",
    material: "Material.012",
    position: [-35.344, -0.429, 160.202],
    rotation: [-0.694, 0, 0],
    scale: [0.689, 0.465, 0.635],
  },
  {
    node: "Cube021",
    material: "Material.004",
    position: [-35.396, -0.744, 161.853],
    rotation: [-1.054, 0, 0],
    scale: [0.58, 0.409, 0.543],
  },
  {
    node: "Cube022",
    material: "Material.013",
    position: [-35.436, -1.057, 161.411],
    rotation: [-2.561, 0, -Math.PI],
    scale: 0.233,
  },
  {
    node: "Cube023",
    material: "Material.014",
    position: [-35.401, -0.429, 158.212],
    rotation: [-0.155, 0, 0],
    scale: [0.351, 0.237, 0.324],
  },
  {
    node: "Cube024",
    material: "Material.015",
    position: [-35.429, -0.429, 159.262],
    rotation: [-0.694, 0, 0],
    scale: [0.351, 0.237, 0.324],
  },
  {
    node: "Cube025",
    material: "Material.016",
    position: [-35.464, -0.429, 158.395],
    rotation: [-0.685, 0, 0],
    scale: [0.228, 0.154, 0.21],
  },
  {
    node: "Cube026",
    material: "Material.017",
    position: [-35.464, -0.429, 162.717],
    rotation: [-0.685, 0, 0],
    scale: [0.228, 0.154, 0.21],
  },
  {
    node: "Cube027",
    material: "Material.018",
    position: [-35.438, -0.429, 165.885],
    rotation: [-1.649, 0, 0],
    scale: [0.228, 0.154, 0.21],
  },
  {
    node: "Cube028",
    material: "Material.019",
    position: [-35.465, -0.692, 163.521],
    rotation: [-0.803, 0, 0],
    scale: [0.241, 0.17, 0.226],
  },
  {
    node: "Cube029",
    material: "Material.020",
    position: [-35.458, -0.89, 163.655],
    rotation: [-2.73, 0, -Math.PI],
    scale: 0.143,
  },
  {
    node: "Cube030",
    material: "Material.021",
    position: [-35.518, -0.744, 164.462],
    rotation: [0.489, 0, Math.PI],
    scale: [-0.236, -0.166, -0.221],
  },
  {
    node: "Cube031",
    material: "Material.022",
    position: [-35.439, -0.746, 165.126],
    rotation: [0.489, 0, -Math.PI],
    scale: [-0.351, -0.237, -0.324],
  },
];

export function TreeLargeV2({
  growthScale = 1,
  hideRoots = false,
  rootsFillProgress = 0,
  rustleIntensity = 0,
  ...props
}: TreeLargeV2Props) {
  const { nodes, materials } = useGLTF(
    TREE_LARGE_V2_MODEL_PATH,
  ) as unknown as GLTFResult;
  const leavesGroupRef = useLeafRustleAnimation({
    intensity: rustleIntensity,
    phaseOffset: 2.8,
  });

  return (
    <group {...props} dispose={null}>
      <group position={TREE_BASE_POSITION} scale={growthScale}>
        <group position={TREE_OFFSET_FROM_BASE}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Trunk001.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Branch1.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Branch2.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Branch3.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Branch4.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Branch5.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Branch6.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Branch7.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Branch8.geometry}
            material={materials["Trunk.009"]}
            position={[-34.834, 3.054, 162.088]}
            scale={1.286}
          />
        </group>
        <group ref={leavesGroupRef}>
          <group position={TREE_OFFSET_FROM_BASE}>
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere023.geometry}
              material={materials["Leaves.014"]}
              position={[-36.653, 16.552, 159.053]}
              rotation={[1.355, -1.315, 1.419]}
              scale={[0.274, 0.372, 0.274]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere024.geometry}
              material={materials["Leaves.015"]}
              position={[-38.406, 16.049, 163.503]}
              rotation={[2.654, -0.412, -1.651]}
              scale={[0.786, 0.786, 0.485]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere025.geometry}
              material={materials["Leaves.016"]}
              position={[-26.247, 13.064, 159.021]}
              rotation={[2.654, -0.412, -1.651]}
              scale={[0.786, 0.786, 0.485]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Leaves7.geometry}
              material={materials["Leaves.017"]}
              position={[-32.211, 10.648, 166.536]}
              rotation={[0.095, -0.12, 0.879]}
              scale={[0.614, 0.614, 0.379]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Leaves8.geometry}
              material={materials["Leaves.018"]}
              position={[-29.658, 10.956, 164.301]}
              rotation={[2.649, -0.873, 2.394]}
              scale={[0.539, 0.529, 0.399]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere028.geometry}
              material={materials["Leaves.019"]}
              position={[-29.444, 11.802, 167.07]}
              rotation={[2.849, -0.336, -0.491]}
              scale={[0.792, 0.792, 0.489]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere029.geometry}
              material={materials["Leaves.020"]}
              position={[-32.46, 16.633, 162.91]}
              rotation={[1.319, 1.097, -1.249]}
              scale={[0.614, 0.614, 0.379]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere030.geometry}
              material={materials["Leaves.021"]}
              position={[-31.071, 17.033, 159.733]}
              rotation={[-1.049, -0.545, -0.581]}
              scale={[0.97, 0.97, 0.599]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere031.geometry}
              material={materials["Leaves.022"]}
              position={[-34.161, 15.805, 157.961]}
              rotation={[1.355, -1.315, 1.419]}
              scale={[0.617, 0.839, 0.617]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere032.geometry}
              material={materials["Leaves.023"]}
              position={[-39.599, 16.945, 159.372]}
              rotation={[0, 1.331, 0]}
              scale={[0.659, 0.659, 0.407]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere033.geometry}
              material={materials["Leaves.024"]}
              position={[-38.942, 17.751, 161.518]}
              scale={[0.614, 0.614, 0.379]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Leaves3.geometry}
              material={materials["Leaves.025"]}
              position={[-39.25, 14.542, 158.816]}
              rotation={[-1.964, -0.988, -1.699]}
              scale={[0.754, 0.754, 0.466]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Leaves5.geometry}
              material={materials["Leaves.026"]}
              position={[-37.193, 16.96, 167.087]}
              rotation={[0.187, -0.473, -0.254]}
              scale={[0.906, 0.906, 0.559]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Leaves1.geometry}
              material={materials["Leaves.027"]}
              position={[-33.803, 12.717, 155.475]}
              rotation={[2.874, -1.419, -2.478]}
              scale={[1.13, 1.109, 0.837]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Leaves4.geometry}
              material={materials["Leaves.027"]}
              position={[-38.283, 13.053, 166.621]}
              rotation={[1.046, -0.507, 1.265]}
              scale={[1.078, 1.078, 0.666]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere038.geometry}
              material={materials["Leaves.027"]}
              position={[-41.383, 11.608, 161.623]}
              rotation={[2.678, -0.693, 2.288]}
              scale={[1.314, 1.289, 0.972]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Leaves2.geometry}
              material={materials["Leaves.027"]}
              position={[-37.045, 14.665, 157.109]}
              rotation={[-0.361, -0.549, 0.671]}
              scale={[0.849, 0.833, 0.628]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Leaves6.geometry}
              material={materials["Leaves.027"]}
              position={[-33.452, 17.211, 165.969]}
              rotation={[Math.PI, -1.415, Math.PI]}
              scale={[0.606, 0.606, 0.374]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere041.geometry}
              material={materials["Leaves.027"]}
              position={[-33.015, 14.389, 169.157]}
              rotation={[-2.657, -1.297, -Math.PI]}
              scale={[1.399, 1.372, 1.035]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere042.geometry}
              material={materials["Leaves.027"]}
              position={[-29.446, 14.476, 156.818]}
              rotation={[0, -1.002, 0]}
              scale={[0.992, 1.349, 0.992]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere043.geometry}
              material={materials["Leaves.027"]}
              position={[-26.623, 15.406, 162.437]}
              scale={[0.919, 0.919, 0.567]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere044.geometry}
              material={materials["Leaves.027"]}
              position={[-29.565, 14.714, 164.673]}
              rotation={[2.131, -1.297, -Math.PI]}
              scale={[1.229, 1.206, 0.91]}
            />
            <mesh
              castShadow
              receiveShadow
              geometry={nodes.Icosphere045.geometry}
              material={materials["Leaves.027"]}
              position={[-34.834, 19.577, 162.088]}
              scale={1.505}
            />
          </group>
        </group>
        <group position={TREE_OFFSET_FROM_BASE} visible={false}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube009.geometry}
            material={materials.Material}
            position={[-35.344, -0.02, 159.618]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube010.geometry}
            material={materials["Material.001"]}
            position={[-35.344, -0.02, 164.545]}
            rotation={[Math.PI, 0, Math.PI]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube011.geometry}
            material={materials["Material.002"]}
            position={[-35.411, 0.139, 163.736]}
            rotation={[-3.041, 0, -Math.PI]}
            scale={0.766}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube012.geometry}
            material={materials["Material.003"]}
            position={[-35.344, -0.02, 160.369]}
            rotation={[-0.141, 0, 0]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube013.geometry}
            material={materials["Material.005"]}
            position={[-35.344, -0.02, 162.712]}
            rotation={[-2.522, 0, -Math.PI]}
            scale={[1, 0.705, 0.937]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube014.geometry}
            material={materials["Material.006"]}
            position={[-35.437, -0.389, 162.372]}
            rotation={[-2.113, 0.05, 3.067]}
            scale={[0.574, 0.404, 0.537]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube015.geometry}
            material={materials["Material.007"]}
            position={[-35.344, -0.02, 161.53]}
            rotation={[-0.62, 0, 0]}
            scale={[1, 0.705, 0.937]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube016.geometry}
            material={materials["Material.008"]}
            position={[-35.394, -0.178, 161.016]}
            rotation={[-0.249, 0, 0]}
            scale={[0.58, 0.409, 0.543]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube017.geometry}
            material={materials["Material.009"]}
            position={[-35.344, -0.02, 165.254]}
            rotation={[2.84, 0, Math.PI]}
            scale={0.742}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube018.geometry}
            material={materials["Material.010"]}
            position={[-35.344, -0.02, 158.727]}
            rotation={[0.378, 0, 0]}
            scale={0.762}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube019.geometry}
            material={materials["Material.011"]}
            position={[-35.351, -0.791, 163.843]}
            rotation={[-2.73, 0, -Math.PI]}
            scale={0.609}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube020.geometry}
            material={materials["Material.012"]}
            position={[-35.344, -0.429, 160.202]}
            rotation={[-0.694, 0, 0]}
            scale={[0.689, 0.465, 0.635]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube021.geometry}
            material={materials["Material.004"]}
            position={[-35.396, -0.744, 161.853]}
            rotation={[-1.054, 0, 0]}
            scale={[0.58, 0.409, 0.543]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube022.geometry}
            material={materials["Material.013"]}
            position={[-35.436, -1.057, 161.411]}
            rotation={[-2.561, 0, -Math.PI]}
            scale={0.233}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube023.geometry}
            material={materials["Material.014"]}
            position={[-35.401, -0.429, 158.212]}
            rotation={[-0.155, 0, 0]}
            scale={[0.351, 0.237, 0.324]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube024.geometry}
            material={materials["Material.015"]}
            position={[-35.429, -0.429, 159.262]}
            rotation={[-0.694, 0, 0]}
            scale={[0.351, 0.237, 0.324]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube025.geometry}
            material={materials["Material.016"]}
            position={[-35.464, -0.429, 158.395]}
            rotation={[-0.685, 0, 0]}
            scale={[0.228, 0.154, 0.21]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube026.geometry}
            material={materials["Material.017"]}
            position={[-35.464, -0.429, 162.717]}
            rotation={[-0.685, 0, 0]}
            scale={[0.228, 0.154, 0.21]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube027.geometry}
            material={materials["Material.018"]}
            position={[-35.438, -0.429, 165.885]}
            rotation={[-1.649, 0, 0]}
            scale={[0.228, 0.154, 0.21]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube028.geometry}
            material={materials["Material.019"]}
            position={[-35.465, -0.692, 163.521]}
            rotation={[-0.803, 0, 0]}
            scale={[0.241, 0.17, 0.226]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube029.geometry}
            material={materials["Material.020"]}
            position={[-35.458, -0.89, 163.655]}
            rotation={[-2.73, 0, -Math.PI]}
            scale={0.143}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube030.geometry}
            material={materials["Material.021"]}
            position={[-35.518, -0.744, 164.462]}
            rotation={[0.489, 0, Math.PI]}
            scale={[-0.236, -0.166, -0.221]}
          />
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.Cube031.geometry}
            material={materials["Material.022"]}
            position={[-35.439, -0.746, 165.126]}
            rotation={[0.489, 0, -Math.PI]}
            scale={[-0.351, -0.237, -0.324]}
          />
        </group>
        {!hideRoots && (
          <group position={TREE_OFFSET_FROM_BASE}>
            {ROOT_MESHES.map((rootMesh) => (
              <RootFillMesh
                key={rootMesh.node}
                castShadow
                receiveShadow
                fillProgress={rootsFillProgress}
                geometry={nodes[rootMesh.node].geometry}
                material={materials[rootMesh.material]}
                position={rootMesh.position}
                rotation={rootMesh.rotation}
                scale={rootMesh.scale}
              />
            ))}
          </group>
        )}
      </group>
    </group>
  );
}

export { TreeLargeV2 as Model };

useGLTF.preload(TREE_LARGE_V2_MODEL_PATH);
